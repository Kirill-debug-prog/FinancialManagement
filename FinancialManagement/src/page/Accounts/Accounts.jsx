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
import { createTransaction } from '../../api/transactions';
import { transformAccountFromBackend, getCurrencySymbol } from '../../api/transformers';
import './Accounts.scss'

export default function Accounts() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [accountName, setAccountName] = useState('')
    const [accountType, setAccountType] = useState('')
    const [currency, setCurrency] = useState('RUB')
    const [intialBalance, setInitialBalance] = useState('')
    const [accountNameErrors, setAccountNameErrors] = useState('')
    const [accountError, setAccountError] = useState({})

    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingAccountId, setEditingAccountId] = useState(null)
    const [editForm, setEditForm] = useState({ name: '', type: '' })
    const [editNameErrors, setEditNameErrors] = useState('')

    const [transferDialogOpen, setTransferDialogOpen] = useState(false)
    const [transferForm, setTransferForm] = useState({ fromAccountId: null, toAccountId: null, amount: '' })
    const [transferErrors, setTransferErrors] = useState({})

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
        // Полная валидация формы
        const nameError = validateAccountName(accountName);
        setAccountNameErrors(nameError);

        const error = validateAccount();
        if (Object.keys(error).length > 0) {
            setAccountError(error);
            toast.error('❌ ' + Object.values(error)[0]);
            return;
        }
        setAccountError({});

        try {
            const curr = currencies.find(c => c.code === currency);
            if (!curr) {
                toast.error('Валюта не найдена');
                return;
            }
            const iconMap = { card: '💳', cash: '💵', savings: '🏦', investment: '📈' };
            await createAccount({
                name: accountName.trim(),
                icon: iconMap[accountType] || '💳',
                sortOrder: accounts.length,
                currencyId: curr.id,
                initialBalance: initialBalanceNum,
                initialBalanceDate: new Date().toISOString(),
            });
            toast.success('Счёт успешно добавлен');
            setDialogOpen(false);
            setAccountName('');
            setAccountType('');
            setCurrency('RUB');
            setInitialBalance('');
            setAccountNameErrors('');
            fetchData();
        } catch (err) {
            toast.error((err.message || 'Ошибка создания счёта'));
        }
    };

    // Валидация имени счета
    const validateAccountName = (name) => {
        const trimmed = name.trim();
        if (!trimmed) {
            return 'Название счёта не может быть пустым';
        }
        if (trimmed.length < 1) {
            return 'Название счёта должно содержать хотя бы 1 символ';
        }
        if (trimmed.length > 100) {
            return 'Название счёта не может быть длиннее 100 символов';
        }
        // Проверить на дубликаты
        if (accounts.some(a => a.name.toLowerCase() === trimmed.toLowerCase())) {
            return 'Счет с таким названием уже существует';
        }
        return '';
    };

    const validateAccount = () => {
        const newErrors = {};

        const num = Number(intialBalance);

        if (intialBalance !== '' && Number.isNaN(num)) {
            newErrors.initialBalance = 'Введите корректное число';
        }
        if (!Number.isNaN(num) && num < 0) {
            newErrors.initialBalance = 'Начальный баланс не может быть отрицательным';
        }
        if (num > 999_999_999) {
            newErrors.initialBalance = 'Начальный баланс не может превышать 999,999,999';
        }
        if (intialBalance === '' || num === 0) {
            newErrors.initialBalance = 'Начальный баланс должен быть больше нуля';
        }
        if (!accountType) {
            newErrors.accountType = 'Пожалуйста, выберите тип счёта';
        }
        return newErrors;
    };

    const handleDelete = async (id) => {
        if (!confirm('Вы уверены, что хотите удалить этот счёт? Это действие нельзя отменить.')) {
            return;
        }
        try {
            await deleteAccount(id);
            setAccounts(prev => prev.filter(account => account.id !== id));
            toast.success('Счёт удалён');
            fetchData();
        } catch (err) {
            // Если есть связанные транзакции, предложим архивировать
            if (err.message && err.message.includes('constraint')) {
                toast.error('Невозможно удалить счет со связанными транзакциями. Используйте функцию архивирования.');
            } else {
                toast.error(err.message || 'Ошибка удаления счета');
            }
        }
    };

    const handleOpenEditDialog = (account) => {
        setEditingAccountId(account.id);
        setEditForm({
            name: account.name,
            type: account.type
        });
        setEditNameErrors('');
        setEditDialogOpen(true);
    };

    const handleSaveEditAccount = async () => {
        // Валидация при редактировании
        const nameError = validateEditAccountName(editForm.name, editingAccountId);
        setEditNameErrors(nameError);

        if (nameError) {
            toast.error(nameError);
            return;
        }

        try {
            await updateAccount(editingAccountId, {
                name: editForm.name.trim(),
                type: editForm.type
            });
            toast.success('✅ Счёт успешно обновлён');
            setEditDialogOpen(false);
            setEditNameErrors('');
            fetchData();
        } catch (err) {
            toast.error('❌ ' + (err.message || 'Ошибка обновления счёта'));
        }
    };

    // Валидация имени счета при редактировании
    const validateEditAccountName = (name, excludeId) => {
        const trimmed = name.trim();
        if (!trimmed) {
            return 'Название счёта не может быть пустым';
        }
        if (trimmed.length > 100) {
            return 'Название счёта не может быть длиннее 100 символов';
        }
        // Проверить на дубликаты (исключая текущий счет)
        if (accounts.some(a => a.id !== excludeId && a.name.toLowerCase() === trimmed.toLowerCase())) {
            return 'Счет с таким названием уже существует';
        }
        return '';
    };

    const handleOpenTransferDialog = (accountId) => {
        setTransferForm({
            fromAccountId: accountId,
            toAccountId: null,
            amount: ''
        });
        setTransferErrors({});
        setTransferDialogOpen(true);
    };

    const handleSaveTransfer = async () => {
        // Полная валидация трансфера
        const newErrors = {};

        if (!transferForm.toAccountId || !transferForm.amount) {
            newErrors.general = 'Заполните все обязательные поля';
        }

        const amount = parseFloat(transferForm.amount);

        if (!transferForm.toAccountId){
            newErrors.accounts = 'Пожалуйста, выберите счёт для перевода';
        }
        if (isNaN(amount) || amount <= 0) {
            newErrors.amount = 'Сумма должна быть больше нуля';
        }

        if (amount > 999_999_999) {
            newErrors.amount = 'Сумма не может превышать 999,999,999';
        }

        // Проверка баланса
        const fromAccount = accounts.find(a => a.id === transferForm.fromAccountId);
        if (fromAccount && amount > fromAccount.balance) {
            newErrors.amount = `Недостаточно средств. Баланс: ${fromAccount.balance.toLocaleString('ru-RU')} ₽`;
        }

        if (transferForm.fromAccountId === transferForm.toAccountId) {
            newErrors.accounts = 'Счета должны различаться';
        }

        if (Object.keys(newErrors).length > 0) {
            setTransferErrors(newErrors);
            const errorMsg = newErrors.general || newErrors.amount || newErrors.accounts || 'Ошибка в форме';
            toast.error('❌ ' + errorMsg);
            return;
        }

        setTransferErrors({});

        try {
            const toAccount = accounts.find(a => a.id === transferForm.toAccountId);
            const curr = currencies.find(c => c.code === fromAccount.currency);

            if (!curr) {
                toast.error('❌ Валюта не найдена');
                return;
            }

            // Создаём две транзакции для трансфера
            // Расход из счета-источника
            await createTransaction({
                accountId: transferForm.fromAccountId,
                type: 'expense',
                amount: amount,
                currencyId: curr.id,
                date: new Date().toISOString(),
                note: `Перевод на ${toAccount.name}`,
            });

            // Доход на счет-получатель
            await createTransaction({
                accountId: transferForm.toAccountId,
                type: 'income',
                amount: amount,
                currencyId: curr.id,
                date: new Date().toISOString(),
                note: `Перевод со счета ${fromAccount.name}`,
            });

            toast.success(`✅ Перевод ${amount.toLocaleString('ru-RU')} выполнен успешно`);
            setTransferDialogOpen(false);
            setTransferForm({ fromAccountId: null, toAccountId: null, amount: '' });
            setTransferErrors({});
            fetchData();
        } catch (err) {
            toast.error('❌ ' + (err.message || 'Ошибка при переводе'));
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
                                <Label htmlFor="account-name">
                                    Название счёта * {accountNameErrors && <span className="form-error-icon">⚠️</span>}
                                </Label>
                                <Input
                                    id="account-name"
                                    placeholder="Например: Основная карта"
                                    value={accountName}
                                    onChange={(e) => {
                                        setAccountName(e.target.value);
                                        setAccountNameErrors('');
                                    }}
                                    className={accountNameErrors ? 'is-error' : ''}
                                />
                                {accountNameErrors && (
                                    <span className="form-error">{accountNameErrors}</span>
                                )}

                                <div className="account__from-field">
                                    <Label htmlFor="account-type">Тип счёта * {accountError.accountType && <span className="form-error-icon">⚠️</span>}</Label>
                                    <Select value={accountType} onValueChange={(val) => {
                                        setAccountType(val);
                                        setAccountError(prev => ({ ...prev, accountType: '' }));
                                    }}>
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
                                    {accountError.accountType && <span className="form-error">{accountError.accountType}</span>}
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
                                        <Label htmlFor="initial-balance">Начальный баланс * {accountError.initialBalance && <span className="form-error-icon">⚠️</span>}</Label>
                                        <Input
                                            id="initial-balance"
                                            type="number"
                                            placeholder="0"
                                            step="0.01"
                                            min="0"
                                            max="999999999"
                                            value={intialBalance}
                                            onChange={(e) => {
                                                setInitialBalance(e.target.value);
                                                setAccountError(prev => ({ ...prev, initialBalance: '' }));
                                            }}
                                            className={accountError.initialBalance ? 'is-error' : ''}
                                        />
                                        {accountError.initialBalance && <span className="form-error">{accountError.initialBalance}</span>}
                                    </div>
                                </div>

                                <div className="account__form-buttons">
                                    <Button onClick={handleAddAccount} className="flex-1">
                                        Добавить счёт
                                    </Button>
                                    <Button variant="outline" className="flex-1" onClick={() => {
                                        setDialogOpen(false);
                                        setAccountNameErrors('');
                                    }}>
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
                            <Label htmlFor="edit-account-name">
                                Название счёта {editNameErrors && <span className="form-error-icon">⚠️</span>}
                            </Label>
                            <Input
                                id="edit-account-name"
                                value={editForm.name}
                                onChange={(e) => {
                                    setEditForm({ ...editForm, name: e.target.value });
                                    setEditNameErrors('');
                                }}
                                className={editNameErrors ? 'is-error' : ''}
                            />
                            {editNameErrors && <span className="form-error">{editNameErrors}</span>}
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
                            <Button variant="outline" className="flex-1" onClick={() => {
                                setEditDialogOpen(false);
                                setEditNameErrors('');
                            }}>
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
                            <Label htmlFor="transfer-to-account">На счёт {transferErrors.accounts && <span className="form-error-icon">⚠️</span>}</Label>
                            <Select
                                value={transferForm.toAccountId || ''}
                                onValueChange={(value) => {
                                    setTransferForm({ ...transferForm, toAccountId: value });
                                    setTransferErrors(prev => ({ ...prev, accounts: '' }));
                                }}
                            >
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
                            {transferErrors.accounts && <span className="form-error">{transferErrors.accounts}</span>}
                        </div>

                        <div className="account__form-field">
                            <Label htmlFor="transfer-amount">
                                Сумма (₽) * {transferErrors.amount && <span className="form-error-icon">⚠️</span>}
                            </Label>
                            <Input
                                id="transfer-amount"
                                type="number"
                                placeholder="0"
                                step="0.01"
                                min="0"
                                max="999999999"
                                value={transferForm.amount}
                                onChange={(e) => {
                                    setTransferForm({ ...transferForm, amount: e.target.value });
                                    setTransferErrors(prev => ({ ...prev, amount: '' }));
                                }}
                                className={transferErrors.amount ? 'is-error' : ''}
                            />
                            {transferErrors.amount && <span className="form-error">{transferErrors.amount}</span>}
                        </div>

                        {transferForm.amount && !transferErrors.amount && (
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
                            <Button variant="outline" className="flex-1" onClick={() => {
                                setTransferDialogOpen(false);
                                setTransferErrors({});
                            }}>
                                Отмена
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
