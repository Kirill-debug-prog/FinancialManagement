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
  private readonly GetAllCurrenciesQueryHandler _getAllHandler;
  private readonly GetCurrencyByIdQueryHandler _getByIdHandler;
  private readonly UpdateCurrencyRateCommandHandler _updateRateHandler;

  public CurrencyController(
    GetAllCurrenciesQueryHandler getAllHandler,
    GetCurrencyByIdQueryHandler getByIdHandler,
    UpdateCurrencyRateCommandHandler updateRateHandler)
  {
    _getAllHandler = getAllHandler;
    _getByIdHandler = getByIdHandler;
    _updateRateHandler = updateRateHandler;
  }

  [HttpGet]
  public async Task<IActionResult> GetAll()
  {
    var result = await _getAllHandler.Handle(new GetAllCurrenciesQuery());
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var result = await _getByIdHandler.Handle(new GetCurrencyByIdQuery(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPatch("{id}/rate")]
  public async Task<IActionResult> UpdateRate(Guid id, [FromBody] UpdateCurrencyRateCommand command)
  {
    var result = await _updateRateHandler.Handle(command with { Id = id });
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}
