using System.Collections.Generic;

namespace PerformanceEvalTool.Dtos.Report
{
    public class DepartmentReportDto
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public int EmployeeCount { get; set; }
        public decimal AverageScore { get; set; }
        public int CompletedEvaluations { get; set; }
        public int PendingEvaluations { get; set; }
        public List<KpiPerformanceDto> KpiPerformance { get; set; } = new List<KpiPerformanceDto>();
    }

    public class KpiPerformanceDto
    {
        public string KpiName { get; set; }
        public decimal CurrentScore { get; set; }
        public decimal TargetScore { get; set; }
        public decimal Weight { get; set; }
    }
}
