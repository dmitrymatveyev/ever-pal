namespace EverPal.WebApi.Models
{
    public class AuthResponse
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public string UserId { get; set; }
        public string Email { get; set; }
        public string DisplayName { get; set; }
    }
}