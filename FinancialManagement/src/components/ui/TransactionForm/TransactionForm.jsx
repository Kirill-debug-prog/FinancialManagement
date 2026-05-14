import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs/tabs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Label } from '../label/label';
import { Input } from '../input_data/input'
import Textarea from "../textarea/textarea";
import { Button } from "../button/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select/select";
import { AlertCircle } from 'lucide-react';
import { getCategories } from '../../../api/categories';
import { getAccounts } from '../../../api/accounts';
import { getCurrencies } from '../../../api/currencies';
import { createTransaction, updateTransaction } from '../../../api/transactions';
import './transactionForm.scss'

export default function TransactionForm({ onClose, onCreated, initialData }) {
    const [type, setType] = useState('expense')
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('')
    const [account, setAccount] = useState('')
    const [fromAccount, setFromAccount] = useState('')
    const [toAccount, setToAccount] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [description, setDescription] = useState('')

    const [expenseCategories, setExpenseCategories] = useState([])
    const [incomeCategories, setIncomeCategories] = useState([])
    const [accounts, setAccounts] = useState([])
    const [currencies, setCurrencies] = useState([])
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [expCats, incCats, accs, currs] = await Promise.all([
                    getCategories('Expense'),
                    getCategories('Income'),
                    getAccounts(),
                    getCurrencies(),
                ]);
                setExpenseCategories(expCats);
                setIncomeCategories(incCats);
                setAccounts(accs);
                setCurrencies(currs);
            } catch {
                toast.error('Ошибка загрузки данных формы');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!initialData) return;

        setAmount(initialData.amount || '');
        setCategory(initialData.category || '');
        setAccount(initialData.account || '');
        setType(initialData.type || '');
    }, [initialData]);

    const getAccountBalance = (accountId) => {
        const acc = accounts.find(a => a.id === accountId);
        return acc ? acc.balance : 0;
    };

    const validateForm = () => {
        const newErrors = {};
        const amountNum = parseFloat(amount);
        const selectedDate = new Date(date);
        const today = new Date();

        if (type === 'transfer') {

            if (isNaN(amountNum) || amountNum <= 0) {
                newErrors.amount = 'Сумма должна быть больше нуля';
                return newErrors;
            }

            if (amountNum > 999_999_999) {
                newErrors.amount = 'Сумма не может превышать 999,999,999';
                return newErrors;
            }

            if(!account) {
                newErrors.account = 'Пожалуйста, выберите счёт';
                return newErrors;
            }

            // Проверка баланса для трансфера
            const fromAccountBalance = getAccountBalance(fromAccount);
            if (fromAccountBalance < amountNum) {
                newErrors.amount = `Недостаточно средств. Баланс: ${fromAccountBalance.toLocaleString('ru-RU')} ₽, требуется: ${amountNum.toLocaleString('ru-RU')} ₽`;
                return newErrors;
            }

            // Валидация даты
            if (selectedDate > today) {
                newErrors.date = 'Дата не может быть в будущем';
                return newErrors;
            }
        } else {

            // Валидация формата числа
            if (isNaN(amountNum) || amountNum.toString() !== amount) {
                newErrors.amount = 'Введите корректную сумму';
                return newErrors;
            }

            if (amountNum <= 0) {
                newErrors.amount = 'Сумма должна быть больше нуля';
                return newErrors;
            }

            if (amountNum > 999_999_999) {
                newErrors.amount = 'Сумма не может превышать 999,999,999';
                return newErrors;
            }
            
            if (!category) {
                newErrors.category = 'Пожалуйста, выберите категорию';
                return newErrors;
            }

            if(!account) {
                newErrors.account = 'Пожалуйста, выберите счёт';
                return newErrors;
            }

            // Проверка баланса для расходов
            if (type === 'expense') {
                const accountBalance = getAccountBalance(account);
                if (accountBalance < amountNum) {
                    newErrors.amount = `Недостаточно средств. Баланс: ${accountBalance.toLocaleString('ru-RU')} ₽, требуется: ${amountNum.toLocaleString('ru-RU')} ₽`;
                    return newErrors;
                }
            }

            // Валидация даты
            if (selectedDate > today) {
                newErrors.date = 'Дата не может быть в будущем';
                return newErrors;
            }

            // Валидация описания
            if (description.length > 1000) {
                newErrors.description = 'Описание не может быть длиннее 1000 символов';
                return newErrors;
            }
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Валидация перед отправкой
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            if (validationErrors.general) {
                toast.error(validationErrors.general);
            } else {
                const firstError = Object.values(validationErrors)[0];
                toast.error('❌ ' + firstError);
            }
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            if (type === 'transfer') {
                const toAcc = accounts.find(a => a.id === toAccount);
                const curr = currencies[0];

                await createTransaction({
                    accountId: fromAccount,
                    type: 'transfer',
                    amount: parseFloat(amount),
                    currencyId: curr?.id,
                    date: new Date(date).toISOString(),
                    note: description || `Перевод на ${toAcc?.name || 'счёт'}`,
                });

                toast.success('✅ Перевод создан успешно');
            } else {
                const curr = currencies[0];

                if (initialData?.id) {
                    // Обновление
                    await updateTransaction(initialData.id, {
                        accountId: account,
                        categoryId: category,
                        type,
                        amount: parseFloat(amount),
                        currencyId: curr?.id,
                        date: new Date(date).toISOString(),
                        note: description,
                    });
                    toast.success('✅ Операция успешно обновлена');
                } else {
                    // Создание
                    await createTransaction({
                        accountId: account,
                        categoryId: category,
                        type,
                        amount: parseFloat(amount),
                        currencyId: curr?.id,
                        date: new Date(date).toISOString(),
                        note: description,
                    });
                    toast.success('✅ Операция успешно добавлена');
                }
            }

            if (onCreated) onCreated();
            else onClose();
        } catch (err) {
            // Обработка детальных ошибок от бэка
            if (err.message) {
                if (err.message.includes('Недостаточно средств')) {
                    setErrors({ amount: err.message });
                    toast.error('❌ ' + err.message);
                } else if (err.message.includes('Категория')) {
                    setErrors({ category: err.message });
                    toast.error('❌ ' + err.message);
                } else {
                    toast.error('❌ ' + (err.message || 'Ошибка создания операции'));
                }
            } else {
                toast.error('❌ Ошибка создания операции');
            }
        } finally {
            setLoading(false);
        }
    }

    const selectedAccountBalance = account ? getAccountBalance(account) : 0;
    const selectedFromAccountBalance = fromAccount ? getAccountBalance(fromAccount) : 0;

    return (
        <form onSubmit={handleSubmit} className="transaction-form">
            <Tabs value={type} onValueChange={(v) => { 
                setType(v); 
                setCategory(''); 
                setAccount('');
                setFromAccount('');
                setToAccount('');
                setErrors({});
            }}>
                <TabsList className="transaction-form__tabs-list">
                    <TabsTrigger value="expense" className="transaction-form__tab">Расход</TabsTrigger>
                    <TabsTrigger value="income" className="transaction-form__tab">Доход</TabsTrigger>
                    <TabsTrigger value="transfer" className="transaction-form__tab">Перевод</TabsTrigger>
                </TabsList>

                {/* EXPENSE TAB */}
                <TabsContent value='expense' className="transaction-form__section">
                    <div className="transaction-form__row">
                        <div className="transaction-form__field">
                            <Label htmlFor="amount">Сумма * {errors.amount && <span className="form-error-icon">⚠️</span>}</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0"
                                step="0.01"
                                min="0"
                                max="999999999"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    setErrors(prev => ({ ...prev, amount: '' }));
                                }}
                                className={errors.amount ? 'is-error' : ''}
                            />
                            {errors.amount && <span className="form-error">{errors.amount}</span>}
                            {account && !errors.amount && (
                                <div className={`balance-info ${selectedAccountBalance < parseFloat(amount || 0) && amount ? 'is-warning' : ''}`}>
                                    💰 Баланс счета: <strong>{selectedAccountBalance.toLocaleString('ru-RU')} ₽</strong>
                                </div>
                            )}
                        </div>
                        <div className="transaction-form__field">
                            <Label htmlFor="date">Дата * {errors.date && <span className="form-error-icon">⚠️</span>}</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    setErrors(prev => ({ ...prev, date: '' }));
                                }}
                                className={errors.date ? 'is-error' : ''}
                            />
                            {errors.date && <span className="form-error">{errors.date}</span>}
                        </div>
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="category">Категория * {errors.category && <span className="form-error-icon">⚠️</span>}</Label>
                        <Select value={category} onValueChange={(val) => {
                            setCategory(val);
                            setErrors(prev => ({ ...prev, category: '' }));
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                            <SelectContent>
                                {expenseCategories.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && <span className="form-error">{errors.category}</span>}
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="account">Счёт *</Label>
                        <Select value={account} onValueChange= {(val) => {
                            setAccount(val);
                            setErrors(prev => ({ ...prev, account: '' }));
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите счёт" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map(a => (
                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.account && <span className="form-error">{errors.account}</span>}
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="description">Описание</Label>
                        <Textarea
                            id="description"
                            placeholder="Дополнительная информация..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={1000}
                        />
                        <span className="text-secondary" style={{ fontSize: '0.75rem', color: '#999' }}>
                            {description.length}/1000
                        </span>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="transaction-form__submit"
                        style={{ marginTop: '1rem' }}
                    >
                        {loading ? '⏳ Загрузка...' : 'Добавить расход'}
                    </Button>
                </TabsContent>

                {/* INCOME TAB */}
                <TabsContent value="income" className="transaction-form__section">
                    <div className="transaction-form__row">
                        <div className="transaction-form__field">
                            <Label htmlFor="amount-income">Сумма * {errors.amount && <span className="form-error-icon">⚠️</span>}</Label>
                            <Input
                                id="amount-income"
                                type="number"
                                placeholder="0"
                                step="0.01"
                                min="0"
                                max="999999999"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    setErrors(prev => ({ ...prev, amount: '' }));
                                }}
                                className={errors.amount ? 'is-error' : ''}
                            />
                            {errors.amount && <span className="form-error">{errors.amount}</span>}
                        </div>
                        <div className="transaction-form__field">
                            <Label htmlFor="date-income">Дата * {errors.date && <span className="form-error-icon">⚠️</span>}</Label>
                            <Input
                                id="date-income"
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    setErrors(prev => ({ ...prev, date: '' }));
                                }}
                                className={errors.date ? 'is-error' : ''}
                            />
                            {errors.date && <span className="form-error">{errors.date}</span>}
                        </div>
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="category-income">Категория * {errors.category && <span className="form-error-icon">⚠️</span>}</Label>
                        <Select value={category} onValueChange={(val) => {
                            setCategory(val);
                            setErrors(prev => ({ ...prev, category: '' }));
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                            <SelectContent>
                                {incomeCategories.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && <span className="form-error">{errors.category}</span>}
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="account-income">Счёт *</Label>
                        <Select value={account} onValueChange={(val) => {
                            setAccount(val);
                            setErrors(prev => ({ ...prev, account: '' }));
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите счёт" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map(a => (
                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.account && <span className="form-error">{errors.account}</span>}
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="description-income">Описание</Label>
                        <Textarea
                            id="description-income"
                            placeholder="Дополнительная информация..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={1000}
                        />
                        <span className="text-secondary" style={{ fontSize: '0.75rem', color: '#999' }}>
                            {description.length}/1000
                        </span>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="transaction-form__submit"
                        style={{ marginTop: '1rem' }}
                    >
                        {loading ? '⏳ Загрузка...' : 'Добавить доход'}
                    </Button>
                </TabsContent>

                {/* TRANSFER TAB */}
                <TabsContent value="transfer" className="transaction-form__section">
                    <div className="transaction-form__field">
                        <Label htmlFor="from-account">Со счета * {errors.account && <span className="form-error-icon">⚠️</span>}</Label>
                        <Select value={fromAccount} onValueChange={(val) => {
                            setFromAccount(val);
                            setErrors(prev => ({ ...prev, account: '' }));
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите счет-отправитель" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map(a => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.name} ({a.balance.toLocaleString('ru-RU')} ₽)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* Показать баланс */}
                        {fromAccount && (
                            <div className={`balance-info ${selectedFromAccountBalance < parseFloat(amount || 0) && amount ? 'is-error' : ''}`}>
                                💰 Баланс: <strong>{selectedFromAccountBalance.toLocaleString('ru-RU')} ₽</strong>
                            </div>
                        )}
                        {errors.account && <span className="form-error">{errors.account}</span>}
                    </div>

                    <div className="transaction-form__row">
                        <div className="transaction-form__field">
                            <Label htmlFor="amount-transfer">Сумма * {errors.amount && <span className="form-error-icon">⚠️</span>}</Label>
                            <Input
                                id="amount-transfer"
                                type="number"
                                placeholder="0"
                                step="0.01"
                                min="0"
                                max="999999999"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    setErrors(prev => ({ ...prev, amount: '' }));
                                }}
                                className={errors.amount ? 'is-error' : ''}
                            />
                            {errors.amount && <span className="form-error">{errors.amount}</span>}
                        </div>
                        <div className="transaction-form__field">
                            <Label htmlFor="date-transfer">Дата * {errors.date && <span className="form-error-icon">⚠️</span>}</Label>
                            <Input
                                id="date-transfer"
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    setErrors(prev => ({ ...prev, date: '' }));
                                }}
                                className={errors.date ? 'is-error' : ''}
                            />
                            {errors.date && <span className="form-error">{errors.date}</span>}
                        </div>
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="to-account">На счет * {errors.account && <span className="form-error-icon">⚠️</span>}</Label>
                        <Select value={toAccount} onValueChange={(val) => {
                            setToAccount(val);
                            setErrors(prev => ({ ...prev, account: '' }));
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите счет-получатель" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts
                                    .filter(a => a.id !== fromAccount)
                                    .map(a => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.name}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                        {errors.account && <span className="form-error">{errors.account}</span>}
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="description-transfer">Описание</Label>
                        <Textarea
                            id="description-transfer"
                            placeholder="Причина перевода..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={500}
                        />
                        <span className="text-secondary" style={{ fontSize: '0.75rem', color: '#999' }}>
                            {description.length}/500
                        </span>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="transaction-form__submit"
                        style={{ marginTop: '1rem' }}
                    >
                        {loading ? 'Загрузка...' : 'Выполнить перевод'}
                    </Button>
                </TabsContent>
            </Tabs>
        </form>
    );
}
