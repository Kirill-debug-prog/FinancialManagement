using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Debts.Queries.GetDebtsByProfileId;

public class GetDebtsByProfileIdQueryHandler
{
  private readonly IDebtRepository _debtRepository;

  public GetDebtsByProfileIdQueryHandler(IDebtRepository debtRepository)
  {
    _debtRepository = debtRepository;
  }

  public async Task<Result<IEnumerable<GetDebtsByProfileIdResponse>>> Handle(GetDebtsByProfileIdQuery query)
  {
    var debts = await _debtRepository.GetByProfileIdAsync(query.ProfileId);

    var response = debts.Select(d => new GetDebtsByProfileIdResponse(
      d.Id,
      d.ProfileId,
      d.CurrencyId,
      d.CreditorName,
      d.TotalAmount,
      d.RemainingAmount,
      d.DueDate,
      d.IsRepaid));

    return Result<IEnumerable<GetDebtsByProfileIdResponse>>.Success(response);
  }
}
