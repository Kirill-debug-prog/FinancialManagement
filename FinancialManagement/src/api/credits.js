import { api, getActiveProfileId } from './client';
import { buildProfileUrl } from './utils';
import { getCurrencies } from './currencies';

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

function transformCreditResponse(credit) {
    if (!credit) return null;
    return {
        id: credit.id,
        name: credit.name,
        type: 'personal',
        totalAmount: credit.totalAmount ?? 0,
        remainingAmount: credit.remainingAmount ?? 0,
        monthlyPayment: credit.monthlyPayment ?? 0,
        interestRate: credit.interestRate ?? 0,
        startDate: credit.startDate,
        endDate: credit.endDate,
        nextPaymentDate: null,
        status: credit.isClosed ? 'closed' : 'active',
        currencyId: credit.currencyId,
    };
}

export async function getCredits() {
    const credits = await api.get(buildProfileUrl('credits'));
    return (credits ?? []).map(transformCreditResponse);
}

export async function getCredit(id) {
    const credit = await api.get(`/credit/${id}`);
    return transformCreditResponse(credit);
}

export async function createCredit(data) {
    const profileId = getActiveProfileId();
    const currencyId = await getDefaultCurrencyId();
    return api.post('/credit', {
        profileId,
        currencyId,
        name: data.name,
        totalAmount: data.totalAmount,
        monthlyPayment: data.monthlyPayment,
        interestRate: data.interestRate,
        startDate: toDateOnly(new Date()),
        endDate: toDateOnly(data.endDate),
    });
}

export async function updateCredit(id, data) {
    const tasks = [];

    if (data.name) {
        tasks.push(api.put(`/credit/${id}/rename`, data.name));
    }

    const paymentAmount = data.paymentAmount ? parseFloat(data.paymentAmount) : 0;
    if (paymentAmount > 0) {
        tasks.push(api.post(`/credit/${id}/payment`, paymentAmount));
    }

    if (data.status === 'closed' || data.remainingAmount === 0) {
        tasks.push(api.patch(`/credit/${id}/close`));
    }

    if (tasks.length) await Promise.all(tasks);
}

export async function deleteCredit(id) {
    return api.delete(`/credit/${id}`);
}
