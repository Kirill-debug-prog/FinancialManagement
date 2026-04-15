import { Card, CardHeader, CradTitle, CardContent } from '../../components/ui/card/card'
import { CurrencyInputs, Input } from '../../components/ui/input_data/input';
import { Progress } from '../../components/ui/progress/progress'
import { CheckCircle, Wallet, DollarSign, Tag, TrendingUp } from 'lucide-react';
import '../Onboarding/Onboarding.css'
import { useState } from 'react';
import { toast } from 'sonner';
import { Label } from '../../components/ui/label/label';
import { Button } from '../../components/ui/button/button'
import { useNavigate } from 'react-router-dom'
import { createProfile } from '../../api/profiles';
import { createCurrency } from '../../api/currencies';
import { createCategory } from '../../api/categories';
import { createAccount } from '../../api/accounts';
import { setActiveProfileId } from '../../api/client';

const categories = {
    expense: [
        { id: 1, name: 'Продукты', icon: '🛒', selected: true },
        { id: 2, name: 'Транспорт', icon: '🚗', selected: true },
        { id: 3, name: 'Развлечения', icon: '🎬', selected: true },
        { id: 4, name: 'Коммунальные услуги', icon: '💡', selected: true },
        { id: 5, name: 'Здоровье', icon: '⚕️', selected: true },
        { id: 6, name: 'Одежда', icon: '👕', selected: false },
        { id: 7, name: 'Образование', icon: '📚', selected: false },
        { id: 8, name: 'Связь', icon: '📱', selected: false },
    ],
    income: [
        { id: 1, name: 'Зарплата', icon: '💰', selected: true },
        { id: 2, name: 'Фриланс', icon: '💻', selected: false },
        { id: 3, name: 'Инвестиции', icon: '📈', selected: false },
        { id: 4, name: 'Подарки', icon: '🎁', selected: false },
    ],
};

const CURRENCY_DATA = {
    RUB: { code: 'RUB', name: 'Российский рубль', shortName: '₽' },
    USD: { code: 'USD', name: 'Доллар США', shortName: '$' },
    EUR: { code: 'EUR', name: 'Евро', shortName: '€' },
};

