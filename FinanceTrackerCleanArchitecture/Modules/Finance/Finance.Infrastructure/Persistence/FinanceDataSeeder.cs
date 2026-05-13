using Finance.Domain.Entities;
using Finance.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Finance.Infrastructure.Persistence;

public static class FinanceDataSeeder
{
  public static async Task SeedAsync(FinanceDbContext context)
  {
    await SeedCurrenciesAsync(context);
    await SeedUnitsAsync(context);
    await SeedCategoriesAsync(context);
  }

  private static async Task SeedCurrenciesAsync(FinanceDbContext context)
  {
    if (await context.Currencies.AnyAsync())
      return;

    var currencies = new[]
    {
      Currency.Create("Украинская гривна",   1,   1.0000m,  "980", "UAH", 1.0000m),
      Currency.Create("Доллар США",          1,  41.5000m,  "840", "USD", 41.5000m),
      Currency.Create("Евро",                1,  46.0000m,  "978", "EUR", 46.0000m),
      Currency.Create("Фунт стерлингов",     1,  54.0000m,  "826", "GBP", 54.0000m),
      Currency.Create("Польский злотый",     1,  10.5000m,  "985", "PLN", 10.5000m),
      Currency.Create("Швейцарский франк",   1,  49.0000m,  "756", "CHF", 49.0000m),
      Currency.Create("Японская иена",       100, 27.5000m, "392", "JPY", 0.2750m),
      Currency.Create("Китайский юань",      1,   5.7000m,  "156", "CNY", 5.7000m),
      Currency.Create("Чешская крона",       10,  1.8500m,  "203", "CZK", 0.1850m),
      Currency.Create("Венгерский форинт",   100, 11.0000m, "348", "HUF", 0.1100m),
      Currency.Create("Норвежская крона",    1,   3.9000m,  "578", "NOK", 3.9000m),
      Currency.Create("Шведская крона",      1,   4.1000m,  "752", "SEK", 4.1000m),
    };

    foreach (var result in currencies)
      if (result.IsSuccess)
        context.Currencies.Add(result.Value!);

    await context.SaveChangesAsync();
  }

  private static async Task SeedUnitsAsync(FinanceDbContext context)
  {
    if (await context.Units.AnyAsync())
      return;

    var units = new[]
    {
      Unit.CreateSystem("Штука",           "шт"),
      Unit.CreateSystem("Килограмм",       "кг"),
      Unit.CreateSystem("Грамм",           "г"),
      Unit.CreateSystem("Тонна",           "т"),
      Unit.CreateSystem("Литр",            "л"),
      Unit.CreateSystem("Миллилитр",       "мл"),
      Unit.CreateSystem("Метр",            "м"),
      Unit.CreateSystem("Сантиметр",       "см"),
      Unit.CreateSystem("Километр",        "км"),
      Unit.CreateSystem("Квадратный метр", "м²"),
      Unit.CreateSystem("Час",             "ч"),
      Unit.CreateSystem("Минута",          "мин"),
      Unit.CreateSystem("День",            "дн"),
      Unit.CreateSystem("Месяц",           "мес"),
      Unit.CreateSystem("Год",             "год"),
      Unit.CreateSystem("Услуга",          "усл"),
      Unit.CreateSystem("Пакет",           "пак"),
      Unit.CreateSystem("Упаковка",        "уп"),
    };

    foreach (var result in units)
      if (result.IsSuccess)
        context.Units.Add(result.Value!);

    await context.SaveChangesAsync();
  }

  private static async Task SeedCategoriesAsync(FinanceDbContext context)
  {
    if (await context.Categories.AnyAsync())
      return;

    var incomeCategories = new[]
    {
      Category.CreateSystem("Зарплата",           FinancialType.Income),
      Category.CreateSystem("Фриланс",            FinancialType.Income),
      Category.CreateSystem("Стипендия",          FinancialType.Income),
      Category.CreateSystem("Бонус",              FinancialType.Income),
      Category.CreateSystem("Дивиденды",          FinancialType.Income),
      Category.CreateSystem("Инвестиции",         FinancialType.Income),
      Category.CreateSystem("Аренда (доход)",     FinancialType.Income),
      Category.CreateSystem("Подарок",            FinancialType.Income),
      Category.CreateSystem("Возврат долга",      FinancialType.Income),
      Category.CreateSystem("Кэшбэк",             FinancialType.Income),
      Category.CreateSystem("Социальные выплаты", FinancialType.Income),
      Category.CreateSystem("Прочее",             FinancialType.Income),
    };

    var expenseCategories = new[]
    {
      Category.CreateSystem("Продукты питания",      FinancialType.Expense),
      Category.CreateSystem("Рестораны и кафе",      FinancialType.Expense),
      Category.CreateSystem("Кофе и напитки",        FinancialType.Expense),
      Category.CreateSystem("Транспорт",             FinancialType.Expense),
      Category.CreateSystem("Топливо",               FinancialType.Expense),
      Category.CreateSystem("Такси",                 FinancialType.Expense),
      Category.CreateSystem("Аренда жилья",          FinancialType.Expense),
      Category.CreateSystem("Коммунальные услуги",   FinancialType.Expense),
      Category.CreateSystem("Связь и интернет",      FinancialType.Expense),
      Category.CreateSystem("Одежда и обувь",        FinancialType.Expense),
      Category.CreateSystem("Красота и уход",        FinancialType.Expense),
      Category.CreateSystem("Здоровье",              FinancialType.Expense),
      Category.CreateSystem("Лекарства и аптека",    FinancialType.Expense),
      Category.CreateSystem("Спорт и фитнес",        FinancialType.Expense),
      Category.CreateSystem("Образование",           FinancialType.Expense),
      Category.CreateSystem("Книги и подписки",      FinancialType.Expense),
      Category.CreateSystem("Развлечения",           FinancialType.Expense),
      Category.CreateSystem("Техника и электроника", FinancialType.Expense),
      Category.CreateSystem("Бытовая химия",         FinancialType.Expense),
      Category.CreateSystem("Путешествия",           FinancialType.Expense),
      Category.CreateSystem("Гостиница и жильё",     FinancialType.Expense),
      Category.CreateSystem("Страхование",           FinancialType.Expense),
      Category.CreateSystem("Кредиты и долги",       FinancialType.Expense),
      Category.CreateSystem("Подарки (расходы)",     FinancialType.Expense),
      Category.CreateSystem("Благотворительность",   FinancialType.Expense),
      Category.CreateSystem("Домашние животные",     FinancialType.Expense),
      Category.CreateSystem("Дети",                  FinancialType.Expense),
      Category.CreateSystem("Прочее",                FinancialType.Expense),
    };

    var transferCategories = new[]
    {
      Category.CreateSystem("Перевод между счетами", FinancialType.Transfer),
    };

    foreach (var result in incomeCategories.Concat(expenseCategories).Concat(transferCategories))
      if (result.IsSuccess)
        context.Categories.Add(result.Value!);

    await context.SaveChangesAsync();
  }
}
