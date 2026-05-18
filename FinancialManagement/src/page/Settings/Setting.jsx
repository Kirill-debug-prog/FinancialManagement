import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs/tabs";
import { Input } from '../../components/ui/input_data/input'
import { Button } from "../../components/ui/button/button";
import { Label } from "../../components/ui/label/label";
import { Card, CardContent, CardTitle, CardHeader } from '../../components/ui/card/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select/select";
import { Database, Trash2, Plus, Edit, Eye, EyeOff } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar/avatar";
import { Switch } from "../../components/ui/switch/switch";
import { Separator } from "../../components/ui/separator/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog_/dialog';
import { getCategories, createCategory, deleteCategory } from '../../api/categories';
import { invalidateCategoriesCache } from '../../api/cacheInvalidation';
import { transformCategoryFromBackend } from '../../api/transformers';
import { getCurrentUser, changeEmail, changePassword, changeProfile, } from '../../api/user';
import './Settings.scss';

export default function Setting() {
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [budgetAlerts, setBudgetAlerts] = useState(false);
    const [theme, setTheme] = useState('light');
    const [currency, setCurrency] = useState('RUB');
    const [language, setLanguage] = useState('ru');

    const [expenseCategories, setExpenseCategories] = useState([]);
    const [incomeCategories, setIncomeCategories] = useState([]);

    const [addCatDialogOpen, setAddCatDialogOpen] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatType, setNewCatType] = useState('expense');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState({});
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    async function loadUser() {
            try {
                const user = await getCurrentUser();
                setFirstName(user.firstName || '');
                setLastName(user.lastName || '');
                setPhoneNumber(user.phoneNumber || '');
                setEmail(user.email || '');
            } catch {
                toast.error('Не удалось загрузить пользователя');
            }
        }

    useEffect(() => {
        loadUser();
    }, []);

    const handleSaveProfile = async () => {
        try {
            await changeProfile(firstName, lastName, phoneNumber);
            toast.success('Профиль обновлён');
        } catch (err) {
            toast.error(`Ошибка: ${err.message}`);
        }
    };

    const handleChangeEmail = async () => {
        try {
            await changeEmail(email);
            toast.success('Email обновлён');
        } catch (err) {
            toast.error(`Ошибка: ${err.message}`);
        }
    };

    const validatePasswordForm = () => {
        const newErrors = {};

        if (!currentPassword) {
            newErrors.currentPassword = 'Введите текущий пароль';
        }

        if (!newPassword) {
            newErrors.newPassword = 'Введите новый пароль';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Подтвердите пароль';
        }

        if (newPassword && newPassword.length < 6) {
            newErrors.newPassword = 'Пароль должен быть минимум 6 символов';
        }

        if (
            newPassword &&
            confirmPassword &&
            newPassword !== confirmPassword
        ) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        return newErrors;
    };

    const handleChangePassword = async () => {
        const errors = validatePasswordForm();

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);

            toast.error(Object.values(errors)[0]);

            return;
        }

        setPasswordErrors({});

        try {
            await changePassword(currentPassword, newPassword);

            toast.success('Пароль изменён');

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data ||
                'Ошибка смены пароля';

            toast.error(message);
        }
    };

    const fetchCategories = async () => {
        try {
            const [exp, inc] = await Promise.all([
                getCategories('Expense'),
                getCategories('Income'),
            ]);
            setExpenseCategories(exp.map((c, i) => transformCategoryFromBackend(c, i)));
            setIncomeCategories(inc.map((c, i) => transformCategoryFromBackend(c, i)));
        } catch (err) {
            toast.error('Ошибка загрузки категорий');
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleBackup = () => {
        toast.success('Резервная копия создана');
    };

    const handleRestore = () => {
        toast.success('Данные восстановлены');
    };

    const handleAddCategory = async () => {
        if (!newCatName) {
            toast.error('Введите название категории');
            return;
        }
        try {
            await createCategory({ name: newCatName, type: newCatType });
            toast.success('Категория добавлена');
            setNewCatName('');
            setAddCatDialogOpen(false);
            invalidateCategoriesCache();
            fetchCategories();
        } catch (err) {
            toast.error(err.message || 'Ошибка добавления категории');
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await deleteCategory(id);
            toast.success('Категория удалена');
            invalidateCategoriesCache();
            fetchCategories();
        } catch (err) {
            toast.error(err.message || 'Ошибка удаления категории');
        }
    };

    return (
        <div className="settings">
            <div className="settings__header">
                <h1 className="settings__title">Настройки</h1>
                <p className="settings__subtitle">Персонализация и конфигурация системы</p>
            </div>

            <Tabs defaultValue="profile" className="settings__tabs">
                <TabsList className="settings__tabs-list">
                    <TabsTrigger value="profile">Профиль</TabsTrigger>
                    <TabsTrigger value="categories">Категории</TabsTrigger>
                    <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
                    <TabsTrigger value="notifications">Уведомления</TabsTrigger>
                    <TabsTrigger value="security">Безопасность</TabsTrigger>
                    <TabsTrigger value="data">Данные</TabsTrigger>
                </TabsList>

                {/* Profile */}
                <TabsContent value="profile">
                    <Card className="card">
                        <CardHeader className="card-header--start">
                            <CardTitle>Информация профиля</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content--spaced">
                            <div className="profile-row">
                                <Avatar className="avatar--large">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="avatar-fallback--blue">ИП</AvatarFallback>
                                </Avatar>
                                <div className="profile-actions">
                                    <Button variant="white">Изменить фото</Button>
                                    <p className="muted">JPG, PNG. Макс. 2МБ</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid--2cols gap">
                                <div className="field">
                                    <Label htmlFor="firstName">Имя</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="Иван"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>

                                <div className="field">
                                    <Label htmlFor="lastName">Фамилия</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Петров"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>

                                <div className="field">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ivan@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="field">
                                    <Label htmlFor="phone">Телефон</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+7 (999) 123-45-67"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid--2cols gap">
                                <Button size="sm" onClick={handleSaveProfile}>
                                    Сохранить профиль
                                </Button>

                                <Button size="sm" onClick={handleChangeEmail}>
                                    Сохранить email
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Categories */}
                <TabsContent value="categories">
                    <div className="stack">
                        <Card className="card">
                            <CardHeader className="card-header--between">
                                <CardTitle>Категории расходов</CardTitle>
                                <Dialog open={addCatDialogOpen && newCatType === 'expense'} onOpenChange={(v) => { setAddCatDialogOpen(v); setNewCatType('expense'); }}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" onClick={() => { setNewCatType('expense'); setAddCatDialogOpen(true); }}>
                                            <Plus className="icon icon--small" />
                                            Добавить
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent aria-describedby={undefined}>
                                        <DialogHeader>
                                            <DialogTitle>Новая категория расходов</DialogTitle>
                                        </DialogHeader>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div>
                                                <Label htmlFor="new-cat-name">Название</Label>
                                                <Input id="new-cat-name" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Название категории" />
                                            </div>
                                            <Button onClick={handleAddCategory}>Добавить</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <div className="categories-grid">
                                    {expenseCategories.map((cat) => (
                                        <div key={cat.id} className="category-item">
                                            <div className="category-left">
                                                <div className="category-icon">{cat.icon}</div>
                                                <div>
                                                    <p className="category-name">{cat.name}</p>
                                                    <div className="category-bar" style={{ backgroundColor: cat.color }} />
                                                </div>
                                            </div>
                                            <div className="category-actions">
                                                <Button variant="icon">
                                                    <Edit className="icon icon--small" />
                                                </Button>
                                                <Button variant="icon" onClick={() => handleDeleteCategory(cat.id)}>
                                                    <Trash2 className="icon icon--small" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>


                        <Card className="card">
                            <CardHeader className="card-header--between">
                                <CardTitle>Категории доходов</CardTitle>
                                <Dialog open={addCatDialogOpen && newCatType === 'income'} onOpenChange={(v) => { setAddCatDialogOpen(v); setNewCatType('income'); }}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" onClick={() => { setNewCatType('income'); setAddCatDialogOpen(true); }}>
                                            <Plus className="icon icon--small" />
                                            Добавить
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent aria-describedby={undefined}>
                                        <DialogHeader>
                                            <DialogTitle>Новая категория доходов</DialogTitle>
                                        </DialogHeader>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div>
                                                <Label htmlFor="new-cat-name-inc">Название</Label>
                                                <Input id="new-cat-name-inc" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Название категории" />
                                            </div>
                                            <Button onClick={handleAddCategory}>Добавить</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <div className="categories-grid">
                                    {incomeCategories.map((cat) => (
                                        <div key={cat.id} className="category-item">
                                            <div className="category-left">
                                                <div className="category-icon">{cat.icon}</div>
                                                <div>
                                                    <p className="category-name">{cat.name}</p>
                                                    <div className="category-bar" style={{ backgroundColor: cat.color }} />
                                                </div>
                                            </div>
                                            <div className="category-actions">
                                                <Button variant="icon">
                                                    <Edit className="icon icon--small" />
                                                </Button>
                                                <Button variant="icon" onClick={() => handleDeleteCategory(cat.id)}>
                                                    <Trash2 className="icon icon--small" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Appearance */}
                <TabsContent value="appearance">
                    <Card className="card">
                        <CardHeader className="card-header--start">
                            <CardTitle>Внешний вид и локализация</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content--spaced">
                            <div className="field">
                                <Label htmlFor="theme">Тема оформления</Label>
                                <Select value={theme} onValueChange={setTheme}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Светлая</SelectItem>
                                        <SelectItem value="dark">Тёмная</SelectItem>
                                        <SelectItem value="auto">Системная</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* <div className="field">
                                <Label htmlFor="currency">Основная валюта</Label>
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="RUB">Рубль (₽)</SelectItem>
                                        <SelectItem value="USD">Доллар ($)</SelectItem>
                                        <SelectItem value="EUR">Евро (€)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div> */}

                            <div className="field">
                                <Label htmlFor="language">Язык интерфейса</Label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ru">Русский</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button size="sm">Сохранить настройки</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications */}
                <TabsContent value="notifications">
                    <Card className="card">
                        <CardHeader className="card-header--start">
                            <CardTitle>Настройки уведомлений</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content--spaced">
                            <div className="setting-row">
                                <div>
                                    <Label>Email уведомления</Label>
                                    <p className="muted">Получать уведомления на почту</p>
                                </div>
                                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                            </div>

                            <Separator />

                            <div className="setting-row">
                                <div>
                                    <Label>Push уведомления</Label>
                                    <p className="muted">Браузерные уведомления</p>
                                </div>
                                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                            </div>

                            <Separator />

                            <div className="setting-row">
                                <div>
                                    <Label>Превышение бюджета</Label>
                                    <p className="muted">Предупреждать о перерасходе</p>
                                </div>
                                <Switch checked={budgetAlerts} onCheckedChange={setBudgetAlerts} />
                            </div>

                            <Separator />

                            <div className="setting-row">
                                <div>
                                    <Label>Напоминания о платежах</Label>
                                    <p className="muted">Уведомлять о предстоящих платежах</p>
                                </div>
                                <Switch defaultUnchecked />
                            </div>

                            <Separator />

                            <div className="setting-row">
                                <div>
                                    <Label>Еженедельный отчёт</Label>
                                    <p className="muted">Сводка по финансам каждую неделю</p>
                                </div>
                                <Switch defaultUnchecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader className="card-header--start">
                            <CardTitle>Безопасность и доступ</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content--spaced">
                            <div className="stack-sm">
                                <div className="field">
                                    <Label htmlFor="current-password">Текущий пароль {passwordErrors.currentPassword && <span className="form-error-icon">⚠️</span>}</Label>
                                    <div className="password-input-wrapper">
                                        <Input
                                            id="current-password"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className={passwordErrors.currentPassword ? 'is-error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() =>
                                                setShowCurrentPassword(!showCurrentPassword)
                                            }
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                    {passwordErrors.currentPassword && <span className="form-error">{passwordErrors.currentPassword}</span>}
                                </div>

                                <div className="field">
                                    <Label htmlFor="new-password">Новый пароль {passwordErrors.newPassword && <span className="form-error-icon">⚠️</span>}</Label>
                                    <div className="password-input-wrapper">
                                        <Input
                                            id="new-password"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className={passwordErrors.newPassword ? 'is-error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() =>
                                                setShowCurrentPassword(!showNewPassword)
                                            }
                                        >
                                            {showNewPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                    {passwordErrors.newPassword && <span className="form-error">{passwordErrors.newPassword}</span>}
                                </div>

                                <div className="field">
                                    <Label htmlFor="confirm-password">Подтвердите пароль {passwordErrors.confirmPassword && <span className="form-error-icon">⚠️</span>}</Label>
                                    <div className="password-input-wrapper">
                                        <Input
                                            id="confirm-password"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={passwordErrors.confirmPassword ? 'is-error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() =>
                                                setShowCurrentPassword(!showConfirmPassword)
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && <span className="form-error">{passwordErrors.confirmPassword}</span>}
                                </div>

                                <Button size="sm" onClick={handleChangePassword}>
                                    Изменить пароль
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Data */}
                <TabsContent value="data">
                    <div className="stack">
                        <Card className="card">
                            <CardHeader className="card-header--start">
                                <CardTitle>Резервное копирование</CardTitle>
                            </CardHeader>
                            <CardContent className="card-content--spaced">
                                <p className="muted">Создайте резервную копию всех ваших финансовых данных</p>
                                <div className="row gap">
                                    <Button size="lg" onClick={handleBackup}>
                                        <Database className="icon icon--small" />
                                        Создать копию
                                    </Button>
                                    <Button size="lg" variant="white" onClick={handleRestore}>
                                        Восстановить данные
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>


                        <Card className="cardcard--danger">
                            <CardHeader className="card-header--start">
                                <CardTitle className="text-danger">Опасная зона</CardTitle>
                            </CardHeader>
                            <CardContent className="card-content--spaced">
                                <div className="info--danger">
                                    <h3 className="section-title">Удалить все данные</h3>
                                    <p className="muted">Это действие удалит все ваши данные безвозвратно</p>
                                    <Button size="lg" variant="destructive">
                                        <Trash2 className="icon icon--small" />
                                        Удалить все данные
                                    </Button>
                                </div>


                                <Separator />


                                <div className="info--danger">
                                    <h3 className="section-title">Удалить аккаунт</h3>
                                    <p className="muted">Навсегда удалить ваш аккаунт и все связанные данные</p>
                                    <Button size="lg" variant="destructive">
                                        <Trash2 className="icon icon--small" />
                                        Удалить аккаунт
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
