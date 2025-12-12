using EverPal.WebApi.Models;

namespace EverPal.WebApi.Services
{
    public interface IPdfExportService
    {
        Task<byte[]> GeneratePdfReportAsync(Guid userId, ExportPdfRequest request);
    }
}
