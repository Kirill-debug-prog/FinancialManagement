import { useState } from 'react';
import { Card, CardContent, CradTitle, CardHeader } from '../../components/ui/card/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select/select";
import { Button } from '../../components/ui/button/button';
import { Trash2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import './Reports.scss';

const monthlyData = [
    { month: 'Янв', income: 80000, expense: 65000, balance: 15000 },
    { month: 'Фев', income: 85000, expense: 70000, balance: 15000 },
    { month: 'Мар', income: 82000, expense: 68000, balance: 14000 },
    { month: 'Апр', income: 90000, expense: 72000, balance: 18000 },
    { month: 'Май', income: 88000, expense: 75000, balance: 13000 },
    { month: 'Июн', income: 95000, expense: 78000, balance: 17000 },
    { month: 'Июл', income: 92000, expense: 80000, balance: 12000 },
    { month: 'Авг', income: 96000, expense: 76000, balance: 20000 },
    { month: 'Сен', income: 94000, expense: 82000, balance: 12000 },
    { month: 'Окт', income: 98000, expense: 85000, balance: 13000 },
];

const categoryExpenseData = [
    { name: 'Продукты', value: 25000, color: '#ef4444' },
    { name: 'Транспорт', value: 15000, color: '#f59e0b' },
    { name: 'Развлечения', value: 12000, color: '#8b5cf6' },
    { name: 'Коммунальные', value: 18000, color: '#3b82f6' },
    { name: 'Здоровье', value: 8000, color: '#10b981' },
    { name: 'Прочее', value: 7000, color: '#6b7280' },
];

const categoryIncomeData = [
    { name: 'Зарплата', value: 85000, color: '#10b981' },
    { name: 'Фриланс', value: 15000, color: '#3b82f6' },
    { name: 'Инвестиции', value: 8000, color: '#8b5cf6' },
];

export function Reports() {
    const [period, setPeriod] = useState('month')
    const [reportType, setReportType] = useState('all')

    const handleExport = (format) => {
        toast.success(`Экспорт в формате ${format.toUpperCase()} начат`)

    }

    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0)
    const totalExpens = monthlyData.reduce((sum, m) => sum + m.expense, 0)
    const avgMonthlyIncome = totalIncome / monthlyData.length
    const avgMonthlyExpense = totalExpens / monthlyData.length

    return (
        <div className="report">
            <div className="report__header">
                <div>
                    <h1 className="report__title">Отчёты и аналитика</h1>
                    <p className="report__subtitle">Визуализация финансовых данных</p>
                </div>

                <div className="report__action">
                    <Button size="auto" variant="white" onClick={() => handleExport('pdf')}>
                        <Trash2 />
                        PDF
                    </Button>

                    <Button size="auto" variant="white" onClick={() => handleExport('excel')}>
                        <Trash2 />
                        Excel
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="report__filter">
                <CardHeader className="report__filter-header">
                    <CradTitle className="report__filter-title">Фильтры отчётов</CradTitle>
                </CardHeader>

                <CardContent className="report__filter-content">
                    <div className="report__filter-items">
                        <div className="report__filter-item">
                            <Select onValueChange={setPeriod} value={period}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="week">Неделя</SelectItem>
                                    <SelectItem value="month">Месяц</SelectItem>
                                    <SelectItem value="quarter">Квартал</SelectItem>
                                    <SelectItem value="year">Год</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="report__filter-item">
                            <Select onValueChange={setReportType} value={reportType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">Все отчёты</SelectItem>
                                    <SelectItem value="income">Доходы</SelectItem>
                                    <SelectItem value="expense">Расходы</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="report__summary-cards">
                <Card className="report__summery-card">
                    <CardHeader className="card__header">
                        <CradTitle>Общий баланс</CradTitle>
                        <TrendingUp className="icon--green" />
                    </CardHeader>

                    <CardContent>
                        <div className="card__value card__value--green">{totalIncome.toLocaleString('ru-RU')} ₽</div>
                        <p className="card__hint">За выбранный период</p>
                    </CardContent>
                </Card>

                <Card className="report__summery-card">
                    <CardHeader className="card__header">
                        <CradTitle>Общий расход</CradTitle>
                        <TrendingDown className="icon--red" />
                    </CardHeader>
                    <CardContent>
                        <div className="card__value card__value--red">{totalExpens.toLocaleString('ru-RU')} ₽</div>
                        <p className="card__hint">За выбранный период</p>
                    </CardContent>
                </Card>

                <Card className="report__summery-card">
                    <CardHeader className="card__header">
                        <CradTitle>Средний доход</CradTitle>
                        <Calendar className="icon--blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="card__value card__value--blue">{avgMonthlyIncome.toLocaleString('ru-RU')} ₽</div>
                        <p className="card__hint">В месяц</p>
                    </CardContent>
                </Card>

                <Card className="report__summery-card">
                    <CardHeader className="card__header">
                        <CradTitle>Средний расход</CradTitle>
                        <Calendar className="icon--purple" />
                    </CardHeader>
                    <CardContent>
                        <div className="card__value card__value--purple">{avgMonthlyExpense.toLocaleString('ru-RU')} ₽</div>
                        <p className="card__hint">В месяц</p>
                    </CardContent>
                </Card>
            </div>

            {/* Income vs Expense Chart */}
            <Card>
                <CardHeader>
                    <CradTitle>Доходы и расходы по месяцам</CradTitle>
                </CardHeader>

                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value.toLocaleString('ru-RU')} ₽`} />
                            <Legend />
                            <Bar dataKey="income" fill="#10b981" name="Доход" />
                            <Bar dataKey="expense" fill="#ef4444" name="Расход" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="report__diagrams">
                {/* Balance Trend */}
                <Card className="balance-trend">
                    <CardHeader>
                        <CradTitle>Динамика баланса</CradTitle>
                    </CardHeader>

                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value.toLocaleString('ru-Ru')} ₽`} />
                                <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} name="Баланс" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Expense Categories */}
                <Card className="expense-categories">
                    <CardHeader>
                        <CradTitle>Структура расходов</CradTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryExpenseData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryExpenseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toLocaleString('ru-RU')} ₽`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Income Categories */}
                <Card className="income-categories">
                    <CardHeader>
                        <CradTitle>Структура доходов</CradTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryIncomeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryIncomeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toLocaleString('ru-RU')} ₽`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Categories */}
                <Card className="top-categories">
                    <CardHeader>
                        <CradTitle>Топ категорий расходов</CradTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="top-categories__list">
                            {categoryExpenseData.map((cat) => {
                                const total = categoryExpenseData.reduce((sum, c) => sum + c.value, 0);
                                const percent = (cat.value / total) * 100;

                                return (
                                    <div key={cat.name} className="top-categories__item">
                                        <div className="top-categories__header">
                                            <span className="top-categories__name">{cat.name}</span>
                                            <span className="top-categories__value">
                                                {cat.value.toLocaleString('ru-RU')} ₽
                                            </span>
                                        </div>
                                        <div className="top-categories__progress">
                                            <div
                                                className="top-categories__progress-bar"
                                                style={{
                                                    width: `${percent}%`,
                                                    backgroundColor: cat.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}