function Onboarding({ onComplete }) {

    const [step, setStep] = useState(1)
    const [userName, SetUserName] = useState('')
    const [accountName, SetAccountName] = useState('')
    const [currency, setCurrency] = useState('RUB')
    const [initialBalance, setInitialBalance] = useState('')
    const [accountType, setAccountType] = useState('card')
    const [selectedExpenseCategories, setSelectedExpenseCategories] = useState(
        categories.expense.filter(c => c.selected).map(c => c.id)
    )
    const [selectedIncomeCategories, setselectedIncomeCategories] = useState(
        categories.income.filter(c => c.selected).map(c => c.id)
    )
    const [saving, setSaving] = useState(false)

    const navigate = useNavigate()

    const totalStep = 5;
    const progres = (step / totalStep) * 100

    const handleNext = () => {
        if (step === 1 && !userName) {
            toast.error('Введите ваше имя');
            return;
        }
        if (step === 3 && !accountName) {
            toast.error('Введите название счёта');
            return;
        }
        if (step < totalStep) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleComplete = async () => {
        setSaving(true);
        try {
            // 1. Create profile
            const profile = await createProfile(userName, currency);
            setActiveProfileId(profile.id);

            // 2. Create currency
            const currData = CURRENCY_DATA[currency];
            const createdCurrency = await createCurrency({
                code: currData.code,
                name: currData.name,
                shortName: currData.shortName,
                decimalPlaces: 2,
                rateDecimalPlaces: 4,
                sortOrder: 0,
            });

            // 3. Create selected expense categories
            const selectedExpCats = categories.expense.filter(c => selectedExpenseCategories.includes(c.id));
            for (const cat of selectedExpCats) {
                await createCategory({ name: cat.name, type: 'expense' });
            }

            // 4. Create selected income categories
            const selectedIncCats = categories.income.filter(c => selectedIncomeCategories.includes(c.id));
            for (const cat of selectedIncCats) {
                await createCategory({ name: cat.name, type: 'income' });
            }

            // 5. Create first account
            const iconMap = { card: '💳', cash: '💵', savings: '🏦', investment: '📈' };
            await createAccount({
                name: accountName,
                icon: iconMap[accountType] || '💳',
                sortOrder: 0,
                currencyId: createdCurrency.id,
                initialBalance: parseFloat(initialBalance) || 0,
                initialBalanceDate: new Date().toISOString(),
            });

            toast.success('Настройка завершена! Добро пожаловать!');
            onComplete(userName);
            navigate('/onboarding-success');
        } catch (err) {
            toast.error(err.message || 'Ошибка при сохранении настроек');
        } finally {
            setSaving(false);
        }
    }

    const handleInputChangeLetter = (event) => {
        const rawValue = event.target.value;
        const lettersOnly = rawValue.replace(/[^a-zA-Zа-яА-ЯёЁ ]/g, '');

        step === 1 ? SetUserName(lettersOnly) : SetAccountName(lettersOnly);
    }

    const getCurrencySymbol = (curr) => {
        switch (curr) {
            case 'RUB': return '₽';
            case 'USD': return '$';
            case 'EUR': return '€';
            default: return '';
        }
    }

    const toggleExpenseCategory = (id) => {
        setSelectedExpenseCategories(prev =>
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        );
    };

    const toggleIncomeCategory = (id) => {
        setselectedIncomeCategories(prev =>
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        );
    };


    return (
        <div className='onboarding'>
            <Card className='onboarding__card'>
                <CardHeader className='onboarding__header'>
                    <div className='onboarding__header-inf'>
                        <div>
                            <CradTitle className='onboarding__header-title'>Финансовый помошник</CradTitle>
                            <p className='onboarding__header-steps'>Шаг {step} из {totalStep}</p>
                        </div>
                        <p className='onboarding__header-precent'>{Math.round(progres)}%</p>
                    </div>
                    <Progress className='onboarding__header-progress' value={progres}></Progress>
                </CardHeader>

                <CardContent>
                    {/* Step 1: Welcome */}
                    {step == 1 && (
                        <>
                            <div className="onboarding__content-descriptions">
                                <div className='onboarding__content-icon blue'>
                                    <TrendingUp className='onboarding__content-blue' />
                                </div>
                                <h2 className='onboarding__content-title'>Начнем настройку</h2>
                                <p className="onboerding__content-description">Мы поможем вам настроить приложение за несколько простых шагов</p>
                            </div>

                            <div className='onboarding__data'>
                                <Label className='onboarding__data-lable' htmlFor='user-name'>Имя пользователя</Label>
                                <Input
                                    id='user-name'
                                    placeholder='Иван'
                                    value={userName}
                                    onChange={handleInputChangeLetter}
                                    className='onboarding__data-input'
                                />
                            </div>

                            <div className='onboarding__info'>
                                <div className="onboarding__info-block">
                                    <Wallet className='onboarding__info-icon wallet' />
                                    <p className="onboarding__info-title">Счета</p>
                                </div>

                                <div className="onboarding__info-block">
                                    <DollarSign className='onboarding__info-icon dollarSing' />
                                    <p className="onboarding__info-title">Операции</p>
                                </div>

                                <div className="onboarding__info-block">
                                    <Tag className='onboarding__info-icon tag' />
                                    <p className="onboarding__info-title">Категории</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 2: Currency */}
                    {step == 2 && (
                        <>
                            <div className="onboarding__content-descriptions">
                                <div className='onboarding__content-icon green'>
                                    <DollarSign className='onboarding__content-green' />
                                </div>
                                <h2 className='onboarding__content-title'>Выберите основную валюту</h2>
                                <p className="onboerding__content-description">Это будет валюта по умолчанию для всех операций</p>
                            </div>

                            <div className="onboarding__currency-choice">
                                <button
                                    onClick={() => setCurrency('RUB')}
                                    className={`onboarding__currncy ${currency === 'RUB'
                                        ? 'onboarding__variant-type--active'
                                        : 'onboarding__variant-type--default'
                                        }`}
                                >
                                    <div className="onboarding__currncy-text">
                                        <p className="onboarding__currncy-name">Российский рубдь</p>
                                        <p className="onboarding__currncy-designation">RUB (₽)</p>
                                    </div>
                                    {currency === 'RUB' && (
                                        <CheckCircle className='onboarding__currncy-icon' />
                                    )}
                                </button>

                                <button
                                    onClick={() => setCurrency('USD')}
                                    className={`onboarding__currncy ${currency === 'USD'
                                        ? 'onboarding__variant-type--active'
                                        : 'onboarding__variant-type--default'
                                        }`}>
                                    <div className="onboarding__currncy-text">
                                        <p className="onboarding__currncy-name">Доллар США</p>
                                        <p className="onboarding__currncy-designation">USD ($)</p>
                                    </div>
                                    {currency === 'USD' && (
                                        <CheckCircle className='onboarding__currncy-icon' />
                                    )}
                                </button>

                                <button
                                    onClick={() => setCurrency('EUR')}
                                    className={`onboarding__currncy ${currency === 'EUR'
                                        ? 'onboarding__variant-type--active'
                                        : 'onboarding__variant-type--default'
                                        }`}>
                                    <div className="onboarding__currncy-text">
                                        <p className="onboarding__currncy-name">Евро</p>
                                        <p className="onboarding__currncy-designation">EUR (€)</p>
                                    </div>
                                    {currency === 'EUR' && (
                                        <CheckCircle className='onboarding__currncy-icon' />
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Step 3: First Account */}
                    {step == 3 && (
                        <>
                            <div className="onboarding__content-descriptions">
                                <div className='onboarding__content-icon ping'>
                                    <Wallet className='onboarding__content-ping' />
                                </div>
                                <h2 className='onboarding__content-title'>Создайте первый счёт</h2>
                                <p className="onboerding__content-description">Добавьте ваш основной счёт для отслеживания расходов</p>
                            </div>

                            <div className='onboarding__data'>
                                <Label className='onboarding__data-lable' htmlFor='account-name'>Название счета</Label>
                                <Input
                                    id='account-name'
                                    placeholder='Например: основная карта'
                                    value={accountName}
                                    onChange={handleInputChangeLetter}
                                    className='onboarding__data-input'
                                />
                            </div>

                            <div className="onboarding__account-type">
                                <p className='onboarding__account-type-text'>Тип счета</p>
                                <div className="onboarding__account-variant">
                                    <button
                                        onClick={() => setAccountType('card')}
                                        className={`onboarding__account-choose ${accountType === 'card'
                                            ? 'onboarding__variant-type--active'
                                            : 'onboarding__variant-type--default'
                                            }`}>
                                        <div className="onboarding__account-choose-icon">💵</div>
                                        <p className="onboarding__account-choose-text">Банковская карта</p>
                                    </button>
                                    <button
                                        onClick={() => setAccountType('cash')}
                                        className={`onboarding__account-choose ${accountType === 'cash'
                                            ? 'onboarding__variant-type--active'
                                            : 'onboarding__variant-type--default'
                                            }`}>
                                        <div className="onboarding__account-choose-icon">💳</div>
                                        <p className="onboarding__account-choose-text">Наличные</p>
                                    </button>
                                    <button
                                        onClick={() => setAccountType('savings')}
                                        className={`onboarding__account-choose ${accountType === 'savings'
                                            ? 'onboarding__variant-type--active'
                                            : 'onboarding__variant-type--default'
                                            }`}>
                                        <div className="onboarding__account-choose-icon">🏦</div>
                                        <p className="onboarding__account-choose-text">Сберегатеотный</p>
                                    </button>
                                    <button
                                        onClick={() => setAccountType('investment')}
                                        className={`onboarding__account-choose ${accountType === 'investment'
                                            ? 'onboarding__variant-type--active'
                                            : 'onboarding__variant-type--default'
                                            }`}>
                                        <div className="onboarding__account-choose-icon">📈</div>
                                        <p className="onboarding__account-choose-text">Инвестиционный</p>
                                    </button>
                                </div>
                            </div>

                            <div className='onboarding__data'>
                                <Label className='onboarding__data-lable' htmlFor='initial-balance'>Наличный баланс</Label>
                                <div className="onboarding__data-input-box">
                                    <CurrencyInputs
                                        id='initial-balance'
                                        placeholder='0'
                                        decimalSeparator=","
                                        value={initialBalance}
                                        onValueChange={(value) => setInitialBalance(value)}
                                        decimalsLimit={2}
                                        allowNegativeValue={false}
                                        className='onboarding__data-input'
                                    />
                                    <span className="onboarding__data-currency">
                                        {getCurrencySymbol(currency)}
                                    </span>
                                </div>
                                <p className="onboarding__data-description">Укажите текущий баланс на этом счёте</p>
                            </div>
                        </>
                    )}

                    {/* Step 4: Categories */}
                    {step === 4 && (
                        <>
                            <div className="onboarding__content-descriptions">
                                <div className='onboarding__content-icon orange'>
                                    <Tag className='onboarding__content-orange' />
                                </div>
                                <h2 className='onboarding__content-title'>Выберите категории</h2>
                                <p className="onboerding__content-description">Отметьте категории, которые вы будете использовать</p>
                            </div>

                            <div className="onboarding__categories">
                                <p className='onboarding__categories-type-text'>Тип счета</p>
                                <div className="onboarding__account-categories">
                                    {categories.expense.map(categ => {
                                        return (
                                            <button key={categ.id}
                                                onClick={() => toggleExpenseCategory(categ.id)}
                                                className={`onboarding__categories-categiry ${selectedExpenseCategories.includes(categ.id)
                                                    ? 'onboarding__variant-type--active'
                                                    : 'onboarding__variant-type--default'
                                                    }`}>
                                                <div className="onboerding__categories-block-content">
                                                    <span className='onboarding__categories-categiry-icon'>{categ.icon}</span>
                                                    <span className="onboarding__categories-categiry-text">{categ.name}</span>
                                                </div>
                                                {selectedExpenseCategories.includes(categ.id) && (
                                                    <CheckCircle className='onboarding__categories-icon' />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>

                                <p className='onboarding__categories-type-text'>Категории доходов</p>
                                <div className="onboarding__account-categories">
                                    {categories.income.map(categ => {
                                        return (
                                            <button key={categ.id}
                                                onClick={() => toggleIncomeCategory(categ.id)}
                                                className={`onboarding__categories-categiry ${selectedIncomeCategories.includes(categ.id)
                                                    ? 'onboarding__variant-type--active'
                                                    : 'onboarding__variant-type--default'
                                                    }`}>
                                                <div className="onboerding__categories-block-content">
                                                    <span className='onboarding__categories-categiry-icon'>{categ.icon}</span>
                                                    <span className="onboarding__categories-categiry-text">{categ.name}</span>
                                                </div>
                                                {selectedIncomeCategories.includes(categ.id) && (
                                                    <CheckCircle className='onboarding__categories-icon' />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 5: Complete */}
                    {step === 5 && (
                        <>
                            <div className="onboarding__content-descriptions">
                                <div className="onboarding__content-icon green">
                                    <CheckCircle className='onboarding__content-green' />
                                </div>
                                <h2 className='onboarding__content-title'>Все готово {userName}</h2>
                                <p className="onboerding__content-description">Ваше финансовое приложение настроено и готово к работе</p>
                            </div>
                            <div className="onboarding__complete-info">
                                <h3 className='onboarding__complete-info-title'>Ваши настройки:</h3>
                                <ul className='onboarding__complete-info-list'>
                                    <li className='onboarding__complete-info-item'>Основная валюта: <span className='onboarding__complete-info-value'>{currency}</span></li>
                                    <li className='onboarding__complete-info-item'>Первый счет: <span className='onboarding__complete-info-value'>{accountName}</span></li>
                                    <li className='onboarding__complete-info-item'>Начальный баланс: <span className='onboarding__complete-info-value'>{initialBalance || '0.00'} {getCurrencySymbol(currency)}</span></li>
                                    <li className='onboarding__complete-info-item'>Выбранные категории расходов: <span className='onboarding__complete-info-value'>{selectedExpenseCategories.length}</span></li>
                                    <li className='onboarding__complete-info-item'>Выбранные категории доходов: <span className='onboarding__complete-info-value'>{selectedIncomeCategories.length}</span></li>
                                </ul>
                            </div>
                            <div className="onboarding__instructions-box">
                                <h4 className='onboarding__instructions-title'>Что дальше?</h4>
                                <ul className='onboarding__instructions-list'>
                                    <li className='onboarding__instructions-item'>Добавьте первую операцию</li>
                                    <li className='onboarding__instructions-item'>Изучите отчёты и аналитику</li>
                                    <li className='onboarding__instructions-item'>Настройте уведомления о платежах</li>
                                    <li className='onboarding__instructions-item'>Импортируйте банковские выписки</li>
                                </ul>
                            </div>
                        </>
                    )}

                    {/* Button*/}
                    <div className="onboarding__button">
                        {step > 1 && (
                            <Button
                                onClick={handleBack}
                                variant="white"
                                className="onboarding__button-back">Назад
                            </Button>
                        )}
                        {step < totalStep ? (
                            <Button
                                onClick={handleNext}
                                variant="black"
                                className="onboarding__button-next">
                                Далее
                            </Button>
                        ) :
                            (
                                <Button
                                    onClick={handleComplete}
                                    className="onboarding__button-start"
                                    variant='green'
                                    disabled={saving}>
                                    {saving ? 'Сохранение...' : 'Начать работу'}
                                </Button>
                            )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export { Onboarding }
