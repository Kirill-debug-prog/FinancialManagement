using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Transactions.Queries.GetTransactionById;

public class GetTransactionByIdQueryHandler
{
  private readonly ITransactionRepository _transactionRepository;

  public GetTransactionByIdQueryHandler(ITransactionRepository transactionRepository)
  {
    _transactionRepository = transactionRepository;
  }

  public async Task<Result<GetTransactionByIdResponse>> Handle(GetTransactionByIdQuery query)
  {
    var transaction = await _transactionRepository.GetByIdAsync(query.Id);
    if (transaction is null)
      return Result<GetTransactionByIdResponse>.Failure(new DomainError("Transaction.NotFound", "Transaction not found."));

    return Result<GetTransactionByIdResponse>.Success(new GetTransactionByIdResponse(
      transaction.Id,
      transaction.WalletId,
      transaction.CategoryId,
      transaction.Type,
      transaction.Amount,
      transaction.Date,
      transaction.Description));
  }
}
