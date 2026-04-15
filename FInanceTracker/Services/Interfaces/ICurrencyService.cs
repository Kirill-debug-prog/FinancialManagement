using FInanceTracker.Data.DTOs;

namespace FInanceTracker.Services.Interfaces
{
    public interface ICurrencyService
    {
        Task<List<CurrencyDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId);
        Task<CurrencyDto> GetByIdAsync(Guid id, Guid profileId, Guid userId);
        Task<CurrencyDto> CreateAsync(Guid profileId, Guid userId, CreateCurrencyDto dto);
        Task<CurrencyDto> UpdateAsync(Guid id, Guid profileId, Guid userId, UpdateCurrencyDto dto);
        Task DeleteAsync(Guid id, Guid profileId, Guid userId);
    }
}
