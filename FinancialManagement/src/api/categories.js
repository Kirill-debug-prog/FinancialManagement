import { api } from './client';
import { buildProfileUrl, buildQueryString } from './utils';

/**
 * Получить список категорий текущего профиля
 * @param {string|null} type Фильтр по типу (например: 'Expense', 'Income')
 * @returns {Promise<Array>} Массив категорий
 */
export async function getCategories(type = null) {
    const query = buildQueryString({ type });
    return api.get(buildProfileUrl('categories') + query);
}

/**
 * Получить одну категорию по ID
 * @param {string} id ID категории
 * @returns {Promise<Object>} Данные категории
 */
export async function getCategory(id) {
    return api.get(buildProfileUrl('categories', `/${id}`));
}

/**
 * Создать новую категорию
 * @param {Object} data Данные категории (name, type, icon, color, parentId)
 * @returns {Promise<Object>} Созданная категория с ID
 */
export async function createCategory(data) {
    return api.post(buildProfileUrl('categories'), data);
}

/**
 * Обновить категорию
 * @param {string} id ID категории
 * @param {Object} data Данные для обновления
 * @returns {Promise<Object>} Обновленная категория
 */
export async function updateCategory(id, data) {
    return api.put(buildProfileUrl('categories', `/${id}`), data);
}

/**
 * Удалить категорию
 * @param {string} id ID категории
 * @returns {Promise<void>}
 */
export async function deleteCategory(id) {
    return api.delete(buildProfileUrl('categories', `/${id}`));
}
