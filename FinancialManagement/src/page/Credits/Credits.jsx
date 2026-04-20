import { useState, useEffect } from "react";
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
import { getCredits, createCredit, updateCredit } from '../../api/credits';
import { getDebts, createDebt, updateDebt } from '../../api/debts';
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
        if (!creditName || !creditType) {
            toast.error('Заполните обязательные поля');
            return;
        }
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
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка добавления кредита');
        }
    };

    const handleAddDebt = async () => {
        if (!debtsName || !debtAmount) {
            toast.error('Заполните обязательные поля');
            return;
        }
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
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка добавления долга');
        }
    };

    const handleMarkReturned = async (debtId) => {
        try {
            await updateDebt(debtId, { status: 'returned' });
            toast.success('Долг отмечен как возвращённый');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка обновления');
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
        if (!editForm.name || !editForm.type) {
            toast.error('Заполните обязательные поля');
            return;
        }

        try {
            // Вычисляем новый остаток, если была внесена сумма платежа
            let newRemainingAmount = parseFloat(editForm.remainingAmount) || 0;
            if (editForm.paymentAmount && editForm.paymentAmount <= newRemainingAmount) {
                const paymentAmount = parseFloat(editForm.paymentAmount) || 0;
                newRemainingAmount = Math.max(0, newRemainingAmount - paymentAmount);
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
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка обновления кредита');
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
                remainingAmount: 0,
                status: 'closed'
            });
            toast.success(`Кредит полностью погашен. Выплачено: ${credit.remainingAmount.toLocaleString('ru-RU')} ₽`);
            setEarlyRepaymentDialogOpen(false);
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
                                <Label htmlFor="credit-name">Название *</Label>
                                <Input
                                    id="credit-name"
                                    placeholder="Например: Кредит на авто"
                                    value={creditName}
                                    onChange={(e) => setCreditName(e.target.value)}
                                />
                            </div>

                            <div className="credit-form__field">
                                <Label htmlFor="credit-type">Тип кредита *</Label>
                                <Select value={creditType} onValueChange={setCreditType}>
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
                            </div>

                            <div className="credit-form__row">
                                <div className="credit-form__field">
                                    <Label htmlFor="total-amount">Общая сумма</Label>
                                    <Input
                                        id="total-amount"
                                        placeholder="0"
                                        type="number"
                                        value={creditTotalAmount}
                                        onChange={(e) => setCreditTotalAmount(e.target.value)}
                                    />
                                </div>
                                <div className="credit-form__field">
                                    <Label htmlFor="interest-rate">Процентная ставка (%)</Label>
                                    <Input
                                        id="interest-rate"
                                        placeholder="0"
                                        type="number"
                                        step="0.1"
                                        value={creditInterestRate}
                                        onChange={(e) => setCreditInterestRate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="credit-form__row">
                                <div className="credit-form__field">
                                    <Label htmlFor="monthly-payment">Ежемесячный платёж</Label>
                                    <Input
                                        id="monthly-payment"
                                        placeholder="0"
                                        type="number"
                                        value={creditMonthlyPayment}
                                        onChange={(e) => setCreditMonthlyPayment(e.target.value)}
                                    />
                                </div>
                                <div className="credit-form__field">
                                    <Label htmlFor="end-date">Дата окончания</Label>
                                    <Input
                                        id="end-date"
                                        type="date"
                                        value={creditEndDate}
                                        onChange={(e) => setCreditEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="transaction-form__buttons">
                                <Button type="submit" className="transaction-form__button transaction-form__button--primary" onClick={handleAddCredit}>
                                    Добавить
                                </Button>
                                <Button type="button" variant="outline" className="transaction-form__button transaction-form__button--outline" onClick={() => setDialogOpenCredit(false)}>
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
                                { label: 'Погасить досрочно', onClick: () => { handleOpenEarlyRepaymentDialog(credit) } },
                                { label: 'График платежей', onClick: () => { } },
                                { label: 'Изменить', onClick: () => { handleOpenEditDialog(credit) }, disabled: credit.status === 'closed' },
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
                                    <Label htmlFor="debts-name">Название *</Label>
                                    <Input
                                        id="debts-name"
                                        placeholder="Например: Занял коллеге"
                                        value={debtsName}
                                        onChange={(e) => setDebtsName(e.target.value)}
                                    />
                                </div>

                                <div className="credit-form__field">
                                    <Label htmlFor="debt-person">Кому</Label>
                                    <Input
                                        id="debt-person"
                                        placeholder="Имя человека"
                                        value={debtPerson}
                                        onChange={(e) => setDebtPerson(e.target.value)}
                                    />
                                </div>

                                <div className="credit-form__field">
                                    <Label htmlFor="debt-total-amount">Сумма *</Label>
                                    <Input
                                        id="debt-total-amount"
                                        placeholder="0"
                                        type="number"
                                        value={debtAmount}
                                        onChange={(e) => setDebtAmount(e.target.value)}
                                    />
                                </div>

                                <div className="credit-form__row">
                                    <div className="credit-form__field">
                                        <Label htmlFor="debt-start-date">Дата выдачи</Label>
                                        <Input
                                            id="debt-start-date"
                                            type="date"
                                            value={debtStartDate}
                                            onChange={(e) => setDebtStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="credit-form__field">
                                        <Label htmlFor="debt-end-date">Срок возврата</Label>
                                        <Input
                                            id="debt-end-date"
                                            type="date"
                                            value={debtReturnDate}
                                            onChange={(e) => setDebtReturnDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="transaction-form__buttons">
                                    <Button type="submit" className="transaction-form__button transaction-form__button--primary" onClick={handleAddDebt}>
                                        Добавить
                                    </Button>
                                    <Button type="button" variant="outline" className="transaction-form__button transaction-form__button--outline" onClick={() => setDialogOpenDebts(false)}>
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

                                    <div className="debt-card__row">
                                        <span className="debt-card__label">Дата выдачи:</span>
                                        <span className="debt-card__value">
                                            {new Date(debt.date).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>

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
                                        <Button size="auto" variant="white">
                                            Напомнить
                                        </Button>
                                        <Button size="auto" variant="white" onClick={() => handleMarkReturned(debt.id)}>
                                            Получено
                                        </Button>
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
                            <Label htmlFor="edit-credit-name">Название *</Label>
                            <Input
                                id="edit-credit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                                <Label htmlFor="edit-payment-amount">Сумма платежа (₽)</Label>
                                <Input
                                    id="edit-payment-amount"
                                    type="number"
                                    placeholder="0"
                                    value={editForm.paymentAmount}
                                    onChange={(e) => setEditForm({ ...editForm, paymentAmount: e.target.value })}
                                />
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
                                <Label htmlFor="edit-interest-rate">Процентная ставка (%)</Label>
                                <Input
                                    id="edit-interest-rate"
                                    type="number"
                                    step="0.1"
                                    value={editForm.interestRate}
                                    onChange={(e) => setEditForm({ ...editForm, interestRate: e.target.value })}
                                />
                            </div>
                            <div className="credit-form__field">
                                <Label htmlFor="edit-monthly-payment">Ежемесячный платёж</Label>
                                <Input
                                    id="edit-monthly-payment"
                                    type="number"
                                    value={editForm.monthlyPayment}
                                    onChange={(e) => setEditForm({ ...editForm, monthlyPayment: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="credit-form__row">
                            <div className="credit-form__field">
                                <Label htmlFor="edit-next-payment">Следующий платёж</Label>
                                <Input
                                    id="edit-next-payment"
                                    type="date"
                                    value={editForm.nextPaymentDate}
                                    onChange={(e) => setEditForm({ ...editForm, nextPaymentDate: e.target.value })}
                                />
                            </div>
                            <div className="credit-form__field">
                                <Label htmlFor="edit-end-date">Дата окончания</Label>
                                <Input
                                    id="edit-end-date"
                                    type="date"
                                    value={editForm.endDate}
                                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
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
                                        ⚠️ После подтверждения вся оставшаяся сумма кредита будет погашена, и статус кредита изменится на "Закрыт".
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
