import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog_/dialog';
import { Plus, CreditCard, Wallet as WalletIcon, DollarSign, Euro, Edit, Trash2, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CradTitle } from '../../components/ui/card/card'
import { Button } from '../../components/ui/button/button';
import { Label } from '../../components/ui/label/label';
import { Input } from '../../components/ui/input_data/input';
import { Badge } from '../../components/ui/badge/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select/select";
import { getAccounts, createAccount, deleteAccount, updateAccount } from '../../api/accounts';
import { getCurrencies } from '../../api/currencies';
import { transformAccountFromBackend, getCurrencySymbol } from '../../api/transformers';
import './Accounts.scss'

export default function Accounts() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [accountName, setAccountName] = useState('')
    const [accountType, setAccountType] = useState('')
    const [currency, setCurrency] = useState('RUB')
    const [intialBalance, setInitialBalance] = useState('')

    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingAccountId, setEditingAccountId] = useState(null)
    const [editForm, setEditForm] = useState({ name: '', type: '' })

    const [transferDialogOpen, setTransferDialogOpen] = useState(false)
    const [transferForm, setTransferForm] = useState({ fromAccountId: null, toAccountId: null, amount: '' })

    const [accounts, setAccounts] = useState([])
    const [currencies, setCurrencies] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const [accs, currs] = await Promise.all([getAccounts(), getCurrencies()]);
            setAccounts(accs.map((a, i) => transformAccountFromBackend(a, i)));
            setCurrencies(currs);
        } catch (err) {
            toast.error(err.message || 'Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const totlalBalance = accounts
        .filter(account => account.currency === 'RUB')
        .reduce((total, account) => total + account.balance, 0)

    const handleAddAccount = async () => {
        if (!accountName || !accountType) {
            toast.error('Заполните обязательные поля')
            return
        }
        try {
            const curr = currencies.find(c => c.code === currency);
            if (!curr) {
                toast.error('Валюта не найдена');
                return;
            }
            const iconMap = { card: '💳', cash: '💵', savings: '🏦', investment: '📈' };
            await createAccount({
                name: accountName,
                icon: iconMap[accountType] || '💳',
                sortOrder: accounts.length,
                currencyId: curr.id,
                initialBalance: parseFloat(intialBalance) || 0,
                initialBalanceDate: new Date().toISOString(),
            });
            toast.success('Счёт успешно добавлен')
            setDialogOpen(false)
            setAccountName('')
            setAccountType('')
            setCurrency('RUB')
            setInitialBalance('')
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка создания счёта');
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Вы уверены, что хотите удалить этот счёт? Это действие нельзя отменить.')) {
            return;
        }
        try {
            await deleteAccount(id);
            toast.success('Счёт удалён');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка удаления');
        }
    };

    const handleOpenEditDialog = (account) => {
        setEditingAccountId(account.id);
        setEditForm({
            name: account.name,
            type: account.type
        });
        setEditDialogOpen(true);
    };

    const handleSaveEditAccount = async () => {
        if (!editForm.name) {
            toast.error('Заполните название счёта');
            return;
        }
        try {
            await updateAccount(editingAccountId, {
                name: editForm.name,
                type: editForm.type
            });
            toast.success('Счёт успешно обновлён');
            setEditDialogOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка обновления счёта');
        }
    };

    const handleOpenTransferDialog = (accountId) => {
        setTransferForm({
            fromAccountId: accountId,
            toAccountId: null,
            amount: ''
        });
        setTransferDialogOpen(true);
    };

    const handleSaveTransfer = async () => {
        if (!transferForm.toAccountId || !transferForm.amount) {
            toast.error('Заполните все поля');
            return;
        }

        const amount = parseFloat(transferForm.amount);
        if (amount <= 0) {
            toast.error('Сумма должна быть больше нуля');
            return;
        }

        const fromAccount = accounts.find(a => a.id === transferForm.fromAccountId);
        if (!fromAccount || fromAccount.balance < amount) {
            toast.error('Недостаточно средств на счёте');
            return;
        }

        try {
            // Обновляем счёт-источник
            await updateAccount(transferForm.fromAccountId, {
                name: fromAccount.name,
                type: fromAccount.type,
                balance: fromAccount.balance - amount
            });

            // Обновляем счёт-получатель
            const toAccount = accounts.find(a => a.id === transferForm.toAccountId);
            await updateAccount(transferForm.toAccountId, {
                name: toAccount.name,
                type: toAccount.type,
                balance: toAccount.balance + amount
            });

            toast.success(`Перевод ${amount.toLocaleString()} ₽ выполнен успешно`);
            setTransferDialogOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка при переводе');
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'card':
                return 'Карта'
            case 'cash':
                return 'Наличные'
            case 'savings':
                return 'Сбережения'
            default:
                return ''
        }
    }

    if (loading) {
        return <div className="accounts"><p>Загрузка...</p></div>;
    }

    return (
        <div className="accounts">
            <div className="accounts__header">
                <div>
                    <h1 className="accounts__title">Счета и кошельки</h1>
                    <p className="accounts__subtitle">Управление вашими счетами</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <button className="accounts__add-btn">
                            <Plus size={18} />
                            Добавить счёт
                        </button>
                    </DialogTrigger>

                    <DialogContent aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>Новый счёт</DialogTitle>
                        </DialogHeader>
                        <div className="account__form">
                            <div className="account__form-field">
                                <Label htmlFor="account-name">Название счёта *</Label>
                                <Input
                                    id="account-name"
                                    placeholder="Например: Основная карта"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                />

                                <div className="account__from-field">
                                    <Label htmlFor="account-type">Тип счёта *</Label>
                                    <Select value={accountType} onValueChange={setAccountType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Выберите тип" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="card">Банковская карта</SelectItem>
                                            <SelectItem value="cash">Наличные</SelectItem>
                                            <SelectItem value="savings">Сберегательный счёт</SelectItem>
                                            <SelectItem value="investment">Инвестиционный счёт</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="account__form-row">
                                    <div className="account__form-field">
                                        <Label htmlFor="currency">Валюта</Label>
                                        <Select value={currency} onValueChange={setCurrency}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currencies.map(c => (
                                                    <SelectItem key={c.id} value={c.code}>
                                                        {c.code} ({c.shortName})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="account__form-field">
                                        <Label htmlFor="initial-balance">Начальный баланс</Label>
                                        <Input
                                            id="initial-balance"
                                            type="number"
                                            placeholder="0"
                                            value={intialBalance}
                                            onChange={(e) => setInitialBalance(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="account__form-buttons">
                                    <Button onClick={handleAddAccount} className="flex-1">
                                        Добавить
                                    </Button>
                                    <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                                        Отмена
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="accounts__balance">
                <CardHeader>
                    <CradTitle className="accounts__balance-title text-xl">Общий баланс</CradTitle>
                </CardHeader>
                <CardContent className="accounts__balance-content">
                    <p className="accounts__balance-amount font-semibold text-xl">{totlalBalance.toLocaleString()} ₽</p>
                    <p className="accounts__balance-subtitle text-lg">Сумма по всем счетам в рублях</p>
                </CardContent>
            </Card>

            {/* Accounts List */}
            <div className="accounts__list">
                {accounts.map((account) => {
                    const Icon = account.icon;
                    return (
                        <Card key={account.id} className="accounts__card">
                            <CardHeader>
                                <div className="accounts__card-header">
                                    <div className="accounts__icon-wrapper" style={{ backgroundColor: account.color }}>
                                        <Icon size={30} />
                                    </div>
                                    <div className="header-text">
                                        <CradTitle className="accounts__card-title text-xl font-normal">{account.name}</CradTitle>
                                        <Badge className="accounts__card-type text-base font-semibold">{getTypeLabel(account.type)}</Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="accounts__card-content">
                                <div className="accounts__card-balance text-xl">
                                    {account.balance.toLocaleString()} {getCurrencySymbol(account.currency)}
                                </div>
                                <div className="accounts__card-actions">
                                    <Button variant="white" className="accounts__card-action-btn" onClick={() => handleOpenEditDialog(account)}>
                                        <Edit size={16} />
                                        Изменить
                                    </Button>
                                    <Button variant="white" className="accounts__card-action-btn" onClick={() => handleOpenTransferDialog(account.id)}>
                                        <ArrowRightLeft size={16} />
                                        Перевести
                                    </Button>
                                    <Button variant="white" className="accounts__card-action-btn" onClick={() => handleDelete(account.id)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {accounts.length === 0 && (
                <div className="accounts__empty-message">
                    Нет счетов. Добавьте первый счёт!
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Редактировать счёт</DialogTitle>
                    </DialogHeader>
                    <div className="account__form">
                        <div className="account__form-field">
                            <Label htmlFor="edit-account-name">Название счёта</Label>
                            <Input
                                id="edit-account-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>
                        <div className="account__form-field">
                            <Label htmlFor="edit-account-type">Тип счёта</Label>
                            <Select value={editForm.type} onValueChange={(value) => setEditForm({ ...editForm, type: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите тип" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="card">Банковская карта</SelectItem>
                                    <SelectItem value="cash">Наличные</SelectItem>
                                    <SelectItem value="savings">Сберегательный счёт</SelectItem>
                                    <SelectItem value="investment">Инвестиционный счёт</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="account__form-buttons">
                            <Button onClick={handleSaveEditAccount} className="flex-1">
                                Сохранить
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setEditDialogOpen(false)}>
                                Отмена
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Transfer Dialog */}
            <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Перевод между счётами</DialogTitle>
                    </DialogHeader>
                    <div className="account__form">
                        <div className="account__form-field">
                            <Label>Со счёта</Label>
                            <div className="dialog-info-box">
                                <p className="dialog-info-box__text">
                                    {accounts.find(a => a.id === transferForm.fromAccountId)?.name}
                                </p>
                                <p className="dialog-info-box__subtitle">
                                    Баланс: {accounts.find(a => a.id === transferForm.fromAccountId)?.balance.toLocaleString()} ₽
                                </p>
                            </div>
                        </div>

                        <div className="account__form-field">
                            <Label htmlFor="transfer-to-account">На счёт</Label>
                            <Select value={transferForm.toAccountId || ''} onValueChange={(value) => setTransferForm({ ...transferForm, toAccountId: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите счёт" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts
                                        .filter(a => a.id !== transferForm.fromAccountId)
                                        .map(account => (
                                            <SelectItem key={account.id} value={account.id}>
                                                {account.name} ({account.balance.toLocaleString()} ₽)
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="account__form-field">
                            <Label htmlFor="transfer-amount">Сумма (₽)</Label>
                            <Input
                                id="transfer-amount"
                                type="number"
                                placeholder="0"
                                value={transferForm.amount}
                                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                            />
                        </div>

                        {transferForm.amount && (
                            <div className="dialog-highlight-box">
                                <p className="dialog-highlight-box__label">
                                    К переводу:
                                </p>
                                <p className="dialog-highlight-box__value">
                                    {parseFloat(transferForm.amount).toLocaleString('ru-RU')} ₽
                                </p>
                            </div>
                        )}

                        <div className="account__form-buttons">
                            <Button onClick={handleSaveTransfer} className="flex-1">
                                Перевести
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setTransferDialogOpen(false)}>
                                Отмена
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
