import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CradTitle } from '../../components/ui/card/card';
import { Button } from '../../components/ui/button/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table/table';
import { Plus, Filter, Download, Edit, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog_/dialog';
import { Input } from '../../components/ui/input_data/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select/select';
import { Badge } from '../../components/ui/badge/badge';
import TransactionForm  from "../../components/ui/TransactionForm/TransactionForm"
import "./Transactions.scss"

const transactionsData = [
    { id: 1, date: '2025-10-25', type: 'expense', category: 'Продукты', account: 'Карта Сбербанк', amount: 2500, description: 'Покупка в Пятёрочке' },
    { id: 2, date: '2025-10-24', type: 'income', category: 'Зарплата', account: 'Карта Тинькофф', amount: 85000, description: 'Зарплата за октябрь' },
    { id: 3, date: '2025-10-23', type: 'expense', category: 'Транспорт', account: 'Наличные', amount: 500, description: 'Такси' },
    { id: 4, date: '2025-10-22', type: 'transfer', category: 'Перевод', account: 'Карта Сбербанк', amount: 10000, description: 'Перевод на сбережения' },
    { id: 5, date: '2025-10-21', type: 'expense', category: 'Развлечения', account: 'Карта Тинькофф', amount: 1500, description: 'Кино' },
    { id: 6, date: '2025-10-20', type: 'expense', category: 'Коммунальные услуги', account: 'Карта Сбербанк', amount: 3200, description: 'Электричество' },
    { id: 7, date: '2025-10-19', type: 'expense', category: 'Продукты', account: 'Карта Сбербанк', amount: 1800, description: 'Магнолия' },
    { id: 8, date: '2025-10-18', type: 'income', category: 'Фриланс', account: 'Карта Тинькофф', amount: 15000, description: 'Проект для клиента' },
];

export default function Transactions() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [filterType, setFilterType] = useState('all')
    const [searchQuery, setsearchQuery] = useState('')

    const filteredTransactions = transactionsData.filter(t => {
        const matchesType = filterType === "all" || t.type === filterType
        const matchesSearch = t.description.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()) ||
            t.category.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())
        return matchesType && matchesSearch
    })

    const getTypeBadge = (type) => {
        if (type === 'income') return <Badge variant="green">Доход</Badge>;
        if (type === 'expense') return <Badge variant="red">Расход</Badge>;
        if (type === 'transfer') return <Badge variant="blue">Перевод</Badge>;
        return <Badge>{type}</Badge>;
    };

    const handleDelete = (id) => {
        toast.success("Операция удалена")
    }

    const handleExport = () => {
        toast.success('Экспорт начат');
    }

    return (
        <div className="transactions">
            {/* Header */}
            <div className="transactions__header">
                <div className="transactions__title-block">
                    <h1 className="transactions__title">Операции</h1>
                    <p className="transactions__subtitle">История всех транзакций</p>
                </div>

                <div className="transactions__actions">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="transactions__add-btn">
                                <Plus className="icon icon--left" />
                                Добавить операцию
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="transactions__dialog">
                            <DialogHeader>
                                <DialogTitle>Новая операция</DialogTitle>
                            </DialogHeader>
                            <TransactionForm onClose={() => setDialogOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters card */}
            <Card className="transactions__card">
                <CardHeader>
                    <CradTitle className="text-xl" style={{ color: "#666363" }}>Фильтры и поиск</CradTitle>
                </CardHeader>
                <CardContent className="transactions__card-content">
                    <div className="transactions__filters">
                        <div className="transactions__search">
                            <Search className="transactions__search-icon" />
                            <Input
                                placeholder="Поиск по описанию или категории..."
                                className="transactions__search-input"
                                value={searchQuery}
                                onChange={(e) => setsearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="transactions__select">
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="transactions__select-trigger">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Все операции</SelectItem>
                                    <SelectItem value="income">Доходы</SelectItem>
                                    <SelectItem value="expense">Расходы</SelectItem>
                                    <SelectItem value="transfer">Переводы</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="transactions__export">
                            <Button variant="white" onClick={handleExport}>
                                <Download className="icon icon--left" />
                                Экспорт
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions table */}
            <Card className="transactions__card card-content">
                <CardContent className="transactions__card-content">
                    <div className="transactions__table-wrapper">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Дата</TableHead>
                                    <TableHead>Тип</TableHead>
                                    <TableHead>Категория</TableHead>
                                    <TableHead>Счёт</TableHead>
                                    <TableHead>Описание</TableHead>
                                    <TableHead className="text-right">Сумма</TableHead>
                                    <TableHead className="text-right">Действия</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredTransactions.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell>{new Date(t.date).toLocaleDateString('ru-RU')}</TableCell>
                                        <TableCell>{getTypeBadge(t.type)}</TableCell>
                                        <TableCell>{t.category}</TableCell>
                                        <TableCell>{t.account}</TableCell>
                                        <TableCell>{t.description}</TableCell>
                                        <TableCell className={`transactions__amount ${t.type === 'income' ? 'is--income' : t.type === 'expense' ? 'is--expense' : 'is--transfer'}`}>
                                            {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}
                                            {t.amount.toLocaleString('ru-RU')} ₽
                                        </TableCell>
                                        <TableCell>
                                            <div className="transactions__row-actions">
                                                <Button variant="transparent" className="transactions__card-btn" aria-label="Редактировать">
                                                    <Edit className="icon" />
                                                </Button>
                                                <Button variant="transparent" className="transactions__card-btn" aria-label="Удалить" onClick={() => handleDelete(t.id)}>
                                                    <Trash2 className="icon" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {filteredTransactions.length === 0 && (
                <div className="transactions__empty">Операции не найдены</div>
            )}
        </div>
    );
}