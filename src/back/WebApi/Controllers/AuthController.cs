using EverPal.WebApi.Models;
using EverPal.WebApi.Services;
using EverPal.WebApi.Exceptions;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FirebaseAdmin.Auth;

namespace EverPal.WebApi.Controllers
{
    [Route("api")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAnonymousAuthService _anonymousAuthService;
        private readonly IFirebaseAuthService _firebaseAuthService;
        private readonly IUserService _userService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAnonymousAuthService anonymousAuthService,
            IFirebaseAuthService firebaseAuthService,
            IUserService userService,
            ILogger<AuthController> logger)
        {
            _anonymousAuthService = anonymousAuthService;
            _firebaseAuthService = firebaseAuthService;
            _userService = userService;
            _logger = logger;
        }

        [HttpPost("anonymous")]
        public async Task<ActionResult<AuthResponse>> Anonymous()
        {
            try
            {
                var result = await _anonymousAuthService.CreateAnonymousUserAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during anonymous authentication");
                return BadRequest(new { message = "Anonymous authentication failed", error = ex.Message });
            }
        }

        [HttpPost("auth/convert-anonymous")]
        public async Task<ActionResult<ConvertAnonymousResponse>> ConvertAnonymous([FromBody] ConvertAnonymousRequest request)
        {
            var authType = User.FindFirst("auth_type")?.Value;
            if (authType != "anonymous")
            {
                return Unauthorized(new { message = "Only anonymous users can convert to email accounts" });
            }

            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user authentication" });
            }

            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            if (request.Password.Length < 8)
            {
                return BadRequest(new { message = "Password must be at least 8 characters" });
            }

            try
            {
                var user = await _userService.GetUserByIdAsync(userId.ToString());
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                if (!string.IsNullOrEmpty(user.FirebaseUid))
                {
                    return BadRequest(new { message = "User already has an email account" });
                }

                var existingUserWithEmail = await _userService.GetUserByEmailAsync(request.Email);
                if (existingUserWithEmail != null)
                {
                    return Conflict(new { message = "This email is already connected to another account" });
                }

                try
                {
                    await _firebaseAuthService.GetUserByEmailAsync(request.Email);
                    return Conflict(new { message = "This email is already connected to another account" });
                }
                catch (FirebaseAuthException)
                {
                }

                UserRecord firebaseUser;
                try
                {
                    firebaseUser = await _firebaseAuthService.CreateUserAsync(request.Email, request.Password);
                }
                catch (FirebaseAuthException ex)
                {
                    _logger.LogError(ex, "Firebase user creation failed for email {Email}", request.Email);
                    return BadRequest(new { message = $"Failed to create account: {ex.Message}" });
                }

                try
                {
                    var success = await _userService.ConvertAnonymousToEmailAsync(userId, firebaseUser.Uid, request.Email);
                    if (!success)
                    {
                        await _firebaseAuthService.DeleteUserAsync(firebaseUser.Uid);
                        return StatusCode(500, new { message = "Failed to update account. Please try again." });
                    }

                    var customToken = await _firebaseAuthService.CreateCustomTokenAsync(firebaseUser.Uid);
                    var tokenResult = await _firebaseAuthService.ExchangeCustomTokenAsync(customToken);

                    try
                    {
                        await _firebaseAuthService.SendEmailVerificationAsync(tokenResult.IdToken);
                        await _userService.UpdateEmailVerificationSentAsync(userId);
                        _logger.LogInformation("Email verification sent to {Email}", request.Email);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to send email verification to {Email}", request.Email);
                    }

                    return Ok(new ConvertAnonymousResponse
                    {
                        Success = true,
                        UserId = userId.ToString(),
                        Email = request.Email,
                        EmailVerified = false,
                        Message = "Account converted. Please check your email to verify your account.",
                        FirebaseToken = tokenResult.IdToken
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Database update failed during conversion for user {UserId}", userId);
                    await _firebaseAuthService.DeleteUserAsync(firebaseUser.Uid);
                    return StatusCode(500, new { message = "Account conversion failed. Your data is safe." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during account conversion for user {UserId}", userId);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again." });
            }
        }

        [HttpPost("auth/login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            try
            {
                var signInResult = await _firebaseAuthService.SignInWithPasswordAsync(request.Email, request.Password);

                var user = await _userService.GetUserByFirebaseUidAsync(signInResult.LocalId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var trialStatus = new TrialStatusResponse
                {
                    TrialStarted = user.TrialStartedAt.HasValue,
                    IsTrialActive = await _userService.IsTrialActiveAsync(user.Id.ToString()),
                    IsPaid = user.IsPaid
                };

                if (user.TrialStartedAt.HasValue && user.TrialEndsAt.HasValue)
                {
                    var daysRemaining = (user.TrialEndsAt.Value - DateTime.UtcNow).Days;
                    trialStatus.DaysRemaining = Math.Max(0, daysRemaining);
                }

                return Ok(new LoginResponse
                {
                    Success = true,
                    Token = signInResult.IdToken,
                    UserId = user.Id.ToString(),
                    Email = user.Email ?? request.Email,
                    EmailVerified = signInResult.EmailVerified,
                    TrialStatus = trialStatus
                });
            }
            catch (FirebaseRestApiException ex)
            {
                _logger.LogWarning("Login failed for email {Email}: {Error}", request.Email, ex.ErrorCode);

                if (ex.ErrorCode == "EMAIL_NOT_FOUND" || ex.ErrorCode == "INVALID_PASSWORD" || ex.ErrorCode == "INVALID_LOGIN_CREDENTIALS")
                {
                    return Unauthorized(new { message = "Incorrect email or password" });
                }

                return BadRequest(new { message = "Login failed. Please try again." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during login for email {Email}", request.Email);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again." });
            }
        }

        [HttpPost("auth/resend-verification")]
        public async Task<ActionResult> ResendVerification([FromBody] EmailRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { message = "Email is required" });
            }

            try
            {
                var firebaseUser = await _firebaseAuthService.GetUserByEmailAsync(request.Email);
                var user = await _userService.GetUserByFirebaseUidAsync(firebaseUser.Uid);

                if (user != null)
                {
                    var verificationLink = await _firebaseAuthService.GenerateEmailVerificationLinkAsync(request.Email);
                    await _userService.UpdateEmailVerificationSentAsync(user.Id);
                    _logger.LogInformation("Email verification link generated for {Email}: {Link}", request.Email, verificationLink);
                }

                return Ok(new { success = true, message = "Verification email sent." });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to resend verification email to {Email}", request.Email);
                return Ok(new { success = true, message = "Verification email sent." });
            }
        }

        [HttpPost("auth/forgot-password")]
        public async Task<ActionResult> ForgotPassword([FromBody] EmailRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { message = "Email is required" });
            }

            try
            {
                await _firebaseAuthService.SendPasswordResetEmailAsync(request.Email);
                _logger.LogInformation("Password reset email sent to {Email}", request.Email);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send password reset email to {Email}", request.Email);
            }

            return Ok(new { success = true, message = "If an account exists with this email, a reset link has been sent." });
        }
    }
}