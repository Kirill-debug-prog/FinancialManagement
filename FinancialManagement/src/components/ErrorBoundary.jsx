import React, { Component } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary компонент для перехвата и обработки необработанных ошибок
 * Предотвращает полный краш приложения при возникновении ошибок
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Логируем ошибку в консоль для отладки
        console.error('[ErrorBoundary] Caught error:', error);
        console.error('[ErrorBoundary] Error info:', errorInfo);

        // Сохраняем информацию об ошибке в state
        this.setState(prevState => ({
            error,
            errorInfo,
            errorCount: prevState.errorCount + 1
        }));

        // Отправляем ошибку на сервер для мониторинга (если нужно)
        const isDevMode = import.meta.env.DEV ?? process.env.NODE_ENV !== 'production';
        if (!isDevMode) {
            this.logErrorToServer(error, errorInfo);
        }
    }

    /**
     * Отправить информацию об ошибке на сервер для мониторинга
     * (реализовать с Sentry, LogRocket или собственным логгером)
     */
    logErrorToServer = (error, errorInfo) => {
        try {
            // Подготавливаем данные об ошибке
            const errorData = {
                message: error.toString(),
                stack: error.stack,
                componentStack: errorInfo?.componentStack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            // Здесь можно отправить на сервер (если будет интеграция с Sentry)
            console.log('[ErrorBoundary] Would send to error tracking service:', errorData);
        } catch (err) {
            console.error('[ErrorBoundary] Failed to log error:', err);
        }
    };

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleNavigateHome = () => {
        this.handleReset();
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.container}>
                    <div style={styles.card}>
                        <div style={styles.iconContainer}>
                            <AlertCircle size={64} color="#ef4444" />
                        </div>

                        <h1 style={styles.title}>
                            Упс! Что-то пошло не так
                        </h1>

                        <p style={styles.subtitle}>
                            К сожалению, приложение встретило неожиданную ошибку
                        </p>

                        <div style={styles.errorDetails}>
                            <h3 style={styles.errorTitle}>Детали ошибки:</h3>
                            <pre style={styles.errorText}>
                                {this.state.error?.toString()}
                            </pre>
                            {this.state.errorInfo && (
                                <pre style={styles.errorText}>
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            )}
                        </div>

                        <p style={styles.tryText}>
                            Попробуйте одно из следующих действий:
                        </p>

                        <div style={styles.buttonContainer}>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    ...styles.button,
                                    ...styles.primaryButton
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.opacity = '0.9';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.opacity = '1';
                                }}
                            >
                                <RefreshCw size={20} style={{ marginRight: '8px' }} />
                                Попробовать снова
                            </button>

                            <button
                                onClick={this.handleNavigateHome}
                                style={{
                                    ...styles.button,
                                    ...styles.secondaryButton
                                }}
                            >
                                <Home size={20} style={{ marginRight: '8px' }} />
                                Вернуться на главную
                            </button>
                        </div>

                        <p style={styles.errorCount}>
                            Количество ошибок: {this.state.errorCount}
                        </p>

                        <p style={styles.helpText}>
                            Если проблема повторяется, пожалуйста, свяжитесь с поддержкой
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '1rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem 2rem',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
    },
    iconContainer: {
        marginBottom: '0.5rem'
    },
    title: {
        fontSize: '1.75rem',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '0.5rem'
    },
    subtitle: {
        fontSize: '1rem',
        color: '#6b7280',
        marginBottom: '1.5rem'
    },
    errorDetails: {
        backgroundColor: '#fef2f2',
        borderLeft: '4px solid #ef4444',
        padding: '1rem',
        marginBottom: '1rem',
        textAlign: 'left',
        borderRadius: '4px'
    },
    errorTitle: {
        fontSize: '0.875rem',
        fontWeight: 'bold',
        color: '#7f1d1d',
        marginBottom: '0.5rem'
    },
    errorText: {
        fontSize: '0.75rem',
        color: '#991b1b',
        overflow: 'auto',
        maxHeight: '200px',
        backgroundColor: 'white',
        padding: '0.5rem',
        borderRadius: '4px',
        fontFamily: 'monospace'
    },
    tryText: {
        fontSize: '0.95rem',
        color: '#4b5563',
        marginBottom: '1rem'
    },
    buttonContainer: {
        display: 'flex',
        gap: '1rem',
        flexDirection: 'column',
        marginBottom: '1.5rem'
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
        color: 'white'
    },
    secondaryButton: {
        backgroundColor: '#e5e7eb',
        color: '#1f2937'
    },
    errorCount: {
        fontSize: '0.875rem',
        color: '#9ca3af',
        marginBottom: '0.5rem'
    },
    helpText: {
        fontSize: '0.875rem',
        color: '#9ca3af'
    }
};

export default ErrorBoundary;
