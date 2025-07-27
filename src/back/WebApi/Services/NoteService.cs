using Dapper;
using EverPal.WebApi.Models;
using Npgsql;

namespace EverPal.WebApi.Services
{
    public class NoteService : INoteService
    {
        private readonly string _connectionString;

        public NoteService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<Note> CreateNoteAsync(Guid userId, CreateNoteRequest request)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            // First verify the user owns the pet
            var petOwnershipSql = @"
                SELECT COUNT(1) FROM pets 
                WHERE id = @PetId AND owner_id = @UserId AND deleted_at IS NULL;";

            var ownsPet = await connection.QuerySingleAsync<int>(petOwnershipSql, new
            {
                PetId = request.PetId,
                UserId = userId
            });

            if (ownsPet == 0)
            {
                throw new UnauthorizedAccessException("Pet not found or access denied");
            }

            var sql = @"
                INSERT INTO notes (pet_id, note_text)
                VALUES (@PetId, @NoteText)
                RETURNING id as Id, pet_id as PetId, note_text as NoteText, created_at as CreatedAt, updated_at as UpdatedAt;";

            var note = await connection.QuerySingleAsync<Note>(sql, new
            {
                PetId = request.PetId,
                NoteText = request.NoteText
            });

            return note;
        }

        public async Task<Note?> GetNoteAsync(Guid noteId, Guid userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT n.id as Id, n.pet_id as PetId, n.note_text as NoteText, n.created_at as CreatedAt, n.updated_at as UpdatedAt
                FROM notes n
                INNER JOIN pets p ON n.pet_id = p.id
                WHERE n.id = @NoteId AND p.owner_id = @UserId AND n.deleted_at IS NULL AND p.deleted_at IS NULL;";

            var note = await connection.QuerySingleOrDefaultAsync<Note>(sql, new
            {
                NoteId = noteId,
                UserId = userId
            });

            return note;
        }

        public async Task<IEnumerable<Note>> GetPetNotesAsync(Guid petId, Guid userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            // First verify the user owns the pet
            var petOwnershipSql = @"
                SELECT COUNT(1) FROM pets 
                WHERE id = @PetId AND owner_id = @UserId AND deleted_at IS NULL;";

            var ownsPet = await connection.QuerySingleAsync<int>(petOwnershipSql, new
            {
                PetId = petId,
                UserId = userId
            });

            if (ownsPet == 0)
            {
                throw new UnauthorizedAccessException("Pet not found or access denied");
            }

            var sql = @"
                SELECT id as Id, pet_id as PetId, note_text as NoteText, created_at as CreatedAt, updated_at as UpdatedAt
                FROM notes 
                WHERE pet_id = @PetId AND deleted_at IS NULL
                ORDER BY created_at DESC;";

            var notes = await connection.QueryAsync<Note>(sql, new { PetId = petId });
            return notes;
        }

        public async Task<Note?> UpdateNoteAsync(Guid noteId, Guid userId, UpdateNoteRequest request)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            if (string.IsNullOrEmpty(request.NoteText))
                return await GetNoteAsync(noteId, userId);

            var sql = @"
                UPDATE notes 
                SET note_text = @NoteText
                FROM pets p
                WHERE notes.id = @NoteId 
                  AND notes.pet_id = p.id 
                  AND p.owner_id = @UserId 
                  AND notes.deleted_at IS NULL 
                  AND p.deleted_at IS NULL
                RETURNING notes.id as Id, notes.pet_id as PetId, notes.note_text as NoteText, notes.created_at as CreatedAt, notes.updated_at as UpdatedAt;";

            var note = await connection.QuerySingleOrDefaultAsync<Note>(sql, new
            {
                NoteId = noteId,
                UserId = userId,
                NoteText = request.NoteText
            });

            return note;
        }

        public async Task<bool> DeleteNoteAsync(Guid noteId, Guid userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                UPDATE notes 
                SET deleted_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
                FROM pets p
                WHERE notes.id = @NoteId 
                  AND notes.pet_id = p.id 
                  AND p.owner_id = @UserId 
                  AND notes.deleted_at IS NULL 
                  AND p.deleted_at IS NULL;";

            var rowsAffected = await connection.ExecuteAsync(sql, new
            {
                NoteId = noteId,
                UserId = userId
            });

            return rowsAffected > 0;
        }
    }
}