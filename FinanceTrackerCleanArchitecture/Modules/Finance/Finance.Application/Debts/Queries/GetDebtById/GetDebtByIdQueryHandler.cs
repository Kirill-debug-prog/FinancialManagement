using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Debts.Queries.GetDebtById;

public class GetDebtByIdQueryHandler : IRequestHandler<GetDebtByIdQuery, Result<GetDebtByIdResponse>>
{
  private readonly IDebtRepository _debtRepository;

  public GetDebtByIdQueryHandler(IDebtRepository debtRepository)
  {
    _debtRepository = debtRepository;
  }

  public async Task<Result<GetDebtByIdResponse>> Handle(GetDebtByIdQuery query, CancellationToken cancellationToken)
  {
    var debt = await _debtRepository.GetByIdAsync(query.Id);
    if (debt is null)
      return Result<GetDebtByIdResponse>.Failure(new DomainError("Debt.NotFound", "Debt not found."));

    return Result<GetDebtByIdResponse>.Success(new GetDebtByIdResponse(
      debt.Id,
      debt.ProfileId,
      debt.CurrencyId,
      debt.CreditorName,
      debt.TotalAmount,
      debt.RemainingAmount,
      debt.DueDate,
      debt.IsRepaid));
  }
}
