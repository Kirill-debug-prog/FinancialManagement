import React, { useEffect, useState } from "react"
import { Sparkles, TrendingUp, Shield, Zap, CheckCircle } from 'lucide-react';
import { motion, scale } from 'framer-motion'
import './FirstTimeWelcome.scss'
import { Button } from "../../components/ui/button/button";
import { useNavigate } from 'react-router-dom'

function FirstTimeWelcome() {
    const [currentFeature, setCurrentFeature] = useState(0)

    const navigate = useNavigate()

    const features = [
        {
            icon: TrendingUp,
            title: 'Полный контроль финансов',
            description: 'Отслеживайте доходы, расходы и планируйте бюджет в одном месте',
            gradientClass: 'bg-gradient-blue'
        },
        {
            icon: Sparkles,
            title: 'Умная аналитика',
            description: 'Визуализация данных и автоматические отчёты помогут понять ваши привычки',
            gradientClass: 'bg-gradient-purple'
        },
        {
            icon: Shield,
            title: 'Безопасность данных',
            description: 'Все ваши данные надёжно защищены и доступны только вам',
            gradientClass: 'bg-gradient-green'
        },
        {
            icon: Zap,
            title: 'Быстро и удобно',
            description: 'Интуитивный интерфейс позволяет управлять финансами за секунды',
            gradientClass: 'bg-gradient-orange'
        }
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeature(prev => (prev + 1) % features.length)
        }, 3000);
        return () => clearInterval(interval)
    }, []);

    return (
        <div className="main-welcome">
            <div className="welcome__hero">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        className="welcome__icon-wrap bg-gradient-blue"
                        animate={{ rotate: [0, 5, 0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <TrendingUp className="welcome__icon" />
                    </motion.div>

                    <h1 className="welcome__title welcome-text">
                        Финансовый помощник
                    </h1>
                    <p className="welcome__description welcome-text">
                        Современное решение для управления личными финансами
                    </p>
                </motion.div>
            </div>
            <div className="welcome__features">
                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    const isActive = index === currentFeature;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: isActive ? 1 : 0,
                                scale: isActive ? 1 : 0.8,
                                zIndex: isActive ? 10 : 0,
                            }}
                            transition={{ duration: 0.5 }}
                            className={`welcome__feature ${isActive ? 'welcome__feature--active' : ''}`}
                        >
                            <div className={`welcome__feature-block ${feature.gradientClass}`}>
                                <Icon className="welcome__icon"></Icon>
                            </div>
                            <h2 className="welcome__title welcome-text">{feature.title}</h2>
                            <p className="welcome__description welcome-text">{feature.description}</p>
                        </motion.div>
                    )
                })}
            </div>
            <div className="welcome__indicators">
                {features.map((_, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className={`welcome__indicator ${index === currentFeature ? 'welcome__indicator--active' : ''}`}
                        onClick={() => setCurrentFeature(index)}
                        whileHover={{ scale: 1.2 }}
                    />
                ))}
            </div>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <div className="welcome__descriptions-block">
                    <div className="description-block">
                        <CheckCircle className="block-check color-green"></CheckCircle>
                        <h4 className="block-title">Бесплатно</h4>
                        <p className="block-description">Все основные функции доступны без ограничений</p>
                    </div>
                    <div className="description-block">
                        <CheckCircle className="block-check color-blue"></CheckCircle>
                        <h4 className="block-title">Без рекламы</h4>
                        <p className="block-description">Чистый интерфейс, никаких отвлечений</p>
                    </div>
                    <div className="description-block">
                        <CheckCircle className="block-check color-purple"></CheckCircle>
                        <h4 className="block-title">Offline режим</h4>
                        <p className="block-description">Работайте даже без интернета</p>
                    </div>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="welcome__btn-block"
            >
                <Button
                    className="welcome__btn-next"
                    variant="blue"
                    onClick={() => navigate('/onboarding')}
                >
                    Начать работу
                </Button>
                <p className="welcome__time-text">Найстройка займет всего 2 минуты</p>
            </motion.div>
        </div>
    )
}

export default FirstTimeWelcome