using EverPal.WebApi.Models;

namespace EverPal.WebApi.Services
{
    public interface IFirebaseAuthService
    {
        Task<AuthResponse> SignUpAsync(SignUpRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
    }
}