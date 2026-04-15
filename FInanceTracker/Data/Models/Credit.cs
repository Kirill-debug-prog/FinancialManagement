namespace FInanceTracker.Data.Models
{
    public class Credit
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProfileId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // mortgage, auto, consumer, personal
        public decimal TotalAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public decimal InterestRate { get; set; }
        public decimal MonthlyPayment { get; set; }
        public DateTime? NextPaymentDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; } = "active"; // active, closed, overdue
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Profile Profile { get; set; } = null!;
    }
}
