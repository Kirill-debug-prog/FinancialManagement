using Finance.Domain.Enums;

namespace Finance.Application.Categories.Queries.GetSystemCategories;

public record GetSystemCategoriesResponse(Guid Id, string Name, FinancialType Type, string? Icon);
