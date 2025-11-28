using Microsoft.AspNetCore.Mvc;
using EverPal.WebApi.Services;

namespace EverPal.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TagsController : ControllerBase
    {
        private readonly ITagService _tagService;

        public TagsController(ITagService tagService)
        {
            _tagService = tagService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTags([FromQuery] string? logType = null)
        {
            if (string.IsNullOrEmpty(logType))
            {
                var tags = await _tagService.GetAllTagsAsync();
                return Ok(tags);
            }

            var filteredTags = await _tagService.GetTagsByLogTypeAsync(logType);
            return Ok(filteredTags);
        }
    }
}
