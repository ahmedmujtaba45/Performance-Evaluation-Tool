using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PerformanceEvalTool.Models
{
    [Table("Evaluations")]
    public class Evaluation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EvaluationId { get; set; }

        public int EmployeeId { get; set; }
        public int EvaluatorId { get; set; }
        public int CycleId { get; set; }
        public decimal? ManagerScore { get; set; }
        public decimal? HRScore { get; set; }
        public decimal? FinalScore { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending";

        public DateTime? SubmittedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("EmployeeId")]
        public User? Employee { get; set; }

        [ForeignKey("EvaluatorId")]
        public User? Evaluator { get; set; }

        [ForeignKey("CycleId")]
        public EvaluationCycle? Cycle { get; set; }

        public ICollection<KpiScore> KpiScores { get; set; } = new List<KpiScore>();
    }
}
