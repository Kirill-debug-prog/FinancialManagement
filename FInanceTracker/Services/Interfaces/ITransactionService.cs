using FInanceTracker.Data.DTOs;

namespace FInanceTracker.Services.Interfaces
{
    public interface ITransactionService
    {
        Task<List<TransactionDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId, Guid? accountId = null, Guid? categoryId = null, DateTime? dateFrom = null, DateTime? dateTo = null);
        Task<TransactionDto> GetByIdAsync(Guid id, Guid profileId, Guid userId);
        Task<TransactionDto> CreateAsync(Guid profileId, Guid userId, CreateTransactionDto dto);
        Task<TransactionDto> UpdateAsync(Guid id, Guid profileId, Guid userId, UpdateTransactionDto dto);
        Task DeleteAsync(Guid id, Guid profileId, Guid userId);
    }
}
