namespace EverPal.WebApi.Models
{
    public class SignUpRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string DisplayName { get; set; }
    }
}