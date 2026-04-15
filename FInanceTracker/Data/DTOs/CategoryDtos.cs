using System.ComponentModel.DataAnnotations;
using FInanceTracker.Data.Models;

namespace FInanceTracker.Data.DTOs
{
    public class CreateCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [Required]
        public CategoryType Type { get; set; }

        public Guid? ParentId { get; set; }
    }

    public class UpdateCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }
    }

    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public CategoryType Type { get; set; }
        public Guid? ParentId { get; set; }
        public List<CategoryDto> Subcategories { get; set; } = new();
    }
}
