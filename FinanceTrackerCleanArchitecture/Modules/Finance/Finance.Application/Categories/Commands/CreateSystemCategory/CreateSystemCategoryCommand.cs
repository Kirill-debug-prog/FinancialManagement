using MediatR;
using Core.Domain.Common;
using Finance.Domain.Enums;

namespace Finance.Application.Categories.Commands.CreateSystemCategory;

public record CreateSystemCategoryCommand(string Name, FinancialType Type, string? Icon = null) : IRequest<Result<Guid>>;
