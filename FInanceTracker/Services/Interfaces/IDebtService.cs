using FInanceTracker.Data.DTOs;

namespace FInanceTracker.Services.Interfaces
{
    public interface IDebtService
    {
        Task<List<DebtDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId);
        Task<DebtDto> GetByIdAsync(Guid id, Guid profileId, Guid userId);
        Task<DebtDto> CreateAsync(Guid profileId, Guid userId, CreateDebtDto dto);
        Task<DebtDto> UpdateAsync(Guid id, Guid profileId, Guid userId, UpdateDebtDto dto);
        Task DeleteAsync(Guid id, Guid profileId, Guid userId);
    }
}
