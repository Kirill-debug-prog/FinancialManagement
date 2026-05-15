/**
 * Global Error Handler - обработчик глобальных ошибок приложения
 */

/**
 * Инициализировать глобальные обработчики ошибок
 */
export function initializeGlobalErrorHandlers() {
    // Обработчик необработанных исключений
    window.addEventListener('error', (event) => {
        console.error('[GlobalError] Uncaught Error:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });

        // Отправляем ошибку на сервер в production
        // eslint-disable-next-line no-undef
        if (process.env.NODE_ENV === 'production') {
            reportErrorToServer({
                type: 'uncaughtError',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        }
    });

    // Обработчик необработанных promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('[GlobalError] Unhandled Promise Rejection:', {
            reason: event.reason,
            promise: event.promise
        });

        // Отправляем ошибку на сервер в production
        // eslint-disable-next-line no-undef
        if (process.env.NODE_ENV === 'production') {
            reportErrorToServer({
                type: 'unhandledRejection',
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        }
    });

    // Обработчик ошибок в Resource Loading (CSS, JS, images и т.д.)
    window.addEventListener('error', (event) => {
        if (event.target !== window) {
            console.warn('[GlobalError] Resource Loading Error:', {
                type: event.target.tagName,
                src: event.target.src || event.target.href,
                message: event.message
            });
            
            // Предотвращаем распространение ошибки загрузки ресурсов
            // Это предотвратит крах приложения при ошибке CSS/шрифтов
            if (event.target.tagName === 'LINK' || event.target.tagName === 'SCRIPT' || event.target.tagName === 'IMG') {
                event.preventDefault();
                return true;
            }
        }
    }, true);

    console.log('[GlobalError] Global error handlers initialized');
}

/**
 * Отправить информацию об ошибке на сервер
 */
function reportErrorToServer(errorData) {
    try {
        // Для примера просто логируем в консоль
        console.log('[ErrorReporter] Would send to server:', errorData);
    } catch (err) {
        console.error('[ErrorReporter] Failed to report error:', err);
    }
}

/**
 * Логирование в консоль с уровнем серьезности
 */
export function logError(message, error, context = {}) {
    const errorLog = {
        timestamp: new Date().toISOString(),
        message,
        error: {
            message: error?.message,
            stack: error?.stack,
            name: error?.name
        },
        context,
        url: window.location.href
    };

    console.error(`[App Error] ${message}`, errorLog);

    // Отправляем на сервер в production
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV === 'production') {
        reportErrorToServer({
            type: 'appError',
            ...errorLog
        });
    }

    return errorLog;
}

/**
 * Безопасное выполнение функции с обработкой ошибок
 */
export async function safeExecute(fn, context = 'Unknown') {
    try {
        return await Promise.resolve(fn());
    } catch (error) {
        logError(`Error in ${context}`, error);
        throw error;
    }
}

/**
 * Получить информацию об ошибке в формате строки
 */
export function getErrorMessage(error) {
    if (typeof error === 'string') {
        return error;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (error?.message) {
        return error.message;
    }

    if (error?.error?.message) {
        return error.error.message;
    }

    return String(error) || 'Unknown error';
}
