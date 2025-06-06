using EverPal.WebApi.Models;

namespace EverPal.WebApi.Services
{
    public interface IAnonymousAuthService
    {
        Task<AuthResponse> CreateAnonymousUserAsync();
        Task<bool> ValidateAnonymousTokenAsync(string token);
    }
}
