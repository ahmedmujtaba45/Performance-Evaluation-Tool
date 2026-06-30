using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvalTool.DTOs;
using PerformanceEvalTool.Services;

namespace PerformanceEvalTool.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Manager")]
    public class ManagerDashboardController : ControllerBase
    {
        private readonly IManagerDashboardService _managerDashboardService;

        public ManagerDashboardController(IManagerDashboardService managerDashboardService)
        {
            _managerDashboardService = managerDashboardService;
        }

        [HttpGet("summary")]
        [ProducesResponseType(typeof(ManagerDashboardSummaryDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSummary()
        {
            return Ok(await _managerDashboardService.GetSummaryAsync(GetCurrentUserId()));
        }

        [HttpGet("team-members")]
        [ProducesResponseType(typeof(IReadOnlyList<ManagerTeamMemberDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTeamMembers()
        {
            return Ok(await _managerDashboardService.GetTeamMembersAsync(GetCurrentUserId()));
        }

        [HttpGet("team-members/{employeeId}")]
        [ProducesResponseType(typeof(ManagerTeamMemberDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTeamMemberDetail(string employeeId)
        {
            var detail = await _managerDashboardService.GetTeamMemberDetailAsync(GetCurrentUserId(), employeeId);
            return detail == null ? NotFound(new { message = "Team member was not found." }) : Ok(detail);
        }

        [HttpPost("evaluations/draft")]
        [ProducesResponseType(typeof(ManagerEvaluationResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SaveEvaluationDraft([FromBody] ManagerEvaluationRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _managerDashboardService.SaveEvaluationDraftAsync(GetCurrentUserId(), request);
            return result == null ? NotFound(new { message = "Team member was not found." }) : Ok(result);
        }

        [HttpPost("evaluations/submit")]
        [ProducesResponseType(typeof(ManagerEvaluationResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SubmitEvaluationToHr([FromBody] ManagerEvaluationRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _managerDashboardService.SubmitEvaluationToHrAsync(GetCurrentUserId(), request);
            return result == null ? NotFound(new { message = "Team member was not found." }) : Ok(result);
        }

        [HttpGet("surveys")]
        [ProducesResponseType(typeof(IReadOnlyList<ManagerSurveyDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSurveys()
        {
            return Ok(await _managerDashboardService.GetManagerSurveysAsync(GetCurrentUserId()));
        }

        [HttpPost("surveys/submit")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SubmitSurvey([FromBody] ManagerSurveyResponseDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string confirmationId = await _managerDashboardService.SubmitSurveyResponseAsync(GetCurrentUserId(), request);
            return Ok(new { confirmationId, message = "Survey response submitted successfully." });
        }

        private int GetCurrentUserId()
        {
            string? subject = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;

            return int.TryParse(subject, out int userId) ? userId : 0;
        }
    }
}
