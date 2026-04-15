using System.ComponentModel.DataAnnotations;

namespace FInanceTracker.Data.DTOs
{
    public class UserDto
    {
        public required Guid Id { get; set; }
        public required string Email { get; set; }
    }
}
