using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PerformanceEvalTool.Models
{
    [Table("SurveyQuestions")]
    public class SurveyQuestion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SurveyQuestionId { get; set; }

        public int SurveyId { get; set; }

        [Required]
        [MaxLength(300)]
        public string Text { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Type { get; set; } = "rating";

        [MaxLength(1000)]
        public string OptionsCsv { get; set; } = string.Empty;

        [ForeignKey("SurveyId")]
        public Survey? Survey { get; set; }
    }
}
