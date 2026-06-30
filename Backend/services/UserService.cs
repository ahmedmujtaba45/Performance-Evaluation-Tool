using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PerformanceEvalTool.Data;
using PerformanceEvalTool.Dtos.User;
using PerformanceEvalTool.Models;

namespace PerformanceEvalTool.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserDetailDto>> GetAllUsersAsync()
        {
            return await _context.Users
                .Include(u => u.Department)
                .Select(u => ToDetailDto(u))
                .ToListAsync();
        }

        public async Task<UserDetailDto?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return null;

            return ToDetailDto(user);
        }

        public async Task<List<UserDetailDto>> GetUsersByRoleAsync(string role)
        {
            return await _context.Users
                .Include(u => u.Department)
                .Where(u => u.Role == role)
                .Select(u => ToDetailDto(u))
                .ToListAsync();
        }

        public async Task<UserDetailDto> CreateUserAsync(CreateUserDto dto)
        {
            var department = await GetOrCreateDepartmentAsync(dto.Department);
            var user = new User
            {
                FullName = dto.Name,
                Email = dto.Email,
                Role = dto.Role,
                DepartmentId = department?.DepartmentId,
                Designation = dto.Role,
                PhoneNumber = dto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                    string.IsNullOrWhiteSpace(dto.Password) ? "Password123!" : dto.Password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            user.Department = department;
            return ToDetailDto(user);
        }

        public async Task<UserDetailDto?> UpdateUserAsync(UpdateUserDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.UserId == dto.Id);
            if (user == null) return null;

            var department = await GetOrCreateDepartmentAsync(dto.Department);
            user.FullName = dto.Name;
            user.Email = dto.Email;
            user.Role = dto.Role;
            user.DepartmentId = department?.DepartmentId;
            user.Department = department;
            user.PhoneNumber = dto.Phone;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return ToDetailDto(user);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateUserStatusAsync(int id, string status)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.IsActive = status.Equals("active", StringComparison.OrdinalIgnoreCase)
                || status.Equals("enabled", StringComparison.OrdinalIgnoreCase);
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<Department?> GetOrCreateDepartmentAsync(string? departmentName)
        {
            if (string.IsNullOrWhiteSpace(departmentName))
                return null;

            string normalized = departmentName.Trim();
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.DepartmentName == normalized);

            if (department != null)
                return department;

            department = new Department { DepartmentName = normalized };
            _context.Departments.Add(department);
            await _context.SaveChangesAsync();
            return department;
        }

        private static UserDetailDto ToDetailDto(User user)
        {
            return new UserDetailDto
            {
                Id = user.UserId,
                Name = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Department = user.Department?.DepartmentName ?? string.Empty,
                Phone = user.PhoneNumber ?? string.Empty,
                Status = user.IsActive ? "active" : "inactive",
                Joined = user.CreatedAt
            };
        }
    }
}
