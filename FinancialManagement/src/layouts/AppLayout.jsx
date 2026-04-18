import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import AppSidebar from '../components/ui/AppSidebar/AppSidebar'
import Dashboard from '../page/DashBoard/DashBoard'
import Accounts from '../page/Accounts/Accounts'
import Transactions from '../page/Transactions/Transactions'
import Credits from '../page/Credits/Credits'
import Deposits from '../page/Deposits/Deposits'
import ImportExport from '../page/ImportExport/ImportExport' 
import { Reports } from '../page/Reports/Reports'
import Setting from '../page/Settings/Setting'
import Help from '../page/Help/Help'
import { useEffect, useState, useRef } from 'react'
import { useLocation } from "react-router-dom";
import { Menu, X } from 'lucide-react'
import './AppLayout.css'

export default function AppLayout({onLogout}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const navigate = useNavigate()

    const mainRef = useRef(null)
    const { pathname } = useLocation()

    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo(0, 0)
        }
    }, [pathname])

    // Закрываем сайдбар при навигации на мобильных
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true)
            } else {
                setSidebarOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        // Инициализация на загрузку
        handleResize()

        return () => window.removeEventListener('resize', handleResize)
    }, [])
    

    return (
        <div className="window">
            {/* Мобильный хедер с бургер-меню */}
            <div className="mobile-header">
                <button
                    className="burger-button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle menu"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <h1 className="mobile-header__title">Финансовый помощник</h1>
                <div style={{ width: 40 }} /> {/* Spacer для центрирования */}
            </div>

            {/* Overlay для мобильных */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <AppSidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onNavigate={() => setSidebarOpen(false)}
                onLogout={onLogout}
            />

            <main ref={mainRef} className="main">
                <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="accounts" element={<Accounts />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="credits" element={<Credits />} />
                    <Route path="deposits" element={<Deposits />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="importExport" element={<ImportExport/>} />
                    <Route path="settings" element={<Setting/>} />
                    <Route path='help' element={<Help />} />

                    <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
            </main>
        </div>
    )
}
