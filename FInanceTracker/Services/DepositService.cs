using FInanceTracker.Data.DTOs;
using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using FInanceTracker.Services.Interfaces;

namespace FInanceTracker.Services
{
    public class DepositService : IDepositService
    {
        private readonly IDepositRepository _depositRepository;
        private readonly IProfileRepository _profileRepository;

        public DepositService(IDepositRepository depositRepository, IProfileRepository profileRepository)
        {
            _depositRepository = depositRepository;
            _profileRepository = profileRepository;
        }

        public async Task<List<DepositDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var deposits = await _depositRepository.GetAllByProfileIdAsync(profileId);
            return deposits.Select(MapToDto).ToList();
        }

        public async Task<DepositDto> GetByIdAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var deposit = await _depositRepository.GetByIdAsync(id);
            if (deposit == null || deposit.ProfileId != profileId)
                throw new Exception("Вклад не найден");

            return MapToDto(deposit);
        }

        public async Task<DepositDto> CreateAsync(Guid profileId, Guid userId, CreateDepositDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);

            var deposit = new Deposit
            {
                ProfileId = profileId,
                Name = dto.Name,
                Bank = dto.Bank,
                Amount = dto.Amount,
                InterestRate = dto.InterestRate,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Type = dto.Type,
                Capitalization = dto.Capitalization,
                Status = dto.Status
            };

            var created = await _depositRepository.CreateAsync(deposit);
            return MapToDto(created);
        }

        public async Task<DepositDto> UpdateAsync(Guid id, Guid profileId, Guid userId, UpdateDepositDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);
            var deposit = await _depositRepository.GetByIdAsync(id);
            if (deposit == null || deposit.ProfileId != profileId)
                throw new Exception("Вклад не найден");

            deposit.Name = dto.Name;
            deposit.Bank = dto.Bank;
            deposit.Amount = dto.Amount;
            deposit.InterestRate = dto.InterestRate;
            deposit.StartDate = dto.StartDate;
            deposit.EndDate = dto.EndDate;
            deposit.Type = dto.Type;
            deposit.Capitalization = dto.Capitalization;
            deposit.Status = dto.Status;

            await _depositRepository.UpdateAsync(deposit);
            return MapToDto(deposit);
        }

        public async Task DeleteAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var deposit = await _depositRepository.GetByIdAsync(id);
            if (deposit == null || deposit.ProfileId != profileId)
                throw new Exception("Вклад не найден");

            await _depositRepository.DeleteAsync(id);
        }

        private async Task ValidateProfileOwnership(Guid profileId, Guid userId)
        {
            var profile = await _profileRepository.GetByIdAsync(profileId);
            if (profile == null || profile.UserId != userId)
                throw new Exception("Профиль не найден");
        }

        private static DepositDto MapToDto(Deposit deposit) => new()
        {
            Id = deposit.Id,
            Name = deposit.Name,
            Bank = deposit.Bank,
            Amount = deposit.Amount,
            InterestRate = deposit.InterestRate,
            StartDate = deposit.StartDate,
            EndDate = deposit.EndDate,
            Type = deposit.Type,
            Capitalization = deposit.Capitalization,
            Status = deposit.Status,
            CreatedAt = deposit.CreatedAt
        };
    }
}
