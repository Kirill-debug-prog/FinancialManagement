import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog_/dialog';
import TransactionForm from '../../components/ui/TransactionForm/TransactionForm';
import { getDashboardData } from '../../api/dashboard';
import { toast } from 'sonner';
import './Dashboard.scss';

export default function Dashboard() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const data = await getDashboardData();
            setDashboardData(data);
        } catch (err) {
            toast.error(err.message || 'Ошибка загрузки данных дашборда');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleTransactionCreated = () => {
        setDialogOpen(false);
        fetchData();
    };

    const totalIncome = dashboardData?.totalIncome ?? 0;
    const totalExpense = dashboardData?.totalExpense ?? 0;
    const totalBalance = dashboardData?.totalBalance ?? 0;
    const categoryData = dashboardData?.categoryExpenses ?? [];
    const incomeExpenseData = dashboardData?.monthlyData ?? [];

    if (loading) {
        return <div className="dashboard"><p>Загрузка...</p></div>;
    }

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
                        <TransactionForm onClose={() => setDialogOpen(false)} onCreated={handleTransactionCreated} />
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
                    <div className="card__value card__value--blue">{totalBalance.toLocaleString('ru-RU')} ₽</div>
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
                    {categoryData.length > 0 ? (
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
                    ) : (
                        <p style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>Нет данных за текущий месяц</p>
                    )}
                </div>

                <div className="card">
                    <h3 className="card__title">Доходы и расходы</h3>
                    {incomeExpenseData.length > 0 ? (
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
                    ) : (
                        <p style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>Нет данных</p>
                    )}
                </div>
            </div>
        </div>
    );
}
