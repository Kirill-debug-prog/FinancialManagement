using FInanceTracker.Data.Models;

namespace FInanceTracker.Repositories.Interfaces
{
    public interface IDepositRepository
    {
        Task<Deposit?> GetByIdAsync(Guid id);
        Task<List<Deposit>> GetAllByProfileIdAsync(Guid profileId);
        Task<Deposit> CreateAsync(Deposit deposit);
        Task UpdateAsync(Deposit deposit);
        Task DeleteAsync(Guid id);
    }
}
