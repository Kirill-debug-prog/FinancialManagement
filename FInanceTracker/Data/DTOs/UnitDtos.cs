using System.ComponentModel.DataAnnotations;

namespace FInanceTracker.Data.DTOs
{
    public class CreateUnitDto
    {
        [Required]
        [MaxLength(50)]
        public required string Name { get; set; }
    }

    public class UnitDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
