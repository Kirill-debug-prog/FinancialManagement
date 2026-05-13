namespace Finance.Application.Credits.Commands.CreateCredit;

public record CreateCreditCommand(
  Guid ProfileId,
  Guid CurrencyId,
  string Name,
  decimal TotalAmount,
  decimal MonthlyPayment,
  decimal InterestRate,
  DateOnly StartDate,
  DateOnly EndDate);
