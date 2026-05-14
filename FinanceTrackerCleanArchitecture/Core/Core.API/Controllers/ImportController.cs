using Finance.Application.Import.Commands.ImportBankStatement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ImportController : ControllerBase
{
  private readonly ImportBankStatementCommandHandler _importHandler;

  public ImportController(ImportBankStatementCommandHandler importHandler)
  {
    _importHandler = importHandler;
  }

  [HttpPost("bank-statement")]
  [RequestSizeLimit(10 * 1024 * 1024)]
  public async Task<IActionResult> ImportBankStatement(
    [FromQuery] Guid walletId,
    IFormFile file)
  {
    if (file is null || file.Length == 0)
      return BadRequest(new { error = "PDF file is required." });

    if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
      return BadRequest(new { error = "Only PDF files are supported." });

    byte[] bytes;
    using (var ms = new MemoryStream())
    {
      await file.CopyToAsync(ms);
      bytes = ms.ToArray();
    }

    var result = await _importHandler.Handle(new ImportBankStatementCommand(walletId, bytes));

    if (result.IsFailure)
      return BadRequest(result.Error);

    return Ok(result.Value);
  }
}
