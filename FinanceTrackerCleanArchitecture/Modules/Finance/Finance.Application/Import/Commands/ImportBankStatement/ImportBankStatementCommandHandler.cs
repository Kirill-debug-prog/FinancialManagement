using MediatR;
using Core.Domain.Common;
using Finance.Domain.Entities;
using Finance.Domain.Enums;
using Finance.Domain.Interfaces;

namespace Finance.Application.Import.Commands.ImportBankStatement;

public class ImportBankStatementCommandHandler : IRequestHandler<ImportBankStatementCommand, Result<ImportBankStatementResponse>>
{
  private readonly IBankStatementParser _parser;
  private readonly ITransactionRepository _transactionRepository;
  private readonly IWalletRepository _walletRepository;

  public ImportBankStatementCommandHandler(
    IBankStatementParser parser,
    ITransactionRepository transactionRepository,
    IWalletRepository walletRepository)
  {
    _parser = parser;
    _transactionRepository = transactionRepository;
    _walletRepository = walletRepository;
  }

  public async Task<Result<ImportBankStatementResponse>> Handle(ImportBankStatementCommand command, CancellationToken cancellationToken)
  {
    var wallet = await _walletRepository.GetWalletByIdAsync(command.WalletId);
    if (wallet is null)
      return Result<ImportBankStatementResponse>.Failure(
        new DomainError("Import.WalletNotFound", "Wallet not found."));

    var parsed = _parser.Parse(command.PdfBytes).ToList();

    if (parsed.Count == 0)
      return Result<ImportBankStatementResponse>.Failure(
        new DomainError("Import.NoTransactions", "No transactions found in the document."));

    int imported = 0;
    int skipped = 0;
    var errors = new List<string>();

    foreach (var tx in parsed)
    {
      var type = tx.IsIncome ? FinancialType.Income : FinancialType.Expense;
      var transactionResult = Transaction.Create(
        command.WalletId, type, tx.Amount, tx.Date, description: tx.Description);

      if (transactionResult.IsFailure)
      {
        errors.Add($"{tx.Date:dd.MM.yyyy}: {transactionResult.Error!.Message}");
        skipped++;
        continue;
      }

      await _transactionRepository.CreateAsync(transactionResult.Value!);
      imported++;
    }

    var dateFrom = parsed.Min(t => t.Date);
    var dateTo = parsed.Max(t => t.Date);

    return Result<ImportBankStatementResponse>.Success(
      new ImportBankStatementResponse(imported, skipped, dateFrom, dateTo, errors));
  }
}
