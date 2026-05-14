using Core.Domain.Common;
using Finance.Domain.Enums;
using Finance.Domain.Interfaces;

namespace Finance.Application.Analytics.Queries.GetCategoryAnalytics;

public class GetCategoryAnalyticsQueryHandler
{
    private static readonly string[] Colors =
    [
        "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6",
        "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f59e0b",
        "#10b981", "#6366f1"
    ];

    private readonly IWalletRepository _walletRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly ICategoryRepository _categoryRepository;

    public GetCategoryAnalyticsQueryHandler(
        IWalletRepository walletRepository,
        ITransactionRepository transactionRepository,
        ICategoryRepository categoryRepository)
    {
        _walletRepository = walletRepository;
        _transactionRepository = transactionRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<Result<IEnumerable<GetCategoryAnalyticsResponse>>> Handle(GetCategoryAnalyticsQuery query)
    {
        var wallets = await _walletRepository.GetWalletsByProfileIdAsync(query.ProfileId);

        var filtered = new List<(Guid? CategoryId, decimal Amount)>();

        foreach (var wallet in wallets)
        {
            var transactions = await _transactionRepository.GetByWalletIdAsync(wallet.Id);
            foreach (var tx in transactions)
            {
                if (tx.Type != query.Type) continue;
                if (query.DateFrom.HasValue && tx.Date < query.DateFrom.Value) continue;
                if (query.DateTo.HasValue && tx.Date > query.DateTo.Value) continue;
                filtered.Add((tx.CategoryId, tx.Amount));
            }
        }

        var systemCats = await _categoryRepository.GetSystemCategoriesAsync();
        var profileCats = await _categoryRepository.GetByProfileIdAsync(query.ProfileId);
        var categoryNames = systemCats.Concat(profileCats).ToDictionary(c => c.Id, c => c.Name);

        var grouped = filtered
            .GroupBy(t => t.CategoryId)
            .Select(g =>
            {
                var name = g.Key.HasValue && categoryNames.TryGetValue(g.Key.Value, out var n)
                    ? n
                    : "Без категории";
                return (Name: name, Value: g.Sum(t => t.Amount));
            })
            .OrderByDescending(x => x.Value)
            .ToList();

        var response = grouped
            .Select((item, i) => new GetCategoryAnalyticsResponse(
                item.Name,
                item.Value,
                Colors[i % Colors.Length]))
            .ToList();

        return Result<IEnumerable<GetCategoryAnalyticsResponse>>.Success(response);
    }
}
