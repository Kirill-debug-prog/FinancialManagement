/**
 * Storage Management Utilities
 * Вспомогательные функции для управления браузерными хранилищами
 */

/**
 * Получить размер localStorage в KB
 */
export function getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return (total / 1024).toFixed(2);
}

/**
 * Получить размер sessionStorage в KB
 */
export function getSessionStorageSize() {
    let total = 0;
    for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
            total += sessionStorage[key].length + key.length;
        }
    }
    return (total / 1024).toFixed(2);
}

/**
 * Получить все ключи из localStorage
 */
export function getAllLocalStorageKeys() {
    const keys = [];
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            keys.push({
                key,
                size: (localStorage[key].length / 1024).toFixed(2),
                prefix: key.split('_')[0]
            });
        }
    }
    return keys;
}

/**
 * Получить все ключи из sessionStorage
 */
export function getAllSessionStorageKeys() {
    const keys = [];
    for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
            keys.push({
                key,
                size: (sessionStorage[key].length / 1024).toFixed(2),
                prefix: key.split('_')[0]
            });
        }
    }
    return keys;
}

/**
 * Очистить все ключи из localStorage с определенным префиксом
 */
export function clearLocalStorageByPrefix(prefix) {
    const keysToRemove = [];
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith(prefix)) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return keysToRemove.length;
}

/**
 * Очистить все ключи из sessionStorage с определенным префиксом
 */
export function clearSessionStorageByPrefix(prefix) {
    const keysToRemove = [];
    for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key) && key.startsWith(prefix)) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    return keysToRemove.length;
}

/**
 * Очистить весь localStorage (опасная функция!)
 */
export function clearAllLocalStorage() {
    const count = localStorage.length;
    localStorage.clear();
    return count;
}

/**
 * Очистить весь sessionStorage
 */
export function clearAllSessionStorage() {
    const count = sessionStorage.length;
    sessionStorage.clear();
    return count;
}

/**
 * Получить подробную информацию об всех хранилищах
 */
export function getStorageInfo() {
    const localKeys = getAllLocalStorageKeys();
    const sessionKeys = getAllSessionStorageKeys();
    
    // Группировка по префиксам
    const groupByPrefix = (keys) => {
        const grouped = {};
        keys.forEach(item => {
            if (!grouped[item.prefix]) {
                grouped[item.prefix] = { count: 0, totalSize: 0 };
            }
            grouped[item.prefix].count++;
            grouped[item.prefix].totalSize += parseFloat(item.size);
        });
        return grouped;
    };
    
    return {
        localStorage: {
            totalSize: getLocalStorageSize(),
            totalCount: localKeys.length,
            byPrefix: groupByPrefix(localKeys),
            keys: localKeys
        },
        sessionStorage: {
            totalSize: getSessionStorageSize(),
            totalCount: sessionKeys.length,
            byPrefix: groupByPrefix(sessionKeys),
            keys: sessionKeys
        }
    };
}

/**
 * Экспортировать состояние для резервной копии
 */
export function exportStorageState() {
    const storage = {
        localStorage: {},
        sessionStorage: {}
    };
    
    // Экспортируем только некешированные данные (auth, preferences, appState)
    const prefixesToExport = ['APP_STATE_', 'APP_CACHE_', 'token', 'profileId', 'auth', 'onboarding'];
    
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const shouldExport = prefixesToExport.some(prefix => key.includes(prefix) || key.startsWith('APP_'));
            if (shouldExport) {
                storage.localStorage[key] = localStorage[key];
            }
        }
    }
    
    for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
            const shouldExport = key.startsWith('APP_');
            if (shouldExport) {
                storage.sessionStorage[key] = sessionStorage[key];
            }
        }
    }
    
    return storage;
}

/**
 * Импортировать состояние из резервной копии
 */
export function importStorageState(state) {
    try {
        // Импортируем localStorage
        if (state.localStorage) {
            Object.keys(state.localStorage).forEach(key => {
                localStorage.setItem(key, state.localStorage[key]);
            });
        }
        
        // Импортируем sessionStorage
        if (state.sessionStorage) {
            Object.keys(state.sessionStorage).forEach(key => {
                sessionStorage.setItem(key, state.sessionStorage[key]);
            });
        }
        
        return true;
    } catch (error) {
        console.error('Error importing storage state:', error);
        return false;
    }
}

/**
 * Мониторить использование хранилища
 */
export function monitorStorage(callback, interval = 5000) {
    const monitor = setInterval(() => {
        const info = getStorageInfo();
        callback(info);
    }, interval);
    
    return () => clearInterval(monitor);
}

/**
 * Получить статус квоты хранилища (для браузеров, поддерживающих API)
 */
export async function getStorageQuota() {
    if (navigator.storage && navigator.storage.estimate) {
        try {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage,
                quota: estimate.quota,
                percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2)
            };
        } catch (error) {
            console.error('Error getting storage quota:', error);
            return null;
        }
    }
    return null;
}

/**
 * Запросить постоянное хранилище (для браузеров, поддерживающих API)
 */
export async function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
        try {
            const isPersistent = await navigator.storage.persist();
            return isPersistent;
        } catch (error) {
            console.error('Error requesting persistent storage:', error);
            return false;
        }
    }
    return false;
}

/**
 * Экспортировать в JSON файл для резервной копии
 */
export function exportToFile(filename = 'storage-backup.json') {
    const data = exportStorageState();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
}

/**
 * Импортировать из JSON файла
 */
export function importFromFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    const success = importStorageState(data);
                    resolve(success);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    });
}
