using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PerformanceEvalTool.Data;
using PerformanceEvalTool.Dtos.Evaluation;
using PerformanceEvalTool.Models;
using Microsoft.EntityFrameworkCore;

namespace PerformanceEvalTool.Services
{
    public class EvaluationService : IEvaluationService
    {
        private readonly AppDbContext _context;

        public EvaluationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<EvaluationDetailDto>> GetAllEvaluationsAsync()
        {
            return await _context.Evaluations
                .Include(e => e.Cycle)
                .Include(e => e.Employee)
                .Include(e => e.KpiScores)
                    .ThenInclude(s => s.Kpi)
                .Select(e => ToDetailDto(e))
                .ToListAsync();
        }

        public async Task<EvaluationDetailDto?> GetEvaluationByIdAsync(int id)
        {
            var evaluation = await _context.Evaluations
                .Include(e => e.Cycle)
                .Include(e => e.Employee)
                .Include(e => e.KpiScores)
                    .ThenInclude(s => s.Kpi)
                .FirstOrDefaultAsync(e => e.EvaluationId == id);

            if (evaluation == null) return null;

            return ToDetailDto(evaluation);
        }

        public async Task<List<EvaluationDetailDto>> GetEmployeeEvaluationsAsync(int employeeId)
        {
            return await _context.Evaluations
                .Where(e => e.EmployeeId == employeeId)
                .Include(e => e.Cycle)
                .Include(e => e.Employee)
                .Include(e => e.KpiScores)
                    .ThenInclude(s => s.Kpi)
                .Select(e => ToDetailDto(e))
                .ToListAsync();
        }

        public async Task<List<EvaluationDetailDto>> GetCycleEvaluationsAsync(int cycleId)
        {
            return await _context.Evaluations
                .Where(e => e.CycleId == cycleId)
                .Include(e => e.Cycle)
                .Include(e => e.Employee)
                .Include(e => e.KpiScores)
                    .ThenInclude(s => s.Kpi)
                .Select(e => ToDetailDto(e))
                .ToListAsync();
        }

        public async Task<EvaluationDetailDto> CreateEvaluationAsync(EvaluationDetailDto dto)
        {
            var evaluation = new Evaluation
            {
                EmployeeId = dto.EmployeeId,
                EvaluatorId = dto.EmployeeId,
                CycleId = dto.EvaluationCycleId,
                FinalScore = dto.TotalScore,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Pending" : dto.Status,
                CreatedAt = DateTime.UtcNow
            };

            _context.Evaluations.Add(evaluation);
            await _context.SaveChangesAsync();

            return (await GetEvaluationByIdAsync(evaluation.EvaluationId))!;
        }

        public async Task<EvaluationDetailDto?> UpdateEvaluationAsync(EvaluationDetailDto dto)
        {
            var evaluation = await _context.Evaluations.FindAsync(dto.Id);
            if (evaluation == null) return null;

            evaluation.EmployeeId = dto.EmployeeId;
            evaluation.CycleId = dto.EvaluationCycleId;
            evaluation.FinalScore = dto.TotalScore;
            evaluation.Status = string.IsNullOrWhiteSpace(dto.Status) ? evaluation.Status : dto.Status;
            evaluation.SubmittedAt = evaluation.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase)
                ? DateTime.UtcNow
                : evaluation.SubmittedAt;

            _context.Evaluations.Update(evaluation);
            await _context.SaveChangesAsync();

            return await GetEvaluationByIdAsync(evaluation.EvaluationId);
        }

        public async Task<bool> DeleteEvaluationAsync(int id)
        {
            var evaluation = await _context.Evaluations.FindAsync(id);
            if (evaluation == null) return false;

            _context.Evaluations.Remove(evaluation);
            await _context.SaveChangesAsync();
            return true;
        }

        private static EvaluationDetailDto ToDetailDto(Evaluation evaluation)
        {
            return new EvaluationDetailDto
            {
                Id = evaluation.EvaluationId,
                EmployeeId = evaluation.EmployeeId,
                EmployeeName = evaluation.Employee?.FullName ?? string.Empty,
                EvaluationCycleId = evaluation.CycleId,
                CycleName = evaluation.Cycle?.CycleName ?? string.Empty,
                TotalScore = evaluation.FinalScore ?? evaluation.ManagerScore ?? evaluation.HRScore ?? 0,
                Status = evaluation.Status,
                Comments = string.Join("; ", evaluation.KpiScores
                    .Where(score => !string.IsNullOrWhiteSpace(score.Comments))
                    .Select(score => score.Comments)),
                KpiScores = evaluation.KpiScores.Select(score => new KpiScoreDto
                {
                    KpiId = score.KpiId,
                    KpiTitle = score.Kpi?.Title ?? string.Empty,
                    Score = score.Score,
                    MaxScore = 5,
                    Comments = score.Comments ?? string.Empty
                }).ToList(),
                HRScores = new Dictionary<string, decimal>
                {
                    ["hrScore"] = evaluation.HRScore ?? 0
                }
            };
        }
    }
}
