import { api, getActiveProfileId } from './client';
import { buildProfileUrl } from './utils';
import { invalidateCategoriesCache } from './cacheInvalidation';

const TYPE_STR_TO_INT = {
    Income: 0, Expense: 1, Transfer: 2,
    income: 0, expense: 1, transfer: 2,
};

export async function getCategories(type = null) {
    const profileId = getActiveProfileId();
    // Системные категории (isSystem=true, profileId=null) хранятся отдельно от профильных
    const [systemCats, profileCats] = await Promise.all([
        api.get('/category/system').catch(() => []),
        api.get(`/category?profileId=${profileId}`).catch(() => []),
    ]);
    const all = [...(systemCats ?? []), ...(profileCats ?? [])];
    if (!type) return all;
    const typeInt = TYPE_STR_TO_INT[type] ?? null;
    if (typeInt === null) return all;
    return all.filter(c => c.type === typeInt);
}

export async function getCategory(id) {
    return api.get(buildProfileUrl('categories', `/${id}`));
}

export async function createCategory(data) {
    const profileId = getActiveProfileId();
    const result = await api.post('/category', {
        profileId,
        name: data.name,
        type: TYPE_STR_TO_INT[data.type] ?? 1,
        icon: data.icon || null,
    });
    invalidateCategoriesCache();
    return result;
}

export async function updateCategory(id, data) {
    const result = await api.put(`/category/${id}/rename`, data.name);
    invalidateCategoriesCache();
    return result;
}

export async function deleteCategory(id) {
    const result = await api.delete(`/category/${id}`);
    invalidateCategoriesCache();
    return result;
}
