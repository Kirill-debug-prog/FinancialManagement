import { CreditCard, Wallet, DollarSign, Euro, Landmark } from 'lucide-react';

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

function guessAccountType(account) {
    const name = (account.name || '').toLowerCase();
    const icon = (account.icon || '').toLowerCase();
    if (name.includes('наличн') || icon.includes('cash')) return 'cash';
    if (name.includes('сбереж') || name.includes('накоп') || icon.includes('saving')) return 'savings';
    return 'card';
}

function getAccountIcon(type) {
    switch (type) {
        case 'cash': return Wallet;
        case 'savings': return Landmark;
        default: return CreditCard;
    }
}

export function transformAccountFromBackend(account, index = 0) {
    const type = guessAccountType(account);
    return {
        id: account.id,
        name: account.name,
        type,
        currency: account.currencyCode,
        currencyShortName: account.currencyShortName,
        balance: account.balance,
        icon: getAccountIcon(type),
        color: ACCOUNT_COLORS[index % ACCOUNT_COLORS.length],
        isArchived: account.isArchived,
    };
}

export function transformTransactionFromBackend(t) {
    return {
        id: t.id,
        date: t.date,
        type: t.type,
        category: t.categoryName || 'Без категории',
        categoryId: t.categoryId,
        account: t.accountName,
        accountId: t.accountId,
        amount: t.totalAmount,
        description: t.note || '',
        currencyCode: t.currencyCode,
        currencyId: t.currencyId,
    };
}

export function transformCategoryFromBackend(cat, index = 0) {
    return {
        id: cat.id,
        name: cat.name,
        type: cat.type,
        icon: CATEGORY_ICON_MAP[cat.name] || '📦',
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        parentId: cat.parentId,
        subcategories: (cat.subcategories || []).map((sub, i) => transformCategoryFromBackend(sub, i)),
    };
}

export function getCurrencySymbol(code) {
    switch (code) {
        case 'RUB': return '₽';
        case 'USD': return '$';
        case 'EUR': return '€';
        default: return code;
    }
}
