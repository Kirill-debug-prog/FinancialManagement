using System.ComponentModel.DataAnnotations;

namespace FInanceTracker.Data.DTOs
{
    public class CreateUserDto
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        [Required]
        [MaxLength(50)]
        [MinLength(6)]
        public required string Password { get; set; }
        [Required]
        [Compare("Password")]
        public required string ConfirmPassword { get; set; }
    }
}
