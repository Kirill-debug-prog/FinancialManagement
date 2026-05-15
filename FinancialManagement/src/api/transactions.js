import { api, getActiveProfileId } from './client';
import { invalidateTransactionsCache } from './cacheInvalidation';

const TYPE_STR_TO_INT = {
    income: 0, expense: 1, transfer: 2,
    Income: 0, Expense: 1, Transfer: 2,
};

function toDateOnly(value) {
    if (!value) return new Date().toISOString().split('T')[0];
    if (typeof value === 'string') return value.split('T')[0];
    return new Date(value).toISOString().split('T')[0];
}

export async function getTransactions(filters = {}) {
    const walletId = filters.walletId || filters.accountId;

    if (walletId) {
        return api.get(`/transaction?walletId=${walletId}`);
    }

    // No walletId: fetch all profile wallets then all their transactions
    const profileId = getActiveProfileId();
    const wallets = await api.get(`/wallet?profileId=${profileId}`).catch(() => []);
    if (!wallets || !wallets.length) return [];

    const all = await Promise.all(
        wallets.map(w => api.get(`/transaction?walletId=${w.id}`).catch(() => []))
    );
    return all.flat();
}

export async function getTransaction(id) {
    return api.get(`/transaction/${id}`);
}

export async function createTransaction(data) {
    const result = await api.post('/transaction', {
        walletId: data.walletId || data.accountId,
        type: TYPE_STR_TO_INT[data.type] ?? 1,
        amount: data.amount,
        date: toDateOnly(data.date),
        categoryId: data.categoryId || null,
        description: data.description || data.note || null,
        toWalletId: data.toWalletId || null,
    });
    invalidateTransactionsCache();
    return result;
}

export async function updateTransaction(id, data) {
    const tasks = [];
    if (data.description !== undefined || data.note !== undefined) {
        tasks.push(api.patch(`/transaction/${id}/description`, data.description ?? data.note ?? null));
    }
    if (data.categoryId !== undefined) {
        tasks.push(api.patch(`/transaction/${id}/category`, data.categoryId || null));
    }
    if (tasks.length) await Promise.all(tasks);
    invalidateTransactionsCache();
}

export async function deleteTransaction(id) {
    const result = await api.delete(`/transaction/${id}`);
    invalidateTransactionsCache();
    return result;
}
