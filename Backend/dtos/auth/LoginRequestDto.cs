// DTOs/LoginRequestDto.cs
// AI-Powered Performance Evaluation Tool — E1-US1 User Login
// Data Transfer Object received from the frontend login form.

using System.ComponentModel.DataAnnotations;

namespace PerformanceEvalTool.DTOs
{
    /// <summary>
    /// Payload sent by the client when a user attempts to log in.
    /// </summary>
    public class LoginRequestDto
    {
        /// <summary>
        /// The user's registered email address.
        /// </summary>
        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Please provide a valid email address.")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// The user's plain-text password (will be verified against hashed value in DB).
        /// </summary>
        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// The role the user selected on the login page (Manager / HR / Employee / Admin).
        /// Used to cross-validate against the role stored in the database.
        /// </summary>
        [Required(ErrorMessage = "Role is required.")]
        public string Role { get; set; } = string.Empty;
    }
}
