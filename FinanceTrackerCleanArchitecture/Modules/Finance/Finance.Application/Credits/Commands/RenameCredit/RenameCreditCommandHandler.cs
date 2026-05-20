using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Credits.Commands.RenameCredit;

public class RenameCreditCommandHandler : IRequestHandler<RenameCreditCommand, Result<bool>>
{
  private readonly ICreditRepository _creditRepository;

  public RenameCreditCommandHandler(ICreditRepository creditRepository)
  {
    _creditRepository = creditRepository;
  }

  public async Task<Result<bool>> Handle(RenameCreditCommand command, CancellationToken cancellationToken)
  {
    var credit = await _creditRepository.GetByIdAsync(command.Id);
    if (credit is null)
      return Result<bool>.Failure(new DomainError("Credit.NotFound", "Credit not found."));

    var result = credit.Rename(command.NewName);
    if (result.IsFailure)
      return result;

    await _creditRepository.UpdateAsync(credit);
    return Result<bool>.Success(true);
  }
}
