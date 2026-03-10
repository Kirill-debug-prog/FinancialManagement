using FInanceTracker.Data.Models;

namespace FInanceTracker.Repositories.Interfaces
{
    public interface IProfileRepository
    {
        Task<Profile?> GetByIdAsync(Guid id);
        Task<List<Profile>> GetAllByUserIdAsync(Guid userId);
        Task<int> CountByUserIdAsync(Guid userId);
        Task<Profile> CreateAsync(Profile profile);
        Task UpdateAsync(Profile profile);
        Task DeleteAsync(Guid id);
    }
}
