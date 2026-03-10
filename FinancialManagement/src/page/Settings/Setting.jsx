import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs/tabs";
import { Input } from '../../components/ui/input_data/input'
import { Button } from "../../components/ui/button/button";
import { Label } from "../../components/ui/label/label";
import { Card, CardContent, CradTitle, CardHeader } from '../../components/ui/card/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select/select";
import { Database, Trash2, Plus, Edit } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar/avatar";
import { Switch } from "../../components/ui/switch/switch";
import { Separator } from "../../components/ui/separator/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog_/dialog';
import { getCategories, createCategory, deleteCategory } from '../../api/categories';
import { transformCategoryFromBackend } from '../../api/transformers';
import './Settings.scss';

export default function Setting() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [budgetAlerts, setBudgetAlerts] = useState(true);
    const [theme, setTheme] = useState('light');
    const [currency, setCurrency] = useState('RUB');
    const [language, setLanguage] = useState('ru');

    const [expenseCategories, setExpenseCategories] = useState([]);
    const [incomeCategories, setIncomeCategories] = useState([]);

    const [addCatDialogOpen, setAddCatDialogOpen] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatType, setNewCatType] = useState('expense');

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

    const handleSaveProfile = () => {
        toast.success('Профиль обновлён');
    };

    const handleChangePassword = () => {
        toast.success('Пароль изменён');
    };

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
            fetchCategories();
        } catch (err) {
            toast.error(err.message || 'Ошибка добавления категории');
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await deleteCategory(id);
            toast.success('Категория удалена');
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
                            <CradTitle>Информация профиля</CradTitle>
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
                                    <Input id="firstName" placeholder="Иван" />
                                </div>
                                <div className="field">
                                    <Label htmlFor="lastName">Фамилия</Label>
                                    <Input id="lastName" placeholder="Петров" />
                                </div>
                                <div className="field">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="ivan@example.com" />
                                </div>
                                <div className="field">
                                    <Label htmlFor="phone">Телефон</Label>
                                    <Input id="phone" type="tel" placeholder="+7 (999) 123-45-67" />
                                </div>
                            </div>


                            <Button size="sm" onClick={handleSaveProfile}>Сохранить изменения</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Categories */}
                <TabsContent value="categories">
                    <div className="stack">
                        <Card className="card">
                            <CardHeader className="card-header--between">
                                <CradTitle>Категории расходов</CradTitle>
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
                                <CradTitle>Категории доходов</CradTitle>
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
                            <CradTitle>Внешний вид и локализация</CradTitle>
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

                            <div className="field">
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
                            </div>

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
                            <CradTitle>Настройки уведомлений</CradTitle>
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
                                <Switch defaultChecked />
                            </div>

                            <Separator />

                            <div className="setting-row">
                                <div>
                                    <Label>Еженедельный отчёт</Label>
                                    <p className="muted">Сводка по финансам каждую неделю</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader className="card-header--start">
                            <CradTitle>Безопасность и доступ</CradTitle>
                        </CardHeader>
                        <CardContent className="card-content--spaced">
                            <div className="stack-sm">
                                <div className="field">
                                    <Label htmlFor="current-password">Текущий пароль</Label>
                                    <Input id="current-password" type="password" />
                                </div>
                                <div className="field">
                                    <Label htmlFor="new-password">Новый пароль</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <div className="field">
                                    <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                                    <Input id="confirm-password" type="password" />
                                </div>
                                <Button size="sm" onClick={handleChangePassword}>Изменить пароль</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Data */}
                <TabsContent value="data">
                    <div className="stack">
                        <Card className="card">
                            <CardHeader className="card-header--start">
                                <CradTitle>Резервное копирование</CradTitle>
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
                                <CradTitle className="text-danger">Опасная зона</CradTitle>
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
