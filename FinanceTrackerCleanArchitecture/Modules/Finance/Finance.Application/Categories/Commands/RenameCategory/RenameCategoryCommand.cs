using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Categories.Commands.RenameCategory;

public record RenameCategoryCommand(Guid Id, string NewName) : IRequest<Result<bool>>;
