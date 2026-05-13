using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.RecurringTransactions.Queries.GetRecurringTransactionsByWalletId;

public class GetRecurringTransactionsByWalletIdQueryHandler
{
  private readonly IRecurringTransactionRepository _recurringTransactionRepository;

  public GetRecurringTransactionsByWalletIdQueryHandler(IRecurringTransactionRepository recurringTransactionRepository)
  {
    _recurringTransactionRepository = recurringTransactionRepository;
  }

  public async Task<Result<IEnumerable<GetRecurringTransactionsByWalletIdResponse>>> Handle(GetRecurringTransactionsByWalletIdQuery query)
  {
    var recurringTransactions = await _recurringTransactionRepository.GetByWalletIdAsync(query.WalletId);

    var response = recurringTransactions.Select(rt => new GetRecurringTransactionsByWalletIdResponse(
      rt.Id,
      rt.WalletId,
      rt.ToWalletId,
      rt.CategoryId,
      rt.Type,
      rt.Amount,
      rt.Description,
      rt.Interval,
      rt.StartDate,
      rt.EndDate,
      rt.NextOccurrenceDate,
      rt.IsActive));

    return Result<IEnumerable<GetRecurringTransactionsByWalletIdResponse>>.Success(response);
  }
}
