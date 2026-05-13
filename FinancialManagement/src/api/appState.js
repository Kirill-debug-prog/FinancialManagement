/**
 * Получить активный профиль
 */
export function getActiveProfile() {
    try {
        const data = localStorage.getItem('activeProfile');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.warn('Error getting active profile:', error);
        return null;
    }
}

/**
 * Сохранить активный профиль
 */
export function saveActiveProfile(profile) {
    try {
        localStorage.setItem('activeProfile', JSON.stringify(profile));
    } catch (error) {
        console.warn('Error saving active profile:', error);
    }
}

/**
 * Получить пользовательские предпочтения
 */
export function getUserPreferences() {
    try {
        const data = localStorage.getItem('userPreferences');
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.warn('Error getting preferences:', error);
        return {};
    }
}

/**
 * Сохранить пользовательские предпочтения
 */
export function saveUserPreferences(preferences) {
    try {
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
        console.warn('Error saving preferences:', error);
    }
}

/**
 * Сохранить текущий маршрут
 */
export function saveCurrentRoute(pathname) {
    try {
        localStorage.setItem('lastRoute', pathname);
    } catch (error) {
        console.warn('Error saving current route:', error);
    }
}

/**
 * Получить последний сохраненный маршрут
 */
export function getLastRoute() {
    try {
        return localStorage.getItem('lastRoute');
    } catch (error) {
        console.warn('Error getting last route:', error);
        return null;
    }
}
