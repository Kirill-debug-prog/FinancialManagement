using Finance.Domain.Enums;

namespace Finance.Application.Categories.Commands.CreateCategory;

public record CreateCategoryCommand(Guid ProfileId, string Name, FinancialType Type, string? Icon = null);
