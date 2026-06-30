using Microsoft.EntityFrameworkCore;
using PerformanceEvalTool.Data;
using PerformanceEvalTool.DTOs;
using PerformanceEvalTool.Models;

namespace PerformanceEvalTool.Services
{
    public class ManagerDashboardService : IManagerDashboardService
    {
        private readonly AppDbContext _db;

        public ManagerDashboardService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<ManagerDashboardSummaryDto> GetSummaryAsync(int managerId)
        {
            var members = await GetManagerEmployeesQuery(managerId).ToListAsync();
            var employeeIds = members.Select(x => x.UserId).ToList();
            var activeCycle = await GetActiveCycleAsync();

            var evaluations = activeCycle == null
                ? new List<Evaluation>()
                : await _db.Evaluations
                    .Where(e => employeeIds.Contains(e.EmployeeId) && e.CycleId == activeCycle.CycleId)
                    .ToListAsync();

            int done = evaluations.Count(e => e.Status == "Completed");
            int pending = Math.Max(members.Count - done, 0);
            decimal average = evaluations.Any(e => e.FinalScore.HasValue)
                ? Math.Round(evaluations.Where(e => e.FinalScore.HasValue).Average(e => e.FinalScore!.Value), 1)
                : 0;

            return new ManagerDashboardSummaryDto
            {
                TeamSize = members.Count,
                EvaluationsDone = done,
                PendingReviews = pending,
                TeamAverageScore = average,
                EvaluationCompletionPercentage = members.Count == 0
                    ? 0
                    : Math.Round((decimal)done / members.Count * 100, 1)
            };
        }

        public async Task<IReadOnlyList<ManagerTeamMemberDto>> GetTeamMembersAsync(int managerId)
        {
            var activeCycle = await GetActiveCycleAsync();
            var employees = await GetManagerEmployeesQuery(managerId).ToListAsync();
            var employeeIds = employees.Select(x => x.UserId).ToList();

            var evaluations = activeCycle == null
                ? new List<Evaluation>()
                : await _db.Evaluations
                    .Where(e => employeeIds.Contains(e.EmployeeId) && e.CycleId == activeCycle.CycleId)
                    .ToListAsync();

            return employees.Select(employee =>
            {
                var evaluation = evaluations.FirstOrDefault(e => e.EmployeeId == employee.UserId);
                return ToTeamMemberDto(employee, evaluation);
            }).ToList();
        }

        public async Task<ManagerTeamMemberDetailDto?> GetTeamMemberDetailAsync(int managerId, string employeeId)
        {
            if (!int.TryParse(employeeId, out int parsedEmployeeId))
                return null;

            var employee = await GetManagerEmployeesQuery(managerId)
                .FirstOrDefaultAsync(u => u.UserId == parsedEmployeeId);

            if (employee == null)
                return null;

            var activeCycle = await GetActiveCycleAsync();
            Evaluation? evaluation = null;

            if (activeCycle != null)
            {
                evaluation = await _db.Evaluations
                    .Include(e => e.KpiScores)
                    .FirstOrDefaultAsync(e => e.EmployeeId == employee.UserId && e.CycleId == activeCycle.CycleId);
            }

            var kpis = await _db.KPIs
                .Where(k => k.DepartmentId == employee.DepartmentId && k.IsActive)
                .OrderBy(k => k.Title)
                .ToListAsync();

            var scores = evaluation?.KpiScores.ToDictionary(x => x.KpiId) ?? new Dictionary<int, KpiScore>();

            return new ManagerTeamMemberDetailDto
            {
                Employee = ToTeamMemberDto(employee, evaluation),
                Kpis = kpis.Select(kpi =>
                {
                    scores.TryGetValue(kpi.KpiId, out var score);
                    return new ManagerKpiDto
                    {
                        KpiId = kpi.KpiId.ToString(),
                        Name = kpi.Title,
                        Weight = Decimal.ToInt32(Math.Round(kpi.Weightage)),
                        Target = kpi.Description ?? "Configured department KPI",
                        Actual = score == null ? "Not evaluated" : $"{score.Score:0.#}/5",
                        ManagerScore = score == null ? null : Decimal.ToInt32(Math.Round(score.Score)),
                        HrScore = evaluation?.HRScore == null ? null : Decimal.ToInt32(Math.Round(evaluation.HRScore.Value)),
                        IsOnTarget = score != null && score.Score >= 3
                    };
                }).ToList(),
                QuarterlyTeamAverage = await GetQuarterlyTeamAverageAsync(employee.DepartmentId)
            };
        }

        public Task<ManagerEvaluationResponseDto?> SaveEvaluationDraftAsync(
            int managerId,
            ManagerEvaluationRequestDto request)
        {
            return SaveEvaluationAsync(managerId, request, "In Progress");
        }

        public Task<ManagerEvaluationResponseDto?> SubmitEvaluationToHrAsync(
            int managerId,
            ManagerEvaluationRequestDto request)
        {
            return SaveEvaluationAsync(managerId, request, "Completed");
        }

        public Task<IReadOnlyList<ManagerSurveyDto>> GetManagerSurveysAsync(int managerId)
        {
            return Task.FromResult<IReadOnlyList<ManagerSurveyDto>>(Array.Empty<ManagerSurveyDto>());
        }

        public Task<string> SubmitSurveyResponseAsync(int managerId, ManagerSurveyResponseDto request)
        {
            return Task.FromResult(CreateConfirmationId("SV"));
        }

