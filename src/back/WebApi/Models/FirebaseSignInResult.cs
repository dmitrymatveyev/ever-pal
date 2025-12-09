namespace EverPal.WebApi.Models
{
    public class FirebaseSignInResult
    {
        public string IdToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public string LocalId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool EmailVerified { get; set; }
        public int ExpiresIn { get; set; }
    }
}
