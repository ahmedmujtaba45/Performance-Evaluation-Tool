namespace PerformanceEvalTool.Dtos.Kpi
{
    public class UpdateKpiDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal MaxScore { get; set; }
        public decimal Weight { get; set; }
        public string Target { get; set; }
    }
}
