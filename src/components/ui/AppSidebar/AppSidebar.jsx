import {
    LayoutDashboard,
    Wallet,
    ArrowLeftRight,
    CreditCard,
    PiggyBank,
    BarChart3,
    Settings,
    Bell,
    Download,
    Shield,
    LogOut,
    HelpCircle,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom'
import './AppSidebar.scss';

const menuItems = [
    { route: '/app/dashboard', label: 'Главная', icon: LayoutDashboard },
    { route: '/app/accounts', label: 'Счета', icon: Wallet },
    { route: '/app/transactions', label: 'Операции', icon: ArrowLeftRight },
    { route: '/app/credits', label: 'Кредиты и долги', icon: CreditCard },
    { route: '/app/deposits', label: 'Вклады', icon: PiggyBank },
    { route: '/app/reports', label: 'Отчёты', icon: BarChart3 },
    { route: '/app/notifications', label: 'Уведомления', icon: Bell },
    { route: '/app/import', label: 'Импорт/Экспорт', icon: Download },
    { route: '/app/settings', label: 'Настройки', icon: Settings },
    { route: '/app/admin', label: 'Админ-панель', icon: Shield },
];

export default function AppSidebar({onLogout}) {

    const navigate = useNavigate();

    return (
        <aside className="sidebar">
            <div className="sidebar__container">
                <div className="sidebar__header">
                    <h1 className="sidebar__title">Финансовый помощник</h1>
                </div>

                <nav className="sidebar__nav">
                    <ul className="sidebar__menu">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <li key={item.route}>
                                    <NavLink
                                        to={item.route}
                                        className={({ isActive }) =>
                                            `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
                                        }
                                    >
                                        <Icon className="sidebar__icon" />
                                        <span>{item.label}</span>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="sidebar__footer">
                    <button
                        className="sidebar__help"
                    >
                        <HelpCircle className="sidebar__icon" />
                        Помощь
                    </button>
                    <button
                        className="sidebar__logout"
                        onClick={() => {
                            onLogout()
                            navigate('/login')
                        }}
                    >
                        <LogOut className="sidebar__icon" />
                        Выйти
                    </button>
                </div>
            </div>
        </aside>
    )
}
