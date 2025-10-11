using EverPal.WebApi.Models;
using EverPal.WebApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace EverPal.WebApi.Controllers
{
    [Route("api")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAnonymousAuthService _anonymousAuthService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAnonymousAuthService anonymousAuthService,
            ILogger<AuthController> logger)
        {
            _anonymousAuthService = anonymousAuthService;
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
    }
}