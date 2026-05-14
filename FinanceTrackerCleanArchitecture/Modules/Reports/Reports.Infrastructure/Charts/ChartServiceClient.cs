using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Reports.Infrastructure.Charts;

public class ChartServiceClient : IChartServiceClient
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly HttpClient _http;
    private readonly ILogger<ChartServiceClient> _logger;

    public ChartServiceClient(HttpClient http, ILogger<ChartServiceClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    public Task<byte[]?> GetMonthlyBarAsync(MonthlyBarChartRequest req, CancellationToken ct = default)
        => PostAsync("/charts/monthly-bar", req, ct);

    public Task<byte[]?> GetBalanceLineAsync(BalanceLineChartRequest req, CancellationToken ct = default)
        => PostAsync("/charts/balance-line", req, ct);

    public Task<byte[]?> GetCategoryPieAsync(CategoryPieChartRequest req, CancellationToken ct = default)
        => PostAsync("/charts/category-pie", req, ct);

    private async Task<byte[]?> PostAsync<T>(string path, T body, CancellationToken ct)
    {
        try
        {
            using var response = await _http.PostAsJsonAsync(path, body, JsonOptions, ct);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsByteArrayAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Chart service unavailable at {Path}; report will be generated without chart", path);
            return null;
        }
    }
}
