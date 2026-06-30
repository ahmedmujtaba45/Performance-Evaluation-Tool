using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvalTool.Dtos.Evaluation;
using PerformanceEvalTool.Services;

namespace PerformanceEvalTool.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EvaluationsController : ControllerBase
    {
        private readonly IEvaluationService _evaluationService;

        public EvaluationsController(IEvaluationService evaluationService)
        {
            _evaluationService = evaluationService;
        }

        [HttpGet]
        public async Task<ActionResult<List<EvaluationDetailDto>>> GetAllEvaluations()
        {
            var evaluations = await _evaluationService.GetAllEvaluationsAsync();
            return Ok(evaluations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EvaluationDetailDto>> GetEvaluationById(int id)
        {
            var evaluation = await _evaluationService.GetEvaluationByIdAsync(id);
            if (evaluation == null)
                return NotFound(new { message = "Evaluation not found" });

            return Ok(evaluation);
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<List<EvaluationDetailDto>>> GetEmployeeEvaluations(int employeeId)
        {
            var evaluations = await _evaluationService.GetEmployeeEvaluationsAsync(employeeId);
            return Ok(evaluations);
        }

        [HttpGet("cycle/{cycleId}")]
        public async Task<ActionResult<List<EvaluationDetailDto>>> GetCycleEvaluations(int cycleId)
        {
            var evaluations = await _evaluationService.GetCycleEvaluationsAsync(cycleId);
            return Ok(evaluations);
        }

        [HttpPost]
        public async Task<ActionResult<EvaluationDetailDto>> CreateEvaluation(EvaluationDetailDto dto)
        {
            var evaluation = await _evaluationService.CreateEvaluationAsync(dto);
            return CreatedAtAction(nameof(GetEvaluationById), new { id = evaluation.Id }, evaluation);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<EvaluationDetailDto>> UpdateEvaluation(int id, EvaluationDetailDto dto)
        {
            dto.Id = id;
            var evaluation = await _evaluationService.UpdateEvaluationAsync(dto);
            if (evaluation == null)
                return NotFound(new { message = "Evaluation not found" });

            return Ok(evaluation);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteEvaluation(int id)
        {
            var result = await _evaluationService.DeleteEvaluationAsync(id);
            if (!result)
                return NotFound(new { message = "Evaluation not found" });

            return NoContent();
        }
    }
}
