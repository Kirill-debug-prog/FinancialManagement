/**
 * Cache Invalidation Utilities
 * Вспомогательные функции для инвалидации кеша при изменении данных
 */

import { clearCache, clearCacheByPattern } from './cache';

/**
 * Инвалидировать кеш при создании нового счета
 */
export function invalidateAccountsCache() {
    clearCacheByPattern('/accounts');
    clearCacheByPattern('/dashboard'); // Dashboard зависит от счетов
}

/**
 * Инвалидировать кеш при изменении счета
 */
export function invalidateAccountCache(accountId) {
    clearCache(`/profiles/*/accounts/${accountId}`);
    invalidateAccountsCache();
}

/**
 * Инвалидировать кеш при изменении категорий
 */
export function invalidateCategoriesCache() {
    clearCacheByPattern('/categories');
    clearCacheByPattern('/dashboard');
}

/**
 * Инвалидировать кеш при создании транзакции
 */
export function invalidateTransactionsCache() {
    clearCacheByPattern('/transactions');
    clearCacheByPattern('/dashboard');
    clearCacheByPattern('/reports');
}

/**
 * Инвалидировать кеш при изменении кредитов/долгов
 */
export function invalidateCreditsDebtsCache() {
    clearCacheByPattern('/credits');
    clearCacheByPattern('/debts');
    clearCacheByPattern('/dashboard');
}

/**
 * Инвалидировать кеш при изменении депозитов
 */
export function invalidateDepositsCache() {
    clearCacheByPattern('/deposits');
    clearCacheByPattern('/dashboard');
}

/**
 * Полная инвалидация всех кешей (при смене профиля или logout)
 */
export function invalidateAllCache() {
    clearCacheByPattern('');
}

/**
 * Обновить данные фоном (refresh данные без блокировки UI)
 */
export async function refreshDataInBackground(apiCall, onSuccess) {
    try {
        const freshData = await apiCall();
        onSuccess(freshData);
        return freshData;
    } catch (error) {
        console.warn('Background refresh failed:', error);
        // Не выбрасываем ошибку - UI продолжит работать с кешированными данными
        return null;
    }
}

/**
 * Batch инвалидация нескольких типов данных
 */
export function invalidateCacheForResourceTypes(types = []) {
    types.forEach(type => {
        switch (type) {
            case 'accounts':
                invalidateAccountsCache();
                break;
            case 'categories':
                invalidateCategoriesCache();
                break;
            case 'transactions':
                invalidateTransactionsCache();
                break;
            case 'credits':
            case 'debts':
                invalidateCreditsDebtsCache();
                break;
            case 'deposits':
                invalidateDepositsCache();
                break;
            default:
                break;
        }
    });
}
