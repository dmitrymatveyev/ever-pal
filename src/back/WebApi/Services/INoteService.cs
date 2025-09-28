using EverPal.WebApi.Models;

namespace EverPal.WebApi.Services
{
    public interface INoteService
    {
        Task<Note> CreateNoteAsync(Guid userId, CreateNoteRequest request);
        Task<Note?> GetNoteAsync(Guid noteId, Guid userId);
        Task<IEnumerable<Note>> GetNotesAsync(Guid petId, Guid userId);
        Task<Note?> UpdateNoteAsync(Guid noteId, Guid userId, UpdateNoteRequest request);
        Task<bool> DeleteNoteAsync(Guid noteId, Guid userId);
    }
}