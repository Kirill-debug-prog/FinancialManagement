import { api, getActiveProfileId } from './client';

const CATEGORY_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#C224EA', '#5823E8', '#6b7280'];

function getMonthLabel(dateStr) {
    return new Date(dateStr).toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
}

function isCurrentMonth(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function getLast6MonthLabels() {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return d.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
    });
}

function isWithinLast6Months(dateStr) {
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    return new Date(dateStr) >= cutoff;
}

/**
 * Получить агрегированные данные для дашборда.
 * Собирает данные из /wallet, /transaction/balance и /transaction
 * и возвращает структуру, ожидаемую компонентом Dashboard.
 *
 * @returns {Promise<{
 *   totalBalance: number,
 *   totalIncome: number,
 *   totalExpense: number,
 *   categoryExpenses: Array<{name: string, value: number, color: string}>,
 *   monthlyData: Array<{month: string, income: number, expense: number}>
 * }>}
 */
export async function getDashboardData() {
    const profileId = getActiveProfileId();

    const wallets = await api.get(`/wallet?profileId=${profileId}`);

    if (!wallets?.length) {
        const monthlyData = getLast6MonthLabels().map(month => ({ month, income: 0, expense: 0 }));
        return { totalBalance: 0, totalIncome: 0, totalExpense: 0, categoryExpenses: [], monthlyData };
    }

    // Параллельно тянем баланс и транзакции для каждого кошелька
    const walletResults = await Promise.all(
        wallets.map(async (wallet) => {
            const [balance, transactions] = await Promise.all([
                api.get(`/transaction/balance?walletId=${wallet.id}`),
                api.get(`/transaction?walletId=${wallet.id}`),
            ]);
            return { balance: balance ?? 0, transactions: transactions ?? [] };
        })
    );

    const totalBalance = walletResults.reduce((sum, { balance }) => sum + balance, 0);
    const allTransactions = walletResults.flatMap(({ transactions }) => transactions);

    // Метрики текущего месяца
    const currentMonthTx = allTransactions.filter(t => isCurrentMonth(t.date));
    const totalIncome = currentMonthTx
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + (t.totalAmount ?? 0), 0);
    const totalExpense = currentMonthTx
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + (t.totalAmount ?? 0), 0);

    // Разбивка по категориям (расходы текущего месяца)
    const categoryMap = {};
    currentMonthTx
        .filter(t => t.type === 'Expense')
        .forEach(t => {
            const name = t.categoryName || 'Без категории';
            categoryMap[name] = (categoryMap[name] ?? 0) + (t.totalAmount ?? 0);
        });
    const categoryExpenses = Object.entries(categoryMap).map(([name, value], i) => ({
        name,
        value,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

    // Доходы/расходы по месяцам за последние 6 месяцев
    const monthLabels = getLast6MonthLabels();
    const monthlyMap = Object.fromEntries(
        monthLabels.map(m => [m, { month: m, income: 0, expense: 0 }])
    );
    allTransactions
        .filter(t => isWithinLast6Months(t.date))
        .forEach(t => {
            const label = getMonthLabel(t.date);
            if (monthlyMap[label]) {
                if (t.type === 'Income') monthlyMap[label].income += t.totalAmount ?? 0;
                if (t.type === 'Expense') monthlyMap[label].expense += t.totalAmount ?? 0;
            }
        });
    const monthlyData = monthLabels.map(m => monthlyMap[m]);

    return { totalBalance, totalIncome, totalExpense, categoryExpenses, monthlyData };
}
