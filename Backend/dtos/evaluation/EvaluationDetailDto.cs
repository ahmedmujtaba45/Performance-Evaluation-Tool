using System.Collections.Generic;

namespace PerformanceEvalTool.Dtos.Evaluation
{
    public class EvaluationDetailDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public int EvaluationCycleId { get; set; }
        public string CycleName { get; set; }
        public decimal TotalScore { get; set; }
        public string Status { get; set; }
        public string Comments { get; set; }
        public List<KpiScoreDto> KpiScores { get; set; } = new List<KpiScoreDto>();
        public Dictionary<string, decimal> HRScores { get; set; } = new Dictionary<string, decimal>();
    }
}
