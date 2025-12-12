namespace EverPal.WebApi.Models
{
    public class ExportPdfRequest
    {
        public Guid PetId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IncludePhotos { get; set; } = true;
    }
}
