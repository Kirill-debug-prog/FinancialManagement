using FInanceTracker.Data.DTOs;
using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using FInanceTracker.Services.Interfaces;

namespace FInanceTracker.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IProfileRepository _profileRepository;

        public TransactionService(ITransactionRepository transactionRepository, IProfileRepository profileRepository)
        {
            _transactionRepository = transactionRepository;
            _profileRepository = profileRepository;
        }

        public async Task<List<TransactionDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId, Guid? accountId = null, Guid? categoryId = null, DateTime? dateFrom = null, DateTime? dateTo = null)
        {
            await ValidateProfileOwnership(profileId, userId);
            var transactions = await _transactionRepository.GetAllByProfileIdAsync(profileId, accountId, categoryId, dateFrom, dateTo);
            return transactions.Select(MapToDto).ToList();
        }

        public async Task<TransactionDto> GetByIdAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var transaction = await _transactionRepository.GetByIdAsync(id);
            if (transaction == null || transaction.ProfileId != profileId)
                throw new Exception("Транзакция не найдена");

            return MapToDto(transaction);
        }

        public async Task<TransactionDto> CreateAsync(Guid profileId, Guid userId, CreateTransactionDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);

            var totalAmount = CalculateTotalAmount(dto.Amount, dto.Quantity, dto.DiscountPercent);

            var transaction = new Transaction
            {
                ProfileId = profileId,
                AccountId = dto.AccountId,
                CategoryId = dto.CategoryId,
                Type = dto.Type,
                Amount = dto.Amount,
                CurrencyId = dto.CurrencyId,
                Quantity = dto.Quantity,
                UnitOfMeasureId = dto.UnitOfMeasureId,
                DiscountPercent = dto.DiscountPercent,
                TotalAmount = totalAmount,
                Note = dto.Note,
                Date = dto.Date
            };

            var created = await _transactionRepository.CreateAsync(transaction);
            // Reload with includes
            created = await _transactionRepository.GetByIdAsync(created.Id);
            return MapToDto(created!);
        }

        public async Task<TransactionDto> UpdateAsync(Guid id, Guid profileId, Guid userId, UpdateTransactionDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);
            var transaction = await _transactionRepository.GetByIdAsync(id);
            if (transaction == null || transaction.ProfileId != profileId)
                throw new Exception("Транзакция не найдена");

            var totalAmount = CalculateTotalAmount(dto.Amount, dto.Quantity, dto.DiscountPercent);

            transaction.AccountId = dto.AccountId;
            transaction.CategoryId = dto.CategoryId;
            transaction.Type = dto.Type;
            transaction.Amount = dto.Amount;
            transaction.CurrencyId = dto.CurrencyId;
            transaction.Quantity = dto.Quantity;
            transaction.UnitOfMeasureId = dto.UnitOfMeasureId;
            transaction.DiscountPercent = dto.DiscountPercent;
            transaction.TotalAmount = totalAmount;
            transaction.Note = dto.Note;
            transaction.Date = dto.Date;

            await _transactionRepository.UpdateAsync(transaction);

            // Reload with includes
            transaction = await _transactionRepository.GetByIdAsync(id);
            return MapToDto(transaction!);
        }

        public async Task DeleteAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var transaction = await _transactionRepository.GetByIdAsync(id);
            if (transaction == null || transaction.ProfileId != profileId)
                throw new Exception("Транзакция не найдена");

            await _transactionRepository.DeleteAsync(id);
        }

        private async Task ValidateProfileOwnership(Guid profileId, Guid userId)
        {
            var profile = await _profileRepository.GetByIdAsync(profileId);
            if (profile == null || profile.UserId != userId)
                throw new Exception("Профиль не найден");
        }

        private static decimal CalculateTotalAmount(decimal amount, decimal quantity, decimal? discountPercent)
        {
            var total = amount * quantity;
            if (discountPercent.HasValue && discountPercent.Value > 0)
                total *= (1 - discountPercent.Value / 100);
            return Math.Round(total, 2);
        }

        private static TransactionDto MapToDto(Transaction transaction) => new()
        {
            Id = transaction.Id,
            AccountId = transaction.AccountId,
            AccountName = transaction.Account?.Name ?? string.Empty,
            CategoryId = transaction.CategoryId,
            CategoryName = transaction.Category?.Name,
            Type = transaction.Type,
            Amount = transaction.Amount,
            CurrencyId = transaction.CurrencyId,
            CurrencyCode = transaction.Currency?.Code ?? string.Empty,
            Quantity = transaction.Quantity,
            UnitOfMeasureId = transaction.UnitOfMeasureId,
            UnitOfMeasureName = transaction.UnitOfMeasure?.Name,
            DiscountPercent = transaction.DiscountPercent,
            TotalAmount = transaction.TotalAmount,
            Note = transaction.Note,
            Date = transaction.Date,
            CreatedAt = transaction.CreatedAt
        };
    }
}
