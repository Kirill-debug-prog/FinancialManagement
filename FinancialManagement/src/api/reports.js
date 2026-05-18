import { api, getActiveProfileId } from './client';
import { buildQueryString } from './utils';

export async function getMonthlyReport(year = null) {
    const profileId = getActiveProfileId();
    const query = buildQueryString({ profileId, year });
    return api.get('/analytics/monthly' + query);
}

export async function getCategoryReport(type = 'Expense', dateFrom = null, dateTo = null) {
    const profileId = getActiveProfileId();
    const query = buildQueryString({ profileId, type, dateFrom, dateTo });
    return api.get('/analytics/categories' + query);
}
