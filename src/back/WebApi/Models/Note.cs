namespace EverPal.WebApi.Models
{
    public class Note
    {
        public Guid Id { get; set; }
        public Guid PetId { get; set; }
        public string NoteText { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateNoteRequest
    {
        public Guid PetId { get; set; }
        public string NoteText { get; set; } = string.Empty;
    }

    public class UpdateNoteRequest
    {
        public string? NoteText { get; set; }
    }
}