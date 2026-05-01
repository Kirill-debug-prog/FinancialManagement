import { api } from './client';
import { buildProfileUrl } from './utils';

/**
 * Получить список депозитов текущего профиля
 * @returns {Promise<Array>} Массив депозитов
 */
export async function getDeposits() {
    return api.get(buildProfileUrl('deposits'));
}

/**
 * Получить один депозит по ID
 * @param {string} id ID депозита
 * @returns {Promise<Object>} Данные депозита
 */
export async function getDeposit(id) {
    return api.get(buildProfileUrl('deposits', `/${id}`));
}

/**
 * Создать новый депозит
 * @param {Object} data Данные депозита (bank, amount, rate, startDate, endDate, currency, description)
 * @returns {Promise<Object>} Созданный депозит с ID
 */
export async function createDeposit(data) {
    return api.post(buildProfileUrl('deposits'), data);
}

/**
 * Обновить депозит
 * @param {string} id ID депозита
 * @param {Object} data Данные для обновления
 * @returns {Promise<Object>} Обновленный депозит
 */
export async function updateDeposit(id, data) {
    return api.put(buildProfileUrl('deposits', `/${id}`), data);
}

/**
 * Удалить депозит
 * @param {string} id ID депозита
 * @returns {Promise<void>}
 */
export async function deleteDeposit(id) {
    return api.delete(buildProfileUrl('deposits', `/${id}`));
}
