using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Units.Queries.GetAllUnits;

public class GetAllUnitsQueryHandler : IRequestHandler<GetAllUnitsQuery, Result<IEnumerable<GetAllUnitsResponse>>>
{
  private readonly IUnitRepository _unitRepository;

  public GetAllUnitsQueryHandler(IUnitRepository unitRepository)
  {
    _unitRepository = unitRepository;
  }

  public async Task<Result<IEnumerable<GetAllUnitsResponse>>> Handle(GetAllUnitsQuery query, CancellationToken cancellationToken)
  {
    var units = await _unitRepository.GetAllAsync();
    var response = units.Select(u => new GetAllUnitsResponse(u.Id, u.Name, u.ShortName, u.IsSystem));
    return Result<IEnumerable<GetAllUnitsResponse>>.Success(response);
  }
}
