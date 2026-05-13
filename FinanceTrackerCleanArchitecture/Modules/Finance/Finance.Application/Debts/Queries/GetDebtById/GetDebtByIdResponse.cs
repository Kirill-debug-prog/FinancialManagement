namespace Finance.Application.Debts.Queries.GetDebtById;

public record GetDebtByIdResponse(
  Guid Id,
  Guid ProfileId,
  Guid CurrencyId,
  string CreditorName,
  decimal TotalAmount,
  decimal RemainingAmount,
  DateOnly? DueDate,
  bool IsRepaid);
