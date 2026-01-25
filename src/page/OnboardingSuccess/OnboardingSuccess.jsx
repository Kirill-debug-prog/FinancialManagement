import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, TrendingUp, Wallet, BarChart3 } from 'lucide-react';
import './OnboardingSuccess.css';
import { useNavigate } from 'react-router-dom'

export default function OnboardingSuccess({ userName, onContinue }) {

    const navigate = useNavigate();

    return (
        <div className="onboarding-success">
            <div className="onboarding-success__container">

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="onboarding-success__icon-wrapper"
                >
                    <motion.div
                        className="onboarding-success__icon"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        <CheckCircle size={48} color="#fff" />
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="onboarding-success__header"
                >
                    <h1>Поздравляем, {userName}! 🎉</h1>
                    <p>Ваше финансовое приложение полностью настроено и готово к использованию</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="onboarding-success__card"
                >
                    <h2>Вы готовы к:</h2>
                    <div className="onboarding-success__features">
                        <Feature
                            delay={0.7}
                            icon={<Wallet size={20} />}
                            title="Управлению счетами"
                            text="Отслеживайте баланс на всех ваших счетах"
                            color="blue"
                        />
                        <Feature
                            delay={0.8}
                            icon={<TrendingUp size={20} />}
                            title="Учёту операций"
                            text="Записывайте доходы и расходы в пару кликов"
                            color="green"
                        />
                        <Feature
                            delay={0.9}
                            icon={<BarChart3 size={20} />}
                            title="Анализу финансов"
                            text="Получайте детальные отчёты и графики"
                            color="purple"
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="onboarding-success__tip"
                >
                    <Sparkles size={38} />
                    <h3>Совет для начала</h3>
                    <p>
                        Начните с добавления 2–3 последних операций. Это поможет быстрее привыкнуть к интерфейсу.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="onboarding-success__action"
                >
                    <button
                        onClick={() => {
                            onContinue()
                            navigate('/app/dashboard')
                        }}
                        className="onboarding-success__button">
                        Перейти в приложение
                        <CheckCircle size={18} />
                    </button>
                </motion.div>

            </div>
        </div>
    );
}

function Feature({ icon, title, text, color, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay }}
            className={`feature feature--${color}`}
        >
            <div className="feature__icon">{icon}</div>
            <div>
                <p className="feature__title">{title}</p>
                <p className="feature__text">{text}</p>
            </div>
        </motion.div>
    );
}
