using System.ComponentModel.DataAnnotations;

namespace FInanceTracker.Data.DTOs
{
    public class CreateDepositDto
    {
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Bank { get; set; }

        [Required]
        public decimal Amount { get; set; }

        public decimal InterestRate { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Type { get; set; }

        public bool Capitalization { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "active";
    }

    public class UpdateDepositDto
    {
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Bank { get; set; }

        [Required]
        public decimal Amount { get; set; }

        public decimal InterestRate { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Type { get; set; }

        public bool Capitalization { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "active";
    }

    public class DepositDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Bank { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal InterestRate { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Type { get; set; } = string.Empty;
        public bool Capitalization { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
