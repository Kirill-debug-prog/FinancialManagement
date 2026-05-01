import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
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
    const { t, i18n } = useTranslation();
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [budgetAlerts, setBudgetAlerts] = useState(false);
    const [theme, setTheme] = useState('light');
    const [currency, setCurrency] = useState('RUB');
    const [language, setLanguage] = useState(i18n.language);

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
            toast.error(t('common.message.errorLoadingCategories'));
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSaveProfile = () => {
        toast.success(t('common.message.profileUpdated'));
    };

    const handleChangePassword = () => {
        toast.success(t('common.message.passwordChanged'));
    };

    const handleBackup = () => {
        toast.success(t('common.message.backupCreated'));
    };

    const handleRestore = () => {
        toast.success(t('common.message.dataRestored'));
    };

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        i18n.changeLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
    };

    const handleAddCategory = async () => {
        if (!newCatName) {
            toast.error(t('common.message.enterCategoryName'));
            return;
        }
        try {
            await createCategory({ name: newCatName, type: newCatType });
            toast.success(t('common.message.categoryAdded'));
            setNewCatName('');
            setAddCatDialogOpen(false);
            fetchCategories();
        } catch (err) {
            toast.error(err.message || t('common.message.errorAddingCategory'));
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await deleteCategory(id);
            toast.success(t('common.message.categoryDeleted'));
            fetchCategories();
        } catch (err) {
            toast.error(err.message || t('common.message.errorDeletingCategory'));
        }
    };

    return (
        <div className="settings">
            <div className="settings__header">
                <h1 className="settings__title">{t('settings.title')}</h1>
                <p className="settings__subtitle">{t('settings.subtitle')}</p>
            </div>

            <Tabs defaultValue="profile" className="settings__tabs">
                <TabsList className="settings__tabs-list">
                    <TabsTrigger value="profile">{t('settings.tabs.profile')}</TabsTrigger>
                    <TabsTrigger value="categories">{t('settings.tabs.categories')}</TabsTrigger>
                    <TabsTrigger value="appearance">{t('settings.tabs.appearance')}</TabsTrigger>
                    <TabsTrigger value="notifications">{t('settings.tabs.notifications')}</TabsTrigger>
                    <TabsTrigger value="security">{t('settings.tabs.security')}</TabsTrigger>
                    <TabsTrigger value="data">{t('settings.tabs.data')}</TabsTrigger>
                </TabsList>

                {/* Profile */}
                <TabsContent value="profile">
                    <Card className="card">
                        <CardHeader className="card-header--start">
                            <CradTitle>{t('settings.profile.title')}</CradTitle>
                        </CardHeader>
                        <CardContent className="card-content--spaced">
                            <div className="profile-row">
                                <Avatar className="avatar--large">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="avatar-fallback--blue">ИП</AvatarFallback>
                                </Avatar>
                                <div className="profile-actions">
                                    <Button variant="white">{t('common.button.changePhoto')}</Button>
                                    <p className="muted">{t('common.message.maxFileSize')}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid--2cols gap">
                                <div className="field">
                                    <Label htmlFor="firstName">{t('common.label.firstName')}</Label>
                                    <Input id="firstName" placeholder={t('common.placeholder.name')} />
                                </div>
                                <div className="field">
                                    <Label htmlFor="lastName">{t('common.label.lastName')}</Label>
                                    <Input id="lastName" placeholder={t('common.placeholder.surname')} />
                                </div>
                                <div className="field">
                                    <Label htmlFor="email">{t('common.label.email')}</Label>
                                    <Input id="email" type="email" placeholder={t('common.placeholder.email')} />
                                </div>
                                <div className="field">
                                    <Label htmlFor="phone">{t('common.label.phone')}</Label>
                                    <Input id="phone" type="tel" placeholder={t('common.placeholder.phone')} />
                                </div>
                            </div>


                            <Button size="sm" onClick={handleSaveProfile}>{t('common.button.saveChanges')}</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Categories */}
                <TabsContent value="categories">
                    <div className="stack">
                        <Card className="card">
                            <CardHeader className="card-header--between">
                                <CradTitle>{t('settings.categories.expenseTitle')}</CradTitle>
                                <Dialog open={addCatDialogOpen && newCatType === 'expense'} onOpenChange={(v) => { setAddCatDialogOpen(v); setNewCatType('expense'); }}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" onClick={() => { setNewCatType('expense'); setAddCatDialogOpen(true); }}>
                                            <Plus className="icon icon--small" />
                                            {t('common.button.add')}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent aria-describedby={undefined}>
                                        <DialogHeader>
                                            <DialogTitle>{t('settings.categories.newExpenseDialog')}</DialogTitle>
                                        </DialogHeader>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div>
                                                <Label htmlFor="new-cat-name">{t('settings.categories.categoryName')}</Label>
                                                <Input id="new-cat-name" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder={t('common.placeholder.categoryName')} />
                                            </div>
                                            <Button onClick={handleAddCategory}>{t('common.button.add')}</Button>
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
                                <CradTitle>{t('settings.categories.incomeTitle')}</CradTitle>
                                <Dialog open={addCatDialogOpen && newCatType === 'income'} onOpenChange={(v) => { setAddCatDialogOpen(v); setNewCatType('income'); }}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" onClick={() => { setNewCatType('income'); setAddCatDialogOpen(true); }}>
                                            <Plus className="icon icon--small" />
                                            {t('common.button.add')}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent aria-describedby={undefined}>
                                        <DialogHeader>
                                            <DialogTitle>{t('settings.categories.newIncomeDialog')}</DialogTitle>
                                        </DialogHeader>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div>
                                                <Label htmlFor="new-cat-name-inc">{t('settings.categories.categoryName')}</Label>
                                                <Input id="new-cat-name-inc" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder={t('common.placeholder.categoryName')} />
                                            </div>
                                            <Button onClick={handleAddCategory}>{t('common.button.add')}</Button>
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
                            <CradTitle>{t('settings.appearance.title')}</CradTitle>
                        </CardHeader>
                        <CardContent className="card-content--spaced">
                            <div className="field">
                                <Label htmlFor="theme">{t('common.label.theme')}</Label>
                                <Select value={theme} onValueChange={setTheme}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">{t('settings.appearance.themeLight')}</SelectItem>
                                        <SelectItem value="dark">{t('settings.appearance.themeDark')}</SelectItem>
                                        <SelectItem value="auto">{t('settings.appearance.themeAuto')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="field">
                                <Label htmlFor="currency">{t('common.label.currency')}</Label>
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="RUB">{t('settings.appearance.currencyRub')}</SelectItem>
                                        <SelectItem value="USD">{t('settings.appearance.currencyUsd')}</SelectItem>
                                        <SelectItem value="EUR">{t('settings.appearance.currencyEur')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="field">
                                <Label htmlFor="language">{t('common.label.language')}</Label>
                                <Select value={language} onValueChange={handleLanguageChange}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ru">Русский</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button size="sm">{t('common.button.saveSettings')}</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications */}
                <TabsContent value="notifications">
                    <Card className="card">
                        <CardHeader className="card-header--start">
                            <CradTitle>{t('settings.notifications.title')}</CradTitle>
                        </CardHeader>
                        <CardContent className="card-content--spaced">
                            <div className="setting-row">
                                <div>
                                    <Label>{t('settings.notifications.emailNotifications')}</Label>
                                    <p className="muted">{t('settings.notifications.emailDescription')}</p>
                                </div>
                                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                            </div>

                            <Separator />

                            <div className="setting-row">
                                <div>
                                    <Label>{t('settings.notifications.pushNotifications')}</Label>
                                    <p className="muted">{t('settings.notifications.pushDescription')}</p>
                                </div>
                                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                            </div>

                            <Separator />

                            <div className="setting-row">
                                <div>
                                    <Label>{t('settings.notifications.budgetAlerts')}</Label>
                                    <p className="muted">{t('settings.notifications.budgetDescription')}</p>
                                </div>
                                <Switch checked={budgetAlerts} onCheckedChange={setBudgetAlerts} />
                            </div>

                            <Separator />

                            <div className="setting-row">
                                <div>
                                    <Label>{t('settings.notifications.paymentReminders')}</Label>
                                    <p className="muted">{t('settings.notifications.paymentDescription')}</p>
                                </div>
                                <Switch defaultUnchecked/>
                            </div>

                            <Separator />

                            <div className="setting-row">
                                <div>
                                    <Label>{t('settings.notifications.weeklyReport')}</Label>
                                    <p className="muted">{t('settings.notifications.reportDescription')}</p>
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
                            <CradTitle>{t('settings.security.title')}</CradTitle>
                        </CardHeader>
                        <CardContent className="card-content--spaced">
                            <div className="stack-sm">
                                <div className="field">
                                    <Label htmlFor="current-password">{t('settings.security.currentPassword')}</Label>
                                    <Input id="current-password" type="password" />
                                </div>
                                <div className="field">
                                    <Label htmlFor="new-password">{t('settings.security.newPassword')}</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <div className="field">
                                    <Label htmlFor="confirm-password">{t('settings.security.confirmPassword')}</Label>
                                    <Input id="confirm-password" type="password" />
                                </div>
                                <Button size="sm" onClick={handleChangePassword}>{t('common.button.changePassword')}</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Data */}
                <TabsContent value="data">
                    <div className="stack">
                        <Card className="card">
                            <CardHeader className="card-header--start">
                                <CradTitle>{t('settings.data.backupTitle')}</CradTitle>
                            </CardHeader>
                            <CardContent className="card-content--spaced">
                                <p className="muted">{t('settings.data.backupDescription')}</p>
                                <div className="row gap">
                                    <Button size="lg" onClick={handleBackup}>
                                        <Database className="icon icon--small" />
                                        {t('common.button.backup')}
                                    </Button>
                                    <Button size="lg" variant="white" onClick={handleRestore}>
                                        {t('common.button.restore')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>


                        <Card className="cardcard--danger">
                            <CardHeader className="card-header--start">
                                <CradTitle className="text-danger">{t('settings.data.dangerZone')}</CradTitle>
                            </CardHeader>
                            <CardContent className="card-content--spaced">
                                <div className="info--danger">
                                    <h3 className="section-title">{t('settings.data.deleteAllDataTitle')}</h3>
                                    <p className="muted">{t('settings.data.deleteAllDataDescription')}</p>
                                    <Button size="lg" variant="destructive">
                                        <Trash2 className="icon icon--small" />
                                        {t('common.button.deleteAll')}
                                    </Button>
                                </div>


                                <Separator />


                                <div className="info--danger">
                                    <h3 className="section-title">{t('settings.data.deleteAccountTitle')}</h3>
                                    <p className="muted">{t('settings.data.deleteAccountDescription')}</p>
                                    <Button size="lg" variant="destructive">
                                        <Trash2 className="icon icon--small" />
                                        {t('common.button.deleteAccount')}
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
