// DTOs/LoginResponseDto.cs
// AI-Powered Performance Evaluation Tool — E1-US1 User Login
// Returned to the frontend when login succeeds.

namespace PerformanceEvalTool.DTOs
{
    /// <summary>
    /// Response payload sent back to the client after a successful login.
    /// </summary>
    public class LoginResponseDto
    {
        /// <summary>
        /// JWT bearer token used to authenticate subsequent API requests.
        /// </summary>
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// Expiry date/time of the token (UTC).
        /// The frontend can use this to show a session-expiry warning.
        /// </summary>
        public DateTime TokenExpiry { get; set; }

        /// <summary>
        /// The user's unique identifier in the database.
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Full display name of the logged-in user.
        /// </summary>
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Email address of the logged-in user.
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Role assigned to the user (Admin / HR / Manager / Employee).
        /// The frontend uses this to redirect to the correct dashboard.
        /// </summary>
        public string Role { get; set; } = string.Empty;
    }
}
