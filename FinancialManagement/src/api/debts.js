import { api, getActiveProfileId } from './client';
import { buildProfileUrl } from './utils';
import { getCurrencies } from './currencies';

function toDateOnly(value) {
    if (!value) return null;
    if (typeof value === 'string') return value.split('T')[0];
    return new Date(value).toISOString().split('T')[0];
}

async function getDefaultCurrencyId() {
    const currencies = await getCurrencies().catch(() => []);
    const rub = (currencies ?? []).find(c => c.code === 'RUB');
    return rub?.id ?? null;
}

function transformDebtResponse(debt) {
    if (!debt) return null;
    return {
        id: debt.id,
        name: debt.creditorName,
        person: debt.creditorName,
        amount: debt.remainingAmount ?? debt.totalAmount ?? 0,
        totalAmount: debt.totalAmount ?? 0,
        remainingAmount: debt.remainingAmount ?? 0,
        date: null,
        returnDate: debt.dueDate,
        status: debt.isRepaid ? 'returned' : 'active',
        currencyId: debt.currencyId,
    };
}

export async function getDebts() {
    const debts = await api.get(buildProfileUrl('debts'));
    return (debts ?? []).map(transformDebtResponse);
}

export async function getDebt(id) {
    const debt = await api.get(`/debt/${id}`);
    return transformDebtResponse(debt);
}

export async function createDebt(data) {
    const profileId = getActiveProfileId();
    const currencyId = await getDefaultCurrencyId();
    return api.post('/debt', {
        profileId,
        currencyId,
        creditorName: data.person || data.name,
        totalAmount: data.amount,
        dueDate: toDateOnly(data.returnDate),
    });
}

export async function updateDebt(id, data) {
    if (data.status === 'returned') {
        return api.patch(`/debt/${id}/repay`);
    }
    return api.put(`/debt/${id}/creditor`, data.creditor || data.person || data.name);
}

export async function deleteDebt(id) {
    return api.delete(`/debt/${id}`);
}
