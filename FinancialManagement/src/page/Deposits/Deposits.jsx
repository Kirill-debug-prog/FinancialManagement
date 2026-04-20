import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog_/dialog';
import { Plus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CradTitle } from '../../components/ui/card/card'
import { Button } from '../../components/ui/button/button';
import { Label } from '../../components/ui/label/label';
import { Input } from '../../components/ui/input_data/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select/select";
import { Badge } from "../../components/ui/badge/badge";
import FinanceProductCard from '../../components/ui/FinanceProductCard/FinanceProductCard'
import { getDeposits, createDeposit, deleteDeposit, updateDeposit } from '../../api/deposits';
import './Deposits.scss'

export default function Deposits() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dipositName, setDipositName] = useState('')
    const [depositType, setDepositType] = useState('')
    const [depositBank, setDepositBank] = useState('')
    const [depositAmount, setDepositAmount] = useState('')
    const [depositRate, setDepositRate] = useState('')
    const [depositStartDate, setDepositStartDate] = useState('')
    const [depositEndDate, setDepositEndDate] = useState('')
    const [depositCapitalization, setDepositCapitalization] = useState(false)

    const [replenishDialogOpen, setReplenishDialogOpen] = useState(false)
    const [replenishingDepositId, setReplenishingDepositId] = useState(null)
    const [replenishForm, setReplenishForm] = useState({ amount: '', replenishmentDate: '' })

    const [depositsData, setDepositsData] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const data = await getDeposits();
            setDepositsData(data);
        } catch (err) {
            toast.error(err.message || 'Ошибка загрузки вкладов');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAddDeposit = async () => {
        if (!dipositName) {
            toast.error('Заполните обязательные поля')
            return
        }
        try {
            await createDeposit({
                name: dipositName,
                bank: depositBank,
                amount: parseFloat(depositAmount) || 0,
                interestRate: parseFloat(depositRate) || 0,
                startDate: depositStartDate ? new Date(depositStartDate).toISOString() : new Date().toISOString(),
                endDate: depositEndDate ? new Date(depositEndDate).toISOString() : null,
                type: depositType || 'fixed',
                capitalization: depositCapitalization,
                status: 'active',
            });
            toast.success('Вклад успешно добавлен');
            setDialogOpen(false);
            setDipositName('');
            setDepositType('');
            setDepositBank('');
            setDepositAmount('');
            setDepositRate('');
            setDepositStartDate('');
            setDepositEndDate('');
            setDepositCapitalization(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка добавления вклада');
        }
    }

    const handleCloseDeposit = async (depositId) => {
        if (!confirm('Вы уверены, что хотите закрыть вклад? Это действие нельзя отменить.')) {
            return;
        }

        try {
            await deleteDeposit(depositId);
            toast.success('Вклад успешно закрыт');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка закрытия вклада');
        }
    }

    const handleOpenReplenishDialog = (deposit) => {
        setReplenishingDepositId(deposit.id);
        setReplenishForm({
            amount: '',
            replenishmentDate: new Date().toISOString().split('T')[0]
        });
        setReplenishDialogOpen(true);
    };

    const handleSaveReplenish = async () => {
        if (!replenishForm.amount || parseFloat(replenishForm.amount) <= 0) {
            toast.error('Введите корректную сумму пополнения');
            return;
        }

        const deposit = depositsData.find(d => d.id === replenishingDepositId);
        if (!deposit) {
            toast.error('Вклад не найден');
            return;
        }

        try {
            const newAmount = deposit.amount + parseFloat(replenishForm.amount);
            await updateDeposit(replenishingDepositId, {
                ...deposit,
                amount: newAmount
            });
            toast.success(`Вклад пополнен на ${replenishForm.amount} ₽`);
            setReplenishDialogOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Ошибка пополнения вклада');
        }
    };

    const calculateEarnings = (deposit) => {
        const startDate = new Date(deposit.startDate)
        const endDate = deposit.endDate ? new Date(deposit.endDate) : new Date()
        const months = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        const earnings = deposit.amount * (deposit.interestRate / 100) * (months / 12)
        return earnings
    }

    const getTypeLabel = (type) => {
        switch (type) {
            case 'fixed':
                return 'Фиксированный'
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

    if (loading) {
        return <div className="deposits"><p>Загрузка...</p></div>;
    }

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
                                    onChange={(e) => setDipositName(e.target.value)}
                                />
                            </div>

                            <div className="deposits-form__field">
                                <Label htmlFor="deposits-bank">Банк</Label>
                                <Input
                                    id="deposits-bank"
                                    placeholder="Например: Сбербанк"
                                    value={depositBank}
                                    onChange={(e) => setDepositBank(e.target.value)}
                                />
                            </div>

                            <div className="deposits-form__field">
                                <Label htmlFor="deposits-type">Тип вклада *</Label>
                                <Select value={depositType} onValueChange={setDepositType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите тип" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Фиксированный</SelectItem>
                                        <SelectItem value="replenishable">Пополняемый</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="deposits-form__row">
                                <div className="deposits-form__field">
                                    <Label htmlFor="deposit-total-amount">Сумма вклада</Label>
                                    <Input
                                        id="deposit-total-amount"
                                        placeholder="0"
                                        type="number"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                    />
                                </div>
                                <div className="deposits-form__field">
                                    <Label htmlFor="deposit-interest-rate">Процентная ставка (%)</Label>
                                    <Input
                                        id="deposit-interest-rate"
                                        placeholder="0"
                                        type="number"
                                        step="0.1"
                                        value={depositRate}
                                        onChange={(e) => setDepositRate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="deposits-form__row">
                                <div className="deposits-form__field">
                                    <Label htmlFor="deposit-start-date">Дата открытия *</Label>
                                    <Input
                                        id="deposit-start-date"
                                        type="date"
                                        value={depositStartDate}
                                        onChange={(e) => setDepositStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="deposits-form__field">
                                    <Label htmlFor="deposit-end-date">Дата окончания *</Label>
                                    <Input
                                        id="deposit-end-date"
                                        type="date"
                                        value={depositEndDate}
                                        onChange={(e) => setDepositEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="deposits-form__field">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={depositCapitalization}
                                        onChange={(e) => setDepositCapitalization(e.target.checked)}
                                    />
                                    С капитализацией процентов
                                </label>
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
                            {Math.round(totalEarnings).toLocaleString('ru-RU')} ₽
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
                            {depositsData.filter(d => d.status === 'active').length}
                        </div>
                        <p className="deposits-summary__subtitle">
                            В разных банках
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="deposits-cards">
                <div className="deposits-cards__title ">
                    <span>Мои вклады</span>
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
                                        {deposit.capitalization && (
                                            <Badge variant="outline">С капитализацией</Badge>
                                        )}
                                        {getStatusBadge(deposit.status)}
                                    </>
                                }
                                depositAmount={deposit.amount}
                                interestRate={deposit.interestRate}
                                earnings={earnings}
                                startDate={deposit.startDate}
                                endDate={deposit.endDate}
                                actions={deposit.type !== 'fixed' ? [
                                    { label: "Пополнить", onClick: () => handleOpenReplenishDialog(deposit) },
                                    { label: "Закрыть", onClick: () => handleCloseDeposit(deposit.id) },
                                ] : [
                                    { label: "Закрыть", onClick: () => handleCloseDeposit(deposit.id) },
                                ]}
                            />
                        )
                    })}
                    {depositsData.length === 0 && (
                        <p style={{ color: '#666', padding: '1rem' }}>Нет вкладов</p>
                    )}
                </div>
            </div>

            <Dialog open={replenishDialogOpen} onOpenChange={setReplenishDialogOpen}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Пополнить вклад</DialogTitle>
                    </DialogHeader>
                    <div className="credit-form">
                        {depositsData.find(d => d.id === replenishingDepositId) && (
                            <>
                                <div className="credit-form__field">
                                    <Label>Вклад</Label>
                                    <div className="dialog-info-box">
                                        <p className="dialog-info-box__text">
                                            {depositsData.find(d => d.id === replenishingDepositId)?.name}
                                        </p>
                                        <p className="dialog-info-box__subtitle">
                                            {depositsData.find(d => d.id === replenishingDepositId)?.bank}
                                        </p>
                                    </div>
                                </div>

                                <div className="credit-form__field">
                                    <Label>Текущая сумма</Label>
                                    <div className="dialog-amount-box">
                                        <p className="dialog-amount-box__value">
                                            {depositsData.find(d => d.id === replenishingDepositId)?.amount.toLocaleString('ru-RU')} ₽
                                        </p>
                                    </div>
                                </div>

                                <div className="credit-form__field">
                                    <Label htmlFor="replenish-amount">Сумма пополнения (₽)</Label>
                                    <Input
                                        id="replenish-amount"
                                        placeholder="0"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={replenishForm.amount}
                                        onChange={(e) => setReplenishForm({ ...replenishForm, amount: e.target.value })}
                                    />
                                </div>

                                <div className="credit-form__field">
                                    <Label htmlFor="replenish-date">Дата пополнения</Label>
                                    <Input
                                        id="replenish-date"
                                        type="date"
                                        value={replenishForm.replenishmentDate}
                                        onChange={(e) => setReplenishForm({ ...replenishForm, replenishmentDate: e.target.value })}
                                    />
                                </div>

                                {replenishForm.amount && (
                                    <div className="dialog-highlight-box">
                                        <p className="dialog-highlight-box__label">
                                            Новая сумма вклада:
                                        </p>
                                        <p className="dialog-highlight-box__value">
                                            {(depositsData.find(d => d.id === replenishingDepositId)?.amount + parseFloat(replenishForm.amount) || 0).toLocaleString('ru-RU')} ₽
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="transaction-form__buttons">
                            <Button
                                className="transaction-form__button transaction-form__button--primary"
                                onClick={handleSaveReplenish}
                            >
                                Пополнить вклад
                            </Button>
                            <Button
                                variant="outline"
                                className="transaction-form__button transaction-form__button--outline"
                                onClick={() => setReplenishDialogOpen(false)}
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
