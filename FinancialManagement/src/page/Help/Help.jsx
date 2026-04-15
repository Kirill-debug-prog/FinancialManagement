import {
    Book,
    Search,
    HelpCircle,
    CheckCircle,
    Lightbulb
} from 'lucide-react';
import { Card, CardContent, CradTitle, CardHeader, CardDescription } from '../../components/ui/card/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs/tabs';
import { Input } from '../../components/ui/input_data/input';
import { Badge } from '../../components/ui/badge/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/Accordion/Accordion';
import { useState } from 'react';
import { sections, faqGeneral, tips } from '../../data/help-content';
import './Help.scss';

export default function Help() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSections = sections.filter(section =>
        searchQuery === '' ||
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.content.some(item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return (
        <div className="help">
            <div className="help__header">
                <div className="help__header-text">
                    <h1 className="help__title">Справка и руководство</h1>
                    <p className="help__subtitle">Всё, что нужно знать для эффективного управления финансами</p>
                    <div className="help__search-wrapper">
                        <Input
                            type="text"
                            placeholder="Поиск по справке..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="help__search"
                        />
                        <Search className="help__search-icon" />
                    </div>
                </div>
            </div>

            <Tabs defaultValue="sections" className="help__tabs">
                <TabsList className="help__tabs-list">
                    <TabsTrigger value="sections" className="help__tab-trigger">Разделы</TabsTrigger>
                    <TabsTrigger value="faq" className="help__tab-trigger">Частые вопросы</TabsTrigger>
                    <TabsTrigger value="tips" className="help__tab-trigger">Советы</TabsTrigger>
                </TabsList>

                <TabsContent value="sections" className="help-sections">
                    {filteredSections.length === 0 ? (
                        <Card className="help-empty">
                            <CardContent className="help-empty__content">
                                <HelpCircle className="help-empty__icon" />
                                <p className="help-empty__title">По вашему запросу ничего не найдено</p>
                                <p className="help-empty__subtitle">
                                    Попробуйте изменить поисковый запрос
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="help-grid">
                            {filteredSections.map((section) => {
                                const Icon = section.icon;

                                return (
                                    <Card key={section.id} className={`help-card help-card--${section.theme}`}>
                                        <CardHeader className="help-card__header">
                                            <div className="help-card__header-content">
                                                <div className="help-card__icon">
                                                    <Icon className="help-card__icon-svg" />
                                                </div>

                                                <div className="help-card__text">
                                                    <CradTitle className="help-card__title">
                                                        {section.title}
                                                    </CradTitle>
                                                    <CardDescription className="help-card__description">
                                                        {section.description}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="help-card__content">
                                            <Accordion type="single" collapsible className="help-accordion">
                                                {section.content.map((item, index) => (
                                                    <AccordionItem
                                                        key={index}
                                                        value={`${section.id}-${index}`}
                                                        className="help-accordion__item"
                                                    >
                                                        <AccordionTrigger className="help-accordion__trigger">
                                                            <span className="help-accordion__question">
                                                                <HelpCircle className="help-accordion__question-icon" />
                                                                <span>{item.question}</span>
                                                            </span>
                                                        </AccordionTrigger>

                                                        <AccordionContent className="help-accordion__answer">
                                                            {item.answer}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Frequently asked questions */}
                <TabsContent value="faq" className="faq-tab">
                    <Card className="faq-card">
                        <CardHeader className="faq-card__header">
                            <CradTitle className="faq-card__title">
                                <HelpCircle className="faq-card__title-icon" />
                                Часто задаваемые вопросы
                            </CradTitle>

                            <CardDescription className="faq-card__description">
                                Ответы на самые популярные вопросы пользователей
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="faq-card__content">
                            <Accordion type="single" collapsible className="faq-accordion">
                                {faqGeneral.map((item, index) => (
                                    <AccordionItem
                                        key={index}
                                        value={`faq-${index}`}
                                        className="faq-accordion__item"
                                    >
                                        <AccordionTrigger className="faq-accordion__trigger">
                                            <span className="faq-accordion__question">
                                                <CheckCircle className="faq-accordion__icon" />
                                                <span>{item.question}</span>
                                            </span>
                                        </AccordionTrigger>

                                        <AccordionContent className="faq-accordion__answer">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tips and best practices */}
                <TabsContent value="tips" className="tips-tab">
                    <div className="tips-tab__wrapper">
                        <Card className="tips-header">
                            <CardHeader className="tips-header__content">
                                <CradTitle className="tips-header__title">
                                    <Lightbulb className="tips-header__icon" />
                                    Полезные советы
                                </CradTitle>

                                <CardDescription className="tips-header__description">
                                    Рекомендации для эффективного управления финансами
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <div className="tips-grid">
                            {tips.map((tip, index) => {
                                const Icon = tip.icon;

                                return (
                                    <Card key={index} className="tip-card">
                                        <CardHeader className="tip-card__header">
                                            <div className="tip-card__title-row">
                                                <div className="tip-card__icon">
                                                    <Icon className="tip-card__icon-svg" />
                                                </div>
                                                <CradTitle className="tip-card__title">
                                                    {tip.title}
                                                </CradTitle>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="tip-card__content">
                                            <p className="tip-card__text">{tip.text}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    <Card className="first-steps">
                        <CardHeader className="first-steps__header">
                            <CradTitle className="first-steps__title">
                                Первые шаги
                            </CradTitle>
                        </CardHeader>

                        <CardContent className="first-steps__content">
                            <div className="first-steps__item">
                                <div className="first-steps__step">1</div>
                                <div className="first-steps__text">
                                    <p className="first-steps__item-title">Добавьте все свои счета</p>
                                    <p className="first-steps__item-description">
                                        Начните с добавления банковских счетов, карт и наличных. Укажите текущие балансы.
                                    </p>
                                </div>
                            </div>

                            <div className="first-steps__item">
                                <div className="first-steps__step">2</div>
                                <div className="first-steps__text">
                                    <p className="first-steps__item-title">Создайте категории расходов</p>
                                    <p className="first-steps__item-description">
                                        Настройте категории под свой образ жизни: продукты, транспорт, развлечения и т.д.
                                    </p>
                                </div>
                            </div>

                            <div className="first-steps__item">
                                <div className="first-steps__step">3</div>
                                <div className="first-steps__text">
                                    <p className="first-steps__item-title">Записывайте операции регулярно</p>
                                    <p className="first-steps__item-description">
                                        Вносите каждый доход и расход сразу после совершения. Это войдёт в привычку.
                                    </p>
                                </div>
                            </div>

                            <div className="first-steps__item">
                                <div className="first-steps__step">4</div>
                                <div className="first-steps__text">
                                    <p className="first-steps__item-title">Установите бюджеты</p>
                                    <p className="first-steps__item-description">
                                        Через неделю использования установите месячные лимиты на основные категории.
                                    </p>
                                </div>
                            </div>

                            <div className="first-steps__item">
                                <div className="first-steps__step">5</div>
                                <div className="first-steps__text">
                                    <p className="first-steps__item-title">Анализируйте отчёты</p>
                                    <p className="first-steps__item-description">
                                        Раз в неделю изучайте отчёты, чтобы понять свои финансовые привычки и найти способы экономии.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card className="help-contact">
                <CardContent className="help-contact__content">
                    <div className="help-contact__layout">
                        <div className="help-contact__info">
                            <div className="help-contact__icon">
                                <HelpCircle className="help-contact__icon-svg" />
                            </div>

                            <div className="help-contact__text">
                                <h3 className="help-contact__title">
                                    Не нашли ответ на свой вопрос?
                                </h3>
                                <p className="help-contact__description">
                                    Свяжитесь с нами, и мы с радостью поможем разобраться
                                </p>
                            </div>
                        </div>

                        <div className="help-contact__actions">
                            <Badge variant="secondary" className="help-contact__badge">
                                support@financeapp.com
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

