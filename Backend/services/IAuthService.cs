// Services/IAuthService.cs
// AI-Powered Performance Evaluation Tool — E1-US1 User Login
// Interface for the authentication service (enables dependency injection & unit testing).

using PerformanceEvalTool.DTOs;

namespace PerformanceEvalTool.Services
{
    /// <summary>
    /// Contract for the authentication service.
    /// Inject this interface in the controller so the implementation can be swapped for testing.
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Attempts to authenticate the user with the supplied credentials.
        /// </summary>
        /// <param name="request">Login payload from the frontend.</param>
        /// <returns>
        ///   A <see cref="LoginResponseDto"/> containing the JWT token on success;
        ///   <c>null</c> if credentials are invalid.
        /// </returns>
        Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
    }
}
