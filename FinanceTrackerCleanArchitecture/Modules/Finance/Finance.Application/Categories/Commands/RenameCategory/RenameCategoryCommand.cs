namespace Finance.Application.Categories.Commands.RenameCategory;

public record RenameCategoryCommand(Guid Id, string NewName);
