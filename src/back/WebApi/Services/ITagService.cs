using EverPal.WebApi.Models;

namespace EverPal.WebApi.Services
{
    public interface ITagService
    {
        Task<IEnumerable<Tag>> GetAllTagsAsync();
        Task<IEnumerable<Tag>> GetTagsByLogTypeAsync(string logType);
    }
}
