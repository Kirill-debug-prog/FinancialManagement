import { API_BASE_URL } from './config';

// ============================================================================
// Authentication & Storage Management
// ============================================================================

/**
 * Получить токен авторизации из localStorage
 * @returns {string|null} JWT токен или null
 */
export function getToken() {
    return localStorage.getItem('token');
}

/**
 * Сохранить токен авторизации в localStorage
 * @param {string} token JWT токен
 */
export function setToken(token) {
    localStorage.setItem('token', token);
}

/**
 * Получить ID активного профиля из localStorage
 * @returns {string|null} ID профиля или null
 */
export function getActiveProfileId() {
    return localStorage.getItem('profileId');
}

/**
 * Сохранить ID активного профиля в localStorage
 * @param {string} id ID профиля
 */
export function setActiveProfileId(id) {
    localStorage.setItem('profileId', id);
}

/**
 * Очистить все данные авторизации и сессии
 */
export function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('profileId');
    localStorage.removeItem('auth');
    localStorage.removeItem('onboarding');
}

/**
 * Проверить, авторизован ли пользователь (валидный не истекший токен)
 * @returns {boolean} true если авторизован и токен не истек
 */
export function isAuthenticated() {
    const token = getToken();
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

/**
 * Распарсить JWT токен и получить payload
 * @param {string} token JWT токен
 * @returns {object|null} Payload токена или null при ошибке парсинга
 */
export function parseJwt(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch {
        return null;
    }
}

// ============================================================================
// HTTP Request Handler
// ============================================================================

/**
 * Выполнить HTTP запрос с автоматической авторизацией
 * @private
 * @param {string} url URL для запроса (относительный путь)
 * @param {object} options опции fetch
 * @returns {Promise} JSON ответ от сервера
 * @throws {Error} Если статус ответа не OK или сессия истекла
 */
async function request(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    // Обработка 401 - сессия истекла
    if (response.status === 401) {
        clearAuth();
        window.location.href = '/login';
        throw new Error('Сессия истекла');
    }

    // Обработка ошибочных статусов
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Обработка 204 No Content
    if (response.status === 204) return null;
    
    return response.json();
}

// ============================================================================
// API Client
// ============================================================================

/**
 * API клиент для выполнения HTTP запросов
 * @type {object}
 */
export const api = {
    /**
     * GET запрос
     * @param {string} url URL для запроса
     * @returns {Promise} JSON ответ
     */
    get: (url) => request(url),
    
    /**
     * POST запрос
     * @param {string} url URL для запроса
     * @param {object} data Тело запроса
     * @returns {Promise} JSON ответ
     */
    post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
    
    /**
     * PUT запрос
     * @param {string} url URL для запроса
     * @param {object} data Тело запроса
     * @returns {Promise} JSON ответ
     */
    put: (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
    
    /**
     * DELETE запрос
     * @param {string} url URL для запроса
     * @returns {Promise} JSON ответ
     */
    delete: (url) => request(url, { method: 'DELETE' }),
};
