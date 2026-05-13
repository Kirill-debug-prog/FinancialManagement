namespace Finance.Application.Deposits.Queries.GetDepositsByProfileId;

public record GetDepositsByProfileIdResponse(
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
