using System.ComponentModel.DataAnnotations;

namespace FInanceTracker.Data.DTOs
{
    public class CreateDebtDto
    {
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Person { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public DateTime? ReturnDate { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "pending";
    }

    public class UpdateDebtDto
    {
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Person { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public DateTime? ReturnDate { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "pending";
    }

    public class DebtDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Person { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
