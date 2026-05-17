import { api, getActiveProfileId } from './client';
import { buildProfileUrl } from './utils';
import { getCurrencies } from './currencies';
import { invalidateDepositsCache } from './cacheInvalidation';

function toDateOnly(value) {
    if (!value) return new Date().toISOString().split('T')[0];
    if (typeof value === 'string') return value.split('T')[0];
    return new Date(value).toISOString().split('T')[0];
}

async function getDefaultCurrencyId() {
    const currencies = await getCurrencies().catch(() => []);
    const rub = (currencies ?? []).find(c => c.code === 'RUB');
    return rub?.id ?? null;
}

function transformDepositResponse(deposit) {
    if (!deposit) return null;
    const amount = deposit.currentAmount ?? deposit.initialAmount ?? 0;
    return {
        id: deposit.id,
        name: deposit.name,
        bank: deposit.bank ?? '',
        amount,
        currentAmount: amount,
        initialAmount: deposit.initialAmount ?? 0,
        interestRate: deposit.interestRate ?? 0,
        startDate: deposit.startDate,
        endDate: deposit.endDate,
        capitalization: deposit.isCapitalized ?? false,
        isCapitalized: deposit.isCapitalized ?? false,
        status: deposit.isClosed ? 'closed' : 'active',
        type: deposit.type === 1 ? 'replenishable' : 'fixed',
        currencyId: deposit.currencyId,
    };
}

export async function getDeposits() {
    const deposits = await api.get(buildProfileUrl('deposits'));
    return (deposits ?? []).map(transformDepositResponse);
}

export async function getDeposit(id) {
    const deposit = await api.get(`/deposit/${id}`);
    return transformDepositResponse(deposit);
}

export async function createDeposit(data) {
    const profileId = getActiveProfileId();
    const currencyId = await getDefaultCurrencyId();
    const result = await api.post('/deposit', {
        profileId,
        currencyId,
        name: data.name,
        initialAmount: data.amount,
        interestRate: data.interestRate,
        startDate: toDateOnly(data.startDate),
        endDate: toDateOnly(data.endDate),
        isCapitalized: data.capitalization ?? data.isCapitalized ?? false,
        type: data.type === 'replenishable' ? 1 : 0,
    });
    invalidateDepositsCache();
    return result;
}

export async function updateDeposit(id, data) {
    const tasks = [];

    if (data.name) {
        tasks.push(api.put(`/deposit/${id}/rename`, data.name));
    }

    const currentAmount = data.currentAmount ?? 0;
    const newAmount = data.amount ?? currentAmount;
    const topUpAmount = newAmount - currentAmount;

    if (topUpAmount > 0) {
        tasks.push(api.post(`/deposit/${id}/top-up`, topUpAmount));
    }

    if (tasks.length) await Promise.all(tasks);
    invalidateDepositsCache();
}

export async function deleteDeposit(id) {
    const result = await api.delete(`/deposit/${id}`);
    invalidateDepositsCache();
    return result;
}
