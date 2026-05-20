using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Deposits.Queries.GetDepositsByProfileId;

public class GetDepositsByProfileIdQueryHandler : IRequestHandler<GetDepositsByProfileIdQuery, Result<IEnumerable<GetDepositsByProfileIdResponse>>>
{
  private readonly IDepositRepository _depositRepository;

  public GetDepositsByProfileIdQueryHandler(IDepositRepository depositRepository)
  {
    _depositRepository = depositRepository;
  }

  public async Task<Result<IEnumerable<GetDepositsByProfileIdResponse>>> Handle(GetDepositsByProfileIdQuery query, CancellationToken cancellationToken)
  {
    var deposits = await _depositRepository.GetByProfileIdAsync(query.ProfileId);

    var response = deposits.Select(d => new GetDepositsByProfileIdResponse(
      d.Id,
      d.ProfileId,
      d.CurrencyId,
      d.Name,
      d.InitialAmount,
      d.CurrentAmount,
      d.InterestRate,
      d.StartDate,
      d.EndDate,
      d.IsCapitalized,
      d.IsClosed,
      d.Type));

    return Result<IEnumerable<GetDepositsByProfileIdResponse>>.Success(response);
  }
}
