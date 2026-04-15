namespace FInanceTracker.Data.Models
{
    public class Account
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProfileId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public Guid CurrencyId { get; set; }
        public decimal InitialBalance { get; set; }
        public DateTime InitialBalanceDate { get; set; } = DateTime.UtcNow;
        public string? Note { get; set; }
        public bool IsArchived { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Profile Profile { get; set; } = null!;
        public Currency Currency { get; set; } = null!;
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
