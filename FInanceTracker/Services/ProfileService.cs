using FInanceTracker.Data.DTOs;
using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using FInanceTracker.Services.Interfaces;

namespace FInanceTracker.Services
{
    public class ProfileService : IProfileService
    {
        private readonly IProfileRepository _profileRepository;

        public ProfileService(IProfileRepository profileRepository)
        {
            _profileRepository = profileRepository;
        }

        public async Task<List<ProfileDto>> GetAllByUserIdAsync(Guid userId)
        {
            var profiles = await _profileRepository.GetAllByUserIdAsync(userId);
            return profiles.Select(MapToDto).ToList();
        }

        public async Task<ProfileDto> GetByIdAsync(Guid id, Guid userId)
        {
            var profile = await _profileRepository.GetByIdAsync(id);
            if (profile == null || profile.UserId != userId)
                throw new Exception("Профиль не найден");

            return MapToDto(profile);
        }

        public async Task<ProfileDto> CreateAsync(Guid userId, CreateProfileDto dto)
        {
            var profile = new Profile
            {
                UserId = userId,
                Name = dto.Name,
                MainCurrency = dto.MainCurrency
            };

            var created = await _profileRepository.CreateAsync(profile);
            return MapToDto(created);
        }

        public async Task<ProfileDto> UpdateAsync(Guid id, Guid userId, UpdateProfileDto dto)
        {
            var profile = await _profileRepository.GetByIdAsync(id);
            if (profile == null || profile.UserId != userId)
                throw new Exception("Профиль не найден");

            profile.Name = dto.Name;
            await _profileRepository.UpdateAsync(profile);
            return MapToDto(profile);
        }

        public async Task DeleteAsync(Guid id, Guid userId)
        {
            var profile = await _profileRepository.GetByIdAsync(id);
            if (profile == null || profile.UserId != userId)
                throw new Exception("Профиль не найден");

            var count = await _profileRepository.CountByUserIdAsync(userId);
            if (count <= 1)
                throw new Exception("Нельзя удалить последний профиль");

            await _profileRepository.DeleteAsync(id);
        }

        private static ProfileDto MapToDto(Profile profile) => new()
        {
            Id = profile.Id,
            Name = profile.Name,
            MainCurrency = profile.MainCurrency,
            CreatedAt = profile.CreatedAt
        };
    }
}
