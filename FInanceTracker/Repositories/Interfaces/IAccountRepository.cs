using FInanceTracker.Data.Models;

namespace FInanceTracker.Repositories.Interfaces
{
    public interface IAccountRepository
    {
        Task<Account?> GetByIdAsync(Guid id);
        Task<List<Account>> GetAllByProfileIdAsync(Guid profileId);
        Task<Account> CreateAsync(Account account);
        Task UpdateAsync(Account account);
        Task DeleteAsync(Guid id);
    }
}
