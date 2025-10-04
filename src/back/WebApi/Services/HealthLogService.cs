using Dapper;
using EverPal.WebApi.Models;
using Npgsql;

namespace EverPal.WebApi.Services
{
    public class HealthLogService : IHealthLogService
    {
        private readonly string _connectionString;
        private readonly IPetOwnershipService _petOwnershipService;

        public HealthLogService(IConfiguration configuration, IPetOwnershipService petOwnershipService)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _petOwnershipService = petOwnershipService;
        }

        public async Task<HealthLog> CreateHealthLogAsync(Guid userId, CreateHealthLogRequest request)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            // Verify the user owns the pet
            await _petOwnershipService.ValidateUserOwnsPetAsync(userId, request.PetId);

            var loggedAt = request.LoggedAt ?? DateTime.UtcNow;

            var sql = @"
                INSERT INTO health_logs (pet_id, entry_text, logged_at)
                VALUES (@PetId, @EntryText, @LoggedAt)
                RETURNING id as Id, pet_id as PetId, entry_text as EntryText, logged_at as LoggedAt, created_at as CreatedAt, updated_at as UpdatedAt;";

            var healthLog = await connection.QuerySingleAsync<HealthLog>(sql, new
            {
                PetId = request.PetId,
                EntryText = request.EntryText,
                LoggedAt = loggedAt
            });

            return healthLog;
        }

        public async Task<HealthLog?> GetHealthLogAsync(Guid healthLogId, Guid userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT h.id as Id, h.pet_id as PetId, h.entry_text as EntryText, h.logged_at as LoggedAt, h.created_at as CreatedAt, h.updated_at as UpdatedAt
                FROM health_logs h
                INNER JOIN pets p ON h.pet_id = p.id
                WHERE h.id = @HealthLogId AND p.owner_id = @UserId AND h.deleted_at IS NULL AND p.deleted_at IS NULL;";

            var healthLog = await connection.QuerySingleOrDefaultAsync<HealthLog>(sql, new
            {
                HealthLogId = healthLogId,
                UserId = userId
            });

            return healthLog;
        }

        public async Task<IEnumerable<HealthLog>> GetHealthLogsAsync(Guid petId, Guid userId, int limit, int offset)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            // Verify the user owns the pet
            await _petOwnershipService.ValidateUserOwnsPetAsync(userId, petId);

            var sql = @"
                SELECT id as Id, pet_id as PetId, entry_text as EntryText, logged_at as LoggedAt, created_at as CreatedAt, updated_at as UpdatedAt
                FROM health_logs
                WHERE pet_id = @PetId AND deleted_at IS NULL
                ORDER BY logged_at DESC
                LIMIT @Limit OFFSET @Offset;";

            var healthLogs = await connection.QueryAsync<HealthLog>(sql, new
            {
                PetId = petId,
                Limit = limit,
                Offset = offset
            });
            return healthLogs;
        }

        public async Task<HealthLog?> UpdateHealthLogAsync(Guid healthLogId, Guid userId, UpdateHealthLogRequest request)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            if (string.IsNullOrEmpty(request.EntryText) && request.LoggedAt == null)
                return await GetHealthLogAsync(healthLogId, userId);

            var setParts = new List<string>();
            var parameters = new Dictionary<string, object>
            {
                { "HealthLogId", healthLogId },
                { "UserId", userId }
            };

            if (!string.IsNullOrEmpty(request.EntryText))
            {
                setParts.Add("entry_text = @EntryText");
                parameters.Add("EntryText", request.EntryText);
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
                RETURNING health_logs.id as Id, health_logs.pet_id as PetId, health_logs.entry_text as EntryText, health_logs.logged_at as LoggedAt, health_logs.created_at as CreatedAt, health_logs.updated_at as UpdatedAt;";

            var healthLog = await connection.QuerySingleOrDefaultAsync<HealthLog>(sql, parameters);

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