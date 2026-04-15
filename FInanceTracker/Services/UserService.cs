using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FInanceTracker.Data.DTOs;
using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using FInanceTracker.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;

namespace FInanceTracker.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public UserService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<UserDto> CreateUser(CreateUserDto dto)
        {
            var existingUser = await _userRepository.GetByEmailAsync(dto.Email);

            if (existingUser != null)
            {
                throw new Exception("Пользователь с таким email уже существует");
            }

            if(dto.Password != dto.ConfirmPassword)
            {
                throw new Exception("Пароли не совпадают");
            }

            var user = new User
            {
                Email = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            var createdUser = await _userRepository.CreateAsync(user);

            return new UserDto { Email = createdUser.Email, Id = createdUser.Id };
        }

        public async Task<UserDto> GetUserByEmail(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user != null) 
            {
                return new UserDto { Id =  user.Id, Email = user.Email};
            }
            else
            {
                throw new Exception("Пользователя не существует");
            }
        }

        public Task<UserDto> GetUserById(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<string> Login(LoginDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            {
                throw new Exception("Неверный email или пароль");
            }

            return GenerateJwtToken(user);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpireMinutes"]!)),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
