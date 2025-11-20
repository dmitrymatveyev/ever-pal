namespace EverPal.WebApi.Models
{
    public class Tag
    {
        public Guid Id { get; set; }
        public string Label { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Category { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
