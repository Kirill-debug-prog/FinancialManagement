import { api, setToken, parseJwt } from './client';

/**
 * Авторизовать пользователя с помощью email и пароля
 * @param {string} email Email пользователя
 * @param {string} password Пароль пользователя
 * @returns {Promise<string>} JWT токен авторизации
 * @throws {Error} Если ошибка при авторизации
 */
export async function login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    setToken(data.token);
    return data.token;
}

/**
 * Зарегистрировать нового пользователя
 * @param {string} email Email пользователя
 * @param {string} password Пароль пользователя
 * @param {string} confirmPassword Подтверждение пароля
 * @returns {Promise<Object>} Данные зарегистрированного пользователя
 * @throws {Error} Если ошибка при регистрации
 */
export async function register(email, password, confirmPassword) {
    const data = await api.post('/auth/register', { email, password, confirmPassword });
    return data;
}

/**
 * Извлечь ID пользователя из JWT токена
 * @param {string} token JWT токен
 * @returns {string|null} ID пользователя или null если токен невалиден
 */
export function getUserIdFromToken(token) {
    const payload = parseJwt(token);
    if (!payload) return null;
    return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub;
}
