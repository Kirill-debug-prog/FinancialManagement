using Finance.Application.Categories.Commands.ChangeIcon;
using Finance.Application.Categories.Commands.CreateCategory;
using Finance.Application.Categories.Commands.CreateSystemCategory;
using Finance.Application.Categories.Commands.DeleteCategory;
using Finance.Application.Categories.Commands.RenameCategory;
using Finance.Application.Categories.Queries.GetCategoriesByProfileId;
using Finance.Application.Categories.Queries.GetCategoryById;
using Finance.Application.Categories.Queries.GetSystemCategories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
  private readonly CreateCategoryCommandHandler _createCategoryHandler;
  private readonly CreateSystemCategoryCommandHandler _createSystemCategoryHandler;
  private readonly DeleteCategoryCommandHandler _deleteCategoryHandler;
  private readonly RenameCategoryCommandHandler _renameCategoryHandler;
  private readonly ChangeIconCategoryCommandHandler _changeIconHandler;
  private readonly GetCategoryByIdQueryHandler _getCategoryByIdHandler;
  private readonly GetCategoriesByProfileIdQueryHandler _getCategoriesByProfileIdHandler;
  private readonly GetSystemCategoriesQueryHandler _getSystemCategoriesHandler;

  public CategoryController(
    CreateCategoryCommandHandler createCategoryHandler,
    CreateSystemCategoryCommandHandler createSystemCategoryHandler,
    DeleteCategoryCommandHandler deleteCategoryHandler,
    RenameCategoryCommandHandler renameCategoryHandler,
    ChangeIconCategoryCommandHandler changeIconHandler,
    GetCategoryByIdQueryHandler getCategoryByIdHandler,
    GetCategoriesByProfileIdQueryHandler getCategoriesByProfileIdHandler,
    GetSystemCategoriesQueryHandler getSystemCategoriesHandler)
  {
    _createCategoryHandler = createCategoryHandler;
    _createSystemCategoryHandler = createSystemCategoryHandler;
    _deleteCategoryHandler = deleteCategoryHandler;
    _renameCategoryHandler = renameCategoryHandler;
    _changeIconHandler = changeIconHandler;
    _getCategoryByIdHandler = getCategoryByIdHandler;
    _getCategoriesByProfileIdHandler = getCategoriesByProfileIdHandler;
    _getSystemCategoriesHandler = getSystemCategoriesHandler;
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateCategoryCommand command)
  {
    var result = await _createCategoryHandler.Handle(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPost("system")]
  public async Task<IActionResult> CreateSystem([FromBody] CreateSystemCategoryCommand command)
  {
    var result = await _createSystemCategoryHandler.Handle(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var result = await _getCategoryByIdHandler.Handle(new GetCategoryByIdQuery(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet]
  public async Task<IActionResult> GetByProfileId([FromQuery] Guid profileId)
  {
    var result = await _getCategoriesByProfileIdHandler.Handle(new GetCategoriesByProfileIdQuery(profileId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("system")]
  public async Task<IActionResult> GetSystem()
  {
    var result = await _getSystemCategoriesHandler.Handle(new GetSystemCategoriesQuery());
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPut("{id}/rename")]
  public async Task<IActionResult> Rename(Guid id, [FromBody] string newName)
  {
    var result = await _renameCategoryHandler.Handle(new RenameCategoryCommand(id, newName));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPatch("{id}/icon")]
  public async Task<IActionResult> ChangeIcon(Guid id, [FromBody] string? newIcon)
  {
    var result = await _changeIconHandler.Handle(new ChangeIconCategoryCommand(id, newIcon));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var result = await _deleteCategoryHandler.Handle(new DeleteCategoryCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}
