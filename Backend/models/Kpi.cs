using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PerformanceEvalTool.Models
{
    [Table("KPIs")]
    public class Kpi
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int KpiId { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public int DepartmentId { get; set; }
        public decimal Weightage { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }

        public ICollection<KpiScore> KpiScores { get; set; } = new List<KpiScore>();
    }
}
