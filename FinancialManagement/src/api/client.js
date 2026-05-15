import { API_BASE_URL } from './config';
import { getMemoryCache, setMemoryCache, getLocalCache, setLocalCache, clearCache as clearCacheUtil, getCacheStats } from './cache';
import { getLocalStorageSize, getAllLocalStorageKeys, clearLocalStorageByPrefix, getStorageInfo, exportStorageState, importStorageState } from './storageUtils';

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
 * Проверить, авторизован ли пользователь
 * @returns {boolean}
 */
export function isAuthenticated() {
    const token = getToken();
    
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
// HTTP Request Handler
// ============================================================================

/**
 * Выполнить HTTP запрос с авторизацией и кешированием для GET
 * @private
 * @param {string} url URL для запроса
 * @param {object} options опции fetch
 * @returns {Promise} JSON ответ
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

    const fullUrl = `${API_BASE_URL}${url}`;
    
    // Кеширование для GET запросов
    if (options.method === 'GET' || !options.method) {
        // Сначала проверяем память
        const cachedInMemory = getMemoryCache(url);
        if (cachedInMemory) {
            console.log('[Cache] Memory hit for:', url);
            return cachedInMemory;
        }
        
        // Затем проверяем localStorage
        const cachedLocal = getLocalCache(url);
        if (cachedLocal) {
            console.log('[Cache] localStorage hit for:', url);
            // Сохраняем в память для быстрого доступа
            setMemoryCache(url, cachedLocal);
            return cachedLocal;
        }
    }

    try {
        const response = await fetch(fullUrl, {
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
        
        const data = await response.json();
        
        // Кешируем результат для GET запросов
        if (options.method === 'GET' || !options.method) {
            setMemoryCache(url, data);
            setLocalCache(url, data);
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================================================
// API Client
// ============================================================================

/**
 * API клиент для выполнения HTTP запросов
 * @type {object}
 */
export const api = {
    get: (url, options = {}) => request(url, { ...options, method: 'GET' }),
    post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
    put: (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
    
    /**
     * PATCH запрос
     * @param {string} url URL для запроса
     * @param {object} data Тело запроса
     * @returns {Promise} JSON ответ
     */
    patch: (url, data) => request(url, { method: 'PATCH', body: JSON.stringify(data) }),

    /**
     * DELETE запрос
     * @param {string} url URL для запроса
     * @returns {Promise} JSON ответ
     */
    delete: (url) => request(url, { method: 'DELETE' }),
};

// ============================================================================
// Cache Management Functions
// ============================================================================

/**
 * Очистить кеш для конкретного URL
 */
export function invalidateCache(url) {
    clearCacheUtil(url);
    console.log('[Cache] Invalidated cache for:', url);
}

/**
 * Очистить весь кеш
 */
export function invalidateAllCache() {
    // Импортируем и вызываем функцию из cache.js
    import('./cache').then(module => {
        module.clearAllCache();
        console.log('[Cache] Cleared all cache');
    });
}

// ============================================================================
// Storage Management
// ============================================================================

/**
 * Получить информацию о текущем использовании хранилища
 */
export function getStorageStatus() {
    return getStorageInfo();
}

/**
 * Получить статистику кеша
 */
export function getCacheStatus() {
    return getCacheStats();
}

/**
 * Получить размер localStorage в KB
 */
export function getStorageSizeKB() {
    return getLocalStorageSize();
}

/**
 * Получить все ключи из localStorage с информацией о размере
 */
export function getStorageKeys() {
    return getAllLocalStorageKeys();
}

/**
 * Очистить localStorage по префиксу
 */
export function clearStorageByPrefix(prefix) {
    return clearLocalStorageByPrefix(prefix);
}

/**
 * Экспортировать состояние хранилища для резервной копии
 */
export function exportStorage() {
    return exportStorageState();
}

/**
 * Импортировать состояние хранилища из резервной копии
 */
export function importStorage(state) {
    return importStorageState(state);
}
