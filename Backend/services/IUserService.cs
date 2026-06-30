using System.Collections.Generic;
using System.Threading.Tasks;
using PerformanceEvalTool.Dtos.User;

namespace PerformanceEvalTool.Services
{
    public interface IUserService
    {
        Task<List<UserDetailDto>> GetAllUsersAsync();
        Task<UserDetailDto?> GetUserByIdAsync(int id);
        Task<List<UserDetailDto>> GetUsersByRoleAsync(string role);
        Task<UserDetailDto> CreateUserAsync(CreateUserDto dto);
        Task<UserDetailDto?> UpdateUserAsync(UpdateUserDto dto);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> UpdateUserStatusAsync(int id, string status);
    }
}
