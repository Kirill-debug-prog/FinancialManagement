namespace Finance.Application.Import;

public record ParsedTransaction(
  DateOnly Date,
  string Description,
  decimal Amount,
  bool IsIncome);
