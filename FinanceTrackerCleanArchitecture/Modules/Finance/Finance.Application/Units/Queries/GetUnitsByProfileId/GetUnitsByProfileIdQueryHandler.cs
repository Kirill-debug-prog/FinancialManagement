using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Units.Queries.GetUnitsByProfileId;

public class GetUnitsByProfileIdQueryHandler
{
  private readonly IUnitRepository _unitRepository;

  public GetUnitsByProfileIdQueryHandler(IUnitRepository unitRepository)
  {
    _unitRepository = unitRepository;
  }

  public async Task<Result<IEnumerable<GetUnitsByProfileIdResponse>>> Handle(GetUnitsByProfileIdQuery query)
  {
    var units = await _unitRepository.GetByProfileIdAsync(query.ProfileId);
    var response = units.Select(u => new GetUnitsByProfileIdResponse(u.Id, u.Name, u.ShortName, u.IsSystem));
    return Result<IEnumerable<GetUnitsByProfileIdResponse>>.Success(response);
  }
}
