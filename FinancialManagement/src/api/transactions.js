import { api } from './client';
import { buildProfileUrl, buildQueryString } from './utils';

/**
 * Получить список транзакций с фильтрацией
 * @param {Object} filters Объект фильтров
 * @param {string} filters.accountId ID счета для фильтра
 * @param {string} filters.categoryId ID категории для фильтра
 * @param {string} filters.dateFrom Начальная дата (ISO формат)
 * @param {string} filters.dateTo Конечная дата (ISO формат)
 * @returns {Promise<Array>} Массив транзакций
 */
export async function getTransactions(filters = {}) {
    const query = buildQueryString({
        accountId: filters.accountId || null,
        categoryId: filters.categoryId || null,
        dateFrom: filters.dateFrom || null,
        dateTo: filters.dateTo || null,
    });
    return api.get(buildProfileUrl('transactions') + query);
}

/**
 * Получить одну транзакцию по ID
 * @param {string} id ID транзакции
 * @returns {Promise<Object>} Данные транзакции
 */
export async function getTransaction(id) {
    return api.get(buildProfileUrl('transactions', `/${id}`));
}

/**
 * Создать новую транзакцию
 * @param {Object} data Данные транзакции (accountId, categoryId, amount, date, type, note)
 * @returns {Promise<Object>} Созданная транзакция с ID
 */
export async function createTransaction(data) {
    return api.post(buildProfileUrl('transactions'), data);
}

/**
 * Обновить транзакцию
 * @param {string} id ID транзакции
 * @param {Object} data Данные для обновления
 * @returns {Promise<Object>} Обновленная транзакция
 */
export async function updateTransaction(id, data) {
    return api.put(buildProfileUrl('transactions', `/${id}`), data);
}

/**
 * Удалить транзакцию
 * @param {string} id ID транзакции
 * @returns {Promise<void>}
 */
export async function deleteTransaction(id) {
    return api.delete(buildProfileUrl('transactions', `/${id}`));
}
