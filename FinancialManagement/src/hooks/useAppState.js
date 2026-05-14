import { useState, useEffect, useCallback } from 'react';

/**
 * Хук для управления фильтрами на странице
 */
export function usePageFilters(pageKey, initialFilters = {}) {
    const [filters, setFilters] = useState(initialFilters);

    const updateFilters = useCallback((newFilters) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    }, []);

    const clearPageFilters = useCallback(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    return { filters, updateFilters, clearPageFilters };
}

/**
 * Хук для сохранения данных формы
 */
export function useFormData(formKey, initialData = {}) {
    const [data, setData] = useState(initialData);

    const updateData = useCallback((newData) => {
        setData(prevData => typeof newData === 'function' ? newData(prevData) : newData);
    }, []);

    const clearData = useCallback(() => {
        setData(initialData);
    }, [initialData]);

    return { data, updateData, clearData };
}

/**
 * Хук для загрузки данных
 */
export function useFetchData(fetchFunction, dependencies = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const result = await fetchFunction();
                setData(result);
                setError(null);
            } catch (err) {
                setError(err);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, dependencies);

    return { data, loading, error };
}
