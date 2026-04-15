import { api, getActiveProfileId } from './client';

export async function getMonthlyReport(year) {
    const query = year ? `?year=${year}` : '';
    return api.get(`/profiles/${getActiveProfileId()}/reports/monthly${query}`);
}

export async function getCategoryReport(type = 'Expense', dateFrom, dateTo) {
    const params = new URLSearchParams();
    params.set('type', type);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    return api.get(`/profiles/${getActiveProfileId()}/reports/categories?${params.toString()}`);
}
