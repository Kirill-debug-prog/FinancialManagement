using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Analytics.Queries.GetCategoryAnalytics;

public class GetCategoryAnalyticsQueryHandler : IRequestHandler<GetCategoryAnalyticsQuery, Result<IEnumerable<GetCategoryAnalyticsResponse>>>
{
    private readonly ITransactionRepository _transactionRepository;

    public GetCategoryAnalyticsQueryHandler(ITransactionRepository transactionRepository)
    {
        _transactionRepository = transactionRepository;
    }

    public async Task<Result<IEnumerable<GetCategoryAnalyticsResponse>>> Handle(GetCategoryAnalyticsQuery query, CancellationToken cancellationToken)
    {
        var totals = await _transactionRepository.GetCategoryTotalsAsync(
            query.ProfileId, query.Type, query.DateFrom, query.DateTo);

        var response = totals
            .OrderByDescending(t => t.Total)
            .Select(t => new GetCategoryAnalyticsResponse(
                t.Name,
                t.Total,
                NameToColor(t.Name)))
            .ToList();

        return Result<IEnumerable<GetCategoryAnalyticsResponse>>.Success(response);
    }

    // Deterministic HSL color from category name: same name → same color across requests.
    // String.GetHashCode is randomized per-process in .NET, so we use a stable polynomial hash.
    private static string NameToColor(string name)
    {
        int hash = 17;
        unchecked
        {
            foreach (var c in name)
                hash = hash * 31 + c;
        }
        var hue = ((hash % 360) + 360) % 360;
        return $"hsl({hue}, 65%, 55%)";
    }
}
