using FInanceTracker.Data.Models;

namespace FInanceTracker.Repositories.Interfaces
{
    public interface ICategoryRepository
    {
        Task<Category?> GetByIdAsync(Guid id);
        Task<List<Category>> GetAllByProfileIdAsync(Guid profileId, CategoryType? type = null);
        Task<bool> HasTransactionsAsync(Guid categoryId);
        Task<Category> CreateAsync(Category category);
        Task UpdateAsync(Category category);
        Task DeleteAsync(Guid id);
    }
}
