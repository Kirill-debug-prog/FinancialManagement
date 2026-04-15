import { api, getActiveProfileId } from './client';

function profileUrl(path = '') {
    return `/profiles/${getActiveProfileId()}/transactions${path}`;
}

export async function getTransactions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.accountId) params.set('accountId', filters.accountId);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(profileUrl() + query);
}

export async function getTransaction(id) {
    return api.get(profileUrl(`/${id}`));
}

export async function createTransaction(data) {
    return api.post(profileUrl(), data);
}

export async function updateTransaction(id, data) {
    return api.put(profileUrl(`/${id}`), data);
}

export async function deleteTransaction(id) {
    return api.delete(profileUrl(`/${id}`));
}
