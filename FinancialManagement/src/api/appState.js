/**
 * Application State Manager
 * Управляет состоянием приложения с сохранением в sessionStorage и localStorage
 */

const STATE_KEY = 'APP_STATE_';
const ROUTE_HISTORY_KEY = 'APP_ROUTE_HISTORY';
const FILTERS_KEY = 'APP_FILTERS_';
const FORM_DATA_KEY = 'APP_FORM_';

// In-memory state для быстрого доступа
const appState = {
    currentRoute: null,
    filters: {},
    formData: {},
    lastActiveProfile: null,
    userPreferences: {}
};

/**
 * Сохранить текущий маршрут
 */
export function saveCurrentRoute(route) {
    appState.currentRoute = route;
    
    try {
        // Сохранить в sessionStorage для текущей сессии
        sessionStorage.setItem(ROUTE_HISTORY_KEY, JSON.stringify({
            route,
            timestamp: Date.now()
        }));
        
        // Также сохранить в localStorage для восстановления после полной перезагрузки
        localStorage.setItem(
            STATE_KEY + 'lastRoute',
            JSON.stringify({ route, timestamp: Date.now() })
        );
    } catch (error) {
        console.warn('Error saving route:', error);
    }
}

/**
 * Получить последний сохраненный маршрут
 */
export function getLastRoute() {
    try {
        // Сначала проверяем sessionStorage (текущая сессия)
        const sessionRoute = sessionStorage.getItem(ROUTE_HISTORY_KEY);
        if (sessionRoute) {
            const { route } = JSON.parse(sessionRoute);
            return route;
        }
        
        // Если нет, проверяем localStorage
        const localRoute = localStorage.getItem(STATE_KEY + 'lastRoute');
        if (localRoute) {
            const { route, timestamp } = JSON.parse(localRoute);
            // Маршрут актуален только 24 часа
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                return route;
            }
        }
    } catch (error) {
        console.warn('Error retrieving route:', error);
    }
    
    return null;
}

/**
 * Сохранить фильтры для страницы
 */
export function saveFilters(pageKey, filters) {
    appState.filters[pageKey] = filters;
    
    try {
        sessionStorage.setItem(
            FILTERS_KEY + pageKey,
            JSON.stringify({ filters, timestamp: Date.now() })
        );
    } catch (error) {
        console.warn('Error saving filters:', error);
    }
}

/**
 * Получить фильтры для страницы
 */
export function getFilters(pageKey) {
    try {
        // Сначала из памяти
        if (appState.filters[pageKey]) {
            return appState.filters[pageKey];
        }
        
        // Затем из sessionStorage
        const stored = sessionStorage.getItem(FILTERS_KEY + pageKey);
        if (stored) {
            const { filters } = JSON.parse(stored);
            appState.filters[pageKey] = filters;
            return filters;
        }
    } catch (error) {
        console.warn('Error retrieving filters:', error);
    }
    
    return {};
}

/**
 * Очистить фильтры для страницы
 */
export function clearFilters(pageKey) {
    delete appState.filters[pageKey];
    
    try {
        sessionStorage.removeItem(FILTERS_KEY + pageKey);
    } catch (error) {
        console.warn('Error clearing filters:', error);
    }
}

/**
 * Сохранить данные формы (для восстановления незаполненной формы)
 */
export function saveFormData(formKey, data) {
    appState.formData[formKey] = data;
    
    try {
        // Сохранять только в sessionStorage (не в localStorage)
        sessionStorage.setItem(
            FORM_DATA_KEY + formKey,
            JSON.stringify({ data, timestamp: Date.now() })
        );
    } catch (error) {
        console.warn('Error saving form data:', error);
    }
}

/**
 * Получить данные формы
 */
export function getFormData(formKey) {
    try {
        // Сначала из памяти
        if (appState.formData[formKey]) {
            return appState.formData[formKey];
        }
        
        // Затем из sessionStorage
        const stored = sessionStorage.getItem(FORM_DATA_KEY + formKey);
        if (stored) {
            const { data, timestamp } = JSON.parse(stored);
            // Данные формы актуальны только в течение сессии
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                appState.formData[formKey] = data;
                return data;
            } else {
                sessionStorage.removeItem(FORM_DATA_KEY + formKey);
            }
        }
    } catch (error) {
        console.warn('Error retrieving form data:', error);
    }
    
    return null;
}

/**
 * Очистить данные формы
 */
export function clearFormData(formKey) {
    delete appState.formData[formKey];
    
    try {
        sessionStorage.removeItem(FORM_DATA_KEY + formKey);
    } catch (error) {
        console.warn('Error clearing form data:', error);
    }
}

/**
 * Сохранить ID последнего активного профиля
 */
export function saveActiveProfile(profileId) {
    appState.lastActiveProfile = profileId;
    
    try {
        localStorage.setItem(STATE_KEY + 'activeProfile', profileId);
    } catch (error) {
        console.warn('Error saving active profile:', error);
    }
}

/**
 * Получить ID последнего активного профиля
 */
export function getActiveProfile() {
    try {
        if (appState.lastActiveProfile) {
            return appState.lastActiveProfile;
        }
        
        const profileId = localStorage.getItem(STATE_KEY + 'activeProfile');
        if (profileId) {
            appState.lastActiveProfile = profileId;
            return profileId;
        }
    } catch (error) {
        console.warn('Error retrieving active profile:', error);
    }
    
    return null;
}

/**
 * Сохранить пользовательские предпочтения
 */
export function saveUserPreferences(preferences) {
    appState.userPreferences = { ...appState.userPreferences, ...preferences };
    
    try {
        localStorage.setItem(
            STATE_KEY + 'preferences',
            JSON.stringify(appState.userPreferences)
        );
    } catch (error) {
        console.warn('Error saving preferences:', error);
    }
}

/**
 * Получить пользовательские предпочтения
 */
export function getUserPreferences() {
    try {
        if (Object.keys(appState.userPreferences).length > 0) {
            return appState.userPreferences;
        }
        
        const prefs = localStorage.getItem(STATE_KEY + 'preferences');
        if (prefs) {
            appState.userPreferences = JSON.parse(prefs);
            return appState.userPreferences;
        }
    } catch (error) {
        console.warn('Error retrieving preferences:', error);
    }
    
    return {};
}

/**
 * Очистить всё состояние приложения (при logout)
 */
export function clearAppState() {
    Object.keys(appState).forEach(key => {
        if (typeof appState[key] === 'object') {
            appState[key] = {};
        } else {
            appState[key] = null;
        }
    });
    
    try {
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
            if (key.includes(FILTERS_KEY) || key.includes(FORM_DATA_KEY) || key.includes(ROUTE_HISTORY_KEY)) {
                sessionStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.warn('Error clearing app state:', error);
    }
}

/**
 * Получить полный снимок состояния (для отладки)
 */
export function getAppStateSnapshot() {
    return {
        inMemory: { ...appState },
        sessionStorage: {
            filters: Object.fromEntries(
                Object.keys(sessionStorage)
                    .filter(k => k.startsWith(FILTERS_KEY))
                    .map(k => [k, sessionStorage.getItem(k)])
            ),
            formData: Object.fromEntries(
                Object.keys(sessionStorage)
                    .filter(k => k.startsWith(FORM_DATA_KEY))
                    .map(k => [k, sessionStorage.getItem(k)])
            )
        }
    };
}
