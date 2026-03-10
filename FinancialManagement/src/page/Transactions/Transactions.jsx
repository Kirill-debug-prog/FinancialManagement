import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CradTitle } from '../../components/ui/card/card';
import { Button } from '../../components/ui/button/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table/table';
import { Plus, Filter, Download, Edit, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog_/dialog';
import { Input } from '../../components/ui/input_data/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select/select';
import { Badge } from '../../components/ui/badge/badge';
import TransactionForm from "../../components/ui/TransactionForm/TransactionForm"
import { getTransactions, deleteTransaction } from '../../api/transactions';
import { transformTransactionFromBackend } from '../../api/transformers';
import "./Transactions.scss"

export default function Transactions() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [filterType, setFilterType] = useState('all')
    const [searchQuery, setsearchQuery] = useState('')
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchTransactions = async () => {
        try {
            const data = await getTransactions();
            setTransactions(data.map(t => transformTransactionFromBackend(t)));
        } catch (err) {
            toast.error(err.message || 'Ошибка загрузки операций');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTransactions(); }, []);

    const filteredTransactions = transactions.filter(t => {
        const matchesType = filterType === "all" || t.type === filterType
        const matchesSearch = t.description.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()) ||
            t.category.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())
        return matchesType && matchesSearch
    })

    const getTypeBadge = (type) => {
        if (type === 'income') return <Badge variant="green">Доход</Badge>;
        if (type === 'expense') return <Badge variant="red">Расход</Badge>;
        if (type === 'transfer') return <Badge variant="blue">Перевод</Badge>;
        if (type === 'initialBalance') return <Badge variant="outline">Нач. баланс</Badge>;
        return <Badge>{type}</Badge>;
    };

    const handleDelete = async (id) => {
        try {
            await deleteTransaction(id);
            toast.success("Операция удалена");
            fetchTransactions();
        } catch (err) {
            toast.error(err.message || 'Ошибка удаления');
        }
    }

    const handleExport = () => {
        toast.success('Экспорт начат');
    }

    const handleTransactionCreated = () => {
        setDialogOpen(false);
        fetchTransactions();
    };

    if (loading) {
        return <div className="transactions"><p>Загрузка...</p></div>;
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
                            <TransactionForm onClose={() => setDialogOpen(false)} onCreated={handleTransactionCreated} />
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
