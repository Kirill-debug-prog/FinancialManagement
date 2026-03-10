import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Auth from '../page/Login/Auth'
import FirstTimeWelcome from '../page/FirstTimeWelcome/FirstTimeWelcome'
import { Onboarding } from '../page/Onboarding/Onboarding'
import OnboardingSuccess from '../page/OnboardingSuccess/OnboardingSuccess'
import AppLayout from '../layouts/AppLayout'
import ProtectedRoute from './ProtectedRoute.jsx'
import WelcomeModal from '../components/ui/WelcomeModel/WelcomeModal.jsx'
import { isAuthenticated as checkAuth, clearAuth, getActiveProfileId } from '../api/client'

export default function Router() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
    const [showWelcomeModal, setShowWelcomeModal] = useState(false)
    const [userName, setUserName] = useState('')

    useEffect(() => {
        if (checkAuth()) {
            setIsAuthenticated(true)
            if (getActiveProfileId()) {
                setHasCompletedOnboarding(true)
            }
        }
    }, [])

    const handleLogin = (isNewUser) => {
        setIsAuthenticated(true)
        localStorage.setItem('auth', 'true')

        if (!isNewUser) {
            setHasCompletedOnboarding(true)
            localStorage.setItem('onboarding', 'true')
        }
    }

    const logout = () => {
        setIsAuthenticated(false)
        setHasCompletedOnboarding(false)
        clearAuth()
    }

    return (
        <BrowserRouter>
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
