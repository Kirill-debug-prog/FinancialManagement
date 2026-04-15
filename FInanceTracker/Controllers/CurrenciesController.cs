using System.Security.Claims;
using FInanceTracker.Data.DTOs;
using FInanceTracker.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FInanceTracker.Controllers
{
    [ApiController]
    [Route("api/profiles/{profileId}/currencies")]
    [Authorize]
    public class CurrenciesController : ControllerBase
    {
        private readonly ICurrencyService _currencyService;

        public CurrenciesController(ICurrencyService currencyService)
        {
            _currencyService = currencyService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<ActionResult<List<CurrencyDto>>> GetAll(Guid profileId)
        {
            try
            {
                var currencies = await _currencyService.GetAllByProfileIdAsync(profileId, GetUserId());
                return Ok(currencies);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CurrencyDto>> GetById(Guid profileId, Guid id)
        {
            try
            {
                var currency = await _currencyService.GetByIdAsync(id, profileId, GetUserId());
                return Ok(currency);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<CurrencyDto>> Create(Guid profileId, CreateCurrencyDto dto)
        {
            try
            {
                var currency = await _currencyService.CreateAsync(profileId, GetUserId(), dto);
                return CreatedAtAction(nameof(GetById), new { profileId, id = currency.Id }, currency);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CurrencyDto>> Update(Guid profileId, Guid id, UpdateCurrencyDto dto)
        {
            try
            {
                var currency = await _currencyService.UpdateAsync(id, profileId, GetUserId(), dto);
                return Ok(currency);
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
                await _currencyService.DeleteAsync(id, profileId, GetUserId());
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
