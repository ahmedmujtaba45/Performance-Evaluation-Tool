// Models/User.cs
// AI-Powered Performance Evaluation Tool — E1-US1 User Login
// Entity class that maps to the [Users] table in SQL Server.

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PerformanceEvalTool.Models
{
    /// <summary>
    /// Represents a system user.
    /// Maps to the [Users] table in the PerformanceEvalDB database.
    /// </summary>
    [Table("Users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// BCrypt-hashed password. Never store plain text.
        /// </summary>
        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        /// <summary>
        /// Role: Admin | HR | Manager | Employee
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = string.Empty;

        public int? DepartmentId { get; set; }

        [MaxLength(100)]
        public string? Designation { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLoginAt { get; set; }
    }
}
