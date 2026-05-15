import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, setToken, clearAuth, getActiveProfileId, setActiveProfileId, isAuthenticated } from '../api/client';

/**
 * Хок для управления авторизацией
 */
export function useAuth() {
    const [isAuth, setIsAuth] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
        localStorage.getItem('onboardingCompleted') === 'true'
    );
    const navigate = useNavigate();

    // Инициализация при загрузке
    useEffect(() => {
        // Проверяем не только наличие токена, но и его валидность
        const token = getToken();
        
        if (token && isAuthenticated()) {
            setIsAuth(true);
            console.log('[useAuth] Token is valid, user authenticated');
        } else {
            // Если токен истек или невалиден, очищаем
            if (token) {
                console.log('[useAuth] Token exists but invalid, clearing auth');
                clearAuth();
            }
            setIsAuth(false);
        }
        
        // Завершаем загрузку после проверки
        setIsLoading(false);
    }, []);

    const handleLogin = useCallback((needsOnboarding) => {
        setIsAuth(true);
        if (!needsOnboarding) {
            setHasCompletedOnboarding(true);
            localStorage.setItem('onboardingCompleted', 'true');
        }
    }, []);

    const logout = useCallback(() => {
        clearAuth();
        setIsAuth(false);
        setHasCompletedOnboarding(false);
        localStorage.removeItem('onboardingCompleted');
        navigate('/login', { replace: true });
    }, [navigate]);

    return {
        isAuth,
        isLoading,
        hasCompletedOnboarding,
        handleLogin,
        logout,
        setHasCompletedOnboarding
    };
}

/**
 * Hook для проверки авторизации при защищенных маршрутах
 */
export function useRequireAuth() {
    const { isAuth, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !isAuth) {
            navigate('/login', { replace: true });
        }
    }, [isAuth, isLoading, navigate]);

    return { isAuth, isLoading };
}

/**
 * Hook для защиты маршрутов
 */
export function useProtectedRoute(isAllowed) {
    const navigate = useNavigate();

    useEffect(() => {
        if (isAllowed === false) {
            navigate('/login', { replace: true });
        }
    }, [isAllowed, navigate]);

    return isAllowed;
}
