using System.Collections.Generic;
using System.Threading.Tasks;
using PerformanceEvalTool.Dtos.Kpi;

namespace PerformanceEvalTool.Services
{
    public interface IKpiService
    {
        Task<List<KpiDetailDto>> GetAllKpisAsync();
        Task<KpiDetailDto?> GetKpiByIdAsync(int id);
        Task<List<KpiDetailDto>> GetKpisByDepartmentAsync(int departmentId);
        Task<KpiDetailDto> CreateKpiAsync(CreateKpiDto dto);
        Task<KpiDetailDto?> UpdateKpiAsync(UpdateKpiDto dto);
        Task<bool> DeleteKpiAsync(int id);
    }
}
