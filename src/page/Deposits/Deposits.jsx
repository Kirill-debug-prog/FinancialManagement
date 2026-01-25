import { useState } from "react";
import { toast } from "sonner";
import AppSidebar from '../../components/ui/AppSidebar/AppSidebar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog_/dialog';
import { Plus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CradTitle } from '../../components/ui/card/card'
import { Button } from '../../components/ui/button/button';
import { Label } from '../../components/ui/label/label';
import { Input } from '../../components/ui/input_data/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select/select";
import { Badge } from "../../components/ui/badge/badge";
import FinanceProductCard from '../../components/ui/FinanceProductCard/FinanceProductCard'
import './Deposits.scss'

const depositsData = [
    {
        id: 1,
        name: 'Накопительный вклад',
        bank: 'Сбербанк',
        amount: 500000,
        interestRate: 7.5,
        startDate: '2025-01-01',
        endDate: '2026-01-01',
        type: 'fixed',
        capitalization: true,
        status: 'active'
    },
    {
        id: 2,
        name: 'Пополняемый вклад',
        bank: 'Тинькофф',
        amount: 200000,
        interestRate: 6.8,
        startDate: '2025-06-01',
        endDate: '2025-12-01',
        type: 'replenishable',
        capitalization: false,
        status: 'active'
    },
    {
        id: 3,
        name: 'Краткосрочный',
        bank: 'ВТБ',
        amount: 100000,
        interestRate: 8.0,
        startDate: '2025-09-01',
        endDate: '2025-12-01',
        type: 'fixed',
        capitalization: true,
        status: 'active'
    },
];

