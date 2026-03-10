using System.Security.Claims;
using FInanceTracker.Data.DTOs;
using FInanceTracker.Data.Models;
using FInanceTracker.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FInanceTracker.Controllers
{
    [ApiController]
    [Route("api/profiles/{profileId}/reports")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        private readonly IProfileService _profileService;

        public ReportsController(
            ITransactionService transactionService,
            IProfileService profileService)
        {
            _transactionService = transactionService;
            _profileService = profileService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("monthly")]
        public async Task<ActionResult<List<MonthlyReportDto>>> GetMonthlyReport(
            Guid profileId,
            [FromQuery] int? year = null)
        {
            try
            {
                var userId = GetUserId();
                await _profileService.GetByIdAsync(profileId, userId);

                var targetYear = year ?? DateTime.UtcNow.Year;
                var result = new List<MonthlyReportDto>();

                for (int month = 1; month <= 12; month++)
                {
                    var start = new DateTime(targetYear, month, 1, 0, 0, 0, DateTimeKind.Utc);
                    var end = start.AddMonths(1);

                    if (start > DateTime.UtcNow) break;

                    var transactions = await _transactionService.GetAllByProfileIdAsync(
                        profileId, userId, null, null, start, end);

                    var income = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.TotalAmount);
                    var expense = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.TotalAmount);

                    result.Add(new MonthlyReportDto
                    {
                        Month = GetRussianMonthName(month),
                        Income = income,
                        Expense = expense,
                        Balance = income - expense,
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("categories")]
        public async Task<ActionResult<List<CategoryReportDto>>> GetCategoryReport(
            Guid profileId,
            [FromQuery] string type = "Expense",
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null)
        {
            try
            {
                var userId = GetUserId();
                await _profileService.GetByIdAsync(profileId, userId);

                var from = dateFrom ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var to = dateTo ?? DateTime.UtcNow;

                var transactions = await _transactionService.GetAllByProfileIdAsync(
                    profileId, userId, null, null, from, to);

                var targetType = type.ToLower() == "income" ? TransactionType.Income : TransactionType.Expense;

                var result = transactions
                    .Where(t => t.Type == targetType && t.CategoryName != null)
                    .GroupBy(t => t.CategoryName!)
                    .Select((g, i) => new CategoryReportDto
                    {
                        Name = g.Key,
                        Value = g.Sum(t => t.TotalAmount),
                        Color = GetColor(i)
                    })
                    .OrderByDescending(c => c.Value)
                    .ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private static string GetColor(int index)
        {
            var colors = new[] { "#ef4444", "#f59e0b", "#8b5cf6", "#3b82f6", "#10b981", "#6b7280", "#C224EA", "#5823E8" };
            return colors[index % colors.Length];
        }

        private static string GetRussianMonthName(int month) => month switch
        {
            1 => "Янв",
            2 => "Фев",
            3 => "Мар",
            4 => "Апр",
            5 => "Май",
            6 => "Июн",
            7 => "Июл",
            8 => "Авг",
            9 => "Сен",
            10 => "Окт",
            11 => "Ноя",
            12 => "Дек",
            _ => ""
        };
    }
}
