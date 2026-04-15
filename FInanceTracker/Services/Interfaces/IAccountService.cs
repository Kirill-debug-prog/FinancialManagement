using FInanceTracker.Data.DTOs;

namespace FInanceTracker.Services.Interfaces
{
    public interface IAccountService
    {
        Task<List<AccountDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId);
        Task<AccountDto> GetByIdAsync(Guid id, Guid profileId, Guid userId);
        Task<AccountDto> CreateAsync(Guid profileId, Guid userId, CreateAccountDto dto);
        Task<AccountDto> UpdateAsync(Guid id, Guid profileId, Guid userId, UpdateAccountDto dto);
        Task DeleteAsync(Guid id, Guid profileId, Guid userId);
        Task ArchiveAsync(Guid id, Guid profileId, Guid userId);
    }
}
