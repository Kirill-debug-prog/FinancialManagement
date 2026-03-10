using FInanceTracker.Data.DTOs;
using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using FInanceTracker.Services.Interfaces;

namespace FInanceTracker.Services
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IProfileRepository _profileRepository;
        private readonly ITransactionRepository _transactionRepository;

        public AccountService(IAccountRepository accountRepository, IProfileRepository profileRepository, ITransactionRepository transactionRepository)
        {
            _accountRepository = accountRepository;
            _profileRepository = profileRepository;
            _transactionRepository = transactionRepository;
        }

        public async Task<List<AccountDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var accounts = await _accountRepository.GetAllByProfileIdAsync(profileId);
            var result = new List<AccountDto>();

            foreach (var account in accounts)
            {
                var transactions = await _transactionRepository.GetByAccountIdAsync(account.Id);
                var balance = CalculateBalance(account, transactions);
                result.Add(MapToDto(account, balance));
            }

            return result;
        }

        public async Task<AccountDto> GetByIdAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var account = await _accountRepository.GetByIdAsync(id);
            if (account == null || account.ProfileId != profileId)
                throw new Exception("Счёт не найден");

            var transactions = await _transactionRepository.GetByAccountIdAsync(account.Id);
            var balance = CalculateBalance(account, transactions);
            return MapToDto(account, balance);
        }

        public async Task<AccountDto> CreateAsync(Guid profileId, Guid userId, CreateAccountDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);

            var account = new Account
            {
                ProfileId = profileId,
                Name = dto.Name,
                Icon = dto.Icon,
                SortOrder = dto.SortOrder,
                CurrencyId = dto.CurrencyId,
                InitialBalance = dto.InitialBalance,
                InitialBalanceDate = dto.InitialBalanceDate,
                Note = dto.Note
            };

            var created = await _accountRepository.CreateAsync(account);

            // Create initial balance transaction
            if (dto.InitialBalance != 0)
            {
                var transaction = new Transaction
                {
                    ProfileId = profileId,
                    AccountId = created.Id,
                    Type = TransactionType.InitialBalance,
                    Amount = dto.InitialBalance,
                    TotalAmount = dto.InitialBalance,
                    CurrencyId = dto.CurrencyId,
                    Date = dto.InitialBalanceDate,
                    Note = "Начальный баланс"
                };

                await _transactionRepository.CreateAsync(transaction);
            }

            // Reload with Currency included
            created = await _accountRepository.GetByIdAsync(created.Id);
            return MapToDto(created!, dto.InitialBalance);
        }

        public async Task<AccountDto> UpdateAsync(Guid id, Guid profileId, Guid userId, UpdateAccountDto dto)
        {
            await ValidateProfileOwnership(profileId, userId);
            var account = await _accountRepository.GetByIdAsync(id);
            if (account == null || account.ProfileId != profileId)
                throw new Exception("Счёт не найден");

            account.Name = dto.Name;
            account.Icon = dto.Icon;
            account.SortOrder = dto.SortOrder;
            account.Note = dto.Note;

            await _accountRepository.UpdateAsync(account);

            var transactions = await _transactionRepository.GetByAccountIdAsync(account.Id);
            var balance = CalculateBalance(account, transactions);
            return MapToDto(account, balance);
        }

        public async Task DeleteAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var account = await _accountRepository.GetByIdAsync(id);
            if (account == null || account.ProfileId != profileId)
                throw new Exception("Счёт не найден");

            await _accountRepository.DeleteAsync(id);
        }

        public async Task ArchiveAsync(Guid id, Guid profileId, Guid userId)
        {
            await ValidateProfileOwnership(profileId, userId);
            var account = await _accountRepository.GetByIdAsync(id);
            if (account == null || account.ProfileId != profileId)
                throw new Exception("Счёт не найден");

            account.IsArchived = !account.IsArchived;
            await _accountRepository.UpdateAsync(account);
        }

        private async Task ValidateProfileOwnership(Guid profileId, Guid userId)
        {
            var profile = await _profileRepository.GetByIdAsync(profileId);
            if (profile == null || profile.UserId != userId)
                throw new Exception("Профиль не найден");
        }

        private static decimal CalculateBalance(Account account, List<Transaction> transactions)
        {
            decimal balance = 0;
            foreach (var t in transactions)
            {
                balance += t.Type switch
                {
                    TransactionType.Income or TransactionType.InitialBalance => t.TotalAmount,
                    TransactionType.Expense => -t.TotalAmount,
                    _ => 0
                };
            }
            return balance;
        }

        private static AccountDto MapToDto(Account account, decimal balance) => new()
        {
            Id = account.Id,
            Name = account.Name,
            Icon = account.Icon,
            SortOrder = account.SortOrder,
            CurrencyCode = account.Currency?.Code ?? string.Empty,
            CurrencyShortName = account.Currency?.ShortName ?? string.Empty,
            Balance = balance,
            IsArchived = account.IsArchived
        };
    }
}
