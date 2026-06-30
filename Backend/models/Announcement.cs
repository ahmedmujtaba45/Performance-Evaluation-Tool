using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PerformanceEvalTool.Models
{
    [Table("Announcements")]
    public class Announcement
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AnnouncementId { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Body { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Category { get; set; } = "General";

        [MaxLength(100)]
        public string Audience { get; set; } = "All Employees";

        [MaxLength(100)]
        public string Author { get; set; } = "HR";

        public bool Pinned { get; set; }

        public int Viewed { get; set; }

        public DateTime PostedOn { get; set; } = DateTime.UtcNow;
    }
}
