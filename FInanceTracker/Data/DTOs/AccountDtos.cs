using System.ComponentModel.DataAnnotations;

namespace FInanceTracker.Data.DTOs
{
    public class CreateAccountDto
    {
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [MaxLength(50)]
        public string Icon { get; set; } = string.Empty;

        public int SortOrder { get; set; }

        [Required]
        public Guid CurrencyId { get; set; }

        public decimal InitialBalance { get; set; }
        public DateTime InitialBalanceDate { get; set; } = DateTime.UtcNow;
        public string? Note { get; set; }
    }

    public class UpdateAccountDto
    {
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [MaxLength(50)]
        public string Icon { get; set; } = string.Empty;

        public int SortOrder { get; set; }
        public string? Note { get; set; }
    }

    public class AccountDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public string CurrencyCode { get; set; } = string.Empty;
        public string CurrencyShortName { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public bool IsArchived { get; set; }
    }
}
