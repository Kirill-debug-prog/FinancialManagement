namespace FInanceTracker.Data.DTOs
{
    public class MonthlyReportDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal Income { get; set; }
        public decimal Expense { get; set; }
        public decimal Balance { get; set; }
    }

    public class CategoryReportDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public string Color { get; set; } = string.Empty;
    }
}
