import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ruTranslation from './locales/ru/translation.json';
import enTranslation from './locales/en/translation.json';

// Получить язык из localStorage или использовать русский по умолчанию
const savedLanguage = localStorage.getItem('language') || 'ru';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ru: { translation: ruTranslation },
            en: { translation: enTranslation }
        },
        lng: savedLanguage,
        fallbackLng: 'ru',
        supportedLngs: ['ru', 'en'],
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        }
    });

export default i18n;
