using FInanceTracker.Data.DTOs;

namespace FInanceTracker.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserDto> CreateUser(CreateUserDto user);
        Task<UserDto> GetUserById(Guid id);
        Task<UserDto> GetUserByEmail(string email);
        Task<string> Login(LoginDto dto);
    }
}
