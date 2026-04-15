using System.ComponentModel.DataAnnotations;
using FInanceTracker.Data.Models;

namespace FInanceTracker.Data.DTOs
{
    public class CreateTransactionDto
    {
        [Required]
        public Guid AccountId { get; set; }

        public Guid? CategoryId { get; set; }

        [Required]
        public TransactionType Type { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public Guid CurrencyId { get; set; }

        public decimal Quantity { get; set; } = 1;
        public Guid? UnitOfMeasureId { get; set; }

        [Range(0, 100)]
        public decimal? DiscountPercent { get; set; }

        public string? Note { get; set; }

        [Required]
        public DateTime Date { get; set; }
    }

    public class UpdateTransactionDto
    {
        [Required]
        public Guid AccountId { get; set; }

        public Guid? CategoryId { get; set; }

        [Required]
        public TransactionType Type { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public Guid CurrencyId { get; set; }

        public decimal Quantity { get; set; } = 1;
        public Guid? UnitOfMeasureId { get; set; }

        [Range(0, 100)]
        public decimal? DiscountPercent { get; set; }

        public string? Note { get; set; }

        [Required]
        public DateTime Date { get; set; }
    }

    public class TransactionDto
    {
        public Guid Id { get; set; }
        public Guid AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public Guid? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public TransactionType Type { get; set; }
        public decimal Amount { get; set; }
        public Guid CurrencyId { get; set; }
        public string CurrencyCode { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public Guid? UnitOfMeasureId { get; set; }
        public string? UnitOfMeasureName { get; set; }
        public decimal? DiscountPercent { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Note { get; set; }
        public DateTime Date { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
