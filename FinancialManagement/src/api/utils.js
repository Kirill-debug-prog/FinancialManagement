import { getActiveProfileId } from './client';

// Маппинг имён ресурсов фронтенда → имена роутов бэкенда
const RESOURCE_MAP = {
    accounts: 'wallet',
    transactions: 'transaction',
    categories: 'category',
    credits: 'credit',
    debts: 'debt',
    deposits: 'deposit',
    currencies: 'currency',
};

/**
 * Построить URL для ресурса в контексте активного профиля
 * @param {string} resource Название ресурса (например: 'accounts', 'categories')
 * @param {string} path Дополнительный путь (например: '/{id}')
 * @returns {string} Полный URL для запроса
 */
export function buildProfileUrl(resource, path = '') {
    const profileId = getActiveProfileId();
    if (!profileId) {
        console.warn(`buildProfileUrl: profileId не установлен`);
    }
    const backendResource = RESOURCE_MAP[resource] || resource;
    // Запрос коллекции — profileId передаём query-параметром
    if (path === '') {
        return `/${backendResource}?profileId=${profileId}`;
    }
    // Запрос конкретного ресурса по ID — profileId не нужен
    return `/${backendResource}${path}`;
}

/**
 * Построить query-string из объекта параметров
 * Пропускает null, undefined и пустые строки
 * @param {object} params Объект с параметрами
 * @returns {string} Query-string (включая ?)
 * 
 * @example
 * // '?type=Expense&dateFrom=2024-01-01'
 * buildQueryString({ type: 'Expense', dateFrom: '2024-01-01', dateTo: null })
 * 
 * @example
 * // ''
 * buildQueryString({})
 */
export function buildQueryString(params) {
    const searchParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined && value !== '') {
            searchParams.set(key, value);
        }
    }
    
    const query = searchParams.toString();
    return query ? `?${query}` : '';
}
