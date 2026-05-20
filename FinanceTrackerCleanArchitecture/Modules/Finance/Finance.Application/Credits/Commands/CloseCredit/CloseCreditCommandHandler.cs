using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Credits.Commands.CloseCredit;

public class CloseCreditCommandHandler : IRequestHandler<CloseCreditCommand, Result<bool>>
{
  private readonly ICreditRepository _creditRepository;

  public CloseCreditCommandHandler(ICreditRepository creditRepository)
  {
    _creditRepository = creditRepository;
  }

  public async Task<Result<bool>> Handle(CloseCreditCommand command, CancellationToken cancellationToken)
  {
    var credit = await _creditRepository.GetByIdAsync(command.Id);
    if (credit is null)
      return Result<bool>.Failure(new DomainError("Credit.NotFound", "Credit not found."));

    if (credit.IsClosed)
      return Result<bool>.Failure(new DomainError("Credit.AlreadyClosed", "Credit is already closed."));

    credit.Close();
    await _creditRepository.UpdateAsync(credit);
    return Result<bool>.Success(true);
  }
}
