namespace Finance.Application.Debts.Queries.GetDebtsByProfileId;

public record GetDebtsByProfileIdResponse(
  Guid Id,
  Guid ProfileId,
  Guid CurrencyId,
  string CreditorName,
  decimal TotalAmount,
  decimal RemainingAmount,
  DateOnly? DueDate,
  bool IsRepaid);
