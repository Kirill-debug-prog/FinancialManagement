using FInanceTracker.Data.DTOs;
using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using FInanceTracker.Services.Interfaces;

namespace FInanceTracker.Services
{
    public class CreditService : ICreditService
    {
        private readonly ICreditRepository _creditRepository;
        private readonly IProfileRepository _profileRepository;

        public CreditService(ICreditRepository creditRepository, IProfileRepository profileRepository)
        {
            _creditRepository = creditRepository;
            _profileRepository = profileRepository;
        }

        public async Task<List<CreditDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var credits = await _creditRepository.GetAllByProfileIdAsync(profileId);
            return credits.Select(MapToDto).ToList();
        }

        public async Task<CreditDto> GetByIdAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var credit = await _creditRepository.GetByIdAsync(id);
            if (credit == null || credit.ProfileId != profileId)
                throw new Exception("Кредит не найден");

            return MapToDto(credit);
        }

        public async Task<CreditDto> CreateAsync(Guid profileId, Guid userId, CreateCreditDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);

            var credit = new Credit
            {
                ProfileId = profileId,
                Name = dto.Name,
                Type = dto.Type,
                TotalAmount = dto.TotalAmount,
                RemainingAmount = dto.RemainingAmount,
                InterestRate = dto.InterestRate,
                MonthlyPayment = dto.MonthlyPayment,
                NextPaymentDate = dto.NextPaymentDate,
                EndDate = dto.EndDate,
                Status = dto.Status
            };

            var created = await _creditRepository.CreateAsync(credit);
            return MapToDto(created);
        }

        public async Task<CreditDto> UpdateAsync(Guid id, Guid profileId, Guid userId, UpdateCreditDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);
            var credit = await _creditRepository.GetByIdAsync(id);
            if (credit == null || credit.ProfileId != profileId)
                throw new Exception("Кредит не найден");

            credit.Name = dto.Name;
            credit.Type = dto.Type;
            credit.TotalAmount = dto.TotalAmount;
            credit.RemainingAmount = dto.RemainingAmount;
            credit.InterestRate = dto.InterestRate;
            credit.MonthlyPayment = dto.MonthlyPayment;
            credit.NextPaymentDate = dto.NextPaymentDate;
            credit.EndDate = dto.EndDate;
            credit.Status = dto.Status;

            await _creditRepository.UpdateAsync(credit);
            return MapToDto(credit);
        }

        public async Task DeleteAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var credit = await _creditRepository.GetByIdAsync(id);
            if (credit == null || credit.ProfileId != profileId)
                throw new Exception("Кредит не найден");

            await _creditRepository.DeleteAsync(id);
        }

        private async Task ValidateProfileOwnership(Guid profileId, Guid userId)
        {
            var profile = await _profileRepository.GetByIdAsync(profileId);
            if (profile == null || profile.UserId != userId)
                throw new Exception("Профиль не найден");
        }

        private static CreditDto MapToDto(Credit credit) => new()
        {
            Id = credit.Id,
            Name = credit.Name,
            Type = credit.Type,
            TotalAmount = credit.TotalAmount,
            RemainingAmount = credit.RemainingAmount,
            InterestRate = credit.InterestRate,
            MonthlyPayment = credit.MonthlyPayment,
            NextPaymentDate = credit.NextPaymentDate,
            EndDate = credit.EndDate,
            Status = credit.Status,
            CreatedAt = credit.CreatedAt
        };
    }
}
