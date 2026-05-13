import { useCallback, useEffect, useRef, useMemo, useState } from 'react';

/**
 * Debounce Hook - задерживает выполнение функции
 * Полезен для поиска, фильтрации и дорогих операций
 */
export function useDebounce(callback, delay = 300, dependencies = []) {
    const timeoutRef = useRef(null);
    const callbackRef = useRef(callback);

    // Обновляем callback если изменился
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const debouncedCallback = useCallback((...args) => {
        // Очищаем предыдущий timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Устанавливаем новый timeout
        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay]);

    // Очищаем timeout при размонтировании
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
}

/**
 * Throttle Hook - выполняет функцию не чаще чем раз в N миллисекунд
 * Полезен для scroll, resize обработчиков
 */
export function useThrottle(callback, delay = 300, dependencies = []) {
    const timeoutRef = useRef(null);
    const lastCallRef = useRef(0);
    const callbackRef = useRef(callback);

    // Обновляем callback если изменился
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const throttledCallback = useCallback((...args) => {
        const now = Date.now();

        if (now - lastCallRef.current >= delay) {
            lastCallRef.current = now;
            callbackRef.current(...args);
        } else {
            // Очищаем предыдущий timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Устанавливаем timeout для последнего вызова
            const remaining = delay - (now - lastCallRef.current);
            timeoutRef.current = setTimeout(() => {
                lastCallRef.current = Date.now();
                callbackRef.current(...args);
            }, remaining);
        }
    }, [delay]);

    // Очищаем timeout при размонтировании
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return throttledCallback;
}

/**
 * Memoized Callback Hook - автоматически мемоизирует коллбэк
 * Использует useCallback под капотом с автоматическим управлением зависимостями
 */
export function useMemoCallback(callback, deps = []) {
    return useCallback(callback, deps);
}

/**
 * Intersection Observer Hook - для ленивой загрузки элементов
 */
export function useIntersectionObserver(ref, options = {}) {
    const [isVisible, setIsVisible] = React.useState(false);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                // Удаляем наблюдение после первого видимого события
                observer.unobserve(entry.target);
            }
        }, {
            threshold: 0,
            ...options
        });

        observer.observe(ref.current);

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [ref, options]);

    return isVisible;
}

/**
 * Мемоизированное сравнение объектов
 * Используется для глубокого сравнения зависимостей
 */
export function useDeepMemo(factory, dependencies) {
    const ref = useRef();
    const signalRef = useRef(0);

    const isEqual = (a, b) => {
        if (a === b) return true;
        if (typeof a !== 'object' || a === null) return false;
        if (typeof b !== 'object' || b === null) return false;

        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        return keysA.every(key => isEqual(a[key], b[key]));
    };

    if (!isEqual(dependencies, ref.current)) {
        signalRef.current += 1;
        ref.current = dependencies;
    }

    return useMemo(factory, [signalRef.current]);
}

/**
 * Async Operation Hook - управляет состоянием асинхронной операции
 */
export function useAsync(asyncFunction, immediate = true) {
    const [status, setStatus] = React.useState('idle');
    const [value, setValue] = React.useState(null);
    const [error, setError] = React.useState(null);

    const execute = useCallback(async () => {
        setStatus('pending');
        setValue(null);
        setError(null);
        try {
            const response = await asyncFunction();
            setValue(response);
            setStatus('success');
            return response;
        } catch (error) {
            setError(error);
            setStatus('error');
            throw error;
        }
    }, [asyncFunction]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { execute, status, value, error };
}

/**
 * Оптимизация списков - виртуализация больших списков
 * Нужно использовать с react-window или react-virtualized
 */
export function useVirtualList(items, itemHeight, containerHeight) {
    const scrollTop = useRef(0);
    
    const visibleRange = useMemo(() => {
        const startIndex = Math.floor(scrollTop.current / itemHeight);
        const endIndex = Math.ceil((scrollTop.current + containerHeight) / itemHeight);
        
        return {
            startIndex: Math.max(0, startIndex),
            endIndex: Math.min(items.length, endIndex),
            offset: startIndex * itemHeight
        };
    }, [scrollTop.current, itemHeight, containerHeight, items.length]);

    return visibleRange;
}
