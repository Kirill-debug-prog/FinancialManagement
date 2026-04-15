import { api, getActiveProfileId } from './client';

function profileUrl(path = '') {
    return `/profiles/${getActiveProfileId()}/accounts${path}`;
}

export async function getAccounts() {
    return api.get(profileUrl());
}

export async function getAccount(id) {
    return api.get(profileUrl(`/${id}`));
}

export async function createAccount(data) {
    return api.post(profileUrl(), data);
}

export async function updateAccount(id, data) {
    return api.put(profileUrl(`/${id}`), data);
}

export async function deleteAccount(id) {
    return api.delete(profileUrl(`/${id}`));
}

export async function archiveAccount(id) {
    return api.post(profileUrl(`/${id}/archive`));
}
