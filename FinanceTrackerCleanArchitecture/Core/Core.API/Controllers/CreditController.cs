using MediatR;
using Finance.Application.Credits.Commands.CloseCredit;
using Finance.Application.Credits.Commands.CreateCredit;
using Finance.Application.Credits.Commands.DeleteCredit;
using Finance.Application.Credits.Commands.MakePayment;
using Finance.Application.Credits.Commands.RenameCredit;
using Finance.Application.Credits.Queries.GetCreditById;
using Finance.Application.Credits.Queries.GetCreditsByProfileId;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CreditController : ControllerBase
{

  private readonly IMediator _mediator;

  public CreditController(IMediator mediator)
  {
    _mediator = mediator;
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateCreditCommand command)
  {
    var result = await _mediator.Send(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var result = await _mediator.Send(new GetCreditByIdQuery(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet]
  public async Task<IActionResult> GetByProfileId([FromQuery] Guid profileId)
  {
    var result = await _mediator.Send(new GetCreditsByProfileIdQuery(profileId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPut("{id}/rename")]
  public async Task<IActionResult> Rename(Guid id, [FromBody] string newName)
  {
    var result = await _mediator.Send(new RenameCreditCommand(id, newName));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPost("{id}/payment")]
  public async Task<IActionResult> MakePayment(Guid id, [FromBody] decimal amount)
  {
    var result = await _mediator.Send(new MakePaymentCommand(id, amount));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPatch("{id}/close")]
  public async Task<IActionResult> Close(Guid id)
  {
    var result = await _mediator.Send(new CloseCreditCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var result = await _mediator.Send(new DeleteCreditCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}
