import { api, getActiveProfileId } from './client';

function profileUrl(path = '') {
    return `/profiles/${getActiveProfileId()}/currencies${path}`;
}

export async function getCurrencies() {
    return api.get(profileUrl());
}

export async function getCurrency(id) {
    return api.get(profileUrl(`/${id}`));
}

export async function createCurrency(data) {
    return api.post(profileUrl(), data);
}

export async function updateCurrency(id, data) {
    return api.put(profileUrl(`/${id}`), data);
}

export async function deleteCurrency(id) {
    return api.delete(profileUrl(`/${id}`));
}
