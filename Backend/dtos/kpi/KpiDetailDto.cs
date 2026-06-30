namespace PerformanceEvalTool.Dtos.Kpi
{
    public class KpiDetailDto
    {
        public int Id { get; set; }
        public int DepartmentId { get; set; }
        public string Department { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal MaxScore { get; set; }
        public decimal Weight { get; set; }
        public string Target { get; set; }
    }
}
