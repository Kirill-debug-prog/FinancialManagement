using Finance.Domain.Enums;

namespace Finance.Application.Categories.Queries.GetCategoriesByProfileId;

public record GetCategoriesByProfileIdResponse(
  Guid Id,
  string Name,
  FinancialType Type,
  string? Icon,
  bool IsSystem,
  Guid? ProfileId);
