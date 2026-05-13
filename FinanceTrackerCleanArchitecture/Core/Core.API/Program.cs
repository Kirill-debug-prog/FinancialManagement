using Reports.Infrastructure;
using Reports.Infrastructure.Persistence;
using System.Text;
using Core.API.Extensions;
using Users.Infrastructure;
using Users.Infrastructure.Persistence;
using Finance.Infrastructure;
using Finance.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Hangfire;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddUsersModule(builder.Configuration);
builder.Services.AddFinanceModule(builder.Configuration);
builder.Services.AddReportsModule(builder.Configuration);
builder.Services.AddApplication();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(
    options => options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
    });

builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
  var userDb = scope.ServiceProvider.GetRequiredService<UserDbContext>();
  await userDb.Database.MigrateAsync();

  var financeDb = scope.ServiceProvider.GetRequiredService<FinanceDbContext>();
  await financeDb.Database.MigrateAsync();
  await FinanceDataSeeder.SeedAsync(financeDb);

  var reportsDb = scope.ServiceProvider.GetRequiredService<ReportsDbContext>();
  await reportsDb.Database.MigrateAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseHangfireDashboard("/hangfire");
app.MapControllers();

app.Run();
