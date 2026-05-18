using Finance.Application.Analytics.Queries.GetCategoryAnalytics;
using Finance.Application.Analytics.Queries.GetMonthlyAnalytics;
using Finance.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
  private readonly GetMonthlyAnalyticsQueryHandler _monthlyAnalyticsHandler;
  private readonly GetCategoryAnalyticsQueryHandler _categoryAnalyticsHandler;

  public AnalyticsController(
    GetMonthlyAnalyticsQueryHandler monthlyAnalyticsHandler,
    GetCategoryAnalyticsQueryHandler categoryAnalyticsHandler)
  {
    _monthlyAnalyticsHandler = monthlyAnalyticsHandler;
    _categoryAnalyticsHandler = categoryAnalyticsHandler;
  }

  [HttpGet("monthly")]
  public async Task<IActionResult> GetMonthly(
    [FromQuery] Guid profileId,
    [FromQuery] int? year)
  {
    if (profileId == Guid.Empty)
      return BadRequest(new { error = "profileId is required." });

    var selectedYear = year ?? DateTime.UtcNow.Year;
    var result = await _monthlyAnalyticsHandler.Handle(
      new GetMonthlyAnalyticsQuery(profileId, selectedYear));

    if (result.IsFailure)
      return BadRequest(result.Error);

    return Ok(result.Value);
  }

  [HttpGet("categories")]
  public async Task<IActionResult> GetCategories(
    [FromQuery] Guid profileId,
    [FromQuery] string type = "Expense",
    [FromQuery] string? dateFrom = null,
    [FromQuery] string? dateTo = null)
  {
    if (profileId == Guid.Empty)
      return BadRequest(new { error = "profileId is required." });

    var financialType = type.ToLower() switch
    {
      "income" => FinancialType.Income,
      "expense" => FinancialType.Expense,
      _ => FinancialType.Expense
    };

    DateOnly? from = DateOnly.TryParse(dateFrom, out var df) ? df : null;
    DateOnly? to = DateOnly.TryParse(dateTo, out var dt) ? dt : null;

    var result = await _categoryAnalyticsHandler.Handle(
      new GetCategoryAnalyticsQuery(profileId, financialType, from, to));

    if (result.IsFailure)
      return BadRequest(result.Error);

    return Ok(result.Value);
  }
}
