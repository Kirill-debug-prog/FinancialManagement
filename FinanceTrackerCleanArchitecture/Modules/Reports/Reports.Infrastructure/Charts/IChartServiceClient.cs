namespace Reports.Infrastructure.Charts;

public interface IChartServiceClient
{
    Task<byte[]?> GetMonthlyBarAsync(MonthlyBarChartRequest req, CancellationToken ct = default);
    Task<byte[]?> GetBalanceLineAsync(BalanceLineChartRequest req, CancellationToken ct = default);
    Task<byte[]?> GetCategoryPieAsync(CategoryPieChartRequest req, CancellationToken ct = default);
}
