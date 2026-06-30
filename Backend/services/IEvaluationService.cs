using System.Collections.Generic;
using System.Threading.Tasks;
using PerformanceEvalTool.Dtos.Evaluation;

namespace PerformanceEvalTool.Services
{
    public interface IEvaluationService
    {
        Task<List<EvaluationDetailDto>> GetAllEvaluationsAsync();
        Task<EvaluationDetailDto?> GetEvaluationByIdAsync(int id);
        Task<List<EvaluationDetailDto>> GetEmployeeEvaluationsAsync(int employeeId);
        Task<List<EvaluationDetailDto>> GetCycleEvaluationsAsync(int cycleId);
        Task<EvaluationDetailDto> CreateEvaluationAsync(EvaluationDetailDto dto);
        Task<EvaluationDetailDto?> UpdateEvaluationAsync(EvaluationDetailDto dto);
        Task<bool> DeleteEvaluationAsync(int id);
    }
}
