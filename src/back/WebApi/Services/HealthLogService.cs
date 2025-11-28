using Dapper;
using EverPal.WebApi.Models;
using Npgsql;
using System.Text.Json;

namespace EverPal.WebApi.Services
{
    public class HealthLogService : IHealthLogService
    {
        private readonly string _connectionString;
        private readonly IPetOwnershipService _petOwnershipService;
        private readonly JsonSerializerOptions _jsonOptions;

        public HealthLogService(IConfiguration configuration, IPetOwnershipService petOwnershipService)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _petOwnershipService = petOwnershipService;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
        }

        public async Task<HealthLog> CreateHealthLogAsync(Guid userId, CreateHealthLogRequest request)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            // Verify the user owns the pet
            await _petOwnershipService.ValidateUserOwnsPetAsync(userId, request.PetId);

            var loggedAt = request.LoggedAt ?? DateTime.UtcNow;
            var tagsJson = JsonSerializer.Serialize(request.Tags, _jsonOptions);

            var sql = @"
                INSERT INTO health_logs (pet_id, log_type, entry_text, tags, photo_base64, logged_at)
                VALUES (@PetId, @LogType, @EntryText, @Tags::jsonb, @PhotoBase64, @LoggedAt)
                RETURNING id as Id, pet_id as PetId, log_type as LogType, entry_text as EntryText, tags::text as TagsJson, photo_base64 as PhotoBase64, logged_at as LoggedAt, created_at as CreatedAt, updated_at as UpdatedAt;";

            var result = await connection.QuerySingleAsync<dynamic>(sql, new
            {
                PetId = request.PetId,
                LogType = request.LogType,
                EntryText = request.EntryText,
                Tags = tagsJson,
                PhotoBase64 = request.PhotoBase64,
                LoggedAt = loggedAt
            });

            var healthLog = new HealthLog
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
            };

            return healthLog;
        }

        public async Task<HealthLog?> GetHealthLogAsync(Guid healthLogId, Guid userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT h.id as Id, h.pet_id as PetId, h.log_type as LogType, h.entry_text as EntryText, h.tags::text as TagsJson, h.photo_base64 as PhotoBase64, h.logged_at as LoggedAt, h.created_at as CreatedAt, h.updated_at as UpdatedAt
                FROM health_logs h
                INNER JOIN pets p ON h.pet_id = p.id
                WHERE h.id = @HealthLogId AND p.owner_id = @UserId AND h.deleted_at IS NULL AND p.deleted_at IS NULL;";

            var result = await connection.QuerySingleOrDefaultAsync<dynamic>(sql, new
            {
                HealthLogId = healthLogId,
                UserId = userId
            });

            if (result == null)
                return null;

            var healthLog = new HealthLog
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
            };

            return healthLog;
        }

        public async Task<IEnumerable<HealthLog>> GetHealthLogsAsync(Guid petId, Guid userId, int limit, int offset)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            // Verify the user owns the pet
            await _petOwnershipService.ValidateUserOwnsPetAsync(userId, petId);

            var sql = @"
                SELECT id as Id, pet_id as PetId, log_type as LogType, entry_text as EntryText, tags::text as TagsJson, photo_base64 as PhotoBase64, logged_at as LoggedAt, created_at as CreatedAt, updated_at as UpdatedAt
                FROM health_logs
                WHERE pet_id = @PetId AND deleted_at IS NULL
                ORDER BY logged_at DESC
                LIMIT @Limit OFFSET @Offset;";

            var results = await connection.QueryAsync<dynamic>(sql, new
            {
                PetId = petId,
                Limit = limit,
                Offset = offset
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

        public async Task<HealthLog?> UpdateHealthLogAsync(Guid healthLogId, Guid userId, UpdateHealthLogRequest request)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            if (string.IsNullOrEmpty(request.EntryText) && string.IsNullOrEmpty(request.LogType) && request.LoggedAt == null && request.Tags == null && request.PhotoBase64 == null)
                return await GetHealthLogAsync(healthLogId, userId);

            var setParts = new List<string>();
            var parameters = new Dictionary<string, object>
            {
                { "HealthLogId", healthLogId },
                { "UserId", userId }
            };

            if (!string.IsNullOrEmpty(request.LogType))
            {
                setParts.Add("log_type = @LogType");
                parameters.Add("LogType", request.LogType);
            }

            if (!string.IsNullOrEmpty(request.EntryText))
            {
                setParts.Add("entry_text = @EntryText");
                parameters.Add("EntryText", request.EntryText);
            }

            if (request.Tags != null)
            {
                setParts.Add("tags = @Tags::jsonb");
                parameters.Add("Tags", JsonSerializer.Serialize(request.Tags, _jsonOptions));
            }

            if (request.PhotoBase64 != null)
            {
                setParts.Add("photo_base64 = @PhotoBase64");
                parameters.Add("PhotoBase64", request.PhotoBase64);
            }

            if (request.LoggedAt.HasValue)
            {
                setParts.Add("logged_at = @LoggedAt");
                parameters.Add("LoggedAt", request.LoggedAt.Value);
            }

            var sql = @$"
                UPDATE health_logs
                SET {string.Join(", ", setParts)}
                FROM pets p
                WHERE health_logs.id = @HealthLogId
                  AND health_logs.pet_id = p.id
                  AND p.owner_id = @UserId
                  AND health_logs.deleted_at IS NULL
                  AND p.deleted_at IS NULL
                RETURNING health_logs.id as Id, health_logs.pet_id as PetId, health_logs.log_type as LogType, health_logs.entry_text as EntryText, health_logs.tags::text as TagsJson, health_logs.photo_base64 as PhotoBase64, health_logs.logged_at as LoggedAt, health_logs.created_at as CreatedAt, health_logs.updated_at as UpdatedAt;";

            var result = await connection.QuerySingleOrDefaultAsync<dynamic>(sql, parameters);

            if (result == null)
                return null;

            var healthLog = new HealthLog
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
            };

            return healthLog;
        }

        public async Task<bool> DeleteHealthLogAsync(Guid healthLogId, Guid userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                UPDATE health_logs
                SET deleted_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
                FROM pets p
                WHERE health_logs.id = @HealthLogId
                  AND health_logs.pet_id = p.id
                  AND p.owner_id = @UserId
                  AND health_logs.deleted_at IS NULL
                  AND p.deleted_at IS NULL;";

            var rowsAffected = await connection.ExecuteAsync(sql, new
            {
                HealthLogId = healthLogId,
                UserId = userId
            });

            return rowsAffected > 0;
        }
    }
}