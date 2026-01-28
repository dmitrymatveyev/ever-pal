using Dapper;
using EverPal.WebApi.Models;
using Npgsql;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;
using System.Text.Json;

namespace EverPal.WebApi.Services
{
    public class PdfExportService : IPdfExportService
    {
        private readonly string _connectionString;
        private readonly IPetOwnershipService _petOwnershipService;
        private readonly IPetService _petService;
        private readonly JsonSerializerOptions _jsonOptions;
        private readonly ILogger<PdfExportService> _logger;

        private const int MaxLogs = 500;
        private const int MaxPhotos = 50;
        private const int PhotoMaxWidth = 800;
        private const int JpegQuality = 75;

        public PdfExportService(
            IConfiguration configuration,
            IPetOwnershipService petOwnershipService,
            IPetService petService,
            ILogger<PdfExportService> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _petOwnershipService = petOwnershipService;
            _petService = petService;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
        }

        public async Task<byte[]> GeneratePdfReportAsync(Guid userId, ExportPdfRequest request)
        {
            await _petOwnershipService.ValidateUserOwnsPetAsync(userId, request.PetId);

            var pet = await _petService.GetPetAsync(request.PetId, userId);
            if (pet == null)
            {
                throw new InvalidOperationException("Pet not found");
            }

            var healthLogs = await GetHealthLogsForExportAsync(request.PetId, request.StartDate, request.EndDate);

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.Letter);
                    page.Margin(40);
                    page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                    page.Header().Element(c => ComposeHeader(c, pet));
                    page.Content().Element(c => ComposeContent(c, pet, healthLogs, request.IncludePhotos));
                    page.Footer().Element(c => ComposeFooter(c, pet));
                });
            });

            return document.GeneratePdf();
        }

        private async Task<List<HealthLog>> GetHealthLogsForExportAsync(Guid petId, DateTime? startDate, DateTime? endDate)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT id as Id, pet_id as PetId, log_type as LogType, entry_text as EntryText,
                       tags::text as TagsJson, photo_base64 as PhotoBase64, logged_at as LoggedAt,
                       created_at as CreatedAt, updated_at as UpdatedAt
                FROM health_logs
                WHERE pet_id = @PetId
                  AND deleted_at IS NULL
                  AND (@StartDate::timestamptz IS NULL OR logged_at >= @StartDate)
                  AND (@EndDate::timestamptz IS NULL OR logged_at <= @EndDate)
                ORDER BY logged_at DESC
                LIMIT @MaxLogs;";

            var results = await connection.QueryAsync<dynamic>(sql, new
            {
                PetId = petId,
                StartDate = startDate,
                EndDate = endDate,
                MaxLogs = MaxLogs
            });

            var healthLogs = results.Select(result => new HealthLog
            {
                Id = result.id,
                PetId = result.petid,
                LogType = result.logtype,
                EntryText = result.entrytext,
                Tags = string.IsNullOrEmpty(result.tagsjson)
                    ? new List<Tag>()
                    : JsonSerializer.Deserialize<List<Tag>>(result.tagsjson, _jsonOptions) ?? new List<Tag>(),
                PhotoBase64 = result.photobase64,
                LoggedAt = result.loggedat,
                CreatedAt = result.createdat,
                UpdatedAt = result.updatedat
            }).ToList();

            return healthLogs;
        }

        private void ComposeHeader(IContainer container, Pet pet)
        {
            container.Column(column =>
            {
                column.Item().PaddingBottom(20).Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text($"{pet.Name}'s Health Report")
                            .FontSize(24)
                            .Bold()
                            .FontColor(Colors.Blue.Darken2);

                        col.Item().PaddingTop(5).Text("Pet Health Tracking Report")
                            .FontSize(12)
                            .FontColor(Colors.Grey.Darken1);
                    });

                    if (!string.IsNullOrEmpty(pet.PhotoBase64))
                    {
                        try
                        {
                            var imageBytes = Convert.FromBase64String(pet.PhotoBase64.Contains(",")
                                ? pet.PhotoBase64.Split(',')[1]
                                : pet.PhotoBase64);

                            row.ConstantItem(80).MaxHeight(80).Image(imageBytes).FitArea();
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load pet photo for PDF header");
                        }
                    }
                });

                column.Item().PaddingTop(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
            });
        }

        private void ComposeContent(IContainer container, Pet pet, List<HealthLog> healthLogs, bool includePhotos)
        {
            container.Column(column =>
            {
                column.Item().PaddingBottom(15).Element(c => ComposePetProfile(c, pet, healthLogs));
                column.Item().PaddingBottom(10).Element(c => ComposeDisclaimer(c));
                column.Item().Element(c => ComposeHealthTimeline(c, healthLogs, includePhotos));
            });
        }

        private void ComposePetProfile(IContainer container, Pet pet, List<HealthLog> healthLogs)
        {
            container.Column(column =>
            {
                column.Item().Text("Pet Profile").FontSize(16).Bold().FontColor(Colors.Blue.Darken1);

                column.Item().PaddingTop(10).PaddingBottom(10).Background(Colors.Grey.Lighten3).Padding(15).Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.ConstantItem(120).Text("Name:").SemiBold();
                        row.RelativeItem().Text(pet.Name);
                    });

                    if (!string.IsNullOrEmpty(pet.Breed))
                    {
                        col.Item().PaddingTop(5).Row(row =>
                        {
                            row.ConstantItem(120).Text("Breed:").SemiBold();
                            row.RelativeItem().Text(pet.Breed);
                        });
                    }

                    if (pet.Age.HasValue)
                    {
                        col.Item().PaddingTop(5).Row(row =>
                        {
                            row.ConstantItem(120).Text("Age:").SemiBold();
                            row.RelativeItem().Text($"{pet.Age} years");
                        });
                    }

                    if (pet.Weight.HasValue)
                    {
                        col.Item().PaddingTop(5).Row(row =>
                        {
                            row.ConstantItem(120).Text("Weight:").SemiBold();
                            row.RelativeItem().Text($"{pet.Weight} {pet.WeightUnit ?? "lbs"}");
                        });
                    }

                    col.Item().PaddingTop(5).Row(row =>
                    {
                        row.ConstantItem(120).Text("Report Period:").SemiBold();
                        row.RelativeItem().Text(healthLogs.Any()
                            ? $"{healthLogs.Last().LoggedAt:MMM d, yyyy} - {healthLogs.First().LoggedAt:MMM d, yyyy}"
                            : "No entries");
                    });

                    col.Item().PaddingTop(5).Row(row =>
                    {
                        row.ConstantItem(120).Text("Total Entries:").SemiBold();
                        row.RelativeItem().Text(healthLogs.Count.ToString());
                    });

                    col.Item().PaddingTop(5).Row(row =>
                    {
                        row.ConstantItem(120).Text("Generated:").SemiBold();
                        row.RelativeItem().Text(DateTime.UtcNow.ToString("MMM d, yyyy 'at' h:mm tt 'UTC'"));
                    });
                });
            });
        }

        private void ComposeDisclaimer(IContainer container)
        {
            container.Background(Colors.Yellow.Lighten3).Padding(10).Column(column =>
            {
                column.Item().Text("Medical Disclaimer").FontSize(10).Bold();
                column.Item().PaddingTop(5).Text(
                    "This document contains health observations recorded by the pet owner. It is NOT a veterinary medical record or diagnosis. " +
                    "Please consult with a licensed veterinarian for medical advice regarding your pet's health."
                ).FontSize(9).Italic();
            });
        }

        private void ComposeHealthTimeline(IContainer container, List<HealthLog> healthLogs, bool includePhotos)
        {
            var photoCount = 0;

            container.Column(column =>
            {
                column.Item().PaddingTop(15).PaddingBottom(10).Text("Health Timeline")
                    .FontSize(16)
                    .Bold()
                    .FontColor(Colors.Blue.Darken1);

                if (!healthLogs.Any())
                {
                    column.Item().Text("No health entries found for this period.").Italic().FontColor(Colors.Grey.Darken1);
                    return;
                }

                foreach (var log in healthLogs)
                {
                    var currentPhotoCount = photoCount;
                    var hasPhoto = includePhotos && !string.IsNullOrEmpty(log.PhotoBase64) && currentPhotoCount < MaxPhotos;

                    column.Item().PaddingBottom(15).Element(c => ComposeHealthLogEntry(c, log, hasPhoto));

                    if (hasPhoto)
                    {
                        photoCount++;
                    }
                }
            });
        }

        private void ComposeHealthLogEntry(IContainer container, HealthLog log, bool includePhoto)
        {
            container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingBottom(10).Column(column =>
            {
                column.Item().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Row(r =>
                        {
                            r.AutoItem().Text(log.LoggedAt.ToString("MMM d, yyyy h:mm tt"))
                                .FontSize(11)
                                .SemiBold()
                                .FontColor(Colors.Blue.Darken2);

                            r.AutoItem().PaddingLeft(10).Text($"[{FormatLogType(log.LogType)}]")
                                .FontSize(10)
                                .FontColor(GetLogTypeColor(log.LogType));
                        });

                        if (log.Tags != null && log.Tags.Any())
                        {
                            col.Item().PaddingTop(5).Row(r =>
                            {
                                r.AutoItem().Text("Tags: ").FontSize(9).FontColor(Colors.Grey.Darken1);
                                r.AutoItem().Text(string.Join(", ", log.Tags.Select(t => t.Label)))
                                    .FontSize(9)
                                    .FontColor(Colors.Grey.Darken2);
                            });
                        }
                    });

                    if (includePhoto && !string.IsNullOrEmpty(log.PhotoBase64))
                    {
                        try
                        {
                            var optimizedImage = OptimizeImage(log.PhotoBase64);
                            row.ConstantItem(60).MaxHeight(60).Image(optimizedImage).FitArea();
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to process photo for health log {LogId}", log.Id);
                        }
                    }
                });

                if (!string.IsNullOrEmpty(log.EntryText))
                {
                    column.Item().PaddingTop(8).Text(log.EntryText)
                        .FontSize(10)
                        .LineHeight(1.4f);
                }
            });
        }

        private void ComposeFooter(IContainer container, Pet pet)
        {
            container.AlignCenter().Column(column =>
            {
                column.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                column.Item().PaddingTop(5).Row(row =>
                {
                    row.RelativeItem().AlignLeft().Text(text =>
                    {
                        text.Span("Page ");
                        text.CurrentPageNumber();
                        text.Span(" of ");
                        text.TotalPages();
                    });

                    row.RelativeItem().AlignCenter().Text($"{pet.Name}'s Health Report");

                    row.RelativeItem().AlignRight().Text("Generated by EverPal");
                });
            });
        }

        private byte[] OptimizeImage(string base64Image)
        {
            var base64Data = base64Image.Contains(",") ? base64Image.Split(',')[1] : base64Image;
            var imageBytes = Convert.FromBase64String(base64Data);

            using var inputStream = new MemoryStream(imageBytes);
            using var image = SixLabors.ImageSharp.Image.Load(inputStream);

            if (image.Width > PhotoMaxWidth)
            {
                var height = (int)((float)PhotoMaxWidth / image.Width * image.Height);
                image.Mutate(x => x.Resize(PhotoMaxWidth, height));
            }

            using var outputStream = new MemoryStream();
            image.Save(outputStream, new JpegEncoder { Quality = JpegQuality });
            return outputStream.ToArray();
        }

        private string FormatLogType(string logType)
        {
            return logType switch
            {
                "symptom" => "Symptom",
                "food" => "Food",
                "medication" => "Medication",
                "vet_visit" => "Vet Visit",
                "weight" => "Weight",
                "general" => "General",
                _ => logType
            };
        }

        private string GetLogTypeColor(string logType)
        {
            return logType switch
            {
                "symptom" => Colors.Red.Medium,
                "food" => Colors.Green.Medium,
                "medication" => Colors.Purple.Medium,
                "vet_visit" => Colors.Blue.Medium,
                "weight" => Colors.Orange.Medium,
                _ => Colors.Grey.Darken1
            };
        }
    }
}
