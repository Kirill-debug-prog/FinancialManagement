using Finance.Domain.Entities;
using Finance.Domain.Enums;
using Finance.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Finance.Infrastructure.Persistence;

public static class FinanceDataSeeder
{
  public static async Task SeedAsync(FinanceDbContext context, ICbrCurrencyRateService cbrService, CancellationToken ct = default)
  {
    await SeedCurrenciesAsync(context, cbrService, ct);
    await SeedUnitsAsync(context);
    await SeedCategoriesAsync(context);
  }

  private static async Task SeedCurrenciesAsync(FinanceDbContext context, ICbrCurrencyRateService cbrService, CancellationToken ct)
  {
    // RUB не возвращается ЦБ — создаём вручную если отсутствует
    if (!await context.Currencies.AnyAsync(c => c.Code == "RUB", ct))
    {
      var rub = Currency.Create("Российский рубль", 1, 1.0000m, "643", "RUB", 1.0000m);
      if (rub.IsSuccess)
        context.Currencies.Add(rub.Value!);
      await context.SaveChangesAsync(ct);
    }

    // Синхронизируем курсы с ЦБ при каждом запуске
    IEnumerable<CbrCurrencyRate> rates;
    try
    {
      rates = await cbrService.GetRatesAsync(ct);
    }
    catch
    {
      // ЦБ недоступен — не падаем, работаем с тем что есть
      return;
    }

    foreach (var rate in rates)
    {
      var existing = await context.Currencies.FirstOrDefaultAsync(c => c.Code == rate.Code, ct);
      if (existing is not null)
      {
        existing.UpdateRate(rate.Rate, rate.UnitRate);
      }
      else
      {
        var created = Currency.Create(rate.Name, rate.Nominal, rate.Rate, rate.NumericCode, rate.Code, rate.UnitRate);
        if (created.IsSuccess)
          context.Currencies.Add(created.Value!);
      }
    }

    await context.SaveChangesAsync(ct);
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
