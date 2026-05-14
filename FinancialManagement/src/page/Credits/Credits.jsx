import React, { useState, useEffect } from "react";
import FinanceProductCard from "../../components/ui/FinanceProductCard/FinanceProductCard";
import { Badge } from "../../components/ui/badge/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog_/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select/select";
import { Card, CardHeader, CardContent } from "../../components/ui/card/card";
import { Label } from '../../components/ui/label/label';
import { Input } from '../../components/ui/input_data/input'
import { Button } from "../../components/ui/button/button";
import { Plus, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { Trash2 } from 'lucide-react';
import { getCredits, createCredit, updateCredit, deleteCredit } from '../../api/credits';
import { getDebts, createDebt, updateDebt, deleteDebt } from '../../api/debts';
import { invalidateCreditsDebtsCache } from '../../api/cacheInvalidation';
import "./Credits.scss"

export default function Credits() {
    const [dialogOpenCredit, setDialogOpenCredit] = useState(false)
    const [dialogOpenDebts, setDialogOpenDebts] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingCreditId, setEditingCreditId] = useState(null)
    const [earlyRepaymentDialogOpen, setEarlyRepaymentDialogOpen] = useState(false)
    const [repayingCreditId, setRepayingCreditId] = useState(null)
    const [creditName, setCreditName] = useState('')
    const [creditType, setCreditType] = useState('')
    const [creditTotalAmount, setCreditTotalAmount] = useState('')
    const [creditInterestRate, setCreditInterestRate] = useState('')
    const [creditMonthlyPayment, setCreditMonthlyPayment] = useState('')
    const [creditEndDate, setCreditEndDate] = useState('')
    const [creditErrors, setCreditErrors] = useState({})
    const [debtErrors, setDebtErrors] = useState({})

    const [editForm, setEditForm] = useState({
        name: '',
        type: '',
        totalAmount: '',
        remainingAmount: '',
        interestRate: '',
        monthlyPayment: '',
        nextPaymentDate: '',
        endDate: '',
        status: 'active',
        paymentAmount: ''
    })

    const [debtsName, setDebtsName] = useState('')
    const [debtAmount, setDebtAmount] = useState('')
    const [debtPerson, setDebtPerson] = useState('')
    const [debtStartDate, setDebtStartDate] = useState('')
    const [debtReturnDate, setDebtReturnDate] = useState('')

    const [creditsData, setCreditsData] = useState([])
    const [debtsData, setDebtsData] = useState([])
    const [loading, setLoading] = useState(true)

    // Функции валидации для кредитов
    const validateCredit = () => {
        const newErrors = {};
        const totalAmount = parseFloat(creditTotalAmount);
        const rate = parseFloat(creditInterestRate);
        const payment = parseFloat(creditMonthlyPayment);

        if (isNaN(totalAmount) || totalAmount <= 0) {
            newErrors.totalAmount = 'Сумма должна быть больше нуля';
        }
        if (totalAmount > 999_999_999) {
            newErrors.totalAmount = 'Сумма не может превышать 999,999,999';
        }
        if (isNaN(rate) || rate < 0 || rate > 100) {
            newErrors.rate = 'Процентная ставка должна быть от 0 до 100';
        }
        if (!payment || payment <= 0) {
            newErrors.payment = 'Ежемесячный платеж должен быть больше нуля';
        }
        if (creditEndDate) {
            const endDate = new Date(creditEndDate);
            const today = new Date();
            if (endDate < today) {
                newErrors.endDate = 'Дата конца не может быть в прошлом';
            }
        }
        if (!creditEndDate) {
            newErrors.endDate = 'Укажите дату окончания кредита';
        }
        return newErrors;
    };

    // Функции валидации для долгов
    const validateDebt = () => {
        const newErrors = {};
        const amount = parseFloat(debtAmount);

        if (!debtsName || debtsName.trim().length === 0) {
            newErrors.name = 'Название долга не может быть пустым';
        }
        if (isNaN(amount) || amount <= 0) {
            newErrors.amount = 'Сумма должна быть больше нуля';
        }
        if (amount > 999_999_999) {
            newErrors.amount = 'Сумма не может превышать 999,999,999';
        }
        if (!debtPerson && debtPerson.trim().length === 0) {
            newErrors.person = 'Имя должника не может быть пустым';
        }
        if (debtReturnDate) {
            const returnDate = new Date(debtReturnDate);
            const startDate = debtStartDate ? new Date(debtStartDate) : new Date();
            if (returnDate < startDate) {
                newErrors.returnDate = 'Дата возврата не может быть раньше даты начала';
            }
        }
        if (!debtStartDate && !debtReturnDate) {
            newErrors.startDate = 'Укажите дату начала';
        }
        return newErrors;
    };

    const fetchData = async () => {
        try {
            const [credits, debts] = await Promise.all([getCredits(), getDebts()]);
            setCreditsData(credits);
            setDebtsData(debts);
        } catch (err) {
            toast.error(err.message || 'Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAddCredit = async () => {
        // Полная валидация
        const errors = validateCredit();
        if (Object.keys(errors).length > 0) {
            setCreditErrors(errors);
            toast.error('❌ ' + (Object.values(errors)[0]));
            return;
        }
        setCreditErrors({});
        try {
            await createCredit({
                name: creditName,
                type: creditType,
                totalAmount: parseFloat(creditTotalAmount) || 0,
                remainingAmount: parseFloat(creditTotalAmount) || 0,
                interestRate: parseFloat(creditInterestRate) || 0,
                monthlyPayment: parseFloat(creditMonthlyPayment) || 0,
                endDate: creditEndDate ? new Date(creditEndDate).toISOString() : null,
                status: 'active',
            });
            toast.success('Кредит успешно добавлен');
            setDialogOpenCredit(false);
            setCreditName('');
            setCreditType('');
            setCreditTotalAmount('');
            setCreditInterestRate('');
            setCreditMonthlyPayment('');
            setCreditEndDate('');
            invalidateCreditsDebtsCache();
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка добавления кредита');
        }
    };

    const handleAddDebt = async () => {
        // Полная валидация
        const errors = validateDebt();
        if (Object.keys(errors).length > 0) {
            setDebtErrors(errors);
            toast.error('❌ ' + (Object.values(errors)[0]));
            return;
        }
        setDebtErrors({});
        try {
            await createDebt({
                name: debtsName,
                amount: parseFloat(debtAmount) || 0,
                person: debtPerson,
                date: debtStartDate ? new Date(debtStartDate).toISOString() : new Date().toISOString(),
                returnDate: debtReturnDate ? new Date(debtReturnDate).toISOString() : null,
                status: 'pending',
            });
            toast.success('Долг успешно добавлен');
            setDialogOpenDebts(false);
            setDebtsName('');
            setDebtAmount('');
            setDebtPerson('');
            setDebtStartDate('');
            setDebtReturnDate('');
            invalidateCreditsDebtsCache();
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка добавления долга');
        }
    };

    const handleMarkReturned = async (debtId) => {
        try {
            const debt = debtsData.find(d => d.id === debtId);
            if (!debt) {
                toast.error('Долг не найден');
                return;
            }

            await updateDebt(debtId, {
                name: debt.name,
                amount: debt.amount,
                person: debt.person,
                date: debt.date,
                returnDate: debt.returnDate,
                status: 'returned'
            });

            toast.success('Долг отмечен как возвращённый');
            invalidateCreditsDebtsCache();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка обновления');
        }
    };

    const handleDeleteDebt = async (debtId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот долг? Это действие нельзя отменить.')) {
            return;
        }
        try {
            await deleteDebt(debtId);
            toast.success('Долг успешно удалён');
            invalidateCreditsDebtsCache();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка удаления');
        }
    };

    const handleOpenEditDialog = (credit) => {
        setEditingCreditId(credit.id);
        setEditForm({
            name: credit.name,
            type: credit.type,
            totalAmount: String(credit.totalAmount),
            remainingAmount: String(credit.remainingAmount),
            interestRate: String(credit.interestRate),
            monthlyPayment: String(credit.monthlyPayment),
            nextPaymentDate: credit.nextPaymentDate
                ? new Date(credit.nextPaymentDate).toISOString().split('T')[0]
                : '',
            endDate: credit.endDate
                ? new Date(credit.endDate).toISOString().split('T')[0]
                : '',
            status: credit.status,
            paymentAmount: ''
        });
        setEditDialogOpen(true);
    };

    const handleSaveEditCredit = async () => {
        // Полная валидация
        const errors = validateCredit();
        if (Object.keys(errors).length > 0) {
            setCreditErrors(errors);
            toast.error('❌ ' + (Object.values(errors)[0]));
            return;
        }
        setCreditErrors({});

        try {
            // Вычисляем новый остаток, если была внесена сумма платежа
            let newRemainingAmount = parseFloat(editForm.remainingAmount) || 0;
            if (editForm.paymentAmount && editForm.paymentAmount <= newRemainingAmount) {
                const paymentAmount = parseFloat(editForm.paymentAmount) || 0;
                newRemainingAmount = Math.max(0, newRemainingAmount - paymentAmount);
            }
            else if (editForm.paymentAmount <= 0) {
                toast.error('Сумма платежа должна быть больше нуля');
                return;
            }
            else {
                toast.error('Сумма платежа не может превышать текущий остаток');
                return;
            }

            // Если остаток становится 0, автоматически закрываем кредит
            let creditStatus = editForm.status;
            if (newRemainingAmount === 0) {
                creditStatus = 'closed';
            }

            await updateCredit(editingCreditId, {
                name: editForm.name,
                type: editForm.type,
                totalAmount: parseFloat(editForm.totalAmount) || 0,
                remainingAmount: newRemainingAmount,
                paymentAmount: parseFloat(editForm.paymentAmount) || 0,
                interestRate: parseFloat(editForm.interestRate) || 0,
                monthlyPayment: parseFloat(editForm.monthlyPayment) || 0,
                nextPaymentDate: editForm.nextPaymentDate
                    ? new Date(editForm.nextPaymentDate).toISOString()
                    : null,
                endDate: editForm.endDate
                    ? new Date(editForm.endDate).toISOString()
                    : null,
                status: creditStatus
            });

            if (newRemainingAmount === 0) {
                toast.success('Кредит полностью погашен и закрыт! ✓');
            } else {
                toast.success('Кредит успешно обновлен');
            }

            setEditDialogOpen(false);
            invalidateCreditsDebtsCache();
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка обновления кредита');
        }
    };

    const handleDeleteCredit = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот кредит? Это действие нельзя отменить.')) {
            return;
        }
        try {
            await deleteCredit(id);
            setCreditsData(prev => prev.filter(c => c.id !== id));
            toast.success('Кредит успешно удалён');
            invalidateCreditsDebtsCache();
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка удаления кредита');
        }
    };

    const handleOpenEarlyRepaymentDialog = (credit) => {
        setRepayingCreditId(credit.id);
        setEarlyRepaymentDialogOpen(true);
    };

    const handleEarlyRepayment = async () => {
        const credit = creditsData.find(c => c.id === repayingCreditId);
        if (!credit) {
            toast.error('Кредит не найден');
            return;
        }

        try {
            await updateCredit(repayingCreditId, {
                ...credit,
                paymentAmount: credit.remainingAmount,
                remainingAmount: 0,
                status: 'closed'
            });
            toast.success(`Кредит полностью погашен. Выплачено: ${credit.remainingAmount.toLocaleString('ru-RU')} ₽`);
            setEarlyRepaymentDialogOpen(false);
            invalidateCreditsDebtsCache();
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка досрочного погашения');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge variant="green">Активен</Badge>;
            case 'pending':
                return <Badge variant="yellow">Ожидание</Badge>;
            case 'overdue':
                return <Badge variant="red">Просрочен</Badge>;
            case 'returned':
                return <Badge variant="green">Возвращён</Badge>;
            case 'closed':
                return <Badge variant="red">Закрыт</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'mortgage': return 'Ипотека';
            case 'auto': return 'Автокредит';
            case 'consumer': return 'Потребительский';
            case 'personal': return 'Личный';
            default: return type;
        }
    };

    if (loading) {
        return <div className="credits"><p>Загрузка...</p></div>;
    }

    return (
        <div className="credits">
            {/* Header */}
            <div className="credits__header">
                <div>
                    <h1 className="credits__title">Кредиты и долги</h1>
                    <p className="credits__subtitle">Управление займами и обязательствами</p>
                </div>

                <Dialog open={dialogOpenCredit} onOpenChange={setDialogOpenCredit}>
                    <DialogTrigger asChild>
                        <button className="dashboard__add-btn">
                            <Plus size={18} />
                            Добавить кредит
                        </button>
                    </DialogTrigger>

                    <DialogContent aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>Новый кредит</DialogTitle>
                        </DialogHeader>
                        <div className="credit-form">
                            <div className="credit-form__field">
                                <Label htmlFor="credit-name">Название * {creditErrors.name && <span className="form-error-icon">⚠️</span>}</Label>
                                <Input
                                    id="credit-name"
                                    placeholder="Например: Кредит на авто"
                                    value={creditName}
                                    onChange={(e) => {
                                        setCreditName(e.target.value);
                                        setCreditErrors(prev => ({ ...prev, name: '' }));
                                    }}
                                    className={creditErrors.name ? 'is-error' : ''}
                                />
                                {creditErrors.name && <span className="form-error">{creditErrors.name}</span>}
                            </div>

                            <div className="credit-form__field">
                                <Label htmlFor="credit-type">Тип кредита * {creditErrors.type && <span className="form-error-icon">⚠️</span>}</Label>
                                <Select value={creditType} onValueChange={(val) => {
                                    setCreditType(val);
                                    setCreditErrors(prev => ({ ...prev, type: '' }));
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите тип" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mortgage">Ипотека</SelectItem>
                                        <SelectItem value="auto">Автокредит</SelectItem>
                                        <SelectItem value="consumer">Потребительский</SelectItem>
                                        <SelectItem value="personal">Личный долг</SelectItem>
                                    </SelectContent>
                                </Select>
                                {creditErrors.type && <span className="form-error">{creditErrors.type}</span>}
                            </div>

                            <div className="credit-form__row">
                                <div className="credit-form__field">
                                    <Label htmlFor="total-amount">Общая сумма {creditErrors.totalAmount && <span className="form-error-icon">⚠️</span>}</Label>
                                    <Input
                                        id="total-amount"
                                        placeholder="0"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="999999999"
                                        value={creditTotalAmount}
                                        onChange={(e) => {
                                            setCreditTotalAmount(e.target.value);
                                            setCreditErrors(prev => ({ ...prev, totalAmount: '' }));
                                        }}
                                        className={creditErrors.totalAmount ? 'is-error' : ''}
                                    />
                                    {creditErrors.totalAmount && <span className="form-error">{creditErrors.totalAmount}</span>}
                                </div>
                                <div className="credit-form__field">
                                    <Label htmlFor="interest-rate">Процентная ставка (%) {creditErrors.rate && <span className="form-error-icon">⚠️</span>}</Label>
                                    <Input
                                        id="interest-rate"
                                        placeholder="0"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={creditInterestRate}
                                        onChange={(e) => {
                                            setCreditInterestRate(e.target.value);
                                            setCreditErrors(prev => ({ ...prev, rate: '' }));
                                        }}
                                        className={creditErrors.rate ? 'is-error' : ''}
                                    />
                                    {creditErrors.rate && <span className="form-error">{creditErrors.rate}</span>}
                                </div>
                            </div>

                            <div className="credit-form__row">
                                <div className="credit-form__field">
                                    <Label htmlFor="monthly-payment">Ежемесячный платёж {creditErrors.payment && <span className="form-error-icon">⚠️</span>}</Label>
                                    <Input
                                        id="monthly-payment"
                                        placeholder="0"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={creditMonthlyPayment}
                                        onChange={(e) => {
                                            setCreditMonthlyPayment(e.target.value);
                                            setCreditErrors(prev => ({ ...prev, payment: '' }));
                                        }}
                                        className={creditErrors.payment ? 'is-error' : ''}
                                    />
                                    {creditErrors.payment && <span className="form-error">{creditErrors.payment}</span>}
                                </div>
                                <div className="credit-form__field">
                                    <Label htmlFor="end-date">Дата окончания {creditErrors.endDate && <span className="form-error-icon">⚠️</span>}</Label>
                                    <Input
                                        id="end-date"
                                        type="date"
                                        value={creditEndDate}
                                        onChange={(e) => {
                                            setCreditEndDate(e.target.value);
                                            setCreditErrors(prev => ({ ...prev, endDate: '' }));
                                        }}
                                        className={creditErrors.endDate ? 'is-error' : ''}
                                    />
                                    {creditErrors.endDate && <span className="form-error">{creditErrors.endDate}</span>}
                                </div>
                            </div>

                            <div className="transaction-form__buttons">
                                <Button type="submit" className="transaction-form__button transaction-form__button--primary" onClick={handleAddCredit}>
                                    Добавить кредит
                                </Button>
                                <Button type="button" variant="outline" className="transaction-form__button transaction-form__button--outline" onClick={() => {
                                    setDialogOpenCredit(false);
                                    setCreditErrors({});
                                }}>
                                    Отмена
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="credit">
                <div className="credit__title ">
                    <span>Мои кредиты</span>
                </div>
                <div className="credit__position">
                    {creditsData.map((credit) => (
                        <FinanceProductCard
                            key={credit.id}
                            variant="credit"
                            title={credit.name}
                            typeLabel={getTypeLabel(credit.type)}
                            statusBadge={getStatusBadge(credit.status)}
                            remainingAmount={credit.remainingAmount}
                            totalAmount={credit.totalAmount}
                            interestRate={credit.interestRate}
                            monthlyPayment={credit.monthlyPayment}
                            nextPaymentDate={credit.nextPaymentDate}
                            endDate={credit.endDate}
                            actions={[
                                { label: 'Погасить досрочно', onClick: () => { handleOpenEarlyRepaymentDialog(credit) }, disabled: credit.status === 'closed' },
                                { label: 'График платежей', onClick: () => { } },
                                { label: 'Внести платеж', onClick: () => { handleOpenEditDialog(credit) }, disabled: credit.status === 'closed' },

                                ...(credit.status === 'closed' ?
                                    [{
                                        icon: <Trash2 size={16} style={{ color: '#ff0000' }} />,
                                        onClick: () => { handleDeleteCredit(credit.id) },
                                        variant: 'icon',
                                    }]
                                    : []
                                )
                            ]}
                        />
                    ))}
                    {creditsData.length === 0 && (
                        <p style={{ color: '#666', padding: '1rem' }}>Нет кредитов</p>
                    )}
                </div>
            </div>

            <div className="debts">
                <div className="debts__header">
                    <div>
                        <span className="debts__title ">
                            Мои долги (дебиторская задолженность)
                        </span>
                    </div>

                    <Dialog open={dialogOpenDebts} onOpenChange={setDialogOpenDebts}>
                        <DialogTrigger asChild>
                            <button className="dashboard__add-btn">
                                <Plus size={18} />
                                Добавить долг
                            </button>
                        </DialogTrigger>

                        <DialogContent aria-describedby={undefined}>
                            <DialogHeader>
                                <DialogTitle>Новый долг</DialogTitle>
                            </DialogHeader>
                            <div className="credit-form">
                                <div className="credit-form__field">
                                    <Label htmlFor="debts-name">Название * {debtErrors.name && <span className="form-error-icon">⚠️</span>}</Label>
                                    <Input
                                        id="debts-name"
                                        placeholder="Например: Занял коллеге"
                                        value={debtsName}
                                        onChange={(e) => {
                                            setDebtsName(e.target.value);
                                            setDebtErrors(prev => ({ ...prev, name: '' }));
                                        }}
                                        className={debtErrors.name ? 'is-error' : ''}
                                    />
                                    {debtErrors.name && <span className="form-error">{debtErrors.name}</span>}
                                </div>

                                <div className="credit-form__field">
                                    <Label htmlFor="debt-person">Кому {debtErrors.person && <span className="form-error-icon">⚠️</span>}</Label>
                                    <Input
                                        id="debt-person"
                                        placeholder="Имя человека"
                                        value={debtPerson}
                                        onChange={(e) => {
                                            setDebtPerson(e.target.value);
                                            setDebtErrors(prev => ({ ...prev, person: '' }));
                                        }}
                                        className={debtErrors.person ? 'is-error' : ''}
                                    />
                                    {debtErrors.person && <span className="form-error">{debtErrors.person}</span>}
                                </div>

                                <div className="credit-form__field">
                                    <Label htmlFor="debt-total-amount">Сумма * {debtErrors.amount && <span className="form-error-icon">⚠️</span>}</Label>
                                    <Input
                                        id="debt-total-amount"
                                        placeholder="0"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="999999999"
                                        value={debtAmount}
                                        onChange={(e) => {
                                            setDebtAmount(e.target.value);
                                            setDebtErrors(prev => ({ ...prev, amount: '' }));
                                        }}
                                        className={debtErrors.amount ? 'is-error' : ''}
                                    />
                                    {debtErrors.amount && <span className="form-error">{debtErrors.amount}</span>}
                                </div>

                                <div className="credit-form__row">
                                    <div className="credit-form__field">
                                        <Label htmlFor="debt-start-date">Дата выдачи * {debtErrors.startDate && <span className="form-error-icon">⚠️</span>}</Label>
                                        <Input
                                            id="debt-start-date"
                                            type="date"
                                            value={debtStartDate}
                                            onChange={(e) => {
                                                setDebtStartDate(e.target.value);
                                                setDebtErrors(prev => ({ ...prev, startDate: '' }));
                                            }}
                                            className={debtErrors.startDate ? 'is-error' : ''}

                                        />
                                        {debtErrors.startDate && <span className="form-error">{debtErrors.startDate}</span>}
                                    </div>
                                    <div className="credit-form__field">
                                        <Label htmlFor="debt-end-date">Срок возврата {debtErrors.returnDate && <span className="form-error-icon">⚠️</span>}</Label>
                                        <Input
                                            id="debt-end-date"
                                            type="date"
                                            value={debtReturnDate}
                                            onChange={(e) => {
                                                setDebtReturnDate(e.target.value);
                                                setDebtErrors(prev => ({ ...prev, returnDate: '' }));
                                            }}
                                            className={debtErrors.returnDate ? 'is-error' : ''}
                                        />
                                        {debtErrors.returnDate && <span className="form-error">{debtErrors.returnDate}</span>}
                                    </div>
                                </div>

                                <div className="transaction-form__buttons">
                                    <Button type="submit" className="transaction-form__button transaction-form__button--primary" onClick={handleAddDebt}>
                                        Добавить долг
                                    </Button>
                                    <Button type="button" variant="outline" className="transaction-form__button transaction-form__button--outline" onClick={() => {
                                        setDialogOpenDebts(false);
                                        setDebtErrors({});
                                    }}>
                                        Отмена
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>


                <div className="debts__grid">
                    {debtsData.map((debt) => (
                        <Card className="debt-card" key={debt.id}>
                            <CardHeader>
                                <div className="debt-card__header">
                                    <div>
                                        <h4 className="debt-card__title">
                                            {debt.name}
                                        </h4>
                                        <p className="debt-card__person">
                                            {debt.person}
                                        </p>
                                    </div>

                                    {getStatusBadge(debt.status)}
                                </div>
                            </CardHeader>

                            <CardContent className="card-content">
                                <div className="debt-card__content">
                                    <div className="debt-card__row">
                                        <span className="debt-card__label">Сумма:</span>
                                        <span className="debt-card__value">
                                            {debt.amount.toLocaleString('ru-RU')} ₽
                                        </span>
                                    </div>

                                    {debt.date && (
                                    <div className="debt-card__row">
                                        <span className="debt-card__label">Дата выдачи:</span>
                                        <span className="debt-card__value">
                                            {new Date(debt.date).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>
                                    )}

                                    {debt.returnDate && (
                                        <div className="debt-card__row">
                                            <span className="debt-card__label">Срок возврата:</span>
                                            <span className="debt-card__value">
                                                {new Date(debt.returnDate).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                    )}

                                    {debt.status === 'overdue' && (
                                        <div className="debt-card__alert">
                                            <AlertCircle size={16} />
                                            <span>Просрочен</span>
                                        </div>
                                    )}

                                    <div className="debt-card__actions">
                                        {debt.status !== 'returned' ? (
                                            <>
                                                <Button size="auto" variant="white">
                                                    Напомнить
                                                </Button>

                                                <Button
                                                    size="auto"
                                                    variant="white"
                                                    onClick={() => handleMarkReturned(debt.id)}
                                                >
                                                    Получено
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDeleteDebt(debt.id)}
                                            >
                                                <Trash2 size={16} style={{ color: '#ff0000' }} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {debtsData.length === 0 && (
                        <p style={{ color: '#666', padding: '1rem' }}>Нет долгов</p>
                    )}
                </div>
            </div>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Редактировать кредит</DialogTitle>
                    </DialogHeader>
                    <div className="credit-form">
                        <div className="credit-form__field">
                            <Label htmlFor="edit-credit-name">Название</Label>
                            <Input
                                id="edit-credit-name"
                                value={editForm.name}
                                onChange={(e) => { 
                                    setEditForm({ ...editForm, name: e.target.value });
                                }}
                                disabled
                            />
                        </div>

                        <div className="credit-form__row">
                            <div className="credit-form__field">
                                <Label htmlFor="edit-current-remaining">Текущий остаток</Label>
                                <div className="dialog-amount-box">
                                    <p className="dialog-amount-box__value">
                                        {parseFloat(editForm.remainingAmount).toLocaleString('ru-RU')} ₽
                                    </p>
                                </div>
                            </div>
                            <div className="credit-form__field">
                                <Label htmlFor="edit-payment-amount">Сумма платежа (₽) * {creditErrors.payment && <span className="form-error-icon">⚠️</span>}</Label>
                                <Input
                                    id="edit-payment-amount"
                                    type="number"
                                    placeholder="0"
                                    value={editForm.paymentAmount}
                                    onChange={(e) => {
                                        setEditForm({ ...editForm, paymentAmount: e.target.value })
                                        setCreditErrors(prev => ({ ...prev, payment: '' }));
                                    }}
                                    className={creditErrors.payment ? 'is-error' : ''}
                                />
                                {creditErrors.payment && <span className="form-error">{creditErrors.payment}</span>}
                            </div>
                        </div>

                        {editForm.paymentAmount && (
                            <div className="dialog-highlight-box">
                                <p className="dialog-highlight-box__label">Остаток после платежа:</p>
                                <p className="dialog-highlight-box__value">
                                    {Math.max(0, parseFloat(editForm.remainingAmount) - parseFloat(editForm.paymentAmount) || 0).toLocaleString('ru-RU')} ₽
                                </p>
                            </div>
                        )}

                        
                        <div className="credit-form__row">
                            <div className="credit-form__field">
                                <Label htmlFor="edit-end-date">Дата окончания</Label>
                                <Input
                                    id="edit-end-date"
                                    type="date"
                                    value={editForm.endDate}
                                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="transaction-form__buttons">
                            <Button
                                className="transaction-form__button transaction-form__button--primary"
                                onClick={handleSaveEditCredit}
                            >
                                Сохранить
                            </Button>
                            <Button
                                variant="outline"
                                className="transaction-form__button transaction-form__button--outline"
                                onClick={() => setEditDialogOpen(false)}
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={earlyRepaymentDialogOpen} onOpenChange={setEarlyRepaymentDialogOpen}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Досрочное погашение кредита</DialogTitle>
                    </DialogHeader>
                    <div className="credit-form">
                        {creditsData.find(c => c.id === repayingCreditId) && (
                            <>
                                <div className="credit-form__field">
                                    <Label>Кредит</Label>
                                    <div className="dialog-info-box">
                                        <p className="dialog-info-box__text">
                                            {creditsData.find(c => c.id === repayingCreditId)?.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="credit-form__field">
                                    <Label>Остаток к погашению</Label>
                                    <div className="dialog-amount-box">
                                        <p className="dialog-amount-box__value">
                                            {creditsData.find(c => c.id === repayingCreditId)?.remainingAmount.toLocaleString('ru-RU')} ₽
                                        </p>
                                    </div>
                                </div>

                                <div className="dialog-warning-box">
                                    <p className="dialog-warning-box__text">
                                        ⚠️ После подтверждения вся оставшаяся сумма кредита будет погашена, и статус кредита изменится на Закрыт.
                                    </p>
                                </div>
                            </>
                        )}

                        <div className="transaction-form__buttons">
                            <Button
                                className="transaction-form__button transaction-form__button--primary"
                                onClick={handleEarlyRepayment}
                            >
                                Подтвердить погашение
                            </Button>
                            <Button
                                variant="outline"
                                className="transaction-form__button transaction-form__button--outline"
                                onClick={() => setEarlyRepaymentDialogOpen(false)}
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
