using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Credits.Commands.DeleteCredit;

public class DeleteCreditCommandHandler
{
  private readonly ICreditRepository _creditRepository;

  public DeleteCreditCommandHandler(ICreditRepository creditRepository)
  {
    _creditRepository = creditRepository;
  }

  public async Task<Result<bool>> Handle(DeleteCreditCommand command)
  {
    var credit = await _creditRepository.GetByIdAsync(command.Id);
    if (credit is null)
      return Result<bool>.Failure(new DomainError("Credit.NotFound", "Credit not found."));

    await _creditRepository.DeleteAsync(credit);
    return Result<bool>.Success(true);
  }
}
