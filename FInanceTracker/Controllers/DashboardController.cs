using System.Security.Claims;
using FInanceTracker.Data.DTOs;
using FInanceTracker.Data.Models;
using FInanceTracker.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FInanceTracker.Controllers
{
    [ApiController]
    [Route("api/profiles/{profileId}/dashboard")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly ITransactionService _transactionService;
        private readonly IProfileService _profileService;

        public DashboardController(
            IAccountService accountService,
            ITransactionService transactionService,
            IProfileService profileService)
        {
            _accountService = accountService;
            _transactionService = transactionService;
            _profileService = profileService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<ActionResult<DashboardDto>> Get(Guid profileId)
        {
            try
            {
                var userId = GetUserId();
                await _profileService.GetByIdAsync(profileId, userId);

                var accounts = await _accountService.GetAllByProfileIdAsync(profileId, userId);
                var totalBalance = accounts.Sum(a => a.Balance);

                var now = DateTime.UtcNow;
                var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var endOfMonth = startOfMonth.AddMonths(1);

                var transactions = await _transactionService.GetAllByProfileIdAsync(
                    profileId, userId, null, null, startOfMonth, endOfMonth);

                var totalIncome = transactions
                    .Where(t => t.Type == TransactionType.Income)
                    .Sum(t => t.TotalAmount);

                var totalExpense = transactions
                    .Where(t => t.Type == TransactionType.Expense)
                    .Sum(t => t.TotalAmount);

                var categoryExpenses = transactions
                    .Where(t => t.Type == TransactionType.Expense && t.CategoryName != null)
                    .GroupBy(t => t.CategoryName!)
                    .Select((g, i) => new CategoryExpenseDto
                    {
                        Name = g.Key,
                        Value = g.Sum(t => t.TotalAmount),
                        Color = GetColor(i)
                    })
                    .OrderByDescending(c => c.Value)
                    .ToList();

                // Last 6 months trend
                var monthlyData = new List<MonthlyDataDto>();
                for (int i = 5; i >= 0; i--)
                {
                    var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-i);
                    var monthEnd = monthStart.AddMonths(1);

                    var monthTransactions = await _transactionService.GetAllByProfileIdAsync(
                        profileId, userId, null, null, monthStart, monthEnd);

                    monthlyData.Add(new MonthlyDataDto
                    {
                        Month = GetRussianMonthName(monthStart.Month),
                        Income = monthTransactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.TotalAmount),
                        Expense = monthTransactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.TotalAmount),
                    });
                }

                return Ok(new DashboardDto
                {
                    TotalBalance = totalBalance,
                    TotalIncome = totalIncome,
                    TotalExpense = totalExpense,
                    CategoryExpenses = categoryExpenses,
                    MonthlyData = monthlyData,
                });
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
