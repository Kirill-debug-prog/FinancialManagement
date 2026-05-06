import { useEffect } from 'react';
import { isAuthenticated, clearAuth, getToken } from '../api/client';

/**
 * Хук для проверки авторизации при загрузке/обновлении страницы
 * Проверяет валидность токена и очищает данные если токен истек
 * 
 * @returns {object} { isValid, token }
 */
export function useAuthCheck() {
    useEffect(() => {
        const token = getToken();
        const isAuth = isAuthenticated();

        // Логируем статус авторизации для отладки
        console.log('[useAuthCheck] Token exists:', !!token, 'Is valid:', isAuth);

        // Если токен существует но невалиден, очищаем все
        if (token && !isAuth) {
            console.log('[useAuthCheck] Token is invalid, clearing auth');
            clearAuth();
            // Перенаправляем на логин если мы не уже там
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
    }, []);

    return {
        isValid: isAuthenticated(),
        token: getToken()
    };
}
