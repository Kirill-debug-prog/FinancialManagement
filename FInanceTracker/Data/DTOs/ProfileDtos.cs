using System.ComponentModel.DataAnnotations;

namespace FInanceTracker.Data.DTOs
{
    public class CreateProfileDto
    {
        [Required]
        [MaxLength(50)]
        public required string Name { get; set; }

        [Required]
        [MaxLength(10)]
        public required string MainCurrency { get; set; }
    }

    public class UpdateProfileDto
    {
        [Required]
        [MaxLength(50)]
        public required string Name { get; set; }
    }

    public class ProfileDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MainCurrency { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
