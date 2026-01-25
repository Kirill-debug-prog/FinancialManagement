import { useState } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog_/dialog';
import TransactionForm from '../../components/ui/TransactionForm/TransactionForm';
import './Dashboard.scss';

const categoryData = [
    { name: 'Продукты', value: 25000, color: '#ef4444' },
    { name: 'Транспорт', value: 15000, color: '#f59e0b' },
    { name: 'Развлечения', value: 12000, color: '#8b5cf6' },
    { name: 'Коммунальные', value: 18000, color: '#3b82f6' },
    { name: 'Прочее', value: 8000, color: '#6b7280' },
];

const incomeExpenseData = [
    { month: 'Янв', income: 80000, expense: 65000 },
    { month: 'Фев', income: 85000, expense: 70000 },
    { month: 'Мар', income: 82000, expense: 68000 },
    { month: 'Апр', income: 90000, expense: 72000 },
    { month: 'Май', income: 88000, expense: 75000 },
    { month: 'Июн', income: 95000, expense: 78000 },
];

const upcomingPayments = [
    { id: 1, name: 'Аренда квартиры', amount: 30000, date: '2025-11-01', category: 'Жильё' },
    { id: 2, name: 'Кредит', amount: 15000, date: '2025-11-05', category: 'Кредиты' },
    { id: 3, name: 'Интернет', amount: 800, date: '2025-11-10', category: 'Коммунальные' },
    { id: 4, name: 'Страховка', amount: 5000, date: '2025-11-15', category: 'Страхование' },
];

export default function Dashboard() {
    const [dialogOpen, setDialogOpen] = useState(false);

    const totalIncome = 95000;
    const totalExpense = 78000;
    const balance = totalIncome - totalExpense;

    return (
        <div className="dashboard">
            {/* Header */}
            <div className="dashboard__header">
                <div>
                    <h1 className="dashboard__title">Главная панель</h1>
                    <p className="dashboard__subtitle">Обзор ваших финансов</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <button className="dashboard__add-btn">
                            <Plus size={18} />
                            Добавить операцию
                        </button>
                    </DialogTrigger>

                    <DialogContent aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>Новая операция</DialogTitle>
                        </DialogHeader>
                        <TransactionForm onClose={() => setDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Balance cards */}
            <div className="dashboard__cards">
                <div className="card">
                    <div className="card__header">
                        <span>Общий баланс</span>
                        <Wallet className="icon--blue" />
                    </div>
                    <div className="card__value card__value--blue">{balance.toLocaleString('ru-RU')} ₽</div>
                    <p className="card__hint">На всех счетах</p>
                </div>

                <div className="card">
                    <div className="card__header">
                        <span>Доходы</span>
                        <TrendingUp className="icon--green" />
                    </div>
                    <div className="card__value card__value--green">
                        {totalIncome.toLocaleString('ru-RU')} ₽
                    </div>
                    <p className="card__hint">За месяц</p>
                </div>

                <div className="card">
                    <div className="card__header">
                        <span>Расходы</span>
                        <TrendingDown className="icon--red" />
                    </div>
                    <div className="card__value card__value--red">
                        {totalExpense.toLocaleString('ru-RU')} ₽
                    </div>
                    <p className="card__hint">За месяц</p>
                </div>
            </div>

            {/* Charts */}
            <div className="dashboard__charts">
                <div className="card">
                    <h3 className="card__title">Расходы по категориям</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value">
                                {categoryData.map((item, i) => (
                                    <Cell key={i} fill={item.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <h3 className="card__title">Доходы и расходы</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={incomeExpenseData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="income" stroke="#10b981" name="Доход" strokeWidth={2} />
                            <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Расход" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Upcoming payments */}
            <div className="card">
                <div className="card__header">
                    <h3>Ближайшие платежи</h3>
                    <Calendar />
                </div>

                <div className="payments">
                    {upcomingPayments.map(p => (
                        <div key={p.id} className="payment">
                            <div>
                                <h4 className="payment__name">{p.name}</h4>
                                <span className="payment__category">{p.category}</span>
                            </div>
                            <div className="payment__right">
                                <h4>{p.amount.toLocaleString('ru-RU')} ₽</h4>
                                <span>{new Date(p.date).toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
