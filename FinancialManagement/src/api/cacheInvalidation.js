/**
 * Cache Invalidation Utilities
 * Вспомогательные функции для инвалидации кеша при изменении данных
 */

import { clearCache, clearCacheByPattern } from './cache';

// Event Emitter для уведомления компонентов о изменениях данных
export const dataChangeEmitter = new EventTarget();

/**
 * Отправить событие об изменении данных
 */
function notifyDataChange(type) {
    const event = new CustomEvent('dataChanged', { detail: { type } });
    dataChangeEmitter.dispatchEvent(event);
}

/**
 * Инвалидировать кеш при создании нового счета
 */
export function invalidateAccountsCache() {
    clearCacheByPattern('/wallet');
    clearCacheByPattern('/dashboard'); // Dashboard зависит от счетов
    notifyDataChange('accounts');
}

/**
 * Инвалидировать кеш при изменении счета
 */
export function invalidateAccountCache(accountId) {
    clearCache(`/wallet/${accountId}`);
    invalidateAccountsCache();
}

/**
 * Инвалидировать кеш при изменении категорий
 */
export function invalidateCategoriesCache() {
    clearCacheByPattern('/category');
    clearCacheByPattern('/dashboard');
    notifyDataChange('categories');
}

/**
 * Инвалидировать кеш при создании транзакции
 */
export function invalidateTransactionsCache() {
    clearCacheByPattern('/transaction');
    clearCacheByPattern('/dashboard');
    clearCacheByPattern('/reports');
    notifyDataChange('transactions');
}

/**
 * Инвалидировать кеш при изменении кредитов/долгов
 */
export function invalidateCreditsDebtsCache() {
    clearCacheByPattern('/credit');
    clearCacheByPattern('/debt');
    clearCacheByPattern('/dashboard');
    notifyDataChange('debts');
}

/**
 * Инвалидировать кеш при изменении депозитов
 */
export function invalidateDepositsCache() {
    clearCacheByPattern('/deposit');
    clearCacheByPattern('/dashboard');
    notifyDataChange('deposits');
}

/**
 * Полная инвалидация всех кешей (при смене профиля или logout)
 */
export function invalidateAllCache() {
    clearCacheByPattern('');
    notifyDataChange('all');
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
    const typeSet = new Set();
    
    types.forEach(type => {
        switch (type) {
            case 'accounts':
                invalidateAccountsCache();
                typeSet.add('accounts');
                break;
            case 'categories':
                invalidateCategoriesCache();
                typeSet.add('categories');
                break;
            case 'transactions':
                invalidateTransactionsCache();
                typeSet.add('transactions');
                break;
            case 'credits':
            case 'debts':
                invalidateCreditsDebtsCache();
                typeSet.add('debts');
                break;
            case 'deposits':
                invalidateDepositsCache();
                typeSet.add('deposits');
                break;
            default:
                break;
        }
    });
}
