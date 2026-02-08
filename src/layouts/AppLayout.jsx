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
import { useState } from 'react'
import './AppLayout.css'

export default function AppLayout({onLogout}) {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const navigate = useNavigate()

    return (
        <div className="window">
            <AppSidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onNavigate={(path) => navigate(path)}
                onLogout={onLogout}
            />

            <main className="main">
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
