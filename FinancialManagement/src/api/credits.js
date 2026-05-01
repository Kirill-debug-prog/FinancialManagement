import { api } from './client';
import { buildProfileUrl } from './utils';

/**
 * Получить список кредитов текущего профиля
 * @returns {Promise<Array>} Массив кредитов
 */
export async function getCredits() {
    return api.get(buildProfileUrl('credits'));
}

/**
 * Получить один кредит по ID
 * @param {string} id ID кредита
 * @returns {Promise<Object>} Данные кредита
 */
export async function getCredit(id) {
    return api.get(buildProfileUrl('credits', `/${id}`));
}

/**
 * Создать новый кредит
 * @param {Object} data Данные кредита (lender, amount, rate, startDate, endDate, description)
 * @returns {Promise<Object>} Созданный кредит с ID
 */
export async function createCredit(data) {
    return api.post(buildProfileUrl('credits'), data);
}

/**
 * Обновить кредит
 * @param {string} id ID кредита
 * @param {Object} data Данные для обновления
 * @returns {Promise<Object>} Обновленный кредит
 */
export async function updateCredit(id, data) {
    return api.put(buildProfileUrl('credits', `/${id}`), data);
}

/**
 * Удалить кредит
 * @param {string} id ID кредита
 * @returns {Promise<void>}
 */
export async function deleteCredit(id) {
    return api.delete(buildProfileUrl('credits', `/${id}`));
}
