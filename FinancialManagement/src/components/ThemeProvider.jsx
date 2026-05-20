import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('theme') || 'auto';
        } catch {
            return 'auto';
        }
    });

    useEffect(() => {
        const root = document.documentElement;

        const appliedTheme =
            theme === 'auto'
                ? getSystemTheme()
                : theme;

        root.setAttribute('data-theme', appliedTheme);

        try {
            localStorage.setItem('theme', theme);
        } catch (err) {
            console.warn('Не удалось сохранить тему в localStorage:', err);
        }
    }, [theme]);

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (theme === 'auto') {
                document.documentElement.setAttribute(
                    'data-theme',
                    getSystemTheme()
                );
            }
        };

        media.addEventListener('change', handleChange);

        return () => {
            media.removeEventListener('change', handleChange);
        };
    }, [theme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}