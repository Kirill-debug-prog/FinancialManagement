import { api } from './client';

/**
 * Получить список всех профилей пользователя
 * @returns {Promise<Array>} Массив профилей
 */
export async function getProfiles() {
    return api.get('/profiles');
}

/**
 * Получить один профиль по ID
 * @param {string} profileId ID профиля
 * @returns {Promise<Object>} Данные профиля
 */
export async function getProfile(profileId) {
    return api.get(`/profiles/${profileId}`);
}

/**
 * Создать новый профиль
 * @param {string} name Название профиля
 * @param {string} mainCurrency Основная валюта профиля (например: 'RUB', 'USD')
 * @returns {Promise<Object>} Созданный профиль с ID
 */
export async function createProfile(name, mainCurrency) {
    return api.post('/profiles', { name, mainCurrency });
}

/**
 * Обновить профиль
 * @param {string} profileId ID профиля
 * @param {string} name Новое название профиля
 * @returns {Promise<Object>} Обновленный профиль
 */
export async function updateProfile(profileId, name) {
    return api.put(`/profiles/${profileId}`, { name });
}

/**
 * Удалить профиль
 * @param {string} profileId ID профиля
 * @returns {Promise<void>}
 */
export async function deleteProfile(profileId) {
    return api.delete(`/profiles/${profileId}`);
}
