using Finance.Domain.Entities;

namespace Finance.Domain.Interfaces;

public interface ITransactionRepository
{
  Task CreateAsync(Transaction transaction);
  Task<Transaction?> GetByIdAsync(Guid id);
  Task<IEnumerable<Transaction>> GetByWalletIdAsync(Guid walletId);
  Task<IEnumerable<Transaction>> GetIncomingTransfersByWalletIdAsync(Guid walletId);
  Task UpdateAsync(Transaction transaction);
  Task DeleteAsync(Transaction transaction);
}
