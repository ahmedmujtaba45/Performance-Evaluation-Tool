using System.Collections.Generic;
using System.Threading.Tasks;
using PerformanceEvalTool.Dtos.Report;

namespace PerformanceEvalTool.Services
{
    public interface IReportService
    {
        Task<List<ReportDto>> GetAllReportsAsync();
        Task<ReportDto?> GetReportByIdAsync(int id);
        Task<DepartmentReportDto?> GetDepartmentReportAsync(int departmentId);
        Task<List<DepartmentReportDto>> GetAllDepartmentReportsAsync();
    }
}
