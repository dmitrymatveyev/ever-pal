namespace EverPal.WebApi.Models
{
    public class Pet
    {
        public Guid Id { get; set; }
        public Guid OwnerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public string? Breed { get; set; }
        public decimal? Weight { get; set; }
        public int? Age { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreatePetRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public string? Breed { get; set; }
        public decimal? Weight { get; set; }
        public int? Age { get; set; }
    }

    public class UpdatePetRequest
    {
        public string? Name { get; set; }
        public string? PhotoUrl { get; set; }
        public string? Breed { get; set; }
        public decimal? Weight { get; set; }
        public int? Age { get; set; }
    }
}