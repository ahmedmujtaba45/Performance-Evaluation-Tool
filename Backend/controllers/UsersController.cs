using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvalTool.Dtos.User;
using PerformanceEvalTool.Services;

namespace PerformanceEvalTool.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserDetailDto>>> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDetailDto>> GetUserById(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }

        [HttpGet("role/{role}")]
        public async Task<ActionResult<List<UserDetailDto>>> GetUsersByRole(string role)
        {
            var users = await _userService.GetUsersByRoleAsync(role);
            return Ok(users);
        }

        [HttpPost]
        public async Task<ActionResult<UserDetailDto>> CreateUser(CreateUserDto dto)
        {
            var user = await _userService.CreateUserAsync(dto);
            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UserDetailDto>> UpdateUser(int id, UpdateUserDto dto)
        {
            dto.Id = id;
            var user = await _userService.UpdateUserAsync(dto);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            var result = await _userService.DeleteUserAsync(id);
            if (!result)
                return NotFound(new { message = "User not found" });

            return NoContent();
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult> UpdateUserStatus(int id, [FromBody] UserStatusUpdateDto dto)
        {
            var result = await _userService.UpdateUserStatusAsync(id, dto.Status);
            if (!result)
                return NotFound(new { message = "User not found" });

            return Ok(new { message = "User status updated successfully" });
        }
    }

    public class UserStatusUpdateDto
    {
        public string Status { get; set; }
    }
}
