import { api, getActiveProfileId } from './client';
import { getCategoryReport } from './reports';


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

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    // Параллельно тянем баланс, транзакции и категории расходов
    const [walletResults, categoryExpenses] = await Promise.all([
        Promise.all(
            wallets.map(async (wallet) => {
                const [balData, transactions] = await Promise.all([
                    api.get(`/transaction/balance?walletId=${wallet.id}`),
                    api.get(`/transaction?walletId=${wallet.id}`),
                ]);
                return { balance: balData?.balance ?? 0, transactions: transactions ?? [] };
            })
        ),
        getCategoryReport('Expense', firstDay, lastDay).then(r => r ?? []),
    ]);

    const totalBalance = walletResults.reduce((sum, { balance }) => sum + balance, 0);
    const allTransactions = walletResults.flatMap(({ transactions }) => transactions);

    // Метрики текущего месяца. Backend: type 0=Income, 1=Expense, 2=Transfer; amount field is 'amount'
    const currentMonthTx = allTransactions.filter(t => isCurrentMonth(t.date));
    const totalIncome = currentMonthTx
        .filter(t => t.type === 0)
        .reduce((sum, t) => sum + (t.amount ?? 0), 0);
    const totalExpense = currentMonthTx
        .filter(t => t.type === 1)
        .reduce((sum, t) => sum + (t.amount ?? 0), 0);

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
                if (t.type === 0) monthlyMap[label].income += t.amount ?? 0;
                if (t.type === 1) monthlyMap[label].expense += t.amount ?? 0;
            }
        });
    const monthlyData = monthLabels.map(m => monthlyMap[m]);

    return { totalBalance, totalIncome, totalExpense, categoryExpenses, monthlyData };
}
