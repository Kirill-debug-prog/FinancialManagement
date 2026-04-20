import { api } from './client';
import { buildProfileUrl } from './utils';

/**
 * Получить список долгов текущего профиля
 * @returns {Promise<Array>} Массив долгов
 */
export async function getDebts() {
    return api.get(buildProfileUrl('debts'));
}

/**
 * Получить один долг по ID
 * @param {string} id ID долга
 * @returns {Promise<Object>} Данные долга
 */
export async function getDebt(id) {
    return api.get(buildProfileUrl('debts', `/${id}`));
}

/**
 * Создать новый долг
 * @param {Object} data Данные долга (debtor, amount, reason, dueDate, description)
 * @returns {Promise<Object>} Созданный долг с ID
 */
export async function createDebt(data) {
    return api.post(buildProfileUrl('debts'), data);
}

/**
 * Обновить долг
 * @param {string} id ID долга
 * @param {Object} data Данные для обновления
 * @returns {Promise<Object>} Обновленный долг
 */
export async function updateDebt(id, data) {
    return api.put(buildProfileUrl('debts', `/${id}`), data);
}

/**
 * Удалить долг
 * @param {string} id ID долга
 * @returns {Promise<void>}
 */
export async function deleteDebt(id) {
    return api.delete(buildProfileUrl('debts', `/${id}`));
}
