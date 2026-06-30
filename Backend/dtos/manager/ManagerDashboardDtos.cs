using System.ComponentModel.DataAnnotations;

namespace PerformanceEvalTool.DTOs
{
    public class ManagerDashboardSummaryDto
    {
        public int TeamSize { get; set; }
        public int EvaluationsDone { get; set; }
        public int PendingReviews { get; set; }
        public decimal TeamAverageScore { get; set; }
        public decimal EvaluationCompletionPercentage { get; set; }
    }

    public class ManagerTeamMemberDto
    {
        public string EmployeeId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Initials { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public int? ManagerScore { get; set; }
        public int? HrScore { get; set; }
        public int? TotalScore { get; set; }
        public string Status { get; set; } = "Pending";
    }

    public class ManagerKpiDto
    {
        public string KpiId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Weight { get; set; }
        public string Target { get; set; } = string.Empty;
        public string Actual { get; set; } = string.Empty;
        public int? ManagerScore { get; set; }
        public int? HrScore { get; set; }
        public bool IsOnTarget { get; set; }
    }

    public class ManagerTeamMemberDetailDto
    {
        public ManagerTeamMemberDto Employee { get; set; } = new();
        public List<ManagerKpiDto> Kpis { get; set; } = new();
        public List<QuarterlyScoreDto> QuarterlyTeamAverage { get; set; } = new();
    }

    public class QuarterlyScoreDto
    {
        public string Quarter { get; set; } = string.Empty;
        public decimal Score { get; set; }
    }

    public class ManagerEvaluationKpiScoreDto
    {
        [Required]
        public string KpiId { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Score { get; set; }

        [MaxLength(300)]
        public string? Comment { get; set; }
    }

    public class ManagerEvaluationRequestDto
    {
        [Required]
        public string EmployeeId { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Cycle { get; set; } = "Q1 2026";

        [MinLength(1)]
        public List<ManagerEvaluationKpiScoreDto> KpiScores { get; set; } = new();
    }

    public class ManagerEvaluationResponseDto
    {
        public string ConfirmationId { get; set; } = string.Empty;
        public string EmployeeId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime SavedAtUtc { get; set; }
    }

    public class ManagerSurveyDto
    {
        public string SurveyId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DeadlineUtc { get; set; }
        public bool IsAnonymous { get; set; }
        public int QuestionCount { get; set; }
    }

    public class ManagerSurveyResponseDto
    {
        [Required]
        public string SurveyId { get; set; } = string.Empty;

        public List<ManagerSurveyAnswerDto> Answers { get; set; } = new();
    }

    public class ManagerSurveyAnswerDto
    {
        [Required]
        public string QuestionId { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Answer { get; set; } = string.Empty;
    }
}
