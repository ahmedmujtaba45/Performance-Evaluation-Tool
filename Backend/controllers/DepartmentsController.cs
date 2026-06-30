using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvalTool.Services;

namespace PerformanceEvalTool.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DepartmentsController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public DepartmentsController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet("{departmentName}/employees")]
        public async Task<ActionResult> GetDepartmentEmployees(string departmentName)
        {
            var employees = await _employeeService.GetEmployeesByDepartmentAsync(departmentName);
            return Ok(employees);
        }
    }
}
