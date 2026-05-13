using Finance.Domain.Entities;
using Finance.Domain.Interfaces;
using Finance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Finance.Infrastructure.Persistence.Repositories;

public class RecurringTransactionRepository : IRecurringTransactionRepository
{
  private readonly FinanceDbContext _context;

  public RecurringTransactionRepository(FinanceDbContext context)
  {
    _context = context;
  }

  public async Task CreateAsync(RecurringTransaction recurringTransaction)
  {
    _context.RecurringTransactions.Add(recurringTransaction);
    await _context.SaveChangesAsync();
  }

  public async Task<RecurringTransaction?> GetByIdAsync(Guid id)
  {
    return await _context.RecurringTransactions.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);
  }

  public async Task<IEnumerable<RecurringTransaction>> GetByWalletIdAsync(Guid walletId)
  {
    return await _context.RecurringTransactions.AsNoTracking().Where(r => r.WalletId == walletId).ToListAsync();
  }

  public async Task UpdateAsync(RecurringTransaction recurringTransaction)
  {
    await _context.RecurringTransactions
      .Where(r => r.Id == recurringTransaction.Id)
      .ExecuteUpdateAsync(s => s
        .SetProperty(r => r.IsActive, recurringTransaction.IsActive)
        .SetProperty(r => r.NextOccurrenceDate, recurringTransaction.NextOccurrenceDate)
        .SetProperty(r => r.UpdatedAt, DateTime.UtcNow));
  }

  public async Task DeleteAsync(RecurringTransaction recurringTransaction)
  {
    _context.RecurringTransactions.Remove(recurringTransaction);
    await _context.SaveChangesAsync();
  }
}
