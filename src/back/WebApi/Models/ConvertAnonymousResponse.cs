namespace EverPal.WebApi.Models
{
    public class ConvertAnonymousResponse
    {
        public bool Success { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool EmailVerified { get; set; }
        public string Message { get; set; } = string.Empty;
        public string FirebaseToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
