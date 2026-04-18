import { useState } from "react";
import { Card, CardHeader, CradTitle, CardDescription } from "../../components/ui/card/card";
import './Auth.scss'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs/tabs";
import { Label } from "../../components/ui/label/label";
import { Input } from "../../components/ui/input_data/input";
import { Button } from "../../components/ui/button/button";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom'
import { login, register } from '../../api/auth';
import { getProfiles } from '../../api/profiles';
import { setActiveProfileId } from '../../api/client';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const validateEmail = (email) => {
    if (!email.trim()) {
        return 'Email обязателен';
    }
    if (!emailRegex.test(email)) {
        return 'Введите корректный email адрес';
    }
    return null;
};

const validatePassword = (password) => {
    if (!password) {
        return 'Пароль обязателен';
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        return `Пароль должен содержать не менее ${MIN_PASSWORD_LENGTH} символов`;
    }
    return null;
};

const validatePasswordMatch = (password, confirmPassword) => {
    if (password !== confirmPassword) {
        return 'Пароли не совпадают';
    }
    return null;
};

function Auth({ onLogin }) {
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [loginErrors, setLoginErrors] = useState({ email: '', password: '' });
    const [registerErrors, setRegisterErrors] = useState({ 
        email: '', 
        password: '', 
        confirmPassword: '' 
    });

    const navigate = useNavigate()

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        const emailError = validateEmail(loginEmail);
        const passwordError = validatePassword(loginPassword);

        const newErrors = {
            email: emailError || '',
            password: passwordError || ''
        };

        setLoginErrors(newErrors);

        if (emailError || passwordError) {
            if (emailError) toast.error(emailError);
            if (passwordError) toast.error(passwordError);
            return;
        }

        setLoading(true);
        try {
            await login(loginEmail, loginPassword);
            const profiles = await getProfiles();
            if (profiles && profiles.length > 0) {
                setActiveProfileId(profiles[0].id);
                toast.success('Вы успешно вошли в систему');
                setLoginEmail('');
                setLoginPassword('');
                setLoginErrors({ email: '', password: '' });
                onLogin(false);
                navigate('/app/dashboard');
            } else {
                toast.success('Вы успешно вошли в систему');
                setLoginEmail('');
                setLoginPassword('');
                setLoginErrors({ email: '', password: '' });
                onLogin(true);
                navigate('/welcome');
            }
        } catch (err) {
            const errorMsg = err.message || 'Ошибка входа';
            toast.error(errorMsg);
            
            if (errorMsg.toLowerCase().includes('email')) {
                setLoginErrors(prev => ({ ...prev, email: errorMsg }));
            } else if (errorMsg.toLowerCase().includes('пароль')) {
                setLoginErrors(prev => ({ ...prev, password: errorMsg }));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (event) => {
        event.preventDefault();

        // Валидация
        const emailError = validateEmail(registerEmail);
        const passwordError = validatePassword(registerPassword);
        const confirmPasswordError = validatePasswordMatch(registerPassword, registerConfirmPassword);

        const newErrors = {
            email: emailError || '',
            password: passwordError || '',
            confirmPassword: confirmPasswordError || ''
        };

        setRegisterErrors(newErrors);

        if (emailError || passwordError || confirmPasswordError) {
            if (emailError) toast.error(emailError);
            if (passwordError) toast.error(passwordError);
            if (confirmPasswordError) toast.error(confirmPasswordError);
            return;
        }

        setLoading(true);
        try {
            await register(registerEmail, registerPassword, registerConfirmPassword);
            await login(registerEmail, registerPassword);
            toast.success('Регистрация прошла успешно');
            setRegisterEmail('');
            setRegisterPassword('');
            setRegisterConfirmPassword('');
            setRegisterErrors({ email: '', password: '', confirmPassword: '' });
            onLogin(true);
            navigate('/welcome');
        } catch (err) {
            const errorMsg = err.message || 'Ошибка регистрации';
            toast.error(errorMsg);

            // Определяем, какое поле содержит ошибку
            if (errorMsg.toLowerCase().includes('email')) {
                setRegisterErrors(prev => ({ ...prev, email: errorMsg }));
            } else if (errorMsg.toLowerCase().includes('пароль')) {
                setRegisterErrors(prev => ({ ...prev, password: errorMsg }));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLoginEmailChange = (value) => {
        setLoginEmail(value);
        // Очищаем ошибку при вводе
        if (loginErrors.email) {
            setLoginErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const handleLoginPasswordChange = (value) => {
        setLoginPassword(value);
        // Очищаем ошибку при вводе
        if (loginErrors.password) {
            setLoginErrors(prev => ({ ...prev, password: '' }));
        }
    };

    const handleRegisterEmailChange = (value) => {
        setRegisterEmail(value);
        // Очищаем ошибку при вводе
        if (registerErrors.email) {
            setRegisterErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const handleRegisterPasswordChange = (value) => {
        setRegisterPassword(value);
        // Очищаем ошибки при вводе
        if (registerErrors.password) {
            setRegisterErrors(prev => ({ ...prev, password: '' }));
        }
        // Пересчитываем ошибку совпадения паролей если оно было заполнено
        if (registerConfirmPassword && registerErrors.confirmPassword) {
            if (value === registerConfirmPassword) {
                setRegisterErrors(prev => ({ ...prev, confirmPassword: '' }));
            }
        }
    };

    const handleRegisterConfirmPasswordChange = (value) => {
        setRegisterConfirmPassword(value);
        // Очищаем ошибку при вводе
        if (registerErrors.confirmPassword) {
            setRegisterErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
    };

    return (
        <div className="main-auth">
            <Card className="auth-card">
                <CardHeader className="auth-card-header">
                    <CradTitle className="auth-card-title">Финансовый помошник</CradTitle>
                    <CardDescription className="auth-card-description">
                        Управляйте своими финансами с  умом
                    </CardDescription>
                </CardHeader>
                <Tabs className="auth-tabs" defaultValue="login">
                    <TabsList className="auth-tabs-list">
                        <TabsTrigger className="auth-tabs-trigger" value="login">Вход</TabsTrigger>
                        <TabsTrigger className="auth-tabs-trigger" value="register">Регистрация</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" >
                        <form className="container" onSubmit={handleLoginSubmit} noValidate>
                            <div className={`data-container ${loginErrors.email ? 'data-container--error' : ''}`}>
                                <Label className="login-lable" htmlFor="login-email">Email</Label>
                                <Input className="login-input"
                                    type="email"
                                    id="login-email"
                                    placeholder="your@email.com"
                                    value={loginEmail}
                                    autoComplete="email"
                                    onChange={(e) => handleLoginEmailChange(e.target.value)}
                                    aria-invalid={!!loginErrors.email}
                                    aria-describedby={loginErrors.email ? "login-email-error" : undefined} />
                            </div>
                            <div className={`data-container ${loginErrors.password ? 'data-container--error' : ''}`}>
                                <Label className="login-lable" htmlFor="login-register">Пароль</Label>
                                <Input className="login-input"
                                    type="password"
                                    id="login-register"
                                    placeholder="••••••••"
                                    value={loginPassword}
                                    autoComplete="current-password"
                                    onChange={(e) => handleLoginPasswordChange(e.target.value)}
                                    aria-invalid={!!loginErrors.password}
                                    aria-describedby={loginErrors.password ? "login-password-error" : undefined} />
                            </div>
                            <div className="data-container">
                                <Button className="forgot-password-button" variant="transparent" type="button">Забыли пароль?</Button>
                                <Button className="login-button" variant="black" type="submit" disabled={loading}>
                                    {loading ? 'Вход...' : 'Войти'}
                                </Button>
                            </div>
                            <div className="data-container">
                                <div className="or-hr-wrapper">
                                    <hr className="or-hr" />
                                    <span className="or-hr-label">Или</span>
                                </div>
                            </div>
                            <div className="data-container">
                                <Button className="login-button" variant="white" type="button">Войти с помощью Яндекс</Button>
                                <Button className="login-button" variant="white" type="button">Войти с помощью ВК</Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="register">
                        <form className="container" onSubmit={handleRegisterSubmit} noValidate>
                            <div className={`data-container ${registerErrors.email ? 'data-container--error' : ''}`}>
                                <Label className="register-lable" htmlFor="register-email">Email</Label>
                                <Input className="register-input"
                                    type="email"
                                    id="register-email"
                                    placeholder="your@email.com"
                                    value={registerEmail}
                                    autoComplete="email"
                                    onChange={(e) => handleRegisterEmailChange(e.target.value)}
                                    aria-invalid={!!registerErrors.email}
                                    aria-describedby={registerErrors.email ? "register-email-error" : undefined} />
                            </div>
                            <div className={`data-container ${registerErrors.password ? 'data-container--error' : ''}`}>
                                <Label className="register-lable" htmlFor="register-password">Пароль</Label>
                                <Input className="register-input"
                                    type="password"
                                    id="register-password"
                                    placeholder="••••••••"
                                    value={registerPassword}
                                    autoComplete="new-password"
                                    onChange={(e) => handleRegisterPasswordChange(e.target.value)}
                                    aria-invalid={!!registerErrors.password}
                                    aria-describedby={registerErrors.password ? "register-password-error" : undefined} />
                                <span className="password-hint">Минимум {MIN_PASSWORD_LENGTH} символов</span>
                            </div>
                            <div className={`data-container ${registerErrors.confirmPassword ? 'data-container--error' : ''}`}>
                                <Label className="register-lable" htmlFor="register-confirm-password">Подтвердить пароль</Label>
                                <Input className="register-input"
                                    type="password"
                                    id="register-confirm-password"
                                    placeholder="••••••••"
                                    value={registerConfirmPassword}
                                    autoComplete="new-password"
                                    onChange={(e) => handleRegisterConfirmPasswordChange(e.target.value)}
                                    aria-invalid={!!registerErrors.confirmPassword}
                                    aria-describedby={registerErrors.confirmPassword ? "register-confirm-error" : undefined} />
                                </div>
                            <div className="data-container">
                                <Button className="register-button" variant="black" type="submit" disabled={loading}>
                                    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    )
}

export default Auth;
