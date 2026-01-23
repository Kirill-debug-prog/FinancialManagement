import { useState } from 'react'
import { toast } from 'sonner'
import AppSidebar from '../../components/ui/AppSidebar/AppSidebar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog_/dialog';
import { Plus, CreditCard, Wallet as WalletIcon, DollarSign, Euro, Edit, Trash2, ArrowRightLeft, Icon } from 'lucide-react';
import { Card, CardContent, CardHeader, CradTitle } from '../../components/ui/card/card'
import { Button } from '../../components/ui/button/button';
import { Label } from '../../components/ui/label/label';
import { Input } from '../../components/ui/input_data/input';
import { Badge } from '../../components/ui/badge/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select/select";
import './Accounts.scss'

const accountsData = [
    { id: 1, name: 'Карта Сбербанк', type: 'card', currency: 'RUB', balance: 45000, icon: CreditCard, color: '#10b981' },
    { id: 2, name: 'Карта Тинькофф', type: 'card', currency: 'RUB', balance: 32000, icon: CreditCard, color: '#e1a312' },
    { id: 3, name: 'Наличные', type: 'cash', currency: 'RUB', balance: 8500, icon: WalletIcon, color: '#2563eb' },
    { id: 4, name: 'Долларовый счёт', type: 'savings', currency: 'USD', balance: 1200, icon: DollarSign, color: '#C224EA' },
    { id: 5, name: 'Евро счёт', type: 'savings', currency: 'EUR', balance: 800, icon: Euro, color: '#5823E8' },
]

export default function Accounts() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [accountName, setAccountName] = useState('')
    const [accountType, setAccountType] = useState('')
    const [currency, setCurrency] = useState('RUB')
    const [intialBalance, setInitialBalance] = useState('')

    const totlalBalance = accountsData
        .filter(account => account.currency === 'RUB')
        .reduce((total, account) => total + account.balance, 0)

    const handleAddAccount = () => {
        if (!accountName || !accountType) {
            toast.error('Заполните обязательные поля')
            return
        }
        toast.success('Счёт успешно добавлен')
        setDialogOpen(false)
        setAccountName('')
        setAccountType('')
        setCurrency('RUB')
        setInitialBalance('')
    }

    const getCurrencySymbol = (currency) => {
        switch (currency) {
            case 'RUB':
                return '₽'
            case 'USD':
                return '$'
            case 'EUR':
                return '€'
            default:
                return ''
        }
    }

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

    return (
        <div className="window">
            <AppSidebar currentPage="accounts-window__sidebar" />
            <div className="accounts">
                <div className="accounts__header">
                    <div>
                        <h1 className="accounts__title">Счета и кошельки</h1>
                        <p className="accounts__subtitle">Управление вашими счетами</p>
                    </div>

                    {/* Total Balance */}
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
                                                    <SelectItem value="RUB">RUB (₽)</SelectItem>
                                                    <SelectItem value="USD">USD ($)</SelectItem>
                                                    <SelectItem value="EUR">EUR (€)</SelectItem>
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
                    {accountsData.map((account) => {
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
                                        <Button variant="white" size="sm" className="accounts__card-action-btn">
                                            <Edit size={16} />
                                            Изменить
                                        </Button>
                                        <Button variant="white" size="sm" className="accounts__card-action-btn">
                                            <ArrowRightLeft size={16} />
                                            Перевести
                                        </Button>
                                        <Button variant="white" size="sm" className="accounts__card-action-btn">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}