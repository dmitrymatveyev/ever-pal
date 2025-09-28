using Dapper;
using Npgsql;

namespace EverPal.WebApi.Services
{
    public class PetOwnershipService : IPetOwnershipService
    {
        private readonly string _connectionString;

        public PetOwnershipService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task ValidateUserOwnsPetAsync(Guid userId, Guid petId)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT COUNT(1) FROM pets
                WHERE id = @PetId AND owner_id = @UserId AND deleted_at IS NULL;";

            var ownsPet = await connection.QuerySingleAsync<int>(sql, new
            {
                PetId = petId,
                UserId = userId
            });

            if (ownsPet == 0)
            {
                throw new UnauthorizedAccessException("Pet not found or access denied");
            }
        }
    }
}