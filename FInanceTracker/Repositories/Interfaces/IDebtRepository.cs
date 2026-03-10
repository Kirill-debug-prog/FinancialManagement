using FInanceTracker.Data.Models;

namespace FInanceTracker.Repositories.Interfaces
{
    public interface IDebtRepository
    {
        Task<Debt?> GetByIdAsync(Guid id);
        Task<List<Debt>> GetAllByProfileIdAsync(Guid profileId);
        Task<Debt> CreateAsync(Debt debt);
        Task UpdateAsync(Debt debt);
        Task DeleteAsync(Guid id);
    }
}