export default function Deposits() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dipositName, setDipositName] = useState('')
    const [depositType, setDepositType] = useState('')

    const handleAddDeposit = () => {
        if (!dipositName) {
            toast.error('Заполните обязательные поля')
            return
        }
        toast.success('Вклад успешно добавлен')
        setDialogOpen(false)
    }

    const calculateEarnings = (deposit) => {
        const startDate = new Date(deposit.startDate)
        const endDate = new Date(deposit.endDate)
        const months = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 34 * 30)
        const earnings = deposit.amount * (deposit.interestRate / 100) * (months / 12)
        return earnings
    }

    const getTypeLabel = (type) => {
        switch (type) {
            case 'fixed':
                return 'Фиксироавнный'
            case 'replenishable':
                return 'Пополняемый'
            default:
                return type
        }
    }

    function getStatusBadge(status) {
        if (status === "active") return <Badge variant="green">Активен</Badge>;
        if (status === "closed") return <Badge variant="outline">Закрыт</Badge>;
        return <Badge>{status}</Badge>;
    }

    const totalDeposits = depositsData.reduce((sum, d) => sum + d.amount, 0)
    const totalEarnings = depositsData.reduce((sum, d) => sum + calculateEarnings(d), 0)

    return (
        <div className="deposits">
            <div className="deposits__header">
                <div>
                    <h1 className="deposits__title">Вклады и сбережения</h1>
                    <p className="deposits__subtitle">Управление депозитами и накоплениями</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <button className="dashboard__add-btn">
                            <Plus size={18} />
                            Добавить вклад
                        </button>
                    </DialogTrigger>

                    <DialogContent aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>Новый вклад</DialogTitle>
                        </DialogHeader>
                        <div className="deposits-form">
                            <div className="deposits-form__field">
                                <Label htmlFor="deposits-name">Название *</Label>
                                <Input
                                    id="deposits-name"
                                    placeholder="Например: Накопительный вклад"
                                    value={dipositName}
                                    onChange={(e) => setDipositName(e.terget.value)}
                                />
                            </div>

                            <div className="deposits-form__field">
                                <Label htmlFor="deposits-type">Тип кредита *</Label>
                                <Select value={depositType} onValueChange={setDepositType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите тип" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Фиксированный</SelectItem>
                                        <SelectItem value="replenishable">Пополняемый</SelectItem>
                                        <SelectItem value="withdrawable">С частичным снятием</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="deposits-form__row">
                                <div className="deposits-form__field">
                                    <Label htmlFor="total-amount">Сумма вклада</Label>
                                    <Input
                                        id="total-amount"
                                        placeholder="0"
                                        type="number"
                                    />
                                </div>
                                <div className="deposits-form__field">
                                    <Label htmlFor="interest-rate">Процентная ставка (%)</Label>
                                    <Input
                                        id="interest-rate"
                                        placeholder="Например: Кредит на авто"
                                        type="number"
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            <div className="deposits-form__row">
                                <div className="deposits-form__field">
                                    <Label htmlFor="start-date">Дата открытия *</Label>
                                    <Input
                                        id="start-date"
                                        type="date"
                                    />
                                </div>
                                <div className="deposits-form__field">
                                    <Label htmlFor="end-date">Дата окончания *</Label>
                                    <Input
                                        id="end-date"
                                        type="date"
                                    />
                                </div>
                            </div>

                            <div className="transaction-form__buttons">
                                <Button type="submit" className="transaction-form__button transaction-form__button--primary" onClick={handleAddDeposit}>
                                    Добавить
                                </Button>
                                <Button type="button" variant="outline" className="transaction-form__button transaction-form__button--outline" onClick={() => setDialogOpen(false)}>
                                    Отмена
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="deposits-summary">
                <Card>
                    <CardHeader className="deposits-summary__header">
                        <CradTitle className="deposits-summary__title">
                            Общая сумма вкладов
                        </CradTitle>
                        <TrendingUp className="deposits-summary__icon deposits-summary__icon--blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="deposits-summary__value deposits-summary__value--blue">
                            {totalDeposits.toLocaleString('ru-RU')} ₽
                        </div>
                        <p className="deposits-summary__subtitle">
                            На всех счетах
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="deposits-summary__header">
                        <CradTitle className="deposits-summary__title">
                            Ожидаемый доход
                        </CradTitle>
                        <TrendingUp className="deposits-summary__icon deposits-summary__icon--green" />
                    </CardHeader>
                    <CardContent>
                        <div className="deposits-summary__value deposits-summary__value--green">
                            {totalEarnings.toLocaleString('ru-RU')} ₽
                        </div>
                        <p className="deposits-summary__subtitle">
                            За весь период
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="deposits-summary__header">
                        <CradTitle className="deposits-summary__title">
                            Активных вкладов
                        </CradTitle>
                        <TrendingUp className="deposits-summary__icon deposits-summary__icon--purple" />
                    </CardHeader>
                    <CardContent>
                        <div className="deposits-summary__value deposits-summary__value--purple">
                            {depositsData.length}
                        </div>
                        <p className="deposits-summary__subtitle">
                            В разных банках
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="deposits-cards">
                <div className="deposits-cards__title ">
                    <span>Мои кредиты</span>
                </div>
                <div className="deposits-cards__position">
                    {depositsData.map((deposit) => {
                        const earnings = calculateEarnings(deposit);

                        return (
                            <FinanceProductCard
                                key={deposit.id}
                                variant="deposit"
                                title={deposit.name}
                                subtitle={deposit.bank}
                                typeLabel={getTypeLabel(deposit.type)}
                                statusBadge={
                                    <>
                                        {deposit.capitalization && <Badge variant="outline">С капитализацией</Badge>}
                                        {getStatusBadge(deposit.status)}
                                    </>
                                }
                                depositAmount={deposit.amount}
                                interestRate={deposit.interestRate}
                                earnings={earnings}
                                startDate={deposit.startDate}
                                endDate={deposit.endDate}
                                actions={[
                                    { label: "Пополнить", onClick: () => { } },
                                    { label: "Закрыть", onClick: () => { } },
                                ]}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}