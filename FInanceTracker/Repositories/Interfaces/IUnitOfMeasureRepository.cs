using FInanceTracker.Data.Models;

namespace FInanceTracker.Repositories.Interfaces
{
    public interface IUnitOfMeasureRepository
    {
        Task<UnitOfMeasure?> GetByIdAsync(Guid id);
        Task<List<UnitOfMeasure>> GetAllByProfileIdAsync(Guid profileId);
        Task<bool> HasTransactionsAsync(Guid unitId);
        Task<UnitOfMeasure> CreateAsync(UnitOfMeasure unit);
        Task UpdateAsync(UnitOfMeasure unit);
        Task DeleteAsync(Guid id);
    }
}
