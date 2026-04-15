using System.Security.Claims;
using FInanceTracker.Data.DTOs;
using FInanceTracker.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FInanceTracker.Controllers
{
    [ApiController]
    [Route("api/profiles/{profileId}/units")]
    [Authorize]
    public class UnitsController : ControllerBase
    {
        private readonly IUnitOfMeasureService _unitService;

        public UnitsController(IUnitOfMeasureService unitService)
        {
            _unitService = unitService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<ActionResult<List<UnitDto>>> GetAll(Guid profileId)
        {
            try
            {
                var units = await _unitService.GetAllByProfileIdAsync(profileId, GetUserId());
                return Ok(units);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UnitDto>> GetById(Guid profileId, Guid id)
        {
            try
            {
                var unit = await _unitService.GetByIdAsync(id, profileId, GetUserId());
                return Ok(unit);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<UnitDto>> Create(Guid profileId, CreateUnitDto dto)
        {
            try
            {
                var unit = await _unitService.CreateAsync(profileId, GetUserId(), dto);
                return CreatedAtAction(nameof(GetById), new { profileId, id = unit.Id }, unit);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UnitDto>> Update(Guid profileId, Guid id, CreateUnitDto dto)
        {
            try
            {
                var unit = await _unitService.UpdateAsync(id, profileId, GetUserId(), dto);
                return Ok(unit);
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
                await _unitService.DeleteAsync(id, profileId, GetUserId());
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
