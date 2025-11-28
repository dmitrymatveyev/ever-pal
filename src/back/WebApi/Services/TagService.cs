using Dapper;
using EverPal.WebApi.Models;
using Npgsql;

namespace EverPal.WebApi.Services
{
    public class TagService : ITagService
    {
        private readonly string _connectionString;

        public TagService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<IEnumerable<Tag>> GetAllTagsAsync()
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT id as Id, label as Label, icon as Icon, category as Category, log_type as LogType, created_at as CreatedAt, updated_at as UpdatedAt
                FROM tags
                ORDER BY category, label;";

            var tags = await connection.QueryAsync<Tag>(sql);
            return tags;
        }

        public async Task<IEnumerable<Tag>> GetTagsByLogTypeAsync(string logType)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT id as Id, label as Label, icon as Icon, category as Category, log_type as LogType, created_at as CreatedAt, updated_at as UpdatedAt
                FROM tags
                WHERE log_type = @LogType OR log_type IS NULL
                ORDER BY category, label;";

            var tags = await connection.QueryAsync<Tag>(sql, new { LogType = logType });
            return tags;
        }
    }
}
