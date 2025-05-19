using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EverPal.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // This attribute requires authentication
    public class MainController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            // Access the authenticated user's ID
            var userId = User.FindFirst("firebase_uid")?.Value;
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            return Ok(new 
            { 
                message = "This is a protected endpoint",
                userId,
                email
            });
        }
    }
}