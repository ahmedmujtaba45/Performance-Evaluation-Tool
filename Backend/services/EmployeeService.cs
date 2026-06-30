using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PerformanceEvalTool.Data;
using PerformanceEvalTool.Dtos.Employee;
using PerformanceEvalTool.Models;

namespace PerformanceEvalTool.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly AppDbContext _context;

        public EmployeeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<EmployeeListDto>> GetAllEmployeesAsync()
        {
            return await _context.Users
                .Include(u => u.Department)
                .Where(u => u.Role == "Employee")
                .Select(u => ToListDto(u))
                .ToListAsync();
        }

        public async Task<EmployeeDetailDto?> GetEmployeeByIdAsync(int id)
        {
            var user = await _context.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.UserId == id && u.Role == "Employee");
            if (user == null) return null;

            return ToDetailDto(user);
        }

        public async Task<List<EmployeeListDto>> GetEmployeesByDepartmentAsync(string department)
        {
            return await _context.Users
                .Include(u => u.Department)
                .Where(u =>
                    u.Role == "Employee" &&
                    u.Department != null &&
                    u.Department.DepartmentName == department)
                .Select(u => ToListDto(u))
                .ToListAsync();
        }

        public async Task<EmployeeDetailDto> CreateEmployeeAsync(CreateEmployeeDto dto)
        {
            var department = await GetOrCreateDepartmentAsync(dto.Department);
            var user = new User
            {
                FullName = dto.Name,
                Email = dto.Email,
                DepartmentId = department?.DepartmentId,
                Department = department,
                Designation = dto.JobTitle,
                PhoneNumber = dto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "Employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return ToDetailDto(user, dto.Age);
        }

        public async Task<EmployeeDetailDto?> UpdateEmployeeAsync(UpdateEmployeeDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.UserId == dto.Id && u.Role == "Employee");
            if (user == null) return null;

            var department = await GetOrCreateDepartmentAsync(dto.Department);
            user.FullName = dto.Name;
            user.Email = dto.Email;
            user.DepartmentId = department?.DepartmentId;
            user.Department = department;
            user.Designation = dto.JobTitle;
            user.PhoneNumber = dto.Phone;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return ToDetailDto(user, dto.Age);
        }

        public async Task<bool> DeleteEmployeeAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EmployeeExistsAsync(int id)
        {
            return await _context.Users.AnyAsync(u => u.UserId == id && u.Role == "Employee");
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

        private static EmployeeListDto ToListDto(User user)
        {
            return new EmployeeListDto
            {
                Id = user.UserId,
                Name = user.FullName,
                Email = user.Email,
                Department = user.Department?.DepartmentName ?? string.Empty,
                JobTitle = user.Designation ?? "Employee",
                Score = null,
                Status = user.IsActive ? "active" : "inactive"
            };
        }

        private static EmployeeDetailDto ToDetailDto(User user, int age = 0)
        {
            return new EmployeeDetailDto
            {
                Id = user.UserId,
                Name = user.FullName,
                Email = user.Email,
                Age = age,
                Department = user.Department?.DepartmentName ?? string.Empty,
                JobTitle = user.Designation ?? "Employee",
                Phone = user.PhoneNumber ?? string.Empty,
                Score = null,
                Status = user.IsActive ? "active" : "inactive"
            };
        }
    }
}
