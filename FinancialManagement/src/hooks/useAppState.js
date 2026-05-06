/**
 * React Hooks for App State & Cache Management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    saveCurrentRoute,
    getLastRoute,
    saveFilters,
    getFilters,
    clearFilters as clearStoredFilters,
    saveFormData,
    getFormData,
    clearFormData as clearStoredFormData,
    saveActiveProfile,
    getActiveProfile,
    getUserPreferences,
    saveUserPreferences,
    clearAppState,
} from '../api/appState';

/**
 * Хук для сохранения и восстановления маршрута
 */
export function useRouteNavigation() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Сохранить текущий маршрут
    useEffect(() => {
        saveCurrentRoute(location.pathname);
    }, [location.pathname]);
    
    // Восстановить маршрут при загрузке
    useEffect(() => {
        const lastRoute = getLastRoute();
        // Восстанавливаем только если находимся на /app
        if (lastRoute && lastRoute.startsWith('/app') && location.pathname === '/app') {
            navigate(lastRoute, { replace: true });
        }
    }, []); // Только при монтировании

    return { currentRoute: location.pathname };
}

/**
 * Хук для управления фильтрами на странице
 */
export function usePageFilters(pageKey, initialFilters = {}) {
    const [filters, setFilters] = useState(() => {
        return getFilters(pageKey) || initialFilters;
    });

    const updateFilters = useCallback((newFilters) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        saveFilters(pageKey, updated);
    }, [filters, pageKey]);

    const clearFilters = useCallback(() => {
        setFilters(initialFilters);
        clearStoredFilters(pageKey);
    }, [pageKey, initialFilters]);

    return { filters, updateFilters, clearFilters };
}

/**
 * Хук для сохранения данных формы (для восстановления незаполненной формы)
 */
export function useFormData(formKey, initialData = {}) {
    const [data, setData] = useState(() => {
        return getFormData(formKey) || initialData;
    });

    const updateData = useCallback((newData) => {
        const updated = typeof newData === 'function' ? newData(data) : newData;
        setData(updated);
        saveFormData(formKey, updated);
    }, [data, formKey]);

    const clearData = useCallback(() => {
        setData(initialData);
        clearStoredFormData(formKey);
    }, [formKey, initialData]);

    const submitData = useCallback((callback) => {
        return callback(data).then((result) => {
            clearData();
            return result;
        });
    }, [data, clearData]);

    return { data, updateData, clearData, submitData };
}

/**
 * Хук для управления активным профилем
 */
export function useActiveProfile() {
    const [profileId, setProfileIdState] = useState(() => {
        return getActiveProfile();
    });

    const setProfileId = useCallback((id) => {
        setProfileIdState(id);
        saveActiveProfile(id);
    }, []);

    return { profileId, setProfileId };
}

/**
 * Хук для управления пользовательскими предпочтениями
 */
export function useUserPreferences() {
    const [preferences, setPreferencesState] = useState(() => {
        return getUserPreferences();
    });

    const updatePreferences = useCallback((newPrefs) => {
        const updated = { ...preferences, ...newPrefs };
        setPreferencesState(updated);
        saveUserPreferences(updated);
    }, [preferences]);

    return { preferences, updatePreferences };
}

/**
 * Хук для загрузки данных с кешем и фоновым обновлением
 */
export function useCachedData(fetchFunction, dependencies = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);
    const requestCounterRef = useRef(0);

    const fetch = useCallback(async (forceRefresh = false) => {
        try {
            requestCounterRef.current++;
            const currentRequest = requestCounterRef.current;
            
            setError(null);
            
            // Показываем loading только если это первый запрос
            if (data === null) {
                setLoading(true);
            }
            
            const result = await fetchFunction(forceRefresh);
            
            // Игнорируем результаты старых запросов
            if (currentRequest === requestCounterRef.current && mountedRef.current) {
                setData(result);
                setLoading(false);
            }
            
            return result;
        } catch (err) {
            if (mountedRef.current) {
                setError(err);
                setLoading(false);
            }
            throw err;
        }
    }, [fetchFunction]);

    // Загрузить данные при монтировании или смене зависимостей
    useEffect(() => {
        mountedRef.current = true;
        fetch();

        return () => {
            mountedRef.current = false;
        };
    }, dependencies);

    // Функция для принудительного обновления
    const refetch = useCallback(() => {
        return fetch(true);
    }, [fetch]);

    return { data, loading, error, refetch };
}

/**
 * Хук для debounce функции (например, при вводе фильтра)
 */
export function useDebounce(callback, delay = 300) {
    const timeoutRef = useRef(null);

    const debounced = useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debounced;
}

/**
 * Хук для throttle функции (например, при скролле)
 */
export function useThrottle(callback, interval = 300) {
    const lastRunRef = useRef(Date.now());

    const throttled = useCallback((...args) => {
        const now = Date.now();
        if (now - lastRunRef.current >= interval) {
            lastRunRef.current = now;
            callback(...args);
        }
    }, [callback, interval]);

    return throttled;
}

/**
 * Хук для очистки состояния при logout
 */
export function useAppStateCleanup() {
    return useCallback(() => {
        clearAppState();
    }, []);
}

/**
 * Хук для сохранения прогресса в sessionStorage перед переходом
 */
export function useBeforeUnload(callback) {
    useEffect(() => {
        const handler = (e) => {
            callback();
        };

        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [callback]);
}
