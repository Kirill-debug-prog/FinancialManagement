/**
 * Cache Manager - система кеширования для API запросов
 * Поддерживает в памяти и localStorage кеширование
 */

const CACHE_STORAGE = 'APP_CACHE_';
const CACHE_TIMESTAMP = '_TIMESTAMP_';
const CACHE_TTL = {
    SHORT: 5 * 60 * 1000,      // 5 минут
    MEDIUM: 15 * 60 * 1000,    // 15 минут
    LONG: 60 * 60 * 1000,      // 1 час
    VERY_LONG: 24 * 60 * 60 * 1000 // 24 часа
};

// In-memory cache для быстрого доступа
const memoryCache = new Map();

/**
 * Получить ключ для кеша
 */
function getCacheKey(url, prefix = '') {
    return `${CACHE_STORAGE}${prefix}${url}`;
}

/**
 * Проверить, не истек ли кеш по времени
 */
function isCacheValid(timestamp, ttl) {
    return Date.now() - timestamp < ttl;
}

/**
 * Получить данные из памяти
 */
export function getMemoryCache(url) {
    const entry = memoryCache.get(url);
    if (!entry) return null;
    
    if (!isCacheValid(entry.timestamp, entry.ttl)) {
        memoryCache.delete(url);
        return null;
    }
    
    return entry.data;
}

/**
 * Сохранить данные в памяти
 */
export function setMemoryCache(url, data, ttl = CACHE_TTL.MEDIUM) {
    memoryCache.set(url, {
        data,
        timestamp: Date.now(),
        ttl
    });
}

/**
 * Получить данные из localStorage
 */
export function getLocalCache(url) {
    try {
        const key = getCacheKey(url);
        const cached = localStorage.getItem(key);
        
        if (!cached) return null;
        
        const parsed = JSON.parse(cached);
        const timestampKey = getCacheKey(url, CACHE_TIMESTAMP);
        const timestamp = parseInt(localStorage.getItem(timestampKey)) || 0;
        
        // Проверяем TTL (по умолчанию 1 час)
        if (!isCacheValid(timestamp, CACHE_TTL.LONG)) {
            clearLocalCache(url);
            return null;
        }
        
        return parsed;
    } catch (error) {
        console.warn('Error reading from localStorage cache:', error);
        return null;
    }
}

/**
 * Сохранить данные в localStorage
 */
export function setLocalCache(url, data) {
    try {
        const key = getCacheKey(url);
        localStorage.setItem(key, JSON.stringify(data));
        
        const timestampKey = getCacheKey(url, CACHE_TIMESTAMP);
        localStorage.setItem(timestampKey, Date.now().toString());
    } catch (error) {
        console.warn('Error writing to localStorage cache:', error);
    }
}

/**
 * Очистить кеш для конкретного URL
 */
export function clearCache(url) {
    // Очистить memory cache
    memoryCache.delete(url);
    
    // Очистить localStorage cache
    try {
        const key = getCacheKey(url);
        localStorage.removeItem(key);
        
        const timestampKey = getCacheKey(url, CACHE_TIMESTAMP);
        localStorage.removeItem(timestampKey);
    } catch (error) {
        console.warn('Error clearing localStorage cache:', error);
    }
}

/**
 * Очистить кеш по паттерну (например, все account-related кеши)
 */
export function clearCacheByPattern(pattern) {
    // Очистить memory cache
    for (const [key] of memoryCache) {
        if (key.includes(pattern)) {
            memoryCache.delete(key);
        }
    }
    
    // Очистить localStorage cache
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.includes(CACHE_STORAGE) && key.includes(pattern)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.warn('Error clearing localStorage cache by pattern:', error);
    }
}

/**
 * Очистить весь кеш
 */
export function clearAllCache() {
    memoryCache.clear();
    
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.includes(CACHE_STORAGE)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.warn('Error clearing all localStorage cache:', error);
    }
}

/**
 * Получить статистику кеша (для отладки)
 */
export function getCacheStats() {
    let localStorageSize = 0;
    let localStorageCount = 0;
    
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.includes(CACHE_STORAGE)) {
                localStorageCount++;
                localStorageSize += localStorage.getItem(key).length;
            }
        });
    } catch (error) {
        console.warn('Error calculating cache stats:', error);
    }
    
    return {
        memoryCache: memoryCache.size,
        localStorage: {
            count: localStorageCount,
            sizeInBytes: localStorageSize,
            sizeInKB: (localStorageSize / 1024).toFixed(2)
        }
    };
}

export { CACHE_TTL };
