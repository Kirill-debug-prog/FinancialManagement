using FInanceTracker.Data.Models;

namespace FInanceTracker.Repositories.Interfaces
{
    public interface ICreditRepository
    {
        Task<Credit?> GetByIdAsync(Guid id);
        Task<List<Credit>> GetAllByProfileIdAsync(Guid profileId);
        Task<Credit> CreateAsync(Credit credit);
        Task UpdateAsync(Credit credit);
        Task DeleteAsync(Guid id);
    }
}
