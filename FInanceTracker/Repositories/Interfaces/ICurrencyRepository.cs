using FInanceTracker.Data.Models;

namespace FInanceTracker.Repositories.Interfaces
{
    public interface ICurrencyRepository
    {
        Task<Currency?> GetByIdAsync(Guid id);
        Task<List<Currency>> GetAllByProfileIdAsync(Guid profileId);
        Task<Currency> CreateAsync(Currency currency);
        Task UpdateAsync(Currency currency);
        Task DeleteAsync(Guid id);
    }
}
