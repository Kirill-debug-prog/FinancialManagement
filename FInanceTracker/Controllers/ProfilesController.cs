using System.Security.Claims;
using FInanceTracker.Data.DTOs;
using FInanceTracker.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FInanceTracker.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfilesController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfilesController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<ActionResult<List<ProfileDto>>> GetAll()
        {
            var profiles = await _profileService.GetAllByUserIdAsync(GetUserId());
            return Ok(profiles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProfileDto>> GetById(Guid id)
        {
            try
            {
                var profile = await _profileService.GetByIdAsync(id, GetUserId());
                return Ok(profile);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ProfileDto>> Create(CreateProfileDto dto)
        {
            var profile = await _profileService.CreateAsync(GetUserId(), dto);
            return CreatedAtAction(nameof(GetById), new { id = profile.Id }, profile);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ProfileDto>> Update(Guid id, UpdateProfileDto dto)
        {
            try
            {
                var profile = await _profileService.UpdateAsync(id, GetUserId(), dto);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                await _profileService.DeleteAsync(id, GetUserId());
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
