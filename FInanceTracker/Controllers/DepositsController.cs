using System.Security.Claims;
using FInanceTracker.Data.DTOs;
using FInanceTracker.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FInanceTracker.Controllers
{
    [ApiController]
    [Route("api/profiles/{profileId}/deposits")]
    [Authorize]
    public class DepositsController : ControllerBase
    {
        private readonly IDepositService _depositService;

        public DepositsController(IDepositService depositService)
        {
            _depositService = depositService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<ActionResult<List<DepositDto>>> GetAll(Guid profileId)
        {
            try
            {
                var deposits = await _depositService.GetAllByProfileIdAsync(profileId, GetUserId());
                return Ok(deposits);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DepositDto>> GetById(Guid profileId, Guid id)
        {
            try
            {
                var deposit = await _depositService.GetByIdAsync(id, profileId, GetUserId());
                return Ok(deposit);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<DepositDto>> Create(Guid profileId, CreateDepositDto dto)
        {
            try
            {
                var deposit = await _depositService.CreateAsync(profileId, GetUserId(), dto);
                return CreatedAtAction(nameof(GetById), new { profileId, id = deposit.Id }, deposit);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DepositDto>> Update(Guid profileId, Guid id, UpdateDepositDto dto)
        {
            try
            {
                var deposit = await _depositService.UpdateAsync(id, profileId, GetUserId(), dto);
                return Ok(deposit);
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
                await _depositService.DeleteAsync(id, profileId, GetUserId());
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
