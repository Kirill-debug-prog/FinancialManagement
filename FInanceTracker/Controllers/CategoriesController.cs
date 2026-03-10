using System.Security.Claims;
using FInanceTracker.Data.DTOs;
using FInanceTracker.Data.Models;
using FInanceTracker.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FInanceTracker.Controllers
{
    [ApiController]
    [Route("api/profiles/{profileId}/categories")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<ActionResult<List<CategoryDto>>> GetAll(Guid profileId, [FromQuery] CategoryType? type = null)
        {
            try
            {
                var categories = await _categoryService.GetAllByProfileIdAsync(profileId, GetUserId(), type);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetById(Guid profileId, Guid id)
        {
            try
            {
                var category = await _categoryService.GetByIdAsync(id, profileId, GetUserId());
                return Ok(category);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<CategoryDto>> Create(Guid profileId, CreateCategoryDto dto)
        {
            try
            {
                var category = await _categoryService.CreateAsync(profileId, GetUserId(), dto);
                return CreatedAtAction(nameof(GetById), new { profileId, id = category.Id }, category);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDto>> Update(Guid profileId, Guid id, UpdateCategoryDto dto)
        {
            try
            {
                var category = await _categoryService.UpdateAsync(id, profileId, GetUserId(), dto);
                return Ok(category);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid profileId, Guid id)
        {
            try
            {
                await _categoryService.DeleteAsync(id, profileId, GetUserId());
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
