using EverPal.WebApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EverPal.WebApi.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpGet("trial-status")]
        public async Task<IActionResult> GetTrialStatus()
        {
            var userId = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Trial status requested without valid user_id claim");
                return Unauthorized(new { message = "User ID not found in token" });
            }

            try
            {
                var user = await _userService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning("User {UserId} not found when fetching trial status", userId);
                    return NotFound(new { message = "User not found" });
                }

                var isTrialActive = await _userService.IsTrialActiveAsync(userId);
                var isPaid = user.IsPaid;
                var trialStarted = user.TrialStartedAt.HasValue;

                var daysRemaining = user.TrialEndsAt.HasValue
                    ? Math.Max(0, (int)(user.TrialEndsAt.Value - DateTime.UtcNow).TotalDays)
                    : (int?)null;

                return Ok(new
                {
                    isTrialActive,
                    isPaid,
                    trialStarted,
                    trialEndsAt = user.TrialEndsAt,
                    daysRemaining,
                    disclaimerAcknowledged = user.DisclaimerAcknowledged,
                    emailVerified = user.EmailVerified
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching trial status for user {UserId}", userId);
                return StatusCode(500, new { message = "Failed to fetch trial status", error = ex.Message });
            }
        }

        [HttpPost("acknowledge-disclaimer")]
        public async Task<IActionResult> AcknowledgeDisclaimer()
        {
            var userId = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Disclaimer acknowledgment attempted without valid user_id claim");
                return Unauthorized(new { message = "User ID not found in token" });
            }

            try
            {
                await _userService.AcknowledgeDisclaimerAsync(userId);
                _logger.LogInformation("User {UserId} successfully acknowledged disclaimer", userId);
                return Ok(new { message = "Disclaimer acknowledged successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error acknowledging disclaimer for user {UserId}", userId);
                return StatusCode(500, new { message = "Failed to acknowledge disclaimer", error = ex.Message });
            }
        }
    }
}
