using EverPal.WebApi.Models;
using EverPal.WebApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace EverPal.WebApi.Controllers
{
    [Route("api")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IFirebaseAuthService _firebaseAuthService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IFirebaseAuthService firebaseAuthService, ILogger<AuthController> logger)
        {
            _firebaseAuthService = firebaseAuthService;
            _logger = logger;
        }

        [HttpPost("signup")]
        public async Task<ActionResult<AuthResponse>> SignUp([FromBody] SignUpRequest request)
        {
            try
            {
                var result = await _firebaseAuthService.SignUpAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during signup");
                return BadRequest(new { message = "Registration failed", error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                var result = await _firebaseAuthService.LoginAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return BadRequest(new { message = "Authentication failed", error = ex.Message });
            }
        }
    }
}