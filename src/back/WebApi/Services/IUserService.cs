using EverPal.WebApi.Models;

namespace EverPal.WebApi.Services
{
    public interface IUserService
    {
        Task<User?> GetUserByIdAsync(string userId);
        Task<User?> GetUserByStripePaymentIntentAsync(string? paymentIntentId);
        Task<bool> MarkUserAsPaidAsync(string userId, string? stripeCustomerId, string? stripePaymentIntentId);
        Task<bool> IsTrialActiveAsync(string userId);
        Task<bool> HasPaidAccessAsync(string userId);
        Task AcknowledgeDisclaimerAsync(string userId);
    }
}
