using System.Security.Claims;
using FInanceTracker.Data.DTOs;
using FInanceTracker.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FInanceTracker.Controllers
{
    [ApiController]
    [Route("api/profiles/{profileId}/accounts")]
    [Authorize]
    public class AccountsController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountsController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<ActionResult<List<AccountDto>>> GetAll(Guid profileId)
        {
            try
            {
                var accounts = await _accountService.GetAllByProfileIdAsync(profileId, GetUserId());
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AccountDto>> GetById(Guid profileId, Guid id)
        {
            try
            {
                var account = await _accountService.GetByIdAsync(id, profileId, GetUserId());
                return Ok(account);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<AccountDto>> Create(Guid profileId, CreateAccountDto dto)
        {
            try
            {
                var account = await _accountService.CreateAsync(profileId, GetUserId(), dto);
                return CreatedAtAction(nameof(GetById), new { profileId, id = account.Id }, account);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AccountDto>> Update(Guid profileId, Guid id, UpdateAccountDto dto)
        {
            try
            {
                var account = await _accountService.UpdateAsync(id, profileId, GetUserId(), dto);
                return Ok(account);
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
                await _accountService.DeleteAsync(id, profileId, GetUserId());
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/archive")]
        public async Task<ActionResult> Archive(Guid profileId, Guid id)
        {
            try
            {
                await _accountService.ArchiveAsync(id, profileId, GetUserId());
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
