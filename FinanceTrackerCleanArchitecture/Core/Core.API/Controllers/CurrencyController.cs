using MediatR;
using Finance.Application.Currencies.Commands.UpdateCurrencyRate;
using Finance.Application.Currencies.Queries.GetAllCurrencies;
using Finance.Application.Currencies.Queries.GetCurrencyById;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CurrencyController : ControllerBase
{

  private readonly IMediator _mediator;

  public CurrencyController(IMediator mediator)
  {
    _mediator = mediator;
  }

  [HttpGet]
  public async Task<IActionResult> GetAll()
  {
    var result = await _mediator.Send(new GetAllCurrenciesQuery());
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var result = await _mediator.Send(new GetCurrencyByIdQuery(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPatch("{id}/rate")]
  public async Task<IActionResult> UpdateRate(Guid id, [FromBody] UpdateCurrencyRateCommand command)
  {
    var result = await _mediator.Send(command with { Id = id });
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

}
