import { api, getActiveProfileId } from './client';
import { buildProfileUrl } from './utils';
import { getCurrencies } from './currencies';
import { invalidateCreditsDebtsCache } from './cacheInvalidation';

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
    
    // Разбиваем creditorName обратно на name и person
    // Формат: "Название долга (Имя человека)" или просто "Имя человека"
    let name = '';
    let person = debt.creditorName || '';
    
    const match = (debt.creditorName || '').match(/^(.+?)\s*\(([^)]+)\)$/);
    if (match) {
        name = match[1].trim();
        person = match[2].trim();
    } else {
        name = debt.creditorName || '';
        person = debt.creditorName || '';
    }
    
    return {
        id: debt.id,
        name: name,
        person: person,
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
    
    // Комбинируем название долга и имя человека, чтобы сохранить оба значения
    let creditorName = '';
    if (data.name && data.person) {
        creditorName = `${data.name} (${data.person})`;
    } else {
        creditorName = data.person || data.name || '';
    }
    
    const result = await api.post('/debt', {
        profileId,
        currencyId,
        creditorName: creditorName,
        totalAmount: data.amount,
        dueDate: toDateOnly(data.returnDate),
    });
    invalidateCreditsDebtsCache();
    return result;
}

export async function updateDebt(id, data) {
    let result;
    if (data.status === 'returned') {
        result = await api.patch(`/debt/${id}/repay`);
    } else {
        // При обновлении используем person (имя человека)
        // Если передано название долга, комбинируем с person
        let creditorName = data.person || data.name || '';
        if (data.name && data.person && data.name !== data.person) {
            creditorName = `${data.name} (${data.person})`;
        }
        result = await api.put(`/debt/${id}/creditor`, creditorName);
    }
    invalidateCreditsDebtsCache();
    return result;
}

export async function deleteDebt(id) {
    const result = await api.delete(`/debt/${id}`);
    invalidateCreditsDebtsCache();
    return result;
}
