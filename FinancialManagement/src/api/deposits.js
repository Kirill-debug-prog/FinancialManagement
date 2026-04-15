import { api, getActiveProfileId } from './client';

function profileUrl(path = '') {
    return `/profiles/${getActiveProfileId()}/deposits${path}`;
}

export async function getDeposits() {
    return api.get(profileUrl());
}

export async function getDeposit(id) {
    return api.get(profileUrl(`/${id}`));
}

export async function createDeposit(data) {
    return api.post(profileUrl(), data);
}

export async function updateDeposit(id, data) {
    return api.put(profileUrl(`/${id}`), data);
}

export async function deleteDeposit(id) {
    return api.delete(profileUrl(`/${id}`));
}
