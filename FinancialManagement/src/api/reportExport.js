import { api, getActiveProfileId } from './client';

export async function createTransactionsReport(from, to) {
    const profileId = getActiveProfileId();
    return api.post('/reports/profile-transactions', { profileId, from, to });
}

export async function createCategoryBreakdownReport(from, to) {
    const profileId = getActiveProfileId();
    return api.post('/reports/category-breakdown', { profileId, from, to });
}

export async function createObligationsReport(from, to) {
    const profileId = getActiveProfileId();
    return api.post('/reports/financial-obligations', { profileId, from, to });
}

export async function getReportStatus(reportId) {
    return api.get(`/reports/${reportId}`);
}

export async function getReportDownloadUrl(reportId) {
    return api.get(`/reports/${reportId}/download`);
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function waitForReport(reportId, maxAttempts = 30, intervalMs = 2000) {
    for (let i = 0; i < maxAttempts; i++) {
        const status = await getReportStatus(reportId);
        const s = status.status;
        if (s === 2 || s === 'Completed') return status;
        if (s === 3 || s === 'Failed') throw new Error(status.error || 'Ошибка генерации отчёта');
        await delay(intervalMs);
    }
    throw new Error('Превышено время ожидания отчёта (60 сек)');
}
