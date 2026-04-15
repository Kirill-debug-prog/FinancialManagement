import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs/tabs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Label } from '../label/label';
import { Input } from '../input_data/input'
import Textarea from "../textarea/textarea";
import { Button } from "../button/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select/select";
import { getCategories } from '../../../api/categories';
import { getAccounts } from '../../../api/accounts';
import { getCurrencies } from '../../../api/currencies';
import { createTransaction } from '../../../api/transactions';
import './transactionForm.scss'

export default function TransactionForm({ onClose, onCreated }) {
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
            } catch (err) {
                toast.error('Ошибка загрузки данных формы');
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (type === 'transfer') {
            if (!amount || !fromAccount || !toAccount) {
                toast.error('Заполните обязательные поля');
                return;
            }
            if (fromAccount === toAccount) {
                toast.error('Счета должны различаться');
                return;
            }
        } else {
            if (!amount || !category || !account) {
                toast.error('Заполните обязательные поля');
                return;
            }
        }

        setLoading(true);
        try {
            if (type === 'transfer') {
                const fromAcc = accounts.find(a => a.id === fromAccount);
                const toAcc = accounts.find(a => a.id === toAccount);
                const curr = currencies[0];

                // Expense from source
                await createTransaction({
                    accountId: fromAccount,
                    type: 'transfer',
                    amount: parseFloat(amount),
                    currencyId: curr?.id,
                    date: new Date(date).toISOString(),
                    note: description || `Перевод на ${toAcc?.name || 'счёт'}`,
                });

                toast.success('Перевод создан');
            } else {
                const acc = accounts.find(a => a.id === account);
                const curr = currencies[0];

                await createTransaction({
                    accountId: account,
                    categoryId: category,
                    type,
                    amount: parseFloat(amount),
                    currencyId: curr?.id,
                    date: new Date(date).toISOString(),
                    note: description,
                });

                toast.success('Операция успешно добавлена');
            }

            if (onCreated) onCreated();
            else onClose();
        } catch (err) {
            toast.error(err.message || 'Ошибка создания операции');
        } finally {
            setLoading(false);
        }
    }

    const currentCategories = type === 'income' ? incomeCategories : expenseCategories;

    return (
        <form onSubmit={handleSubmit} className="transaction-form">
            <Tabs value={type} onValueChange={(v) => { setType(v); setCategory(''); setAccount(''); }}>
                <TabsList className="transaction-form__tabs-list">
                    <TabsTrigger value="expense" className="transaction-form__tab">Расход</TabsTrigger>
                    <TabsTrigger value="income" className="transaction-form__tab">Доход</TabsTrigger>
                    <TabsTrigger value="transfer" className="transaction-form__tab">Перевод</TabsTrigger>
                </TabsList>

                <TabsContent value='expense' className="transaction-form__section">
                    <div className="transaction-form__row">
                        <div className="transaction-form__field">
                            <Label htmlFor="amount">Сумма *</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="transaction-form__field">
                            <Label htmlFor="date">Дата *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="category">Категория *</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                            <SelectContent>
                                {expenseCategories.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="account">Счёт *</Label>
                        <Select value={account} onValueChange={setAccount}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите счёт" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map(a => (
                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="transaction-form__field">
                            <Label htmlFor="description">Описание </Label>
                            <Textarea
                                id="description"
                                placeholder="Дополнительная информация..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="income" className="transaction-form__section">
                    <div className="transaction-form__row">
                        <div className="transaction-form__field">
                            <Label htmlFor="amount-income">Сумма *</Label>
                            <Input
                                id="amount-income"
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="transaction-form__field">
                            <Label htmlFor="date-income">Дата *</Label>
                            <Input
                                id="date-income"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="category-income">Категория *</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                            <SelectContent>
                                {incomeCategories.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="account-income">Счёт *</Label>
                        <Select value={account} onValueChange={setAccount}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите счёт" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map(a => (
                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="description-income">Описание</Label>
                        <Textarea
                            id="description-income"
                            placeholder="Дополнительная информация..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="transfer" className="transaction-form__section">
                    <div className="transaction-form__row">
                        <div className="transaction-form__field">
                            <Label htmlFor="amount-transfer">Сумма *</Label>
                            <Input
                                id="amount-transfer"
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="transaction-form__field">
                            <Label htmlFor="date-transfer">Дата *</Label>
                            <Input
                                id="date-transfer"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="from-account">Со счёта *</Label>
                        <Select value={fromAccount} onValueChange={setFromAccount}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите счёт" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map(a => (
                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="to-account">На счёт *</Label>
                        <Select value={toAccount} onValueChange={setToAccount}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите счёт" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map(a => (
                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="description-transfer">Описание</Label>
                        <Textarea
                            id="description-transfer"
                            placeholder="Дополнительная информация..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                </TabsContent>
            </Tabs>

            <div className="transaction-form__buttons">
                <Button type="submit" className="transaction-form__button transaction-form__button--primary" disabled={loading}>
                    {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button type="button" variant="outline" className="transaction-form__button transaction-form__button--outline" onClick={onClose}>
                    Отмена
                </Button>
            </div>
        </form>
    )
}
