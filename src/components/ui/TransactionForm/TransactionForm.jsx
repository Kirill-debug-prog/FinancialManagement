import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from '../label/label';
import { Input } from '../input_data/input'
import Textarea from "../textarea/textarea";
import { Button } from "../button/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select/select";
import './transactionForm.scss'

export default function TransactionForm({ onClose }) {
    const [ type, setType ] = useState('expense')
    const [ amount, setAmount ] = useState('')
    const [ category, setCategory ] = useState('')
    const [ account, setAccount ] = useState('')
    const [ date, setDate ] = useState(new Date().toISOString().split('T')[0])
    const [ description, setDescription ] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || !category || !account) {
            toast.error('Заполните обязательные поля')
            return
        }
        toast.success('Операция успешно добавлена');
        onClose();
    }

    return (
        <form onSubmit={handleSubmit} className="transaction-form">
            <Tabs value={type} onValueChange={setType}>
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
                                <SelectItem value="food">Продукты</SelectItem>
                                <SelectItem value="transport">Транспорт</SelectItem>
                                <SelectItem value="entertainment">Развлечения</SelectItem>
                                <SelectItem value="utilities">Коммунальные услуги</SelectItem>
                                <SelectItem value="health">Здоровье</SelectItem>
                                <SelectItem value="other">Прочее</SelectItem>
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
                                <SelectItem value="cash">Наличные</SelectItem>
                                <SelectItem value="card1">Карта Сбербанк</SelectItem>
                                <SelectItem value="card2">Карта Тинькофф</SelectItem>
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
                                <SelectItem value="salary">Зарплата</SelectItem>
                                <SelectItem value="bonus">Премия</SelectItem>
                                <SelectItem value="freelance">Фриланс</SelectItem>
                                <SelectItem value="investment">Инвестиции</SelectItem>
                                <SelectItem value="other">Прочее</SelectItem>
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
                                <SelectItem value="cash">Наличные</SelectItem>
                                <SelectItem value="card1">Карта Сбербанк</SelectItem>
                                <SelectItem value="card2">Карта Тинькофф</SelectItem>
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
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите счёт" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Наличные</SelectItem>
                                <SelectItem value="card1">Карта Сбербанк</SelectItem>
                                <SelectItem value="card2">Карта Тинькофф</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="transaction-form__field">
                        <Label htmlFor="to-account">На счёт *</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите счёт" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Наличные</SelectItem>
                                <SelectItem value="card1">Карта Сбербанк</SelectItem>
                                <SelectItem value="card2">Карта Тинькофф</SelectItem>
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
                <Button type="submit" className="transaction-form__button transaction-form__button--primary">
                    Сохранить
                </Button>
                <Button type="button" variant="outline" className="transaction-form__button transaction-form__button--outline" onClick={onClose}>
                    Отмена
                </Button>
            </div>
        </form>
    )
}