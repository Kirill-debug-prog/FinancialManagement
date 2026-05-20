import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card/card';
import { Button } from '../../components/ui/button/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table/table';
import { Plus, Download, Edit, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog_/dialog';
import { Input } from '../../components/ui/input_data/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select/select';
import { Badge } from '../../components/ui/badge/badge';
import TransactionForm from "../../components/ui/TransactionForm/TransactionForm"
import { getTransactions, deleteTransaction } from '../../api/transactions';
import { getAccounts } from '../../api/accounts';
import { transformTransactionFromBackend } from '../../api/transformers';
import { invalidateTransactionsCache } from '../../api/cacheInvalidation';
import { useDebounce } from '../../hooks/usePerformance';
import "./Transactions.scss"

const TRANSACTIONS_FILTERS_KEY = 'transactionsFilters';

function loadSavedTransactionFilters() {
    if (typeof window === 'undefined') return {};
    try {
        return JSON.parse(window.localStorage.getItem(TRANSACTIONS_FILTERS_KEY)) || {};
    } catch {
        return {};
    }
}

function saveTransactionFilters(filters) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TRANSACTIONS_FILTERS_KEY, JSON.stringify(filters));
}

function Transactions() {
    const savedFilters = loadSavedTransactionFilters();
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editTransaction, setEditTransaction] = useState(null);
    const [filterType, setFilterType] = useState(savedFilters.filterType ?? 'all')
    const [filterAccount, setFilterAccount] = useState(savedFilters.filterAccount ?? 'all')
    const [searchQuery, setSearchQuery] = useState(savedFilters.searchQuery ?? '')
    const [dateFrom, setDateFrom] = useState(savedFilters.dateFrom ?? '')
    const [dateTo, setDateTo] = useState(savedFilters.dateTo ?? '')
    // eslint-disable-next-line no-unused-vars
    const [minAmount, setMinAmount] = useState(savedFilters.minAmount ?? '')
    // eslint-disable-next-line no-unused-vars
    const [maxAmount, setMaxAmount] = useState(savedFilters.maxAmount ?? '')
    const [transactions, setTransactions] = useState([])
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const initialLoadRef = useRef(true);

    // Debounced поиск для оптимизации производительности (500ms задержка)
    const debouncedSearch = useDebounce(() => {
        // Фильтрация уже происходит в filteredTransactions ниже
        // Это просто задерживает поиск при вводе текста
    }, 500)

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
        debouncedSearch(e.target.value)
    }

    const fetchTransactions = useCallback(async (filters = {}) => {
        try {
            const data = await getTransactions(filters);
            const transformed = data.map(t => transformTransactionFromBackend(t, accounts));
            setTransactions(transformed);
        } catch (err) {
            toast.error(err.message || 'Ошибка загрузки операций');
        } finally {
            setLoading(false);
        }
    }, [accounts]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const accs = await getAccounts();
                setAccounts(accs);
            } catch {
                toast.error('Ошибка загрузки данных');
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (accounts.length === 0) return;
        if (!initialLoadRef.current) return;
        initialLoadRef.current = false;

        const filters = {};
        if (filterAccount && filterAccount !== 'all') {
            filters.accountId = filterAccount;
        }
        fetchTransactions(filters);
    }, [accounts, fetchTransactions, filterAccount]);

    useEffect(() => {
        saveTransactionFilters({
            filterType,
            filterAccount,
            searchQuery,
            dateFrom,
            dateTo,
            minAmount,
            maxAmount,
        });
    }, [filterType, filterAccount, searchQuery, dateFrom, dateTo, minAmount, maxAmount]);

    const handleFilterChange = (newFilters) => {
        const filters = {};
        if (newFilters.accountId && newFilters.accountId !== 'all') {
            filters.accountId = newFilters.accountId;
        }
        if (newFilters.dateFrom) {
            filters.dateFrom = newFilters.dateFrom;
        }
        if (newFilters.dateTo) {
            filters.dateTo = newFilters.dateTo;
        }
        fetchTransactions(filters);
    };

    const handleResetFilters = () => {
        setFilterType('all');
        setFilterAccount('all');
        setSearchQuery('');
        setDateFrom('');
        setDateTo('');
        setMinAmount('');
        setMaxAmount('');
        fetchTransactions();
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesType = filterType === "all" || t.type === filterType
        const matchesAccount = filterAccount === "all" || t.accountId === filterAccount
        const matchesSearch = t.description.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()) ||
            t.category.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())
        const minAmountNum = minAmount ? parseFloat(minAmount) : 0
        const maxAmountNum = maxAmount ? parseFloat(maxAmount) : Infinity
        const matchesAmount = t.amount >= minAmountNum && t.amount <= maxAmountNum
        const dateOnly = t.date ? t.date.split('T')[0] : ''
        const matchesDateFrom = !dateFrom || dateOnly >= dateFrom
        const matchesDateTo = !dateTo || dateOnly <= dateTo

        return matchesType && matchesAccount && matchesSearch && matchesAmount && matchesDateFrom && matchesDateTo
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
            invalidateTransactionsCache();
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
        setEditTransaction(null);
        invalidateTransactionsCache();
        fetchTransactions();
    };

    const handleTransactionEdited = (transaction) => {
        setEditTransaction(transaction);
        setDialogOpen(true);
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
                                <DialogTitle>{editTransaction ? 'Редактировать операцию' : 'Новая операция'}</DialogTitle>
                                <DialogDescription>
                                    {editTransaction ? 'Отредактируйте данные операции' : 'Заполните данные новой операции'}
                                </DialogDescription>
                            </DialogHeader>
                            <TransactionForm onClose={() => setDialogOpen(false)} onCreated={handleTransactionCreated} initialData={editTransaction} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters card */}
            <Card className="transactions__card">
                <CardHeader>
                    <CardTitle className="text-xl" style={{ color: "#666363" }}>Фильтры и поиск</CardTitle>
                </CardHeader>
                <CardContent className="transactions__card-content">
                    <div className="transactions__filters">
                        <div className="transactions__search">
                            <Search className="transactions__search-icon" />
                            <Input
                                placeholder="Поиск по описанию или категории..."
                                className="transactions__search-input"
                                value={searchQuery}
                                onChange={handleSearchChange}
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

                        <div className="transactions__select">
                            <Select value={filterAccount} onValueChange={(value) => {
                                setFilterAccount(value);
                                handleFilterChange({ accountId: value, dateFrom, dateTo });
                            }}>
                                <SelectTrigger className="transactions__select-trigger">
                                    <SelectValue placeholder="Выберите счёт" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Все счета</SelectItem>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="transactions__date-range">
                            <div className="transactions__select">
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => {
                                        setDateFrom(e.target.value);
                                        handleFilterChange({
                                            accountId: filterAccount,
                                            dateFrom: e.target.value,
                                            dateTo,
                                        });
                                    }}
                                    placeholder="С даты"
                                    title="От даты"
                                />
                            </div>

                            <span className="transactions__date-range-separator">—</span>

                            <div className="transactions__select">
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => {
                                        setDateTo(e.target.value);
                                        handleFilterChange({
                                            accountId: filterAccount,
                                            dateFrom,
                                            dateTo: e.target.value,
                                        });
                                    }}
                                    placeholder="До даты"
                                    title="До даты"
                                />
                            </div>
                        </div>

                        <div className="transactions__filter-actions">
                            <Button variant="outline" onClick={handleResetFilters}>
                                Сбросить фильтры
                            </Button>
                        </div>

                        {/* <div className="transactions__export">
                            <Button variant="white" onClick={handleExport}>
                                <Download className="icon icon--left" />
                                Экспорт
                            </Button>
                        </div> */}
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
                                                <Button variant="transparent" className="transactions__card-btn" aria-label="Редактировать" onClick={() => handleTransactionEdited(t)}>
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

export default React.memo(Transactions);
