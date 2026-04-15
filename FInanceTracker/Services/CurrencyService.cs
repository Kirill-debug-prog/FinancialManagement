using FInanceTracker.Data.DTOs;
using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using FInanceTracker.Services.Interfaces;

namespace FInanceTracker.Services
{
    public class CurrencyService : ICurrencyService
    {
        private readonly ICurrencyRepository _currencyRepository;
        private readonly IProfileRepository _profileRepository;

        public CurrencyService(ICurrencyRepository currencyRepository, IProfileRepository profileRepository)
        {
            _currencyRepository = currencyRepository;
            _profileRepository = profileRepository;
        }

        public async Task<List<CurrencyDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var currencies = await _currencyRepository.GetAllByProfileIdAsync(profileId);
            return currencies.Select(MapToDto).ToList();
        }

        public async Task<CurrencyDto> GetByIdAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var currency = await _currencyRepository.GetByIdAsync(id);
            if (currency == null || currency.ProfileId != profileId)
                throw new Exception("Валюта не найдена");

            return MapToDto(currency);
        }

        public async Task<CurrencyDto> CreateAsync(Guid profileId, Guid userId, CreateCurrencyDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);

            var currency = new Currency
            {
                ProfileId = profileId,
                Code = dto.Code,
                Name = dto.Name,
                ShortName = dto.ShortName,
                DecimalPlaces = dto.DecimalPlaces,
                RateDecimalPlaces = dto.RateDecimalPlaces,
                SortOrder = dto.SortOrder
            };

            var created = await _currencyRepository.CreateAsync(currency);
            return MapToDto(created);
        }

        public async Task<CurrencyDto> UpdateAsync(Guid id, Guid profileId, Guid userId, UpdateCurrencyDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);
            var currency = await _currencyRepository.GetByIdAsync(id);
            if (currency == null || currency.ProfileId != profileId)
                throw new Exception("Валюта не найдена");

            currency.Name = dto.Name;
            currency.ShortName = dto.ShortName;
            currency.DecimalPlaces = dto.DecimalPlaces;
            currency.RateDecimalPlaces = dto.RateDecimalPlaces;
            currency.SortOrder = dto.SortOrder;

            await _currencyRepository.UpdateAsync(currency);
            return MapToDto(currency);
        }

        public async Task DeleteAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var currency = await _currencyRepository.GetByIdAsync(id);
            if (currency == null || currency.ProfileId != profileId)
                throw new Exception("Валюта не найдена");

            await _currencyRepository.DeleteAsync(id);
        }

        private async Task ValidateProfileOwnership(Guid profileId, Guid userId)
        {
            var profile = await _profileRepository.GetByIdAsync(profileId);
            if (profile == null || profile.UserId != userId)
                throw new Exception("Профиль не найден");
        }

        private static CurrencyDto MapToDto(Currency currency) => new()
        {
            Id = currency.Id,
            Code = currency.Code,
            Name = currency.Name,
            ShortName = currency.ShortName,
            DecimalPlaces = currency.DecimalPlaces,
            RateDecimalPlaces = currency.RateDecimalPlaces,
            SortOrder = currency.SortOrder
        };
    }
}
