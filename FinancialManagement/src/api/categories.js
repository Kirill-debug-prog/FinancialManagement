import { api, getActiveProfileId } from './client';
import { buildProfileUrl } from './utils';

const TYPE_STR_TO_INT = {
    Income: 0, Expense: 1, Transfer: 2,
    income: 0, expense: 1, transfer: 2,
};

export async function getCategories(type = null) {
    const categories = await api.get(buildProfileUrl('categories'));
    if (!type) return categories ?? [];
    const typeInt = TYPE_STR_TO_INT[type] ?? null;
    if (typeInt === null) return categories ?? [];
    return (categories ?? []).filter(c => c.type === typeInt);
}

export async function getCategory(id) {
    return api.get(buildProfileUrl('categories', `/${id}`));
}

export async function createCategory(data) {
    const profileId = getActiveProfileId();
    return api.post('/category', {
        profileId,
        name: data.name,
        type: TYPE_STR_TO_INT[data.type] ?? 1,
        icon: data.icon || null,
    });
}

export async function updateCategory(id, data) {
    return api.put(`/category/${id}/rename`, data.name);
}

export async function deleteCategory(id) {
    return api.delete(`/category/${id}`);
}
