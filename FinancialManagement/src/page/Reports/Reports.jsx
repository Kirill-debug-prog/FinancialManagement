import { useState, useEffect } from 'react';
import { Card, CardContent, CradTitle, CardHeader } from '../../components/ui/card/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select/select";
import { Button } from '../../components/ui/button/button';
import { Trash2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { getMonthlyReport, getCategoryReport } from '../../api/reports';
import './Reports.scss';

export function Reports() {
    const [period, setPeriod] = useState('year')
    const [reportType, setReportType] = useState('all')
    const [monthlyData, setMonthlyData] = useState([])
    const [categoryExpenseData, setCategoryExpenseData] = useState([])
    const [categoryIncomeData, setCategoryIncomeData] = useState([])
    const [loading, setLoading] = useState(true)

    const getPeriodDates = (selectedPeriod) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (selectedPeriod) {
            case 'month': {
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                return { dateFrom: monthStart.toISOString(), dateTo: today.toISOString() };
            }
            case 'quarter': {
                const quarter = Math.floor(today.getMonth() / 3);
                const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
                return { dateFrom: quarterStart.toISOString(), dateTo: today.toISOString() };
            }
            case 'year': {
                const yearStart = new Date(today.getFullYear(), 0, 1);
                return { dateFrom: yearStart.toISOString(), dateTo: today.toISOString() };
            }
            default:
                return { dateFrom: null, dateTo: null };
        }
    };

    const fetchData = async (selectedPeriod = period, selectedType = reportType) => {
        setLoading(true);
        try {
            const year = new Date().getFullYear();
            const { dateFrom, dateTo } = getPeriodDates(selectedPeriod);
            
            // Получаем данные по месяцам
            const monthly = await getMonthlyReport(year);
            
            // Фильтруем по периоду если нужно
            const filteredMonthly = selectedPeriod === 'year' 
                ? monthly 
                : monthly.filter(m => {
                    const monthDate = new Date(m.month);
                    return monthDate >= new Date(dateFrom) && monthDate <= new Date(dateTo);
                });
            
            // Получаем данные по категориям
            let expCats = [];
            let incCats = [];
            
            if (selectedType === 'all' || selectedType === 'expense') {
                expCats = await getCategoryReport('Expense', dateFrom, dateTo);
            }
            if (selectedType === 'all' || selectedType === 'income') {
                incCats = await getCategoryReport('Income', dateFrom, dateTo);
            }
            
            setMonthlyData(filteredMonthly);
            setCategoryExpenseData(expCats);
            setCategoryIncomeData(incCats);
        } catch (err) {
            toast.error(err.message || 'Ошибка загрузки отчётов');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(period, reportType); 
    }, [period, reportType]);

    const handleExport = (format) => {
        toast.success(`Экспорт в формате ${format.toUpperCase()} начат`)
    }

    const totalIncome = monthlyData.reduce((sum, m) => sum + (m.income || 0), 0)
    const totalExpens = monthlyData.reduce((sum, m) => sum + (m.expense || 0), 0)
    const avgMonthlyIncome = monthlyData.length ? totalIncome / monthlyData.length : 0
    const avgMonthlyExpense = monthlyData.length ? totalExpens / monthlyData.length : 0

    // Фильтруем диаграммы в зависимости от выбранного типа отчета
    const showExpenseChart = reportType === 'all' || reportType === 'expense'
    const showIncomeChart = reportType === 'all' || reportType === 'income'

    if (loading) {
        return <div className="report"><p>Загрузка...</p></div>;
    }

    return (
        <div className="report">
            <div className="report__header">
                <div>
                    <h1 className="report__title">Отчёты и аналитика</h1>
                    <p className="report__subtitle">Визуализация финансовых данных</p>
                </div>

                <div className="report__action">
                    <Button size="auto" variant="white" onClick={() => handleExport('pdf')}>
                        PDF
                    </Button>

                    <Button size="auto" variant="white" onClick={() => handleExport('excel')}>
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
                        <CradTitle>Общий доход</CradTitle>
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
                        <div className="card__value card__value--blue">{Math.round(avgMonthlyIncome).toLocaleString('ru-RU')} ₽</div>
                        <p className="card__hint">В месяц</p>
                    </CardContent>
                </Card>

                <Card className="report__summery-card">
                    <CardHeader className="card__header">
                        <CradTitle>Средний расход</CradTitle>
                        <Calendar className="icon--purple" />
                    </CardHeader>
                    <CardContent>
                        <div className="card__value card__value--purple">{Math.round(avgMonthlyExpense).toLocaleString('ru-RU')} ₽</div>
                        <p className="card__hint">В месяц</p>
                    </CardContent>
                </Card>
            </div>

            {/* Income vs Expense Chart */}
            {monthlyData.length > 0 && (
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
                                {(reportType === 'all' || reportType === 'income') && <Bar dataKey="income" fill="#10b981" name="Доход" />}
                                {(reportType === 'all' || reportType === 'expense') && <Bar dataKey="expense" fill="#ef4444" name="Расход" />}
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            <div className="report__diagrams">
                {/* Balance Trend */}
                {monthlyData.length > 0 && (
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
                                    <Tooltip formatter={(value) => `${value.toLocaleString('ru-RU')} ₽`} />
                                    <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} name="Баланс" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Expense Categories */}
                {showExpenseChart && categoryExpenseData.length > 0 && (
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
                )}

                {/* Income Categories */}
                {showIncomeChart && categoryIncomeData.length > 0 && (
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
                )}

                {/* Top Categories */}
                {showExpenseChart && categoryExpenseData.length > 0 && (
                    <Card className="top-categories">
                        <CardHeader>
                            <CradTitle>Топ категорий расходов</CradTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="top-categories__list">
                                {categoryExpenseData.map((cat) => {
                                    const total = categoryExpenseData.reduce((sum, c) => sum + c.value, 0);
                                    const percent = total ? (cat.value / total) * 100 : 0;

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
                )}
            </div>

            {monthlyData.length === 0 && categoryExpenseData.length === 0 && (
                <Card>
                    <CardContent>
                        <p style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                            Нет данных для отчётов. Добавьте транзакции, чтобы увидеть аналитику.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
