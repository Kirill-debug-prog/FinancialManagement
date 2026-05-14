namespace Reports.Infrastructure.Charts;

public record MonthlyBarChartRequest(
    List<string> Labels,
    List<decimal> Income,
    List<decimal> Expense);

public record BalanceLineChartRequest(
    List<string> Labels,
    List<decimal> Balance);

public record CategoryPieItem(string Name, decimal Value, string Color);

public record CategoryPieChartRequest(
    List<CategoryPieItem> Items,
    string Title);
