import { API_BASE_URL } from './config';
import { getMemoryCache, setMemoryCache, getLocalCache, setLocalCache, CACHE_TTL } from './cache';

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
    const onboarding = localStorage.getItem('onboarding');
    
    if (!token) return false;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Проверяем что токен еще действителен (срок не истек)
        const isTokenValid = payload.exp && payload.exp * 1000 > Date.now();
        
        if (!isTokenValid) {
            // Если токен истек, очищаем все данные
            clearAuth();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error parsing token:', error);
        clearAuth();
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
// Cache Configuration
// ============================================================================

/**
 * Конфигурация кеша для разных типов запросов
 */
const CACHE_CONFIG = {
    // GET запросы кешируются
    'GET': true,
    // POST/PUT/DELETE запросы не кешируются по умолчанию
    'POST': false,
    'PUT': false,
    'DELETE': false
};

/**
 * Время жизни кеша для разных URL паттернов
 */
const URL_CACHE_TTL = {
    '/profiles': CACHE_TTL.LONG,           // 1 час
    '/accounts': CACHE_TTL.MEDIUM,        // 15 минут
    '/categories': CACHE_TTL.MEDIUM,      // 15 минут
    '/currencies': CACHE_TTL.VERY_LONG,   // 24 часа (редко меняется)
    '/units': CACHE_TTL.VERY_LONG,        // 24 часа
    '/transactions': CACHE_TTL.SHORT,     // 5 минут
    '/credits': CACHE_TTL.MEDIUM,         // 15 минут
    '/debts': CACHE_TTL.MEDIUM,           // 15 минут
    '/deposits': CACHE_TTL.MEDIUM,        // 15 минут
    '/dashboard': CACHE_TTL.SHORT,        // 5 минут
    '/reports': CACHE_TTL.SHORT,          // 5 минут
};

/**
 * Получить TTL для URL
 */
function getCacheTTL(url) {
    for (const [pattern, ttl] of Object.entries(URL_CACHE_TTL)) {
        if (url.includes(pattern)) {
            return ttl;
        }
    }
    return CACHE_TTL.MEDIUM; // По умолчанию 15 минут
}

// ============================================================================
// HTTP Request Handler with Caching
// ============================================================================

/**
 * Выполнить HTTP запрос с автоматической авторизацией и кешированием
 * @private
 * @param {string} url URL для запроса (относительный путь)
 * @param {object} options опции fetch
 * @returns {Promise} JSON ответ от сервера
 * @throws {Error} Если статус ответа не OK или сессия истекла
 */
async function request(url, options = {}) {
    const method = options.method || 'GET';
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const fullUrl = `${API_BASE_URL}${url}`;

    // ========== CHECK CACHE FOR GET REQUESTS ==========
    if (method === 'GET' && CACHE_CONFIG[method]) {
        // Проверить memory cache
        const cachedData = getMemoryCache(url);
        if (cachedData) {
            console.debug('[Cache] Memory hit:', url);
            return cachedData;
        }

        // Проверить localStorage cache
        const localCachedData = getLocalCache(url);
        if (localCachedData) {
            console.debug('[Cache] Local storage hit:', url);
            // Восстановить в memory cache
            const ttl = getCacheTTL(url);
            setMemoryCache(url, localCachedData, ttl);
            return localCachedData;
        }
    }

    // ========== PERFORM ACTUAL REQUEST ==========
    let response;
    try {
        response = await fetch(fullUrl, {
            ...options,
            headers,
        });
    } catch (error) {
        console.error('Network error:', error);
        throw new Error('Ошибка подключения к серверу');
    }

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
    
    const data = await response.json();

    // ========== SAVE TO CACHE FOR GET REQUESTS ==========
    if (method === 'GET' && CACHE_CONFIG[method]) {
        const ttl = getCacheTTL(url);
        setMemoryCache(url, data, ttl);
        setLocalCache(url, data);
        console.debug('[Cache] Saved:', url);
    }

    return data;
}

// ============================================================================
// API Client
// ============================================================================

/**
 * API клиент для выполнения HTTP запросов с кешированием
 * @type {object}
 */
export const api = {
    /**
     * GET запрос (с кешированием)
     * @param {string} url URL для запроса
     * @param {object} options дополнительные опции
     * @returns {Promise} JSON ответ
     */
    get: (url, options = {}) => request(url, { ...options, method: 'GET' }),
    
    /**
     * POST запрос (без кеширования)
     * @param {string} url URL для запроса
     * @param {object} data Тело запроса
     * @returns {Promise} JSON ответ
     */
    post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
    
    /**
     * PUT запрос (без кеширования)
     * @param {string} url URL для запроса
     * @param {object} data Тело запроса
     * @returns {Promise} JSON ответ
     */
    put: (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
    
    /**
     * DELETE запрос (без кеширования)
     * @param {string} url URL для запроса
     * @returns {Promise} JSON ответ
     */
    delete: (url) => request(url, { method: 'DELETE' }),
};
