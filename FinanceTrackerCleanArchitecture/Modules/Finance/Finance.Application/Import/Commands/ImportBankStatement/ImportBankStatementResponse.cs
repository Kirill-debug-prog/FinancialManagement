namespace Finance.Application.Import.Commands.ImportBankStatement;

public record ImportBankStatementResponse(
  int Imported,
  int Skipped,
  DateOnly? DateFrom,
  DateOnly? DateTo,
  List<string> Errors);
