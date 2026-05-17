using Finance.Domain.Enums;

namespace Finance.Application.Deposits.Commands.CreateDeposit;

public record CreateDepositCommand(
  Guid ProfileId,
  Guid CurrencyId,
  string Name,
  decimal InitialAmount,
  decimal InterestRate,
  DateOnly StartDate,
  DateOnly EndDate,
  bool IsCapitalized,
  DepositType Type);
