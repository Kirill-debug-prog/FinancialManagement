import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
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
import { getAccounts } from '../../api/accounts';
import { transformTransactionFromBackend } from '../../api/transformers';
import "./Transactions.scss"

export default function Transactions() {
    const { t } = useTranslation();
    const [dialogOpen, setDialogOpen] = useState(false)
    const [filterType, setFilterType] = useState('all')
    const [filterAccount, setFilterAccount] = useState('all')
    const [searchQuery, setsearchQuery] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [minAmount, setMinAmount] = useState('')
    const [maxAmount, setMaxAmount] = useState('')
    const [transactions, setTransactions] = useState([])
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchTransactions = async (filters = {}) => {
        try {
            const data = await getTransactions(filters);
            setTransactions(data.map(t => transformTransactionFromBackend(t)));
        } catch (err) {
            toast.error(err.message || t('transactions.messages.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const accs = await getAccounts();
                setAccounts(accs);
                setLoading(false);
            } catch (err) {
                toast.error(t('common.message.loadError'));
                setLoading(false);
            }
        };
        loadData();
        fetchTransactions();
    }, [t]);

    const handleFilterChange = (newFilters) => {
        const filters = {};
        if (newFilters.accountId && newFilters.accountId !== 'all') {
            filters.accountId = newFilters.accountId;
        }
        if (newFilters.dateFrom) {
            filters.dateFrom = new Date(newFilters.dateFrom).toISOString();
        }
        if (newFilters.dateTo) {
            filters.dateTo = new Date(newFilters.dateTo).toISOString();
        }
        fetchTransactions(filters);
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesType = filterType === "all" || t.type === filterType
        const matchesAccount = filterAccount === "all" || t.accountId === filterAccount
        const matchesSearch = t.description.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()) ||
            t.category.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())
        const minAmountNum = minAmount ? parseFloat(minAmount) : 0
        const maxAmountNum = maxAmount ? parseFloat(maxAmount) : Infinity
        const matchesAmount = t.amount >= minAmountNum && t.amount <= maxAmountNum

        return matchesType && matchesAccount && matchesSearch && matchesAmount
    })

    const getTypeBadge = (type) => {
        if (type === 'income') return <Badge variant="green">{t('transactions.types.income')}</Badge>;
        if (type === 'expense') return <Badge variant="red">{t('transactions.types.expense')}</Badge>;
        if (type === 'transfer') return <Badge variant="blue">{t('transactions.types.transfer')}</Badge>;
        if (type === 'initialBalance') return <Badge variant="outline">{t('transactions.types.initialBalance')}</Badge>;
        return <Badge>{type}</Badge>;
    };

    const handleDelete = async (id) => {
        try {
            await deleteTransaction(id);
            toast.success(t('transactions.messages.deleted'));
            fetchTransactions();
        } catch (err) {
            toast.error(err.message || t('common.message.error'));
        }
    }

    const handleExport = () => {
        toast.success(t('transactions.messages.exportStarted'));
    }

    const handleTransactionCreated = () => {
        setDialogOpen(false);
        fetchTransactions();
    };

    if (loading) {
        return <div className="transactions"><p>{t('common.message.loading')}</p></div>;
    }

    return (
        <div className="transactions">
            {/* Header */}
            <div className="transactions__header">
                <div className="transactions__title-block">
                    <h1 className="transactions__title">{t('transactions.title')}</h1>
                    <p className="transactions__subtitle">{t('transactions.subtitle')}</p>
                </div>

                <div className="transactions__actions">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="transactions__add-btn">
                                <Plus className="icon icon--left" />
                                {t('transactions.addButton')}
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="transactions__dialog">
                            <DialogHeader>
                                <DialogTitle>{t('transactions.newTransaction')}</DialogTitle>
                            </DialogHeader>
                            <TransactionForm onClose={() => setDialogOpen(false)} onCreated={handleTransactionCreated} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters card */}
            <Card className="transactions__card">
                <CardHeader>
                    <CradTitle className="text-xl" style={{ color: "#666363" }}>{t('transactions.filtersTitle')}</CradTitle>
                </CardHeader>
                <CardContent className="transactions__card-content">
                    <div className="transactions__filters">
                        <div className="transactions__search">
                            <Search className="transactions__search-icon" />
                            <Input
                                placeholder={t('transactions.placeholder.searchDescription')}
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
                                    <SelectItem value="all">{t('transactions.allTransactions')}</SelectItem>
                                    <SelectItem value="income">{t('transactions.types.incomes')}</SelectItem>
                                    <SelectItem value="expense">{t('transactions.types.expenses')}</SelectItem>
                                    <SelectItem value="transfer">{t('transactions.types.transfers')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="transactions__select">
                            <Select value={filterAccount} onValueChange={(value) => {
                                setFilterAccount(value);
                                handleFilterChange({ accountId: value, dateFrom, dateTo });
                            }}>
                                <SelectTrigger className="transactions__select-trigger">
                                    <SelectValue placeholder={t('common.placeholder.selectAccount')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('transactions.allAccounts')}</SelectItem>
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
                                    placeholder={t('common.placeholder.fromDate')}
                                    title={t('common.placeholder.fromDate')}
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
                                    placeholder={t('common.placeholder.toDate')}
                                    title={t('common.placeholder.toDate')}
                                />
                            </div>
                        </div>

                        <div className="transactions__export">
                            <Button variant="white" onClick={handleExport}>
                                <Download className="icon icon--left" />
                                {t('common.button.download')}
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
                                    <TableHead>{t('common.label.date')}</TableHead>
                                    <TableHead>{t('common.label.type')}</TableHead>
                                    <TableHead>{t('common.label.category')}</TableHead>
                                    <TableHead>{t('common.label.account')}</TableHead>
                                    <TableHead>{t('common.label.description')}</TableHead>
                                    <TableHead className="text-right">{t('common.label.amount')}</TableHead>
                                    <TableHead className="text-right">{t('common.label.actions')}</TableHead>
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
                                                <Button variant="transparent" className="transactions__card-btn" aria-label={t('common.button.edit')}>
                                                    <Edit className="icon" />
                                                </Button>
                                                <Button variant="transparent" className="transactions__card-btn" aria-label={t('common.button.delete')} onClick={() => handleDelete(t.id)}>
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
                <div className="transactions__empty">{t('transactions.notFound')}</div>
            )}
        </div>
    );
}
