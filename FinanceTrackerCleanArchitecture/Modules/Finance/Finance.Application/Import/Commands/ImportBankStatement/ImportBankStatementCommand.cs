using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Import.Commands.ImportBankStatement;

public record ImportBankStatementCommand(
  Guid WalletId,
  byte[] PdfBytes) : IRequest<Result<ImportBankStatementResponse>>;
