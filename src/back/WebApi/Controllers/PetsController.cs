using EverPal.WebApi.Models;
using EverPal.WebApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dapper;
using System.Security.Claims;

namespace EverPal.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PetsController : ControllerBase
    {
        private readonly IPetService _petService;
        private readonly ILogger<PetsController> _logger;

        public PetsController(IPetService petService, ILogger<PetsController> logger)
        {
            _petService = petService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<Pet>> CreatePet([FromBody] CreatePetRequest request)
        {
            try
            {
                var ownerId = GetUserId();
                var pet = await _petService.CreatePetAsync(ownerId, request);
                return Ok(pet);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating pet");
                return BadRequest(new { message = "Failed to create pet", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pet>>> GetPets()
        {
            try
            {
                var ownerId = GetUserId();
                var pets = await _petService.GetUserPetsAsync(ownerId);
                return Ok(pets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pets");
                return BadRequest(new { message = "Failed to get pets", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Pet>> GetPet(Guid id)
        {
            try
            {
                var ownerId = GetUserId();
                var pet = await _petService.GetPetAsync(id, ownerId);
                
                if (pet == null)
                    return NotFound(new { message = "Pet not found" });
                
                return Ok(pet);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pet");
                return BadRequest(new { message = "Failed to get pet", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Pet>> UpdatePet(Guid id, [FromBody] UpdatePetRequest request)
        {
            try
            {
                var ownerId = GetUserId();
                var pet = await _petService.UpdatePetAsync(id, ownerId, request);
                
                if (pet == null)
                    return NotFound(new { message = "Pet not found" });
                
                return Ok(pet);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating pet");
                return BadRequest(new { message = "Failed to update pet", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePet(Guid id)
        {
            try
            {
                var ownerId = GetUserId();
                var deleted = await _petService.DeletePetAsync(id, ownerId);
                
                if (!deleted)
                    return NotFound(new { message = "Pet not found" });
                
                return Ok(new { message = "Pet deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting pet");
                return BadRequest(new { message = "Failed to delete pet", error = ex.Message });
            }
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Unable to determine user ID");
            }
            
            return userId;
        }
    }
}