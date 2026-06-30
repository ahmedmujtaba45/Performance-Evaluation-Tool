using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PerformanceEvalTool.Data;
using PerformanceEvalTool.Dtos.Report;

namespace PerformanceEvalTool.Services
{
    public class ReportService : IReportService
    {
        private readonly AppDbContext _context;

        public ReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ReportDto>> GetAllReportsAsync()
        {
            var departments = await GetAllDepartmentReportsAsync();
            return departments.Select(department => new ReportDto
            {
                Id = department.DepartmentId,
                Name = $"{department.DepartmentName} Performance Report",
                Type = "Department",
                GeneratedDate = System.DateTime.UtcNow,
                Description = $"Performance summary for {department.DepartmentName}.",
                Data = new List<ReportDataPoint>
                {
                    new() { Label = "Average Score", Value = department.AverageScore, Category = "Score" },
                    new() { Label = "Completed", Value = department.CompletedEvaluations, Category = "Evaluations" },
                    new() { Label = "Pending", Value = department.PendingEvaluations, Category = "Evaluations" }
                }
            }).ToList();
        }

        public async Task<ReportDto?> GetReportByIdAsync(int id)
        {
            return (await GetAllReportsAsync()).FirstOrDefault(report => report.Id == id);
        }

        public async Task<DepartmentReportDto?> GetDepartmentReportAsync(int departmentId)
        {
            var department = await _context.Departments
                .Include(d => d.Users)
                .FirstOrDefaultAsync(d => d.DepartmentId == departmentId);
            if (department == null) return null;

            var employeeIds = department.Users
                .Where(u => u.Role == "Employee")
                .Select(u => u.UserId)
                .ToList();

            var evaluations = await _context.Evaluations
                .Where(e => employeeIds.Contains(e.EmployeeId))
                .Include(e => e.KpiScores)
                    .ThenInclude(score => score.Kpi)
                .ToListAsync();

            var completed = evaluations.Count(e => e.Status == "Completed");
            var scored = evaluations.Where(e => e.FinalScore.HasValue).ToList();

            return new DepartmentReportDto
            {
                DepartmentId = departmentId,
                DepartmentName = department.DepartmentName,
                EmployeeCount = employeeIds.Count,
                AverageScore = scored.Count == 0 ? 0 : System.Math.Round(scored.Average(e => e.FinalScore!.Value), 2),
                CompletedEvaluations = completed,
                PendingEvaluations = System.Math.Max(employeeIds.Count - completed, 0),
                KpiPerformance = evaluations
                    .SelectMany(e => e.KpiScores)
                    .GroupBy(score => score.KpiId)
                    .Select(group =>
                    {
                        var kpi = group.First().Kpi;
                        return new KpiPerformanceDto
                        {
                            KpiName = kpi?.Title ?? $"KPI {group.Key}",
                            CurrentScore = System.Math.Round(group.Average(score => score.Score), 2),
                            TargetScore = 5,
                            Weight = kpi?.Weightage ?? 0
                        };
                    })
                    .ToList()
            };
        }

        public async Task<List<DepartmentReportDto>> GetAllDepartmentReportsAsync()
        {
            var departments = await _context.Departments.ToListAsync();
            var reports = new List<DepartmentReportDto>();

            foreach (var dept in departments)
            {
                var report = await GetDepartmentReportAsync(dept.DepartmentId);
                if (report != null)
                    reports.Add(report);
            }

            return reports;
        }
    }
}
