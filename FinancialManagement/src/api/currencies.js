import { api } from './client';
import { buildProfileUrl } from './utils';

/**
 * Получить список валют текущего профиля
 * @returns {Promise<Array>} Массив валют
 */
export async function getCurrencies() {
    return api.get('/currency');
}

/**
 * Получить одну валюту по ID
 * @param {string} id ID валюты
 * @returns {Promise<Object>} Данные валюты
 */
export async function getCurrency(id) {
    return api.get(`/currency/${id}`);
}

/**
 * Найти валюту по коду из глобального справочника.
 * Бэкенд не поддерживает создание валют — они предзаполнены.
 * @param {Object} data Данные с полем code (например: 'RUB', 'USD')
 * @returns {Promise<Object>} Найденная валюта
 */
export async function createCurrency(data) {
    const all = await getCurrencies();
    const found = (all ?? []).find(c => c.code === data.code);
    return found ?? null;
}

/**
 * Обновить курс валюты
 * @param {string} id ID валюты
 * @param {number} rate Новый курс
 * @returns {Promise<void>}
 */
export async function updateCurrencyRate(id, rate) {
    return api.patch(`/currency/${id}/rate`, { rate });
}
