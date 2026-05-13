namespace Finance.Application.Deposits.Queries.GetDepositById;

public record GetDepositByIdResponse(
  Guid Id,
  Guid ProfileId,
  Guid CurrencyId,
  string Name,
  decimal InitialAmount,
  decimal CurrentAmount,
  decimal InterestRate,
  DateOnly StartDate,
  DateOnly EndDate,
  bool IsCapitalized,
  bool IsClosed);
