namespace EverPal.WebApi.Models
{
    public class HealthLog
    {
        public Guid Id { get; set; }
        public Guid PetId { get; set; }
        public string EntryText { get; set; } = string.Empty;
        public List<Tag> Tags { get; set; } = new();
        public DateTime LoggedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateHealthLogRequest
    {
        public Guid PetId { get; set; }
        public string EntryText { get; set; } = string.Empty;
        public List<Tag> Tags { get; set; } = new();
        public DateTime? LoggedAt { get; set; }
    }

    public class UpdateHealthLogRequest
    {
        public string? EntryText { get; set; }
        public List<Tag>? Tags { get; set; }
        public DateTime? LoggedAt { get; set; }
    }
}