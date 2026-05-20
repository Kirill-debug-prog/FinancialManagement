using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Categories.Commands.DeleteCategory;

public record DeleteCategoryCommand(Guid Id) : IRequest<Result<bool>>;
