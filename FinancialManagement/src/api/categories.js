import { api, getActiveProfileId } from './client';

function profileUrl(path = '') {
    return `/profiles/${getActiveProfileId()}/categories${path}`;
}

export async function getCategories(type = null) {
    const query = type ? `?type=${type}` : '';
    return api.get(profileUrl() + query);
}

export async function getCategory(id) {
    return api.get(profileUrl(`/${id}`));
}

export async function createCategory(data) {
    return api.post(profileUrl(), data);
}

export async function updateCategory(id, data) {
    return api.put(profileUrl(`/${id}`), data);
}

export async function deleteCategory(id) {
    return api.delete(profileUrl(`/${id}`));
}
