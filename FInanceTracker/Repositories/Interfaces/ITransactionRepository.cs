using FInanceTracker.Data.Models;

namespace FInanceTracker.Repositories.Interfaces
{
    public interface ITransactionRepository
    {
        Task<Transaction?> GetByIdAsync(Guid id);
        Task<List<Transaction>> GetAllByProfileIdAsync(Guid profileId, Guid? accountId = null, Guid? categoryId = null, DateTime? dateFrom = null, DateTime? dateTo = null);
        Task<List<Transaction>> GetByAccountIdAsync(Guid accountId);
        Task<Transaction> CreateAsync(Transaction transaction);
        Task UpdateAsync(Transaction transaction);
        Task DeleteAsync(Guid id);
    }
}
