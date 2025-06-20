using Dapper;
using EverPal.WebApi.Models;
using Npgsql;

namespace EverPal.WebApi.Services
{
    public class PetService : IPetService
    {
        private readonly string _connectionString;

        public PetService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<Pet> CreatePetAsync(Guid ownerId, CreatePetRequest request)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            
            var sql = @"
                INSERT INTO pets (owner_id, name, photo_url, breed, weight, age)
                VALUES (@OwnerId, @Name, @PhotoUrl, @Breed, @Weight, @Age)
                RETURNING id, owner_id as OwnerId, name, photo_url as PhotoUrl, breed, weight, age, created_at as CreatedAt, updated_at as UpdatedAt;";

            var pet = await connection.QuerySingleAsync<Pet>(sql, new
            {
                OwnerId = ownerId,
                Name = request.Name,
                PhotoUrl = request.PhotoUrl,
                Breed = request.Breed,
                Weight = request.Weight,
                Age = request.Age
            });

            return pet;
        }

        public async Task<Pet?> GetPetAsync(Guid petId, Guid ownerId)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            
            var sql = @"
                SELECT id, owner_id as OwnerId, name, photo_url as PhotoUrl, breed, weight, age, created_at as CreatedAt, updated_at as UpdatedAt
                FROM pets 
                WHERE id = @PetId AND owner_id = @OwnerId;";

            var pet = await connection.QuerySingleOrDefaultAsync<Pet>(sql, new
            {
                PetId = petId,
                OwnerId = ownerId
            });

            return pet;
        }

        public async Task<IEnumerable<Pet>> GetUserPetsAsync(Guid ownerId)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            
            var sql = @"
                SELECT id, owner_id as OwnerId, name, photo_url as PhotoUrl, breed, weight, age, created_at as CreatedAt, updated_at as UpdatedAt
                FROM pets 
                WHERE owner_id = @OwnerId
                ORDER BY created_at DESC;";

            var pets = await connection.QueryAsync<Pet>(sql, new { OwnerId = ownerId });
            return pets;
        }

        public async Task<Pet?> UpdatePetAsync(Guid petId, Guid ownerId, UpdatePetRequest request)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            
            var setParts = new List<string>();
            var parameters = new DynamicParameters();
            parameters.Add("PetId", petId);
            parameters.Add("OwnerId", ownerId);

            if (!string.IsNullOrEmpty(request.Name))
            {
                setParts.Add("name = @Name");
                parameters.Add("Name", request.Name);
            }
            if (request.PhotoUrl != null)
            {
                setParts.Add("photo_url = @PhotoUrl");
                parameters.Add("PhotoUrl", request.PhotoUrl);
            }
            if (request.Breed != null)
            {
                setParts.Add("breed = @Breed");
                parameters.Add("Breed", request.Breed);
            }
            if (request.Weight.HasValue)
            {
                setParts.Add("weight = @Weight");
                parameters.Add("Weight", request.Weight);
            }
            if (request.Age.HasValue)
            {
                setParts.Add("age = @Age");
                parameters.Add("Age", request.Age);
            }

            if (setParts.Count == 0)
                return await GetPetAsync(petId, ownerId);

            var sql = $@"
                UPDATE pets 
                SET {string.Join(", ", setParts)}
                WHERE id = @PetId AND owner_id = @OwnerId
                RETURNING id, owner_id as OwnerId, name, photo_url as PhotoUrl, breed, weight, age, created_at as CreatedAt, updated_at as UpdatedAt;";

            var pet = await connection.QuerySingleOrDefaultAsync<Pet>(sql, parameters);
            return pet;
        }

        public async Task<bool> DeletePetAsync(Guid petId, Guid ownerId)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            
            var sql = @"
                DELETE FROM pets 
                WHERE id = @PetId AND owner_id = @OwnerId;";

            var rowsAffected = await connection.ExecuteAsync(sql, new
            {
                PetId = petId,
                OwnerId = ownerId
            });

            return rowsAffected > 0;
        }
    }
}