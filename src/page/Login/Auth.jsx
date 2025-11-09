import React, { useState } from "react";   
import { Card, CardHeader, CradTitle, CardDescription } from "../../components/ui/card/card";
import './Auth.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs/tabs";
import { Lable } from "../../components/ui/lable/lable";
import { Input } from "../../components/ui/input_data/input";
import { Button } from "../../components/ui/button/button";
import { toast } from "sonner";

function Auth({ onLogin }) {
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

    const  handleLoginSubmit = (event) =>  {
        event.preventDefault();
        if (loginEmail && loginPassword) {
            toast.success('Вы успешно вошли в систему');
            onLogin(false);
        } else {
            toast.error('Пожалуйста, заполните все поля');
        };
    };

    const handleRegisterSubmit = (event) => {
        event.preventDefault();
        if (!registerEmail || !registerPassword || !registerConfirmPassword) {
            toast.success('Пожалуйста, заполните все поля')
        } else if (registerPassword !== registerConfirmPassword) {
            toast.error('Пароли не совпадают');
        } else {
            toast.success('Регистрация прошла успешно');
            onLogin(false);
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
                        <form className="container" onSubmit={handleLoginSubmit}>
                            <div className="data-container">
                                <Lable className="login-lable" htmlFor="login-email">Email</Lable>
                                <Input className="login-input" 
                                type="email" 
                                id="login-email" 
                                placeholder="your@email.com"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)} />
                            </div>
                            <div className="data-container">
                                <Lable className="login-lable" htmlFor="login-register">Парль</Lable>
                                <Input className="login-input" 
                                type="password" 
                                id="login-register" 
                                placeholder="••••••••"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)} />
                            </div>
                            <div className="data-container">
                                <Button className="forgot-password-button" variant="transparent" type="button">Забыли пароль?</Button>
                                <Button className="login-button" variant="black" type="submit">Войти</Button>
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
                        <form className="container" onSubmit={handleRegisterSubmit}>
                            <div className="data-container">
                                <Lable className="register-lable" htmlFor="register-email">Email</Lable>
                                <Input className="register-input" 
                                type="email" 
                                id="register-email" 
                                placeholder="your@email.com"
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)} />
                            </div>
                            <div className="data-container">
                                <Lable className="register-lable" htmlFor="register-register">Парль</Lable>
                                <Input className="register-input" 
                                type="password" 
                                id="register-register" 
                                placeholder="••••••••"
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)} />
                            </div>
                            <div className="data-container">
                                <Lable className="register-lable" htmlFor="register-register">Подтвердить пароль</Lable>
                                <Input className="register-input" 
                                type="password" 
                                id="register-register" 
                                placeholder="••••••••"
                                value={registerConfirmPassword}
                                onChange={(e) => setRegisterConfirmPassword(e.target.value)} />
                            </div>
                            <div className="data-container">
                                <Button className="register-button" variant="black" type="sumbit">Войти</Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    )
}

export default Auth;