using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PerformanceEvalTool.Models
{
    [Table("KpiScores")]
    public class KpiScore
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int KpiScoreId { get; set; }

        public int EvaluationId { get; set; }
        public int KpiId { get; set; }
        public decimal Score { get; set; }

        [MaxLength(500)]
        public string? Comments { get; set; }

        [ForeignKey("EvaluationId")]
        public Evaluation? Evaluation { get; set; }

        [ForeignKey("KpiId")]
        public Kpi? Kpi { get; set; }
    }
}
