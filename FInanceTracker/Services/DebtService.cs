using FInanceTracker.Data.DTOs;
using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using FInanceTracker.Services.Interfaces;

namespace FInanceTracker.Services
{
    public class DebtService : IDebtService
    {
        private readonly IDebtRepository _debtRepository;
        private readonly IProfileRepository _profileRepository;

        public DebtService(IDebtRepository debtRepository, IProfileRepository profileRepository)
        {
            _debtRepository = debtRepository;
            _profileRepository = profileRepository;
        }

        public async Task<List<DebtDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var debts = await _debtRepository.GetAllByProfileIdAsync(profileId);
            return debts.Select(MapToDto).ToList();
        }

        public async Task<DebtDto> GetByIdAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var debt = await _debtRepository.GetByIdAsync(id);
            if (debt == null || debt.ProfileId != profileId)
                throw new Exception("Долг не найден");

            return MapToDto(debt);
        }

        public async Task<DebtDto> CreateAsync(Guid profileId, Guid userId, CreateDebtDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);

            var debt = new Debt
            {
                ProfileId = profileId,
                Name = dto.Name,
                Amount = dto.Amount,
                Person = dto.Person,
                Date = dto.Date,
                ReturnDate = dto.ReturnDate,
                Status = dto.Status
            };

            var created = await _debtRepository.CreateAsync(debt);
            return MapToDto(created);
        }

        public async Task<DebtDto> UpdateAsync(Guid id, Guid profileId, Guid userId, UpdateDebtDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);
            var debt = await _debtRepository.GetByIdAsync(id);
            if (debt == null || debt.ProfileId != profileId)
                throw new Exception("Долг не найден");

            debt.Name = dto.Name;
            debt.Amount = dto.Amount;
            debt.Person = dto.Person;
            debt.Date = dto.Date;
            debt.ReturnDate = dto.ReturnDate;
            debt.Status = dto.Status;

            await _debtRepository.UpdateAsync(debt);
            return MapToDto(debt);
        }

        public async Task DeleteAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var debt = await _debtRepository.GetByIdAsync(id);
            if (debt == null || debt.ProfileId != profileId)
                throw new Exception("Долг не найден");

            await _debtRepository.DeleteAsync(id);
        }

        private async Task ValidateProfileOwnership(Guid profileId, Guid userId)
        {
            var profile = await _profileRepository.GetByIdAsync(profileId);
            if (profile == null || profile.UserId != userId)
                throw new Exception("Профиль не найден");
        }

        private static DebtDto MapToDto(Debt debt) => new()
        {
            Id = debt.Id,
            Name = debt.Name,
            Amount = debt.Amount,
            Person = debt.Person,
            Date = debt.Date,
            ReturnDate = debt.ReturnDate,
            Status = debt.Status,
            CreatedAt = debt.CreatedAt
        };
    }
}
