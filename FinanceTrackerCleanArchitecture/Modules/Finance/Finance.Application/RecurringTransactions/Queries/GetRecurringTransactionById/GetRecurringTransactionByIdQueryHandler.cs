using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.RecurringTransactions.Queries.GetRecurringTransactionById;

public class GetRecurringTransactionByIdQueryHandler
{
  private readonly IRecurringTransactionRepository _recurringTransactionRepository;

  public GetRecurringTransactionByIdQueryHandler(IRecurringTransactionRepository recurringTransactionRepository)
  {
    _recurringTransactionRepository = recurringTransactionRepository;
  }

  public async Task<Result<GetRecurringTransactionByIdResponse>> Handle(GetRecurringTransactionByIdQuery query)
  {
    var rt = await _recurringTransactionRepository.GetByIdAsync(query.Id);
    if (rt is null)
      return Result<GetRecurringTransactionByIdResponse>.Failure(new DomainError("RecurringTransaction.NotFound", "Recurring transaction not found."));

    return Result<GetRecurringTransactionByIdResponse>.Success(new GetRecurringTransactionByIdResponse(
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
  }
}
