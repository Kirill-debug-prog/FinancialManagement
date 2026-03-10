namespace FInanceTracker.Data.DTOs
{
    public class DashboardDto
    {
        public decimal TotalBalance { get; set; }
        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }
        public List<CategoryExpenseDto> CategoryExpenses { get; set; } = new();
        public List<MonthlyDataDto> MonthlyData { get; set; } = new();
    }

    public class CategoryExpenseDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public class MonthlyDataDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal Income { get; set; }
        public decimal Expense { get; set; }
    }
}
