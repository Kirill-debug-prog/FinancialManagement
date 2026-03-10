using System.ComponentModel.DataAnnotations;

namespace FInanceTracker.Data.DTOs
{
    public class CreateCurrencyDto
    {
        [Required]
        [MaxLength(10)]
        public required string Code { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [Required]
        [MaxLength(10)]
        public required string ShortName { get; set; }

        public int DecimalPlaces { get; set; } = 2;
        public int RateDecimalPlaces { get; set; } = 4;
        public int SortOrder { get; set; }
    }

    public class UpdateCurrencyDto
    {
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [Required]
        [MaxLength(10)]
        public required string ShortName { get; set; }

        public int DecimalPlaces { get; set; } = 2;
        public int RateDecimalPlaces { get; set; } = 4;
        public int SortOrder { get; set; }
    }

    public class CurrencyDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string ShortName { get; set; } = string.Empty;
        public int DecimalPlaces { get; set; }
        public int RateDecimalPlaces { get; set; }
        public int SortOrder { get; set; }
    }
}
