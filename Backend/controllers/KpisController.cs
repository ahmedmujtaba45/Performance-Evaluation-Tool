using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvalTool.Dtos.Kpi;
using PerformanceEvalTool.Services;

namespace PerformanceEvalTool.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class KpisController : ControllerBase
    {
        private readonly IKpiService _kpiService;

        public KpisController(IKpiService kpiService)
        {
            _kpiService = kpiService;
        }

        [HttpGet]
        public async Task<ActionResult<List<KpiDetailDto>>> GetAllKpis()
        {
            var kpis = await _kpiService.GetAllKpisAsync();
            return Ok(kpis);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<KpiDetailDto>> GetKpiById(int id)
        {
            var kpi = await _kpiService.GetKpiByIdAsync(id);
            if (kpi == null)
                return NotFound(new { message = "KPI not found" });

            return Ok(kpi);
        }

        [HttpGet("department/{departmentId}")]
        public async Task<ActionResult<List<KpiDetailDto>>> GetKpisByDepartment(int departmentId)
        {
            var kpis = await _kpiService.GetKpisByDepartmentAsync(departmentId);
            return Ok(kpis);
        }

        [HttpPost]
        public async Task<ActionResult<KpiDetailDto>> CreateKpi(CreateKpiDto dto)
        {
            var kpi = await _kpiService.CreateKpiAsync(dto);
            return CreatedAtAction(nameof(GetKpiById), new { id = kpi.Id }, kpi);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<KpiDetailDto>> UpdateKpi(int id, UpdateKpiDto dto)
        {
            dto.Id = id;
            var kpi = await _kpiService.UpdateKpiAsync(dto);
            if (kpi == null)
                return NotFound(new { message = "KPI not found" });

            return Ok(kpi);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteKpi(int id)
        {
            var result = await _kpiService.DeleteKpiAsync(id);
            if (!result)
                return NotFound(new { message = "KPI not found" });

            return NoContent();
        }
    }
}
