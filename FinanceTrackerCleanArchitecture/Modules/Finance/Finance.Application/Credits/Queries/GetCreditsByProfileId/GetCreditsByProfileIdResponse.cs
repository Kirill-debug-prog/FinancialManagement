namespace Finance.Application.Credits.Queries.GetCreditsByProfileId;

public record GetCreditsByProfileIdResponse(
  Guid Id,
  Guid ProfileId,
  Guid CurrencyId,
  string Name,
  decimal TotalAmount,
  decimal RemainingAmount,
  decimal MonthlyPayment,
  decimal InterestRate,
  DateOnly StartDate,
  DateOnly EndDate,
  bool IsClosed);
