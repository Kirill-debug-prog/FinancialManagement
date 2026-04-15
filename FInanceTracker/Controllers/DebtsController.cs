using System.Security.Claims;
using FInanceTracker.Data.DTOs;
using FInanceTracker.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FInanceTracker.Controllers
{
    [ApiController]
    [Route("api/profiles/{profileId}/debts")]
    [Authorize]
    public class DebtsController : ControllerBase
    {
        private readonly IDebtService _debtService;

        public DebtsController(IDebtService debtService)
        {
            _debtService = debtService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<ActionResult<List<DebtDto>>> GetAll(Guid profileId)
        {
            try
            {
                var debts = await _debtService.GetAllByProfileIdAsync(profileId, GetUserId());
                return Ok(debts);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DebtDto>> GetById(Guid profileId, Guid id)
        {
            try
            {
                var debt = await _debtService.GetByIdAsync(id, profileId, GetUserId());
                return Ok(debt);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<DebtDto>> Create(Guid profileId, CreateDebtDto dto)
        {
            try
            {
                var debt = await _debtService.CreateAsync(profileId, GetUserId(), dto);
                return CreatedAtAction(nameof(GetById), new { profileId, id = debt.Id }, debt);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DebtDto>> Update(Guid profileId, Guid id, UpdateDebtDto dto)
        {
            try
            {
                var debt = await _debtService.UpdateAsync(id, profileId, GetUserId(), dto);
                return Ok(debt);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid profileId, Guid id)
        {
            try
            {
                await _debtService.DeleteAsync(id, profileId, GetUserId());
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
