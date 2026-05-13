using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Reports.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "reports");

            migrationBuilder.CreateTable(
                name: "report_jobs",
                schema: "reports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FileKey = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    Error = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    RequestedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    ParametersJson = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_report_jobs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_report_jobs_CreatedAt",
                schema: "reports",
                table: "report_jobs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_report_jobs_RequestedBy",
                schema: "reports",
                table: "report_jobs",
                column: "RequestedBy");

            migrationBuilder.CreateIndex(
                name: "IX_report_jobs_Status",
                schema: "reports",
                table: "report_jobs",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "report_jobs",
                schema: "reports");
        }
    }
}
