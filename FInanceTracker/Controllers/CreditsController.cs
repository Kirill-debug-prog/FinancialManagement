using System.Security.Claims;
using FInanceTracker.Data.DTOs;
using FInanceTracker.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FInanceTracker.Controllers
{
    [ApiController]
    [Route("api/profiles/{profileId}/credits")]
    [Authorize]
    public class CreditsController : ControllerBase
    {
        private readonly ICreditService _creditService;

        public CreditsController(ICreditService creditService)
        {
            _creditService = creditService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<ActionResult<List<CreditDto>>> GetAll(Guid profileId)
        {
            try
            {
                var credits = await _creditService.GetAllByProfileIdAsync(profileId, GetUserId());
                return Ok(credits);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CreditDto>> GetById(Guid profileId, Guid id)
        {
            try
            {
                var credit = await _creditService.GetByIdAsync(id, profileId, GetUserId());
                return Ok(credit);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<CreditDto>> Create(Guid profileId, CreateCreditDto dto)
        {
            try
            {
                var credit = await _creditService.CreateAsync(profileId, GetUserId(), dto);
                return CreatedAtAction(nameof(GetById), new { profileId, id = credit.Id }, credit);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CreditDto>> Update(Guid profileId, Guid id, UpdateCreditDto dto)
        {
            try
            {
                var credit = await _creditService.UpdateAsync(id, profileId, GetUserId(), dto);
                return Ok(credit);
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
                await _creditService.DeleteAsync(id, profileId, GetUserId());
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
