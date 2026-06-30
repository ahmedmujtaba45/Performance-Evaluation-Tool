using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PerformanceEvalTool.Models
{
    [Table("Surveys")]
    public class Survey
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SurveyId { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Audience { get; set; } = "All Employees";

        [MaxLength(30)]
        public string Status { get; set; } = "Draft";

        public DateTime? DueDate { get; set; }

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

        public int ResponseCount { get; set; }

        public int TotalPossible { get; set; }

        public ICollection<SurveyQuestion> Questions { get; set; } = new List<SurveyQuestion>();
        public ICollection<SurveyResponse> Responses { get; set; } = new List<SurveyResponse>();
    }
}
