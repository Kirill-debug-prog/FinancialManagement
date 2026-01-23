import { useState } from "react";
import FinanceProductCard from "../../components/ui/FinanceProductCard/FinanceProductCard";
import { Badge } from "../../components/ui/badge/badge";
import AppSidebar from "../../components/ui/AppSidebar/AppSidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog_/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select/select";
import { Card, CardHeader, CardContent } from "../../components/ui/card/card";
import { Label } from '../../components/ui/label/label';
import { Input } from '../../components/ui/input_data/input'
import { Button } from "../../components/ui/button/button";
import { Plus, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import "./Credits.scss"

const creditsData = [
    {
        id: 1,
        name: 'Ипотека',
        type: 'mortgage',
        totalAmount: 3000000,
        remainingAmount: 2500000,
        interestRate: 8.5,
        monthlyPayment: 25000,
        nextPaymentDate: '2025-11-05',
        endDate: '2035-10-01',
        status: 'active'
    },
    {
        id: 2,
        name: 'Автокредит',
        type: 'auto',
        totalAmount: 800000,
        remainingAmount: 450000,
        interestRate: 12,
        monthlyPayment: 18000,
        nextPaymentDate: '2025-11-10',
        endDate: '2027-06-01',
        status: 'active'
    },
    {
        id: 3,
        name: 'Долг другу',
        type: 'personal',
        totalAmount: 50000,
        remainingAmount: 30000,
        interestRate: 0,
        monthlyPayment: 5000,
        nextPaymentDate: '2025-11-15',
        endDate: '2026-04-01',
        status: 'active'
    },
];

const debtsData = [
    {
        id: 1,
        name: 'Занял коллеге',
        amount: 15000,
        person: 'Иван Петров',
        date: '2025-10-01',
        returnDate: '2025-11-30',
        status: 'pending'
    },
    {
        id: 2,
        name: 'Долг за аренду',
        amount: 8000,
        person: 'Мария Сидорова',
        date: '2025-09-15',
        returnDate: '2025-11-01',
        status: 'overdue'
    },
];

export default function Credits() {
    const [dialogOpenCredit, setDialogOpenCredit] = useState(false)
    const [dialogOpenDebts, setDialogOpenDebts] = useState(false)
    const [creditName, setCreditName] = useState('')
    const [creditType, setCreditType] = useState('')
    const [debtsName, setDebtsName] = useState('')

    const handleAddCredit = () => {
        if (!creditName || !creditType || debtsName) {
            toast.error('Заполните обязательные поля');
            return;
        }
        toast.success('Кредит успешно добавлен');
        setDialogOpen(false);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge variant="green">Активен</Badge>;
            case 'pending':
                return <Badge variant="yellow">Ожидание</Badge>;
            case 'overdue':
                return <Badge variant="red">Просрочен</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'mortgage': return 'Ипотека';
            case 'auto': return 'Автокредит';
            case 'personal': return 'Личный';
            default: return type;
        }
    };

    return (
        <div className="window">
            <AppSidebar />
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
                                        onChange={(e) => setCreditName(e.terget.value)}
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
                                        />
                                    </div>
                                    <div className="credit-form__field">
                                        <Label htmlFor="interest-rate">Процентная ставка (%)</Label>
                                        <Input
                                            id="interest-rate"
                                            placeholder="Например: Кредит на авто"
                                            type="number"
                                            step="0.1"
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
                                        />
                                    </div>
                                    <div className="credit-form__field">
                                        <Label htmlFor="end-date">Дата окончания</Label>
                                        <Input
                                            id="end-date"
                                            type="date"
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
                                    { label: 'Погасить досрочно', onClick: () => { } },
                                    { label: 'График платежей', onClick: () => { } },
                                    { label: 'Изменить', onClick: () => { } },
                                ]}
                            />
                        ))}
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
                                            onChange={(e) => setDebtsName(e.terget.value)}
                                        />
                                    </div>

                                    <div className="credit-form__field">
                                        <Label htmlFor="total-amount">Общая сумма</Label>
                                        <Input
                                            id="total-amount"
                                            placeholder="0"
                                            type="number"
                                        />
                                    </div>

                                    <div className="credit-form__row">
                                        <div className="credit-form__field">
                                            <Label htmlFor="start-date">Дата выдачи*</Label>
                                            <Input
                                                id="start-date"
                                                type="date"
                                            />
                                        </div>
                                        <div className="credit-form__field">
                                            <Label htmlFor="end-date">Срок возврата*</Label>
                                            <Input
                                                id="end-date"
                                                type="date"
                                            />
                                        </div>
                                    </div>

                                    <div className="transaction-form__buttons">
                                        <Button type="submit" className="transaction-form__button transaction-form__button--primary" onClick={handleAddCredit}>
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

                                        <div className="debt-card__row">
                                            <span className="debt-card__label">Срок возврата:</span>
                                            <span className="debt-card__value">
                                                {new Date(debt.returnDate).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>

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
                                            <Button size="auto" variant="white">
                                                Получено
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}