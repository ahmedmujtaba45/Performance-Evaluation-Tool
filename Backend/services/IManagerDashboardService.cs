using PerformanceEvalTool.DTOs;

namespace PerformanceEvalTool.Services
{
    public interface IManagerDashboardService
    {
        Task<ManagerDashboardSummaryDto> GetSummaryAsync(int managerId);
        Task<IReadOnlyList<ManagerTeamMemberDto>> GetTeamMembersAsync(int managerId);
        Task<ManagerTeamMemberDetailDto?> GetTeamMemberDetailAsync(int managerId, string employeeId);
        Task<ManagerEvaluationResponseDto?> SaveEvaluationDraftAsync(int managerId, ManagerEvaluationRequestDto request);
        Task<ManagerEvaluationResponseDto?> SubmitEvaluationToHrAsync(int managerId, ManagerEvaluationRequestDto request);
        Task<IReadOnlyList<ManagerSurveyDto>> GetManagerSurveysAsync(int managerId);
        Task<string> SubmitSurveyResponseAsync(int managerId, ManagerSurveyResponseDto request);
    }
}