        private async Task<ManagerEvaluationResponseDto?> SaveEvaluationAsync(
            int managerId,
            ManagerEvaluationRequestDto request,
            string status)
        {
            if (!int.TryParse(request.EmployeeId, out int employeeId))
                return null;

            var employee = await GetManagerEmployeesQuery(managerId)
                .FirstOrDefaultAsync(u => u.UserId == employeeId);

            if (employee == null)
                return null;

            var cycle = await GetCycleAsync(request.Cycle) ?? await GetActiveCycleAsync();
            if (cycle == null)
                return null;

            var evaluation = await _db.Evaluations
                .Include(e => e.KpiScores)
                .FirstOrDefaultAsync(e =>
                    e.EmployeeId == employeeId &&
                    e.EvaluatorId == managerId &&
                    e.CycleId == cycle.CycleId);

            if (evaluation == null)
            {
                evaluation = new Evaluation
                {
                    EmployeeId = employeeId,
                    EvaluatorId = managerId,
                    CycleId = cycle.CycleId,
                    HRScore = 0,
                    CreatedAt = DateTime.UtcNow
                };
                _db.Evaluations.Add(evaluation);
            }

            evaluation.Status = status;
            evaluation.SubmittedAt = status == "Completed" ? DateTime.UtcNow : null;

            var departmentKpis = await _db.KPIs
                .Where(k => k.DepartmentId == employee.DepartmentId && k.IsActive)
                .ToListAsync();

            foreach (var scoreDto in request.KpiScores)
            {
                if (!int.TryParse(scoreDto.KpiId, out int kpiId))
                    continue;

                var kpi = departmentKpis.FirstOrDefault(k => k.KpiId == kpiId);
                if (kpi == null)
                    continue;

                var kpiScore = evaluation.KpiScores.FirstOrDefault(s => s.KpiId == kpiId);
                if (kpiScore == null)
                {
                    kpiScore = new KpiScore { KpiId = kpiId, Evaluation = evaluation };
                    evaluation.KpiScores.Add(kpiScore);
                }

                kpiScore.Score = scoreDto.Score;
                kpiScore.Comments = scoreDto.Comment;
            }

            evaluation.ManagerScore = CalculateManagerScore(departmentKpis, evaluation.KpiScores);
            evaluation.FinalScore = (evaluation.ManagerScore ?? 0) + (evaluation.HRScore ?? 0);

            await _db.SaveChangesAsync();

            return new ManagerEvaluationResponseDto
            {
                ConfirmationId = CreateConfirmationId("EV"),
                EmployeeId = employeeId.ToString(),
                Status = status,
                SavedAtUtc = DateTime.UtcNow
            };
        }

        private IQueryable<User> GetManagerEmployeesQuery(int managerId)
        {
            return _db.Users
                .Include(u => u.Department)
                .Where(u =>
                    u.IsActive &&
                    u.Role == "Employee" &&
                    u.DepartmentId != null &&
                    u.Department != null &&
                    u.Department.ManagerId == managerId);
        }

        private Task<EvaluationCycle?> GetActiveCycleAsync()
        {
            return _db.EvaluationCycles
                .Where(c => c.IsActive)
                .OrderByDescending(c => c.StartDate)
                .FirstOrDefaultAsync();
        }

        private Task<EvaluationCycle?> GetCycleAsync(string cycleName)
        {
            return _db.EvaluationCycles
                .FirstOrDefaultAsync(c => c.CycleName == cycleName);
        }

        private async Task<List<QuarterlyScoreDto>> GetQuarterlyTeamAverageAsync(int? departmentId)
        {
            if (departmentId == null)
                return new List<QuarterlyScoreDto>();

            return await _db.Evaluations
                .Where(e =>
                    e.FinalScore.HasValue &&
                    e.Employee != null &&
                    e.Employee.DepartmentId == departmentId)
                .GroupBy(e => e.Cycle!.CycleName)
                .Select(group => new QuarterlyScoreDto
                {
                    Quarter = group.Key,
                    Score = Math.Round(group.Average(e => e.FinalScore!.Value), 1)
                })
                .OrderBy(x => x.Quarter)
                .ToListAsync();
        }

        private static ManagerTeamMemberDto ToTeamMemberDto(User employee, Evaluation? evaluation)
        {
            return new ManagerTeamMemberDto
            {
                EmployeeId = employee.UserId.ToString(),
                FullName = employee.FullName,
                Initials = BuildInitials(employee.FullName),
                JobTitle = employee.Designation ?? "Employee",
                Department = employee.Department?.DepartmentName ?? "Unassigned",
                ManagerScore = evaluation?.ManagerScore == null
                    ? null
                    : Decimal.ToInt32(Math.Round(evaluation.ManagerScore.Value)),
                HrScore = evaluation?.HRScore == null
                    ? null
                    : Decimal.ToInt32(Math.Round(evaluation.HRScore.Value)),
                TotalScore = evaluation?.FinalScore == null
                    ? null
                    : Decimal.ToInt32(Math.Round(evaluation.FinalScore.Value)),
                Status = evaluation?.Status ?? "Pending"
            };
        }

        private static decimal CalculateManagerScore(
            IReadOnlyList<Kpi> kpis,
            IEnumerable<KpiScore> scores)
        {
            decimal totalWeight = kpis.Sum(k => k.Weightage);
            if (totalWeight <= 0)
                return 0;

            decimal weightedScore = scores.Sum(score =>
            {
                var kpi = kpis.FirstOrDefault(k => k.KpiId == score.KpiId);
                if (kpi == null)
                    return 0;

                return (score.Score / 5m) * (kpi.Weightage / totalWeight) * 20m;
            });

            return Math.Round(Math.Min(weightedScore, 20m), 2);
        }

        private static string BuildInitials(string fullName)
        {
            var parts = fullName
                .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Take(2)
                .Select(part => part[0]);

            return string.Concat(parts).ToUpperInvariant();
        }

        private static string CreateConfirmationId(string prefix)
        {
            return $"{prefix}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
        }
    }
}
