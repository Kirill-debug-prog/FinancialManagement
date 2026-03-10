namespace FInanceTracker.Data.Models
{
    public class Debt
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProfileId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Person { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string Status { get; set; } = "pending"; // pending, overdue, returned
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Profile Profile { get; set; } = null!;
    }
}
