using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Transactions.Queries.GetTransactionsByWalletId;

public class GetTransactionsByWalletIdQueryHandler
{
  private readonly ITransactionRepository _transactionRepository;

  public GetTransactionsByWalletIdQueryHandler(ITransactionRepository transactionRepository)
  {
    _transactionRepository = transactionRepository;
  }

  public async Task<Result<IEnumerable<GetTransactionsByWalletIdResponse>>> Handle(GetTransactionsByWalletIdQuery query)
  {
    var transactions = await _transactionRepository.GetByWalletIdAsync(query.WalletId);

    var response = transactions.Select(t => new GetTransactionsByWalletIdResponse(
      t.Id,
      t.WalletId,
      t.CategoryId,
      t.Type,
      t.Amount,
      t.Date,
      t.Description));

    return Result<IEnumerable<GetTransactionsByWalletIdResponse>>.Success(response);
  }
}
