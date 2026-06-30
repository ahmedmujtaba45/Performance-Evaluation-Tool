// Services/AuthService.cs
// AI-Powered Performance Evaluation Tool — E1-US1 User Login
// Business logic: validate credentials, generate JWT token.

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PerformanceEvalTool.Data;
using PerformanceEvalTool.DTOs;
using PerformanceEvalTool.Models;
using BCrypt.Net;

namespace PerformanceEvalTool.Services
{
    /// <summary>
    /// Handles user authentication and JWT token generation.
    /// Called by AuthController to keep the controller thin.
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly AppDbContext  _db;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext db, IConfiguration config)
        {
            _db     = db;
            _config = config;
        }

        // ── Login ─────────────────────────────────────────────────────────
        /// <summary>
        /// Validates the user's email, password, and selected role.
        /// Returns a JWT response DTO on success, or null on failure.
        /// </summary>
        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
        {
            // 1. Find user by email (case-insensitive)
            User? user = await _db.Users
                .FirstOrDefaultAsync(u =>
                    u.Email.ToLower() == request.Email.ToLower() &&
                    u.IsActive);

            if (user == null)
                return null; // user not found

            // 2. Verify password against BCrypt hash
            bool passwordMatches = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!passwordMatches)
                return null; // wrong password

            // 3. Cross-check the role the user selected on the UI
            //    This prevents e.g. an Employee from claiming to be Admin.
            if (!user.Role.Equals(request.Role, StringComparison.OrdinalIgnoreCase))
                return null; // role mismatch

            // 4. Generate JWT token
            string token    = GenerateJwtToken(user);
            DateTime expiry = DateTime.UtcNow.AddHours(
                double.Parse(_config["Jwt:ExpiryHours"] ?? "8"));

            return new LoginResponseDto
            {
                Token       = token,
                TokenExpiry = expiry,
                UserId      = user.UserId,
                FullName    = user.FullName,
                Email       = user.Email,
                Role        = user.Role
            };
        }

        // ── JWT generation ────────────────────────────────────────────────
        /// <summary>
        /// Creates a signed JWT containing the user's ID, email, and role.
        /// The token is verified on every subsequent API request via [Authorize].
        /// </summary>
        private string GenerateJwtToken(User user)
        {
            // Claims embedded inside the token
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub,   user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role,               user.Role),
                new Claim("fullName",                    user.FullName),
                new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString())
            };

            // Signing key from appsettings.json  →  "Jwt:Key"
            string secretKey = _config["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT key is not configured.");

            var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            double expiryHours = double.Parse(_config["Jwt:ExpiryHours"] ?? "8");

            var tokenDescriptor = new JwtSecurityToken(
                issuer:             _config["Jwt:Issuer"],
                audience:           _config["Jwt:Audience"],
                claims:             claims,
                expires:            DateTime.UtcNow.AddHours(expiryHours),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }
    }
}
