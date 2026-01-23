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
import './AppSidebar.scss';

const menuItems = [
    { id: 'dashboard', label: 'Главная', icon: LayoutDashboard },
    { id: 'accounts', label: 'Счета', icon: Wallet },
    { id: 'transactions', label: 'Операции', icon: ArrowLeftRight },
    { id: 'credits', label: 'Кредиты и долги', icon: CreditCard },
    { id: 'deposits', label: 'Вклады', icon: PiggyBank },
    { id: 'reports', label: 'Отчёты', icon: BarChart3 },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'import', label: 'Импорт/Экспорт', icon: Download },
    { id: 'settings', label: 'Настройки', icon: Settings },
    { id: 'admin', label: 'Админ-панель', icon: Shield },
];

export default function AppSidebar({ currentPage, onNavigate }) {
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
                            const isActive = currentPage === item.id;

                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => {
                                            onNavigate(item.id);
                                        }}
                                        className={`sidebar__item ${isActive ? 'sidebar__item--active' : ''
                                            }`}
                                    >
                                        <Icon className="sidebar__icon" />
                                        <span>{item.label}</span>
                                    </button>
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
                    >
                        <LogOut className="sidebar__icon" />
                        Выйти
                    </button>
                </div>
            </div>
        </aside>
    )
}
