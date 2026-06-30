using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvalTool.Dtos.Report;
using PerformanceEvalTool.Services;

namespace PerformanceEvalTool.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ReportDto>>> GetAllReports()
        {
            var reports = await _reportService.GetAllReportsAsync();
            return Ok(reports);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ReportDto>> GetReportById(int id)
        {
            var report = await _reportService.GetReportByIdAsync(id);
            if (report == null)
                return NotFound(new { message = "Report not found" });

            return Ok(report);
        }

        [HttpGet("department/{departmentId}")]
        public async Task<ActionResult<DepartmentReportDto>> GetDepartmentReport(int departmentId)
        {
            var report = await _reportService.GetDepartmentReportAsync(departmentId);
            if (report == null)
                return NotFound(new { message = "Department not found" });

            return Ok(report);
        }

        [HttpGet("departments/all")]
        public async Task<ActionResult<List<DepartmentReportDto>>> GetAllDepartmentReports()
        {
            var reports = await _reportService.GetAllDepartmentReportsAsync();
            return Ok(reports);
        }
    }
}
