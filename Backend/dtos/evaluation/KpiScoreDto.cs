namespace PerformanceEvalTool.Dtos.Evaluation
{
    public class KpiScoreDto
    {
        public int KpiId { get; set; }
        public string KpiTitle { get; set; }
        public decimal Score { get; set; }
        public decimal MaxScore { get; set; }
        public string Comments { get; set; }
    }
}
