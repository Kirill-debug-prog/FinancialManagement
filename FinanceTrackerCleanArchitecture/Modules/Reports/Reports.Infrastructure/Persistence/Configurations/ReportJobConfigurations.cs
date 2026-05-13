using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Reports.Domain.Entities;

namespace Reports.Infrastructure.Persistence.Configurations;

public class ReportJobConfiguration : IEntityTypeConfiguration<ReportJob>
{
  public void Configure(EntityTypeBuilder<ReportJob> builder)
  {
    builder.ToTable("report_jobs");

    builder.HasKey(j => j.Id);

    builder.Property(j => j.Type)
      .IsRequired()
      .HasConversion<int>();

    builder.Property(j => j.Status)
      .IsRequired()
      .HasConversion<int>();

    builder.Property(j => j.CreatedAt)
      .IsRequired();

    builder.Property(j => j.CompletedAt)
      .IsRequired(false);

    builder.Property(j => j.FileKey)
      .IsRequired(false)
      .HasMaxLength(512);

    builder.Property(j => j.Error)
      .IsRequired(false)
      .HasMaxLength(2000);

    builder.Property(j => j.RequestedBy)
      .IsRequired();

    builder.Property(j => j.ParametersJson)
      .IsRequired()
      .HasColumnType("jsonb");

    builder.HasIndex(j => j.RequestedBy);
    builder.HasIndex(j => j.Status);
    builder.HasIndex(j => j.CreatedAt);
  }
}