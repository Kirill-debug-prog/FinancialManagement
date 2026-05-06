/**
 * Route State Manager Component
 * Управляет сохранением и восстановлением маршрута при перезагрузке страницы
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveCurrentRoute, getLastRoute } from '../api/appState';
import { isAuthenticated } from '../api/client';

export default function RouteStateManager({ isAuthenticated: isAuth }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Сохраняем текущий маршрут
    useEffect(() => {
        if (isAuth && location.pathname.startsWith('/app')) {
            saveCurrentRoute(location.pathname);
        }
    }, [location.pathname, isAuth]);

    // При загрузке пытаемся восстановить последний маршрут
    useEffect(() => {
        // Только если мы авторизованы и находимся на /app (главная страница приложения)
        if (isAuth && location.pathname === '/app') {
            const lastRoute = getLastRoute();
            if (lastRoute && lastRoute !== '/app' && lastRoute.startsWith('/app')) {
                // Используем replace чтобы не добавлять в history
                navigate(lastRoute, { replace: true });
            }
        }
    }, [isAuth, navigate]); // Зависит только от isAuth

    return null; // Компонент только для логики, не рендерит UI
}
