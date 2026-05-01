import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation()
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
            toast.error(err.message || t('common.message.loadError'));
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
            toast.error(t('accounts.messages.requiredFields'))
            return
        }
        
        const initialBalance = parseFloat(intialBalance) || 0;
        
        // Валидация на отрицательный баланс
        if (initialBalance < 0) {
            toast.error(t('accounts.messages.initialBalanceNegative'))
            return
        }
        
        try {
            const curr = currencies.find(c => c.code === currency);
            if (!curr) {
                toast.error(t('accounts.messages.currencyNotFound'));
                return;
            }
            const iconMap = { card: '💳', cash: '💵', savings: '🏦', investment: '📈' };
            await createAccount({
                name: accountName,
                icon: iconMap[accountType] || '💳',
                sortOrder: accounts.length,
                currencyId: curr.id,
                initialBalance: initialBalance,
                initialBalanceDate: new Date().toISOString(),
            });
            toast.success(t('accounts.messages.accountAdded'))
            setDialogOpen(false)
            setAccountName('')
            setAccountType('')
            setCurrency('RUB')
            setInitialBalance('')
            fetchData();
        } catch (err) {
            toast.error(err.message || t('accounts.messages.addError'));
        }
    }

    const handleDelete = async (id) => {
        if (!confirm(t('common.message.deleteConfirmAccount'))) {
            return;
        }
        try {
            await deleteAccount(id);
            setAccounts(prev => prev.filter(account => account.id !== id));
            toast.success(t('accounts.messages.accountDeleted'));
            fetchData();
        } catch (err) {
            // Если есть связанные транзакции, предложим архивировать
            if (err.message && err.message.includes('constraint')) {
                toast.error(t('accounts.messages.deleteError'));
            } else {
                toast.error(err.message || t('common.message.error'));
            }
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
            toast.error(t('accounts.messages.fillName'));
            return;
        }
        try {
            await updateAccount(editingAccountId, {
                name: editForm.name,
                type: editForm.type
            });
            toast.success(t('accounts.messages.accountUpdated'));
            setEditDialogOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || t('common.message.error'));
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
            toast.error(t('accounts.messages.transferFieldsRequired'));
            return;
        }

        const amount = parseFloat(transferForm.amount);
        if (amount <= 0) {
            toast.error(t('accounts.messages.amountMustBePositive'));
            return;
        }

        const fromAccount = accounts.find(a => a.id === transferForm.fromAccountId);
        if (!fromAccount || fromAccount.balance < amount) {
            toast.error(t('accounts.messages.insufficientFunds'));
            return;
        }

        try {
            const toAccount = accounts.find(a => a.id === transferForm.toAccountId);
            const curr = currencies.find(c => c.code === fromAccount.currency);
            
            if (!curr) {
                toast.error(t('accounts.messages.currencyNotFound'));
                return;
            }

            // Создаём две транзакции для трансфера
            // Расход из счета-источника (Expense для уменьшения баланса)
            await createTransaction({
                accountId: transferForm.fromAccountId,
                type: 'expense',
                amount: amount,
                currencyId: curr.id,
                date: new Date().toISOString(),
                note: `${t('accounts.messages.transferNoteFrom')} ${toAccount.name}`,
            });

            // Доход на счет-получатель (Income для увеличения баланса)
            await createTransaction({
                accountId: transferForm.toAccountId,
                type: 'income',
                amount: amount,
                currencyId: curr.id,
                date: new Date().toISOString(),
                note: `${t('accounts.messages.transferNoteToFrom')} ${fromAccount.name}`,
            });

            toast.success(t('accounts.messages.transferSuccess', { amount: amount.toLocaleString('ru-RU') }));
            setTransferDialogOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || t('common.message.error'));
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'card':
                return t('accounts.types.card')
            case 'cash':
                return t('accounts.types.cash')
            case 'savings':
                return t('accounts.types.savings')
            default:
                return ''
        }
    }

    if (loading) {
        return <div className="accounts"><p>{t('common.message.loading')}</p></div>;
    }

    return (
        <div className="accounts">
            <div className="accounts__header">
                <div>
                    <h1 className="accounts__title">{t('accounts.title')}</h1>
                    <p className="accounts__subtitle">{t('accounts.subtitle')}</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <button className="accounts__add-btn">
                            <Plus size={18} />
                            {t('accounts.addButton')}
                        </button>
                    </DialogTrigger>

                    <DialogContent aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>{t('accounts.addButton')}</DialogTitle>
                        </DialogHeader>
                        <div className="account__form">
                            <div className="account__form-field">
                                <Label htmlFor="account-name">{t('common.label.accountName')} *</Label>
                                <Input
                                    id="account-name"
                                    placeholder={t('common.placeholder.accountName')}
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                />

                                <div className="account__from-field">
                                    <Label htmlFor="account-type">{t('common.label.accountType')} *</Label>
                                    <Select value={accountType} onValueChange={setAccountType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('common.placeholder.selectType')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="card">{t('accounts.types.bankCard')}</SelectItem>
                                            <SelectItem value="cash">{t('accounts.types.cash')}</SelectItem>
                                            <SelectItem value="savings">{t('accounts.types.savingsAccount')}</SelectItem>
                                            <SelectItem value="investment">{t('accounts.types.investment')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="account__form-row">
                                    <div className="account__form-field">
                                        <Label htmlFor="currency">{t('common.label.currency')}</Label>
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
                                        <Label htmlFor="initial-balance">{t('accounts.form.initialBalance')}</Label>
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
                                        {t('common.button.add')}
                                    </Button>
                                    <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                                        {t('common.button.cancel')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="accounts__balance">
                <CardHeader>
                    <CradTitle className="accounts__balance-title text-xl">{t('accounts.totalBalance')}</CradTitle>
                </CardHeader>
                <CardContent className="accounts__balance-content">
                    <p className="accounts__balance-amount font-semibold text-xl">{totlalBalance.toLocaleString()} ₽</p>
                    <p className="accounts__balance-subtitle text-lg">{t('accounts.balanceDescription')}</p>
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
                                        {t('common.button.edit')}
                                    </Button>
                                    <Button variant="white" className="accounts__card-action-btn" onClick={() => handleOpenTransferDialog(account.id)}>
                                        <ArrowRightLeft size={16} />
                                        {t('accounts.transferButton')}
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
                    {t('accounts.noAccounts')}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>{t('accounts.editAccount')}</DialogTitle>
                    </DialogHeader>
                    <div className="account__form">
                        <div className="account__form-field">
                            <Label htmlFor="edit-account-name">{t('common.label.accountName')}</Label>
                            <Input
                                id="edit-account-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>
                        <div className="account__form-field">
                            <Label htmlFor="edit-account-type">{t('common.label.accountType')}</Label>
                            <Select value={editForm.type} onValueChange={(value) => setEditForm({ ...editForm, type: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('common.placeholder.selectType')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="card">{t('accounts.types.bankCard')}</SelectItem>
                                    <SelectItem value="cash">{t('accounts.types.cash')}</SelectItem>
                                    <SelectItem value="savings">{t('accounts.types.savingsAccount')}</SelectItem>
                                    <SelectItem value="investment">{t('accounts.types.investment')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="account__form-buttons">
                            <Button onClick={handleSaveEditAccount} className="flex-1">
                                {t('common.button.save')}
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setEditDialogOpen(false)}>
                                {t('common.button.cancel')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Transfer Dialog */}
            <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>{t('accounts.transferDialog')}</DialogTitle>
                    </DialogHeader>
                    <div className="account__form">
                        <div className="account__form-field">
                            <Label>{t('accounts.fromAccount')}</Label>
                            <div className="dialog-info-box">
                                <p className="dialog-info-box__text">
                                    {accounts.find(a => a.id === transferForm.fromAccountId)?.name}
                                </p>
                                <p className="dialog-info-box__subtitle">
                                    {t('common.label.balance')}: {accounts.find(a => a.id === transferForm.fromAccountId)?.balance.toLocaleString()} ₽
                                </p>
                            </div>
                        </div>

                        <div className="account__form-field">
                            <Label htmlFor="transfer-to-account">{t('accounts.toAccount')}</Label>
                            <Select value={transferForm.toAccountId || ''} onValueChange={(value) => setTransferForm({ ...transferForm, toAccountId: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('common.placeholder.selectAccount')} />
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
                            <Label htmlFor="transfer-amount">{t('common.label.amount')} (₽)</Label>
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
                                    {t('accounts.transferAmount')}:
                                </p>
                                <p className="dialog-highlight-box__value">
                                    {parseFloat(transferForm.amount).toLocaleString('ru-RU')} ₽
                                </p>
                            </div>
                        )}

                        <div className="account__form-buttons">
                            <Button onClick={handleSaveTransfer} className="flex-1">
                                {t('accounts.transferButton')}
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setTransferDialogOpen(false)}>
                                {t('common.button.cancel')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
