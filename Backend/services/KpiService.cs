using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PerformanceEvalTool.Data;
using PerformanceEvalTool.Dtos.Kpi;
using PerformanceEvalTool.Models;
using Microsoft.EntityFrameworkCore;

namespace PerformanceEvalTool.Services
{
    public class KpiService : IKpiService
    {
        private readonly AppDbContext _context;

        public KpiService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<KpiDetailDto>> GetAllKpisAsync()
        {
            return await _context.KPIs
                .Include(k => k.Department)
                .Select(k => ToDetailDto(k))
                .ToListAsync();
        }

        public async Task<KpiDetailDto?> GetKpiByIdAsync(int id)
        {
            var kpi = await _context.KPIs
                .Include(k => k.Department)
                .FirstOrDefaultAsync(k => k.KpiId == id);

            if (kpi == null) return null;

            return ToDetailDto(kpi);
        }

        public async Task<List<KpiDetailDto>> GetKpisByDepartmentAsync(int departmentId)
        {
            return await _context.KPIs
                .Where(k => k.DepartmentId == departmentId)
                .Include(k => k.Department)
                .Select(k => ToDetailDto(k))
                .ToListAsync();
        }

        public async Task<KpiDetailDto> CreateKpiAsync(CreateKpiDto dto)
        {
            var kpi = new Kpi
            {
                DepartmentId = dto.DepartmentId,
                Title = dto.Title,
                Description = dto.Description,
                Weightage = dto.Weight,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.KPIs.Add(kpi);
            await _context.SaveChangesAsync();

            return (await GetKpiByIdAsync(kpi.KpiId))!;
        }

        public async Task<KpiDetailDto?> UpdateKpiAsync(UpdateKpiDto dto)
        {
            var kpi = await _context.KPIs.FindAsync(dto.Id);
            if (kpi == null) return null;

            kpi.Title = dto.Title;
            kpi.Description = dto.Description;
            kpi.Weightage = dto.Weight;

            _context.KPIs.Update(kpi);
            await _context.SaveChangesAsync();

            return await GetKpiByIdAsync(kpi.KpiId);
        }

        public async Task<bool> DeleteKpiAsync(int id)
        {
            var kpi = await _context.KPIs.FindAsync(id);
            if (kpi == null) return false;

            _context.KPIs.Remove(kpi);
            await _context.SaveChangesAsync();
            return true;
        }

        private static KpiDetailDto ToDetailDto(Kpi kpi)
        {
            return new KpiDetailDto
            {
                Id = kpi.KpiId,
                DepartmentId = kpi.DepartmentId,
                Department = kpi.Department?.DepartmentName ?? string.Empty,
                Title = kpi.Title,
                Description = kpi.Description ?? string.Empty,
                MaxScore = 5,
                Weight = kpi.Weightage,
                Target = kpi.Description ?? string.Empty
            };
        }
    }
}
