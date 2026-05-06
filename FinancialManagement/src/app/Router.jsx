import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Auth from '../page/Login/Auth'
import FirstTimeWelcome from '../page/FirstTimeWelcome/FirstTimeWelcome'
import { Onboarding } from '../page/Onboarding/Onboarding'
import OnboardingSuccess from '../page/OnboardingSuccess/OnboardingSuccess'
import AppLayout from '../layouts/AppLayout'
import ProtectedRoute from './ProtectedRoute.jsx'
import WelcomeModal from '../components/ui/WelcomeModel/WelcomeModal.jsx'
import { isAuthenticated as checkAuth, clearAuth, getActiveProfileId, getToken } from '../api/client'
import ScrollTop from '../components/ScrollTop.jsx'
import RouteStateManager from '../components/RouteStateManager.jsx'
import { clearAllCache } from '../api/cache'
import { clearAppState } from '../api/appState'

export default function Router() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
    const [showWelcomeModal, setShowWelcomeModal] = useState(false)
    const [userName, setUserName] = useState('')

    useEffect(() => {
        // Проверяем авторизацию при загрузке приложения
        const token = getToken();
        const isAuth = checkAuth();
        const hasProfile = getActiveProfileId();
        const hasOnboarding = localStorage.getItem('onboarding') === 'true';
        const hasAuth = localStorage.getItem('auth') === 'true';
        
        console.log('[Router Init] token:', !!token, 'isAuth:', isAuth, 'hasProfile:', hasProfile, 'hasOnboarding:', hasOnboarding, 'hasAuth:', hasAuth);
        
        // Если токен существует но невалиден (истек), очищаем все
        if (token && !isAuth) {
            console.log('[Router Init] Token expired, clearing auth');
            clearAuth();
            setIsAuthenticated(false);
            setHasCompletedOnboarding(false);
            return;
        }
        
        // Если токен валиден, восстанавливаем состояние
        if (isAuth || hasAuth) {
            setIsAuthenticated(true);
            if (hasProfile && hasOnboarding) {
                setHasCompletedOnboarding(true);
            }
        } else {
            setIsAuthenticated(false);
            setHasCompletedOnboarding(false);
        }
    }, [])

    const handleLogin = (isNewUser) => {
        setIsAuthenticated(true)
        
        // Всегда сохраняем что пользователь авторизирован
        localStorage.setItem('auth', 'true')
        
        // Если не новый пользователь, то он уже прошел онбординг
        if (!isNewUser) {
            setHasCompletedOnboarding(true)
            localStorage.setItem('onboarding', 'true')
        }
    }

    const logout = () => {
        console.log('[Router] Logout called');
        setIsAuthenticated(false);
        setHasCompletedOnboarding(false);
        setShowWelcomeModal(false);
        
        // Очистить все данные приложения при выходе
        clearAuth();
        clearAllCache();
        clearAppState();
    }

    return (
        <BrowserRouter>
            <ScrollTop />
            {/* Управление сохранением и восстановлением маршрута */}
            <RouteStateManager isAuthenticated={isAuthenticated && hasCompletedOnboarding} />
            <Routes>

                {/* ---------- LOGIN ---------- */}
                <Route
                    path="/login"
                    element={<Auth onLogin={handleLogin} />}
                />

                {/* ---------- ONBOARDING FLOW ---------- */}
                <Route element={<ProtectedRoute isAllowed={isAuthenticated} />}>

                    <Route path="/welcome" element={<FirstTimeWelcome />} />

                    <Route
                        path="/onboarding"
                        element={<Onboarding onComplete={(name) => setUserName(name)} />}
                    />

                    <Route
                        path="/onboarding-success"
                        element={
                            <OnboardingSuccess
                                userName={userName || 'Пользователь'}
                                onContinue={() => {
                                    setHasCompletedOnboarding(true)
                                    localStorage.setItem('onboarding', 'true')
                                    setShowWelcomeModal(true)
                                }}
                            />
                        }
                    />
                </Route>

                {/* ---------- APP ---------- */}
                <Route
                    element={
                        <ProtectedRoute
                            isAllowed={isAuthenticated && hasCompletedOnboarding}
                        />
                    }
                >
                    <Route
                        path="/app/*"
                        element={
                            <>
                                <AppLayout onLogout={logout} />
                                {showWelcomeModal && (
                                    <WelcomeModal
                                        userName={userName || 'Пользователь'}
                                        onClose={() => setShowWelcomeModal(false)}
                                    />
                                )}
                            </>
                        }
                    />
                </Route>

                {/* ---------- FALLBACK ---------- */}
                <Route path="*" element={<Navigate to="/login" />} />

            </Routes>
        </BrowserRouter>
    )
}
