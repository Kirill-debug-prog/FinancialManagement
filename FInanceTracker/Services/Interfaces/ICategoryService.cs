using FInanceTracker.Data.DTOs;
using FInanceTracker.Data.Models;

namespace FInanceTracker.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId, CategoryType? type = null);
        Task<CategoryDto> GetByIdAsync(Guid id, Guid profileId, Guid userId);
        Task<CategoryDto> CreateAsync(Guid profileId, Guid userId, CreateCategoryDto dto);
        Task<CategoryDto> UpdateAsync(Guid id, Guid profileId, Guid userId, UpdateCategoryDto dto);
        Task DeleteAsync(Guid id, Guid profileId, Guid userId);
    }
}
