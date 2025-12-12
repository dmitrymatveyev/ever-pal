using EverPal.WebApi.Models;
using EverPal.WebApi.Services;
using EverPal.WebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EverPal.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HealthLogsController : ControllerBase
    {
        private readonly IHealthLogService _healthLogService;
        private readonly IPdfExportService _pdfExportService;
        private readonly IUserService _userService;
        private readonly ILogger<HealthLogsController> _logger;

        public HealthLogsController(
            IHealthLogService healthLogService,
            IPdfExportService pdfExportService,
            IUserService userService,
            ILogger<HealthLogsController> logger)
        {
            _healthLogService = healthLogService;
            _pdfExportService = pdfExportService;
            _userService = userService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<HealthLog>> CreateHealthLog([FromBody] CreateHealthLogRequest request)
        {
            try
            {
                var userId = User.GetUserId();
                var healthLog = await _healthLogService.CreateHealthLogAsync(userId, request);
                return Ok(healthLog);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt to create health log for pet {PetId}", request.PetId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating health log");
                return BadRequest(new { message = "Failed to create health log", error = ex.Message });
            }
        }

        [HttpGet("pet/{petId}")]
        public async Task<ActionResult<IEnumerable<HealthLog>>> GetPetHealthLogs(
            Guid petId,
            [FromQuery] int limit = 10,
            [FromQuery] int offset = 0)
        {
            try
            {
                var userId = User.GetUserId();
                var healthLogs = await _healthLogService.GetHealthLogsAsync(petId, userId, limit, offset);
                return Ok(healthLogs);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt to get health logs for pet {PetId}", petId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pet health logs");
                return BadRequest(new { message = "Failed to get pet health logs", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HealthLog>> GetHealthLog(Guid id)
        {
            try
            {
                var userId = User.GetUserId();
                var healthLog = await _healthLogService.GetHealthLogAsync(id, userId);

                if (healthLog == null)
                {
                    return NotFound(new { message = "Health log not found" });
                }

                return Ok(healthLog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting health log");
                return BadRequest(new { message = "Failed to get health log", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<HealthLog>> UpdateHealthLog(Guid id, [FromBody] UpdateHealthLogRequest request)
        {
            try
            {
                var userId = User.GetUserId();
                var healthLog = await _healthLogService.UpdateHealthLogAsync(id, userId, request);

                if (healthLog == null)
                {
                    return NotFound(new { message = "Health log not found" });
                }

                return Ok(healthLog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating health log");
                return BadRequest(new { message = "Failed to update health log", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteHealthLog(Guid id)
        {
            try
            {
                var userId = User.GetUserId();
                var deleted = await _healthLogService.DeleteHealthLogAsync(id, userId);

                if (!deleted)
                {
                    return NotFound(new { message = "Health log not found" });
                }

                return Ok(new { message = "Health log deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting health log");
                return BadRequest(new { message = "Failed to delete health log", error = ex.Message });
            }
        }

        [HttpPost("export-pdf")]
        public async Task<IActionResult> ExportPdf([FromBody] ExportPdfRequest request)
        {
            try
            {
                var userId = User.GetUserId();

                var hasAccess = await _userService.IsTrialActiveAsync(userId.ToString()) ||
                                await _userService.HasPaidAccessAsync(userId.ToString());

                if (!hasAccess)
                {
                    return StatusCode(402, new { message = "Trial expired. Please upgrade to continue using EverPal." });
                }

                var pdfBytes = await _pdfExportService.GeneratePdfReportAsync(userId, request);

                var fileName = $"health-report-{DateTime.UtcNow:yyyy-MM-dd}.pdf";

                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt to export PDF for pet {PetId}", request.PetId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting PDF for pet {PetId}", request.PetId);
                return BadRequest(new { message = "Failed to generate PDF report", error = ex.Message });
            }
        }
    }
}