using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PerformanceEvalTool.Models
{
    [Table("SurveyResponses")]
    public class SurveyResponse
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SurveyResponseId { get; set; }

        public int SurveyId { get; set; }
        public int? RespondentId { get; set; }

        [MaxLength(4000)]
        public string AnswersJson { get; set; } = "{}";

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("SurveyId")]
        public Survey? Survey { get; set; }
    }
}
