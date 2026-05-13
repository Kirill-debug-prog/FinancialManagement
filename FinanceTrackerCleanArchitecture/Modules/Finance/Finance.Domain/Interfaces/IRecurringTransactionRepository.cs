using Finance.Domain.Entities;

namespace Finance.Domain.Interfaces;

public interface IRecurringTransactionRepository
{
  Task CreateAsync(RecurringTransaction recurringTransaction);
  Task<RecurringTransaction?> GetByIdAsync(Guid id);
  Task<IEnumerable<RecurringTransaction>> GetByWalletIdAsync(Guid walletId);
  Task UpdateAsync(RecurringTransaction recurringTransaction);
  Task DeleteAsync(RecurringTransaction recurringTransaction);
}
