import React, { useState, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ScrollTop from '../components/ScrollTop.jsx'
import RouteStateManager from '../components/RouteStateManager.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import { useAuth } from '../hooks/useAuth.js'

// Lazy loaded компоненты (Code Splitting)
const Auth = lazy(() => import('../page/Login/Auth'))
const FirstTimeWelcome = lazy(() => import('../page/FirstTimeWelcome/FirstTimeWelcome'))
const Onboarding = lazy(() => import('../page/Onboarding/Onboarding').then(m => ({ default: m.Onboarding })))
const OnboardingSuccess = lazy(() => import('../page/OnboardingSuccess/OnboardingSuccess'))
const AppLayout = lazy(() => import('../layouts/AppLayout'))
const WelcomeModal = lazy(() => import('../components/ui/WelcomeModel/WelcomeModal.jsx'))

/**
 * Loading компонент для Suspense fallback
 */
function LoadingFallback() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            <div style={{
                textAlign: 'center'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                }} />
                <p style={{ color: '#6b7280' }}>Загрузка...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    )
}

export default function AppRoutes() {
    // Централизованная логика аутентификации из useAuth хука
    const { isAuth, logout, hasCompletedOnboarding, setHasCompletedOnboarding, handleLogin } = useAuth()
    const [showWelcomeModal, setShowWelcomeModal] = useState(false)
    const [userName, setUserName] = useState('')

    return (
        <>
            <ScrollTop />
            {/* Управление сохранением и восстановлением маршрута */}
            <RouteStateManager isAuthenticated={isAuth && hasCompletedOnboarding} />
            <Suspense fallback={<LoadingFallback />}>
                <Routes>

                    {/* ---------- LOGIN ---------- */}
                    <Route
                        path="/login"
                        element={<Auth onLogin={handleLogin} />}
                    />

                    {/* ---------- ONBOARDING FLOW ---------- */}
                    <Route element={<ProtectedRoute isAllowed={isAuth} />}>

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
                                isAllowed={isAuth && hasCompletedOnboarding}
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
            </Suspense>
        </>
    )
}
