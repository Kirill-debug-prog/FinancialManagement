using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Credits.Commands.MakePayment;

public class MakePaymentCommandHandler
{
  private readonly ICreditRepository _creditRepository;

  public MakePaymentCommandHandler(ICreditRepository creditRepository)
  {
    _creditRepository = creditRepository;
  }

  public async Task<Result<bool>> Handle(MakePaymentCommand command)
  {
    var credit = await _creditRepository.GetByIdAsync(command.CreditId);
    if (credit is null)
      return Result<bool>.Failure(new DomainError("Credit.NotFound", "Credit not found."));

    var result = credit.MakePayment(command.Amount);
    if (result.IsFailure)
      return result;

    await _creditRepository.UpdateAsync(credit);
    return Result<bool>.Success(true);
  }
}
