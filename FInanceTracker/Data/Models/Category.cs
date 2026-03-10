namespace FInanceTracker.Data.Models
{
    public class Category
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProfileId { get; set; }
        public Guid? ParentId { get; set; }
        public string Name { get; set; } = string.Empty;
        public CategoryType Type { get; set; }
        public int SortOrder { get; set; }

        public Profile Profile { get; set; } = null!;
        public Category? Parent { get; set; }
        public ICollection<Category> Subcategories { get; set; } = new List<Category>();
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
