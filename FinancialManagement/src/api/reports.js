import { api } from './client';
import { buildProfileUrl, buildQueryString } from './utils';

/**
 * Получить ежемесячный отчет по расходам/доходам
 * @param {number|null} year Год для отчета (опционально)
 * @returns {Promise<Object>} Объект с месячными данными
 */
export async function getMonthlyReport(year = null) {
    const query = buildQueryString({ year });
    return api.get(buildProfileUrl('reports', '/monthly') + query);
}

/**
 * Получить отчет по категориям с фильтрацией по датам
 * @param {string} type Тип отчета ('Expense' для расходов, 'Income' для доходов)
 * @param {string|null} dateFrom Начальная дата (ISO формат, опционально)
 * @param {string|null} dateTo Конечная дата (ISO формат, опционально)
 * @returns {Promise<Object>} Объект с данными по категориям
 */
export async function getCategoryReport(type = 'Expense', dateFrom = null, dateTo = null) {
    const query = buildQueryString({ type, dateFrom, dateTo });
    return api.get(buildProfileUrl('reports', '/categories') + query);
}
