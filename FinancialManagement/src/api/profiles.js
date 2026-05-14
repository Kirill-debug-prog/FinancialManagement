import { api, getToken, parseJwt } from './client';

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
    return { id };
}

/**
 * Обновить профиль (переименовать)
 * @param {string} profileId ID профиля
 * @param {string} name Новое название профиля
 * @returns {Promise<Object>} Обновленный профиль
 */
export async function updateProfile(profileId, name) {
    return api.put(`/profile/${profileId}/rename`, { name });
}

/**
 * Удалить профиль
 * @param {string} profileId ID профиля
 * @returns {Promise<void>}
 */
export async function deleteProfile(profileId) {
    return api.delete(`/profile/${profileId}`);
}
