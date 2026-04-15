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
import { getAccounts, createAccount, deleteAccount } from '../../api/accounts';
import { getCurrencies } from '../../api/currencies';
import { transformAccountFromBackend, getCurrencySymbol } from '../../api/transformers';
import './Accounts.scss'

export default function Accounts() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [accountName, setAccountName] = useState('')
    const [accountType, setAccountType] = useState('')
    const [currency, setCurrency] = useState('RUB')
    const [intialBalance, setInitialBalance] = useState('')
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
        try {
            await deleteAccount(id);
            toast.success('Счёт удалён');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка удаления');
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
                                    <div className={`accounts__icon-wrapper`} style={{ backgroundColor: account.color }}>
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
                                    <Button variant="white" className="accounts__card-action-btn">
                                        <Edit size={16} />
                                        Изменить
                                    </Button>
                                    <Button variant="white" className="accounts__card-action-btn">
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
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    Нет счетов. Добавьте первый счёт!
                </div>
            )}
        </div>
    )
}
