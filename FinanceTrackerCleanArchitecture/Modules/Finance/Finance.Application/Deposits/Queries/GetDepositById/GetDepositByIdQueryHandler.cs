using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Deposits.Queries.GetDepositById;

public class GetDepositByIdQueryHandler : IRequestHandler<GetDepositByIdQuery, Result<GetDepositByIdResponse>>
{
  private readonly IDepositRepository _depositRepository;

  public GetDepositByIdQueryHandler(IDepositRepository depositRepository)
  {
    _depositRepository = depositRepository;
  }

  public async Task<Result<GetDepositByIdResponse>> Handle(GetDepositByIdQuery query, CancellationToken cancellationToken)
  {
    var deposit = await _depositRepository.GetByIdAsync(query.Id);
    if (deposit is null)
      return Result<GetDepositByIdResponse>.Failure(new DomainError("Deposit.NotFound", "Deposit not found."));

    return Result<GetDepositByIdResponse>.Success(new GetDepositByIdResponse(
      deposit.Id,
      deposit.ProfileId,
      deposit.CurrencyId,
      deposit.Name,
      deposit.InitialAmount,
      deposit.CurrentAmount,
      deposit.InterestRate,
      deposit.StartDate,
      deposit.EndDate,
      deposit.IsCapitalized,
      deposit.IsClosed,
      deposit.Type));
  }
}
