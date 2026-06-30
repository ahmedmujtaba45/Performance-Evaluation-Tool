// Controllers/AuthController.cs
// AI-Powered Performance Evaluation Tool — E1-US1 User Login
// ASP.NET Core Web API controller: exposes POST /api/auth/login

using Microsoft.AspNetCore.Mvc;
using PerformanceEvalTool.DTOs;
using PerformanceEvalTool.Services;

namespace PerformanceEvalTool.Controllers
{
    /// <summary>
    /// Handles user authentication endpoints.
    ///
    /// Base route : /api/auth
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger      = logger;
        }

        // ── POST /api/auth/login ──────────────────────────────────────────
        /// <summary>
        /// Authenticates a user and returns a JWT bearer token.
        ///
        /// Called by the frontend login page (login.js) when the user
        /// submits the Sign In form.
        ///
        /// E1-US1 Acceptance Criteria:
        ///   Given a registered account,
        ///   When the user enters valid credentials,
        ///   Then the system should allow successful login.
        /// </summary>
        /// <param name="request">Email, password, and selected role.</param>
        /// <returns>
        ///   200 OK  + LoginResponseDto (token, userId, role) on success.
        ///   401 Unauthorized             when credentials are invalid.
        ///   400 BadRequest               when the request payload is malformed.
        /// </returns>
        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            // ModelState validation (enforced by [Required], [EmailAddress] on DTO)
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Delegate to service layer
            LoginResponseDto? result = await _authService.LoginAsync(request);

            if (result == null)
            {
                // Log at Information level (not Warning) to avoid log poisoning
                _logger.LogInformation(
                    "Failed login attempt for email: {Email} | role: {Role}",
                    request.Email, request.Role);

                // Return generic message — never reveal whether it's the
                // email or the password that is wrong (security best practice).
                return Unauthorized(new { message = "Invalid email or password." });
            }

            _logger.LogInformation(
                "Successful login: UserId={UserId} | Role={Role}",
                result.UserId, result.Role);

            return Ok(result);
        }
    }
}
