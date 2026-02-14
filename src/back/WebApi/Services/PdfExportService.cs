using Dapper;
using EverPal.WebApi.Models;
using Npgsql;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;
using System.Globalization;
using System.Text.Json;
using EverPal.WebApi.Localization;

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

            var lang = request.Language ?? "en";

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.Letter);
                    page.Margin(40);
                    page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                    page.Header().Element(c => ComposeHeader(c, pet, lang));
                    page.Content().Element(c => ComposeContent(c, pet, healthLogs, request.IncludePhotos, lang));
                    page.Footer().Element(c => ComposeFooter(c, pet, lang));
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

        private void ComposeHeader(IContainer container, Pet pet, string lang)
        {
            container.Column(column =>
            {
                column.Item().PaddingBottom(20).Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text(string.Format(PdfStrings.Get(lang, "health_report_title"), pet.Name))
                            .FontSize(24)
                            .Bold()
                            .FontColor(Colors.Blue.Darken2);

                        col.Item().PaddingTop(5).Text(PdfStrings.Get(lang, "health_report_subtitle"))
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

        private void ComposeContent(IContainer container, Pet pet, List<HealthLog> healthLogs, bool includePhotos, string lang)
        {
            container.Column(column =>
            {
                column.Item().PaddingBottom(15).Element(c => ComposePetProfile(c, pet, healthLogs, lang));
                column.Item().PaddingBottom(10).Element(c => ComposeDisclaimer(c, lang));
                column.Item().Element(c => ComposeHealthTimeline(c, healthLogs, includePhotos, lang));
            });
        }

        private void ComposePetProfile(IContainer container, Pet pet, List<HealthLog> healthLogs, string lang)
        {
            var culture = new CultureInfo(lang == "pl" ? "pl-PL" : "en-US");

            container.Column(column =>
            {
                column.Item().Text(PdfStrings.Get(lang, "pet_profile")).FontSize(16).Bold().FontColor(Colors.Blue.Darken1);

                column.Item().PaddingTop(10).PaddingBottom(10).Background(Colors.Grey.Lighten3).Padding(15).Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.ConstantItem(150).Text(PdfStrings.Get(lang, "name")).SemiBold();
                        row.RelativeItem().Text(pet.Name);
                    });

                    if (!string.IsNullOrEmpty(pet.Breed))
                    {
                        col.Item().PaddingTop(5).Row(row =>
                        {
                            row.ConstantItem(150).Text(PdfStrings.Get(lang, "breed")).SemiBold();
                            row.RelativeItem().Text(pet.Breed);
                        });
                    }

                    if (pet.Age.HasValue)
                    {
                        col.Item().PaddingTop(5).Row(row =>
                        {
                            row.ConstantItem(150).Text(PdfStrings.Get(lang, "age")).SemiBold();
                            row.RelativeItem().Text(string.Format(PdfStrings.Get(lang, "age_years"), pet.Age));
                        });
                    }

                    if (pet.Weight.HasValue)
                    {
                        col.Item().PaddingTop(5).Row(row =>
                        {
                            row.ConstantItem(150).Text(PdfStrings.Get(lang, "weight")).SemiBold();
                            row.RelativeItem().Text($"{pet.Weight} {pet.WeightUnit ?? "kg"}");
                        });
                    }

                    col.Item().PaddingTop(5).Row(row =>
                    {
                        row.ConstantItem(150).Text(PdfStrings.Get(lang, "report_period")).SemiBold();
                        row.RelativeItem().Text(healthLogs.Any()
                            ? $"{healthLogs.Last().LoggedAt.ToString("d MMM yyyy", culture)} - {healthLogs.First().LoggedAt.ToString("d MMM yyyy", culture)}"
                            : PdfStrings.Get(lang, "no_entries"));
                    });

                    col.Item().PaddingTop(5).Row(row =>
                    {
                        row.ConstantItem(150).Text(PdfStrings.Get(lang, "total_entries")).SemiBold();
                        row.RelativeItem().Text(healthLogs.Count.ToString());
                    });

                    col.Item().PaddingTop(5).Row(row =>
                    {
                        row.ConstantItem(150).Text(PdfStrings.Get(lang, "generated")).SemiBold();
                        row.RelativeItem().Text(DateTime.UtcNow.ToString("d MMM yyyy, HH:mm 'UTC'", culture));
                    });
                });
            });
        }

        private void ComposeDisclaimer(IContainer container, string lang)
        {
            container.Background(Colors.Yellow.Lighten3).Padding(10).Column(column =>
            {
                column.Item().Text(PdfStrings.Get(lang, "medical_disclaimer_title")).FontSize(10).Bold();
                column.Item().PaddingTop(5).Text(PdfStrings.Get(lang, "medical_disclaimer_text")).FontSize(9).Italic();
            });
        }

        private void ComposeHealthTimeline(IContainer container, List<HealthLog> healthLogs, bool includePhotos, string lang)
        {
            var photoCount = 0;

            container.Column(column =>
            {
                column.Item().PaddingTop(15).PaddingBottom(10).Text(PdfStrings.Get(lang, "health_timeline"))
                    .FontSize(16)
                    .Bold()
                    .FontColor(Colors.Blue.Darken1);

                if (!healthLogs.Any())
                {
                    column.Item().Text(PdfStrings.Get(lang, "no_health_entries")).Italic().FontColor(Colors.Grey.Darken1);
                    return;
                }

                foreach (var log in healthLogs)
                {
                    var currentPhotoCount = photoCount;
                    var hasPhoto = includePhotos && !string.IsNullOrEmpty(log.PhotoBase64) && currentPhotoCount < MaxPhotos;

                    column.Item().PaddingBottom(15).Element(c => ComposeHealthLogEntry(c, log, hasPhoto, lang));

                    if (hasPhoto)
                    {
                        photoCount++;
                    }
                }
            });
        }

        private void ComposeHealthLogEntry(IContainer container, HealthLog log, bool includePhoto, string lang)
        {
            var culture = new CultureInfo(lang == "pl" ? "pl-PL" : "en-US");

            container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingBottom(10).Column(column =>
            {
                column.Item().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Row(r =>
                        {
                            r.AutoItem().Text(log.LoggedAt.ToString("d MMM yyyy, HH:mm", culture))
                                .FontSize(11)
                                .SemiBold()
                                .FontColor(Colors.Blue.Darken2);

                            r.AutoItem().PaddingLeft(10).Text($"[{FormatLogType(log.LogType, lang)}]")
                                .FontSize(10)
                                .FontColor(GetLogTypeColor(log.LogType));
                        });

                        if (log.Tags != null && log.Tags.Any())
                        {
                            col.Item().PaddingTop(5).Row(r =>
                            {
                                r.AutoItem().Text(PdfStrings.Get(lang, "tags")).FontSize(9).FontColor(Colors.Grey.Darken1);
                                r.AutoItem().Text(string.Join(", ", log.Tags.Select(t => TagTranslations.Get(lang, t.Label))))
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

        private void ComposeFooter(IContainer container, Pet pet, string lang)
        {
            container.AlignCenter().Column(column =>
            {
                column.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                column.Item().PaddingTop(5).Row(row =>
                {
                    row.RelativeItem().AlignLeft().Text(text =>
                    {
                        text.Span(PdfStrings.Get(lang, "page"));
                        text.CurrentPageNumber();
                        text.Span(PdfStrings.Get(lang, "of"));
                        text.TotalPages();
                    });

                    row.RelativeItem().AlignCenter().Text(string.Format(PdfStrings.Get(lang, "health_report_title"), pet.Name));

                    row.RelativeItem().AlignRight().Text(PdfStrings.Get(lang, "generated_by"));
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

        private string FormatLogType(string logType, string lang)
        {
            var key = logType switch
            {
                "symptom" => "log_type_symptom",
                "food" => "log_type_food",
                "medication" => "log_type_medication",
                "vet_visit" => "log_type_vet_visit",
                "weight" => "log_type_weight",
                "general" => "log_type_general",
                "stool" => "log_type_stool",
                "urine" => "log_type_urine",
                "vomit" => "log_type_vomit",
                _ => null
            };

            return key != null ? PdfStrings.Get(lang, key) : logType;
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
