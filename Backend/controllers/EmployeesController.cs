using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvalTool.Dtos.Employee;
using PerformanceEvalTool.Services;

namespace PerformanceEvalTool.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeesController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet]
        public async Task<ActionResult<List<EmployeeListDto>>> GetAllEmployees()
        {
            var employees = await _employeeService.GetAllEmployeesAsync();
            return Ok(employees);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeDetailDto>> GetEmployeeById(int id)
        {
            var employee = await _employeeService.GetEmployeeByIdAsync(id);
            if (employee == null)
                return NotFound(new { message = "Employee not found" });

            return Ok(employee);
        }

        [HttpGet("department/{department}")]
        public async Task<ActionResult<List<EmployeeListDto>>> GetEmployeesByDepartment(string department)
        {
            var employees = await _employeeService.GetEmployeesByDepartmentAsync(department);
            return Ok(employees);
        }

        [HttpPost]
        public async Task<ActionResult<EmployeeDetailDto>> CreateEmployee(CreateEmployeeDto dto)
        {
            var employee = await _employeeService.CreateEmployeeAsync(dto);
            return CreatedAtAction(nameof(GetEmployeeById), new { id = employee.Id }, employee);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<EmployeeDetailDto>> UpdateEmployee(int id, UpdateEmployeeDto dto)
        {
            dto.Id = id;
            var employee = await _employeeService.UpdateEmployeeAsync(dto);
            if (employee == null)
                return NotFound(new { message = "Employee not found" });

            return Ok(employee);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteEmployee(int id)
        {
            var result = await _employeeService.DeleteEmployeeAsync(id);
            if (!result)
                return NotFound(new { message = "Employee not found" });

            return NoContent();
        }
    }
}
