using System.Security.Claims;
using FInanceTracker.Data.DTOs;
using FInanceTracker.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FInanceTracker.Controllers
{
    [ApiController]
    [Route("api/profiles/{profileId}/transactions")]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<ActionResult<List<TransactionDto>>> GetAll(
            Guid profileId,
            [FromQuery] Guid? accountId = null,
            [FromQuery] Guid? categoryId = null,
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null)
        {
            try
            {
                var transactions = await _transactionService.GetAllByProfileIdAsync(profileId, GetUserId(), accountId, categoryId, dateFrom, dateTo);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionDto>> GetById(Guid profileId, Guid id)
        {
            try
            {
                var transaction = await _transactionService.GetByIdAsync(id, profileId, GetUserId());
                return Ok(transaction);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<TransactionDto>> Create(Guid profileId, CreateTransactionDto dto)
        {
            try
            {
                var transaction = await _transactionService.CreateAsync(profileId, GetUserId(), dto);
                return CreatedAtAction(nameof(GetById), new { profileId, id = transaction.Id }, transaction);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<TransactionDto>> Update(Guid profileId, Guid id, UpdateTransactionDto dto)
        {
            try
            {
                var transaction = await _transactionService.UpdateAsync(id, profileId, GetUserId(), dto);
                return Ok(transaction);
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
                await _transactionService.DeleteAsync(id, profileId, GetUserId());
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
