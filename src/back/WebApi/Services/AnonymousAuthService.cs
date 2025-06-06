using System.Security.Cryptography;
using Dapper;
using EverPal.WebApi.Models;
using Npgsql;
using Microsoft.Extensions.Configuration;

namespace EverPal.WebApi.Services
{
    public class AnonymousAuthService : IAnonymousAuthService
    {
        private readonly string _connectionString;

        public AnonymousAuthService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<AuthResponse> CreateAnonymousUserAsync()
        {
            var token = GenerateSecureToken();
            
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                INSERT INTO users (anonymous_token)
                VALUES (@Token)
                RETURNING id;";

            var userId = await connection.QuerySingleAsync<Guid>(sql, new { Token = token });

            return new AuthResponse
            {
                Token = token,
                UserId = userId.ToString()
            };
        }

        public async Task<bool> ValidateAnonymousTokenAsync(string token)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            var sql = "SELECT COUNT(1) FROM users WHERE anonymous_token = @Token";
            var exists = await connection.ExecuteScalarAsync<int>(sql, new { Token = token });
            return exists > 0;
        }

        private string GenerateSecureToken()
        {
            var bytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(bytes);
            }
            return Convert.ToBase64String(bytes);
        }
    }
}
