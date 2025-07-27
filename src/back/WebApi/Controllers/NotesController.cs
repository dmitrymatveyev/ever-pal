using EverPal.WebApi.Models;
using EverPal.WebApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EverPal.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotesController : ControllerBase
    {
        private readonly INoteService _noteService;
        private readonly ILogger<NotesController> _logger;

        public NotesController(INoteService noteService, ILogger<NotesController> logger)
        {
            _noteService = noteService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<Note>> CreateNote([FromBody] CreateNoteRequest request)
        {
            try
            {
                var userId = GetUserId();
                var note = await _noteService.CreateNoteAsync(userId, request);
                return Ok(note);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt to create note for pet {PetId}", request.PetId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating note");
                return BadRequest(new { message = "Failed to create note", error = ex.Message });
            }
        }

        [HttpGet("pet/{petId}")]
        public async Task<ActionResult<IEnumerable<Note>>> GetPetNotes(Guid petId)
        {
            try
            {
                var userId = GetUserId();
                var notes = await _noteService.GetPetNotesAsync(petId, userId);
                return Ok(notes);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt to get notes for pet {PetId}", petId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pet notes");
                return BadRequest(new { message = "Failed to get pet notes", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Note>> GetNote(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var note = await _noteService.GetNoteAsync(id, userId);
                
                if (note == null)
                {
                    return NotFound(new { message = "Note not found" });
                }
                
                return Ok(note);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting note");
                return BadRequest(new { message = "Failed to get note", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Note>> UpdateNote(Guid id, [FromBody] UpdateNoteRequest request)
        {
            try
            {
                var userId = GetUserId();
                var note = await _noteService.UpdateNoteAsync(id, userId, request);
                
                if (note == null)
                {
                    return NotFound(new { message = "Note not found" });
                }
                
                return Ok(note);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating note");
                return BadRequest(new { message = "Failed to update note", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNote(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var deleted = await _noteService.DeleteNoteAsync(id, userId);
                
                if (!deleted)
                {
                    return NotFound(new { message = "Note not found" });
                }
                
                return Ok(new { message = "Note deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting note");
                return BadRequest(new { message = "Failed to delete note", error = ex.Message });
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