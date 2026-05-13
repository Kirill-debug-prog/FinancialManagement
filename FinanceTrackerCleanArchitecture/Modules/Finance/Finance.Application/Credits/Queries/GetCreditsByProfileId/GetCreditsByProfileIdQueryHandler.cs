using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Credits.Queries.GetCreditsByProfileId;

public class GetCreditsByProfileIdQueryHandler
{
  private readonly ICreditRepository _creditRepository;

  public GetCreditsByProfileIdQueryHandler(ICreditRepository creditRepository)
  {
    _creditRepository = creditRepository;
  }

  public async Task<Result<IEnumerable<GetCreditsByProfileIdResponse>>> Handle(GetCreditsByProfileIdQuery query)
  {
    var credits = await _creditRepository.GetByProfileIdAsync(query.ProfileId);

    var response = credits.Select(c => new GetCreditsByProfileIdResponse(
      c.Id,
      c.ProfileId,
      c.CurrencyId,
      c.Name,
      c.TotalAmount,
      c.RemainingAmount,
      c.MonthlyPayment,
      c.InterestRate,
      c.StartDate,
      c.EndDate,
      c.IsClosed));

    return Result<IEnumerable<GetCreditsByProfileIdResponse>>.Success(response);
  }
}
