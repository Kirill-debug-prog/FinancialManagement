import { api, getActiveProfileId } from './client';

function profileUrl(path = '') {
    return `/profiles/${getActiveProfileId()}/debts${path}`;
}

export async function getDebts() {
    return api.get(profileUrl());
}

export async function getDebt(id) {
    return api.get(profileUrl(`/${id}`));
}

export async function createDebt(data) {
    return api.post(profileUrl(), data);
}

export async function updateDebt(id, data) {
    return api.put(profileUrl(`/${id}`), data);
}

export async function deleteDebt(id) {
    return api.delete(profileUrl(`/${id}`));
}
