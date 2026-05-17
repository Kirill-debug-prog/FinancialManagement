using Finance.Domain.Entities;
using Finance.Domain.Interfaces;
using Finance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Finance.Infrastructure.Persistence.Repositories;

public class TransactionRepository : ITransactionRepository
{
  private readonly FinanceDbContext _context;

  public TransactionRepository(FinanceDbContext context)
  {
    _context = context;
  }

  public async Task CreateAsync(Transaction transaction)
  {
    _context.Transactions.Add(transaction);
    await _context.SaveChangesAsync();
  }

  public async Task<Transaction?> GetByIdAsync(Guid id)
  {
    return await _context.Transactions.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
  }

  public async Task<IEnumerable<Transaction>> GetByWalletIdAsync(Guid walletId)
  {
    return await _context.Transactions
      .Include(t => t.Category)
      .AsNoTracking()
      .Where(t => t.WalletId == walletId)
      .ToListAsync();
  }

  public async Task<IEnumerable<Transaction>> GetIncomingTransfersByWalletIdAsync(Guid walletId)
  {
    return await _context.Transactions.AsNoTracking()
      .Where(t => t.ToWalletId == walletId)
      .ToListAsync();
  }

  public async Task UpdateAsync(Transaction transaction)
  {
    await _context.Transactions
      .Where(t => t.Id == transaction.Id)
      .ExecuteUpdateAsync(s => s
        .SetProperty(t => t.Description, transaction.Description)
        .SetProperty(t => t.CategoryId, transaction.CategoryId)
        .SetProperty(t => t.UpdatedAt, DateTime.UtcNow));
  }

  public async Task DeleteAsync(Transaction transaction)
  {
    _context.Transactions.Remove(transaction);
    await _context.SaveChangesAsync();
  }
}
