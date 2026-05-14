using Core.Domain.Common;
using Finance.Domain.Enums;
using Finance.Domain.Interfaces;

namespace Finance.Application.Analytics.Queries.GetMonthlyAnalytics;

public class GetMonthlyAnalyticsQueryHandler
{
    private readonly IWalletRepository _walletRepository;
    private readonly ITransactionRepository _transactionRepository;

    public GetMonthlyAnalyticsQueryHandler(
        IWalletRepository walletRepository,
        ITransactionRepository transactionRepository)
    {
        _walletRepository = walletRepository;
        _transactionRepository = transactionRepository;
    }

    public async Task<Result<IEnumerable<GetMonthlyAnalyticsResponse>>> Handle(GetMonthlyAnalyticsQuery query)
    {
        var wallets = await _walletRepository.GetWalletsByProfileIdAsync(query.ProfileId);

        var monthlyIncome = new decimal[13];
        var monthlyExpense = new decimal[13];

        foreach (var wallet in wallets)
        {
            var transactions = await _transactionRepository.GetByWalletIdAsync(wallet.Id);
            foreach (var tx in transactions)
            {
                if (tx.Date.Year != query.Year) continue;
                if (tx.Type == FinancialType.Transfer) continue;

                if (tx.Type == FinancialType.Income)
                    monthlyIncome[tx.Date.Month] += tx.Amount;
                else
                    monthlyExpense[tx.Date.Month] += tx.Amount;
            }
        }

        var result = new List<GetMonthlyAnalyticsResponse>(12);
        decimal cumulativeBalance = 0;

        for (int m = 1; m <= 12; m++)
        {
            cumulativeBalance += monthlyIncome[m] - monthlyExpense[m];
            result.Add(new GetMonthlyAnalyticsResponse(
                $"{query.Year:D4}-{m:D2}",
                monthlyIncome[m],
                monthlyExpense[m],
                cumulativeBalance));
        }

        return Result<IEnumerable<GetMonthlyAnalyticsResponse>>.Success(result);
    }
}
