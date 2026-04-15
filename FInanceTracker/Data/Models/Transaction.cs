namespace FInanceTracker.Data.Models
{
    public class Transaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProfileId { get; set; }
        public Guid AccountId { get; set; }
        public Guid? CategoryId { get; set; }
        public TransactionType Type { get; set; }
        public decimal Amount { get; set; }
        public Guid CurrencyId { get; set; }
        public decimal Quantity { get; set; } = 1;
        public Guid? UnitOfMeasureId { get; set; }
        public decimal? DiscountPercent { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Note { get; set; }
        public DateTime Date { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Profile Profile { get; set; } = null!;
        public Account Account { get; set; } = null!;
        public Category? Category { get; set; }
        public Currency Currency { get; set; } = null!;
        public UnitOfMeasure? UnitOfMeasure { get; set; }
    }
}
