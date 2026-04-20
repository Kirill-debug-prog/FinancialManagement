import { CreditCard, Wallet, DollarSign, Euro, Landmark } from 'lucide-react';

// ============================================================================
// Constants
// ============================================================================

const ACCOUNT_COLORS = ['#10b981', '#e1a312', '#2563eb', '#C224EA', '#5823E8', '#ef4444', '#f59e0b', '#8b5cf6'];

const CATEGORY_ICON_MAP = {
    'Продукты': '🛒',
    'Транспорт': '🚗',
    'Развлечения': '🎬',
    'Коммунальные услуги': '💡',
    'Здоровье': '⚕️',
    'Одежда': '👕',
    'Образование': '📚',
    'Связь': '📱',
    'Зарплата': '💰',
    'Фриланс': '💻',
    'Инвестиции': '📈',
    'Подарки': '🎁',
    'Прочее': '📦',
};

const CATEGORY_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#C224EA', '#5823E8', '#6b7280'];

const CURRENCY_SYMBOLS = {
    'RUB': '₽',
    'USD': '$',
    'EUR': '€',
};

// ============================================================================
// Account Transformers
// ============================================================================

/**
 * Определить тип счета на основе его названия и иконки
 * @private
 * @param {Object} account Объект счета с полями name и icon
 * @returns {string} Тип счета: 'cash', 'savings' или 'card'
 */
function guessAccountType(account) {
    if (!account) return 'card';
    
    const name = (account.name || '').toLowerCase();
    const icon = (account.icon || '').toLowerCase();
    
    if (name.includes('наличн') || icon.includes('cash')) return 'cash';
    if (name.includes('сбереж') || name.includes('накоп') || icon.includes('saving')) return 'savings';
    return 'card';
}

/**
 * Получить компонент иконки на основе типа счета
 * @private
 * @param {string} type Тип счета
 * @returns {Function} React компонент иконки
 */
function getAccountIcon(type) {
    switch (type) {
        case 'cash': return Wallet;
        case 'savings': return Landmark;
        default: return CreditCard;
    }
}

/**
 * Трансформировать счет с бэкенда в формат фронтенда
 * @param {Object} account Данные счета с бэкенда
 * @param {number} index Индекс для выбора цвета (циклический)
 * @returns {Object} Трансформированный счет
 */
export function transformAccountFromBackend(account, index = 0) {
    if (!account) return null;
    
    const type = guessAccountType(account);
    return {
        id: account.id,
        name: account.name || '',
        type,
        currency: account.currencyCode,
        currencyShortName: account.currencyShortName || account.currencyCode,
        balance: account.balance ?? 0,
        icon: getAccountIcon(type),
        color: ACCOUNT_COLORS[index % ACCOUNT_COLORS.length],
        isArchived: account.isArchived || false,
    };
}

// ============================================================================
// Transaction Transformers
// ============================================================================

/**
 * Трансформировать транзакцию с бэкенда в формат фронтенда
 * @param {Object} t Данные транзакции с бэкенда
 * @returns {Object|null} Трансформированная транзакция или null
 */
export function transformTransactionFromBackend(t) {
    if (!t) return null;
    
    return {
        id: t.id,
        date: t.date || new Date().toISOString(),
        type: t.type || 'Expense',
        category: t.categoryName || 'Без категории',
        categoryId: t.categoryId,
        account: t.accountName || '',
        accountId: t.accountId,
        amount: t.totalAmount ?? 0,
        description: t.note || '',
        currencyCode: t.currencyCode || 'RUB',
        currencyId: t.currencyId,
    };
}

// ============================================================================
// Category Transformers
// ============================================================================

/**
 * Трансформировать категорию с бэкенда в формат фронтенда
 * @param {Object} cat Данные категории с бэкенда
 * @param {number} index Индекс для выбора цвета (циклический)
 * @returns {Object|null} Трансформированная категория или null
 */
export function transformCategoryFromBackend(cat, index = 0) {
    if (!cat) return null;
    
    return {
        id: cat.id,
        name: cat.name || '',
        type: cat.type || 'Expense',
        icon: CATEGORY_ICON_MAP[cat.name] || '📦',
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        parentId: cat.parentId || null,
        subcategories: (cat.subcategories || []).map((sub, i) => transformCategoryFromBackend(sub, i)),
    };
}

// ============================================================================
// Credit/Debt/Deposit Transformers
// ============================================================================

/**
 * Трансформировать кредит с бэкенда в формат фронтенда
 * @param {Object} credit Данные кредита с бэкенда
 * @returns {Object|null} Трансформированный кредит или null
 */
export function transformCreditFromBackend(credit) {
    if (!credit) return null;
    
    return {
        id: credit.id,
        lender: credit.lender || '',
        amount: credit.amount ?? 0,
        rate: credit.rate ?? 0,
        startDate: credit.startDate,
        endDate: credit.endDate,
        description: credit.description || '',
        currency: credit.currencyCode || 'RUB',
    };
}

/**
 * Трансформировать долг с бэкенда в формат фронтенда
 * @param {Object} debt Данные долга с бэкенда
 * @returns {Object|null} Трансформированный долг или null
 */
export function transformDebtFromBackend(debt) {
    if (!debt) return null;
    
    return {
        id: debt.id,
        debtor: debt.debtor || '',
        amount: debt.amount ?? 0,
        reason: debt.reason || '',
        dueDate: debt.dueDate,
        description: debt.description || '',
        currency: debt.currencyCode || 'RUB',
    };
}

/**
 * Трансформировать депозит с бэкенда в формат фронтенда
 * @param {Object} deposit Данные депозита с бэкенда
 * @returns {Object|null} Трансформированный депозит или null
 */
export function transformDepositFromBackend(deposit) {
    if (!deposit) return null;
    
    return {
        id: deposit.id,
        bank: deposit.bank || '',
        amount: deposit.amount ?? 0,
        rate: deposit.rate ?? 0,
        startDate: deposit.startDate,
        endDate: deposit.endDate,
        currency: deposit.currencyCode || 'RUB',
        description: deposit.description || '',
    };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Получить символ валюты по коду
 * @param {string} code Код валюты (например: 'RUB', 'USD', 'EUR')
 * @returns {string} Символ валюты или сам код если символ не найден
 */
export function getCurrencySymbol(code) {
    return CURRENCY_SYMBOLS[code] || code;
}
