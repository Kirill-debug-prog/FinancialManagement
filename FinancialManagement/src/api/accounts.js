import { api } from './client';
import { buildProfileUrl } from './utils';

/**
 * Получить список всех счетов текущего профиля
 * @returns {Promise<Array>} Массив счетов
 */
export async function getAccounts() {
    return api.get(buildProfileUrl('accounts'));
}

/**
 * Получить один счет по ID
 * @param {string} id ID счета
 * @returns {Promise<Object>} Данные счета
 */
export async function getAccount(id) {
    return api.get(buildProfileUrl('accounts', `/${id}`));
}

/**
 * Создать новый счет
 * @param {Object} data Данные счета (name, type, currency, balance, color, icon)
 * @returns {Promise<Object>} Созданный счет с ID
 */
export async function createAccount(data) {
    return api.post(buildProfileUrl('accounts'), data);
}

/**
 * Обновить счет
 * @param {string} id ID счета
 * @param {Object} data Данные для обновления
 * @returns {Promise<Object>} Обновленный счет
 */
export async function updateAccount(id, data) {
    return api.put(buildProfileUrl('accounts', `/${id}`), data);
}

/**
 * Удалить счет
 * @param {string} id ID счета
 * @returns {Promise<void>}
 */
export async function deleteAccount(id) {
    return api.delete(buildProfileUrl('accounts', `/${id}`));
}

/**
 * Архивировать счет (переместить в архив без удаления)
 * @param {string} id ID счета
 * @returns {Promise<Object>} Архивированный счет
 */
export async function archiveAccount(id) {
    return api.post(buildProfileUrl('accounts', `/${id}/archive`));
}
