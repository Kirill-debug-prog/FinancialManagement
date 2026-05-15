import { api, getToken, parseJwt } from './client';
import { invalidateAllCache } from './cacheInvalidation';

function getUserId() {
    const payload = parseJwt(getToken());
    return payload?.sub ?? null;
}

/**
 * Получить список всех профилей пользователя
 * @returns {Promise<Array>} Массив профилей
 */
export async function getProfiles() {
    return api.get(`/profile?userId=${getUserId()}`);
}

/**
 * Получить один профиль по ID
 * @param {string} profileId ID профиля
 * @returns {Promise<Object>} Данные профиля
 */
export async function getProfile(profileId) {
    return api.get(`/profile/${profileId}`);
}

/**
 * Создать новый профиль
 * @param {string} name Название профиля
 * @param {string} mainCurrency Основная валюта профиля (например: 'RUB', 'USD')
 * @returns {Promise<Object>} Созданный профиль с ID
 */
export async function createProfile(name, mainCurrency) {
    const id = await api.post('/profile', { userId: getUserId(), name });
    invalidateAllCache();
    return { id };
}

/**
 * Обновить профиль (переименовать)
 * @param {string} profileId ID профиля
 * @param {string} name Новое название профиля
 * @returns {Promise<Object>} Обновленный профиль
 */
export async function updateProfile(profileId, name) {
    const result = await api.put(`/profile/${profileId}/rename`, { name });
    invalidateAllCache();
    return result;
}

/**
 * Удалить профиль
 * @const result = await api.delete(`/profile/${profileId}`);
    invalidateAllCache();
    return result
 * @returns {Promise<void>}
 */
export async function deleteProfile(profileId) {
    return api.delete(`/profile/${profileId}`);
}
