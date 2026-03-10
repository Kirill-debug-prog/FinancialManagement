using FInanceTracker.Data.DTOs;
using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using FInanceTracker.Services.Interfaces;

namespace FInanceTracker.Services
{
    public class UnitOfMeasureService : IUnitOfMeasureService
    {
        private readonly IUnitOfMeasureRepository _unitRepository;
        private readonly IProfileRepository _profileRepository;

        public UnitOfMeasureService(IUnitOfMeasureRepository unitRepository, IProfileRepository profileRepository)
        {
            _unitRepository = unitRepository;
            _profileRepository = profileRepository;
        }

        public async Task<List<UnitDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var units = await _unitRepository.GetAllByProfileIdAsync(profileId);
            return units.Select(MapToDto).ToList();
        }

        public async Task<UnitDto> GetByIdAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var unit = await _unitRepository.GetByIdAsync(id);
            if (unit == null || unit.ProfileId != profileId)
                throw new Exception("Единица измерения не найдена");

            return MapToDto(unit);
        }

        public async Task<UnitDto> CreateAsync(Guid profileId, Guid userId, CreateUnitDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);

            var unit = new UnitOfMeasure
            {
                ProfileId = profileId,
                Name = dto.Name
            };

            var created = await _unitRepository.CreateAsync(unit);
            return MapToDto(created);
        }

        public async Task<UnitDto> UpdateAsync(Guid id, Guid profileId, Guid userId, CreateUnitDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);
            var unit = await _unitRepository.GetByIdAsync(id);
            if (unit == null || unit.ProfileId != profileId)
                throw new Exception("Единица измерения не найдена");

            unit.Name = dto.Name;
            await _unitRepository.UpdateAsync(unit);
            return MapToDto(unit);
        }

        public async Task DeleteAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var unit = await _unitRepository.GetByIdAsync(id);
            if (unit == null || unit.ProfileId != profileId)
                throw new Exception("Единица измерения не найдена");

            if (await _unitRepository.HasTransactionsAsync(id))
                throw new Exception("Нельзя удалить единицу измерения, которая используется в транзакциях");

            await _unitRepository.DeleteAsync(id);
        }

        private async Task ValidateProfileOwnership(Guid profileId, Guid userId)
        {
            var profile = await _profileRepository.GetByIdAsync(profileId);
            if (profile == null || profile.UserId != userId)
                throw new Exception("Профиль не найден");
        }

        private static UnitDto MapToDto(UnitOfMeasure unit) => new()
        {
            Id = unit.Id,
            Name = unit.Name
        };
    }
}
