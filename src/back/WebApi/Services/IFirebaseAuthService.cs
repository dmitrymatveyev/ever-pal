using FirebaseAdmin.Auth;
using EverPal.WebApi.Models;

namespace EverPal.WebApi.Services
{
    public interface IFirebaseAuthService
    {
        Task<UserRecord> CreateUserAsync(string email, string password);
        Task<string> GenerateEmailVerificationLinkAsync(string email);
        Task<FirebaseToken> VerifyIdTokenAsync(string idToken);
        Task<string> CreateCustomTokenAsync(string uid);
        Task DeleteUserAsync(string uid);
        Task<UserRecord> GetUserByEmailAsync(string email);
        Task<UserRecord> GetUserByUidAsync(string uid);
        Task<FirebaseSignInResult> SignInWithPasswordAsync(string email, string password);
        Task SendPasswordResetEmailAsync(string email);
        Task SendEmailVerificationAsync(string idToken);
        Task<FirebaseSignInResult> ExchangeCustomTokenAsync(string customToken);
    }
}
