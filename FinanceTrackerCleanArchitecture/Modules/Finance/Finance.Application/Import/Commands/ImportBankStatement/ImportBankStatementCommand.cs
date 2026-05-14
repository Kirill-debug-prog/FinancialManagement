namespace Finance.Application.Import.Commands.ImportBankStatement;

public record ImportBankStatementCommand(
  Guid WalletId,
  byte[] PdfBytes);
