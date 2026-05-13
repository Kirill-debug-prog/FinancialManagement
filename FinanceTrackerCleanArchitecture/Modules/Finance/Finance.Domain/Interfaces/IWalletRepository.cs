using Finance.Domain.Entities;

namespace Finance.Domain.Interfaces;

public interface IWalletRepository
{
  Task CreateAsync(Wallet wallet);
  Task<Wallet?> GetWalletByIdAsync(Guid id);
  Task<IEnumerable<Wallet>> GetWalletsByProfileIdAsync(Guid profileId);
  Task UpdateAsync(Wallet wallet);
  Task DeleteAsync(Guid id);
}
