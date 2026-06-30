using System.Collections.Generic;
using System.Threading.Tasks;
using PerformanceEvalTool.Dtos.Employee;

namespace PerformanceEvalTool.Services
{
    public interface IEmployeeService
    {
        Task<List<EmployeeListDto>> GetAllEmployeesAsync();
        Task<EmployeeDetailDto?> GetEmployeeByIdAsync(int id);
        Task<List<EmployeeListDto>> GetEmployeesByDepartmentAsync(string department);
        Task<EmployeeDetailDto> CreateEmployeeAsync(CreateEmployeeDto dto);
        Task<EmployeeDetailDto?> UpdateEmployeeAsync(UpdateEmployeeDto dto);
        Task<bool> DeleteEmployeeAsync(int id);
        Task<bool> EmployeeExistsAsync(int id);
    }
}
