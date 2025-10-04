using EverPal.WebApi.Models;

namespace EverPal.WebApi.Services
{
    public interface IHealthLogService
    {
        Task<HealthLog> CreateHealthLogAsync(Guid userId, CreateHealthLogRequest request);
        Task<HealthLog?> GetHealthLogAsync(Guid healthLogId, Guid userId);
        Task<IEnumerable<HealthLog>> GetHealthLogsAsync(Guid petId, Guid userId, int limit, int offset);
        Task<HealthLog?> UpdateHealthLogAsync(Guid healthLogId, Guid userId, UpdateHealthLogRequest request);
        Task<bool> DeleteHealthLogAsync(Guid healthLogId, Guid userId);
    }
}