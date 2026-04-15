using FInanceTracker.Data.DTOs;
using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using FInanceTracker.Services.Interfaces;

namespace FInanceTracker.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IProfileRepository _profileRepository;

        public CategoryService(ICategoryRepository categoryRepository, IProfileRepository profileRepository)
        {
            _categoryRepository = categoryRepository;
            _profileRepository = profileRepository;
        }

        public async Task<List<CategoryDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId, CategoryType? type = null)
        {
            await ValidateProfileOwnership(profileId, userId);
            var categories = await _categoryRepository.GetAllByProfileIdAsync(profileId, type);
            return categories.Select(MapToDto).ToList();
        }

        public async Task<CategoryDto> GetByIdAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null || category.ProfileId != profileId)
                throw new Exception("Категория не найдена");

            return MapToDto(category);
        }

        public async Task<CategoryDto> CreateAsync(Guid profileId, Guid userId, CreateCategoryDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);

            var category = new Category
            {
                ProfileId = profileId,
                Name = dto.Name,
                Type = dto.Type,
                ParentId = dto.ParentId
            };

            var created = await _categoryRepository.CreateAsync(category);
            return MapToDto(created);
        }

        public async Task<CategoryDto> UpdateAsync(Guid id, Guid profileId, Guid userId, UpdateCategoryDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null || category.ProfileId != profileId)
                throw new Exception("Категория не найдена");

            category.Name = dto.Name;
            await _categoryRepository.UpdateAsync(category);
            return MapToDto(category);
        }

        public async Task DeleteAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null || category.ProfileId != profileId)
                throw new Exception("Категория не найдена");

            if (await _categoryRepository.HasTransactionsAsync(id))
                throw new Exception("Нельзя удалить категорию, которая используется в транзакциях");

            await _categoryRepository.DeleteAsync(id);
        }

        private async Task ValidateProfileOwnership(Guid profileId, Guid userId)
        {
            var profile = await _profileRepository.GetByIdAsync(profileId);
            if (profile == null || profile.UserId != userId)
                throw new Exception("Профиль не найден");
        }

        private static CategoryDto MapToDto(Category category) => new()
        {
            Id = category.Id,
            Name = category.Name,
            Type = category.Type,
            ParentId = category.ParentId,
            Subcategories = category.Subcategories?.Select(MapToDto).ToList() ?? new()
        };
    }
}
