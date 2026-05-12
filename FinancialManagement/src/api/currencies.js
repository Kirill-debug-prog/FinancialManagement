import { api } from './client';
import { buildProfileUrl } from './utils';

/**
 * Получить список валют текущего профиля
 * @returns {Promise<Array>} Массив валют
 */
export async function getCurrencies() {
    return api.get(buildProfileUrl('currencies'));
}

/**
 * Получить одну валюту по ID
 * @param {string} id ID валюты
 * @returns {Promise<Object>} Данные валюты
 */
export async function getCurrency(id) {
    return api.get(buildProfileUrl('currencies', `/${id}`));
}

/**
 * Создать новую валюту
 * @param {Object} data Данные валюты (code, symbol, name, exchangeRate)
 * @returns {Promise<Object>} Созданная валюта с ID
 */
export async function createCurrency(data) {
    return api.post(buildProfileUrl('currencies'), data);
}

/**
 * Обновить валюту
 * @param {string} id ID валюты
 * @param {Object} data Данные для обновления
 * @returns {Promise<Object>} Обновленная валюта
 */
export async function updateCurrency(id, data) {
    return api.put(buildProfileUrl('currencies', `/${id}`), data);
}

/**
 * Удалить валюту
 * @param {string} id ID валюты
 * @returns {Promise<void>}
 */
export async function deleteCurrency(id) {
    return api.delete(buildProfileUrl('currencies', `/${id}`));
}
