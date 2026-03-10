import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../dialog_/dialog';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import './WelcomeModal.css';

export default function WelcomeModal({ userName, onClose }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: `Добро пожаловать, ${userName}! 🎉`,
            description: 'Ваше финансовое приложение готово к использованию',
            content: (
                <>
                    <div className="welcome-card welcome-card--gradient">
                        <Sparkles size={48} className="welcome-icon" />
                        <p>
                            Сейчас мы покажем вам основные возможности приложения и поможем сделать первые шаги
                        </p>
                    </div>

                    <div className="welcome-grid">
                        <Feature emoji="📊" title="Отслеживание" text="Контролируйте доходы и расходы" />
                        <Feature emoji="📈" title="Аналитика" text="Визуализация ваших финансов" />
                        <Feature emoji="🎯" title="Планирование" text="Достигайте финансовых целей" />
                        <Feature emoji="💡" title="Подсказки" text="Умные рекомендации" />
                    </div>
                </>
            ),
        },
        {
            title: 'Добавьте первую операцию',
            description: 'Начните отслеживать свои финансы',
            content: (
                <>
                    <div className="welcome-card welcome-card--blue">
                        <h3>Как добавить операцию:</h3>
                        <ol className="welcome-steps">
                            <Step n={1} text='Нажмите кнопку "Добавить операцию" на главной странице' />
                            <Step n={2} text="Выберите тип: доход, расход или перевод" />
                            <Step n={3} text="Укажите сумму, категорию и счёт" />
                            <Step n={4} text="Добавьте описание и сохраните" />
                        </ol>
                    </div>

                    <InfoBox
                        color="green"
                        title="Совет для начала"
                        text="Начните с записи ежедневных трат — это поможет понять, куда уходят деньги"
                    />
                </>
            ),
        },
        {
            title: 'Изучите отчёты',
            description: 'Анализируйте свои финансы',
            content: (
                <>
                    <div className="welcome-card welcome-card--purple">
                        <h3>В разделе «Отчёты» вы найдёте:</h3>

                        <ReportItem emoji="📊" title="Диаграммы расходов" text="По категориям и периодам" />
                        <ReportItem emoji="📈" title="Динамика доходов" text="Отслеживайте изменения" />
                        <ReportItem emoji="🟨" title="Предупреждения" text="О превышении бюджета" />
                    </div>

                    <InfoBox
                        color="orange"
                        title="Экспорт данных"
                        text="Отчёты можно экспортировать в PDF, Excel или CSV"
                    />
                </>
            ),
        },
        {
            title: 'Настройте уведомления',
            description: 'Не пропускайте важные события',
            content: (
                <>
                    <div className="welcome-card welcome-card--indigo">
                        <h3>Полезные уведомления:</h3>

                        <CheckboxItem
                            title="Напоминания о платежах"
                            text="За день до наступления срока"
                        />
                        <CheckboxItem
                            title="Превышение бюджета"
                            text="Когда расходы выше планируемых"
                        />
                        <CheckboxItem
                            title="Еженедельные отчёты"
                            text="Сводка по финансам"
                        />
                    </div>

                    <p className="welcome-footer-text">
                        Настроить уведомления можно в разделе «Настройки»
                    </p>
                </>
            ),
        },
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide((prev) => prev + 1);
        } else {
            onClose();
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="welcome-modal">
                <DialogHeader>
                    <DialogTitle>{slides[currentSlide].title}</DialogTitle>
                    <p className="welcome-description">{slides[currentSlide].description}</p>
                </DialogHeader>

                <div className="welcome-content">
                    {slides[currentSlide].content}
                </div>

                <div className="welcome-indicators">
                    {slides.map((_, i) => (
                        <span
                            key={i}
                            className={`indicator ${i === currentSlide ? 'active' : ''}`}
                        />
                    ))}
                </div>

                <div className="welcome-actions">
                    <button className="btn-ghost" onClick={onClose}>Пропустить</button>

                    <div className="welcome-actions-right">
                        {currentSlide > 0 && (
                            <button
                                className="btn-outline"
                                onClick={() => setCurrentSlide((prev) => prev - 1)}
                            >
                                Назад
                            </button>
                        )}

                        <button className="btn-primary" onClick={handleNext}>
                            {currentSlide < slides.length - 1 ? (
                                <>
                                    Далее <ArrowRight size={16} />
                                </>
                            ) : (
                                <>
                                    Начать работу <CheckCircle size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* === Мелкие компоненты === */

function Feature({ emoji, title, text }) {
    return (
        <div className="welcome-feature">
            <div className="emoji">{emoji}</div>
            <p className="title">{title}</p>
            <p className="text">{text}</p>
        </div>
    );
}

function Step({ n, text }) {
    return (
        <li className='step'>
            <span className="step-number">{n}</span>
            <span>{text}</span>
        </li>
    );
}

function InfoBox({ title, text, color }) {
    return (
        <div className={`info-box info-box--${color}`}>
            <div className="info-box-container">
                <CheckCircle className={`CheckCircle--${color}`} size={18} />
            </div>
            <div className="info-box-content">
                <p className={`title title--${color}`}>{title}</p>
                <p className={`text text--${color}`}>{text}</p>
            </div>
        </div>
    );
}

function ReportItem({ emoji, title, text }) {
    return (
        <div className="report-item">
            <div className="emoji-box">{emoji}</div>
            <div>
                <p className="title">{title}</p>
                <p className="text">{text}</p>
            </div>
        </div>
    );
}

function CheckboxItem({ title, text }) {
    return (
        <label className="checkbox-item">
            <input type="checkbox" defaultChecked disabled />
            <div>
                <p className="title">{title}</p>
                <p className="text">{text}</p>
            </div>
        </label>
    );
}
