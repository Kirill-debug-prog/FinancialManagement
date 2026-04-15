using System.ComponentModel.DataAnnotations;

namespace FInanceTracker.Data.DTOs
{
    public class CreateCreditDto
    {
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Type { get; set; }

        [Required]
        public decimal TotalAmount { get; set; }

        [Required]
        public decimal RemainingAmount { get; set; }

        public decimal InterestRate { get; set; }
        public decimal MonthlyPayment { get; set; }
        public DateTime? NextPaymentDate { get; set; }
        public DateTime? EndDate { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "active";
    }

    public class UpdateCreditDto
    {
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Type { get; set; }

        [Required]
        public decimal TotalAmount { get; set; }

        [Required]
        public decimal RemainingAmount { get; set; }

        public decimal InterestRate { get; set; }
        public decimal MonthlyPayment { get; set; }
        public DateTime? NextPaymentDate { get; set; }
        public DateTime? EndDate { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "active";
    }

    public class CreditDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public decimal InterestRate { get; set; }
        public decimal MonthlyPayment { get; set; }
        public DateTime? NextPaymentDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
