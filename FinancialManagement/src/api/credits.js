import { api, getActiveProfileId } from './client';

function profileUrl(path = '') {
    return `/profiles/${getActiveProfileId()}/credits${path}`;
}

export async function getCredits() {
    return api.get(profileUrl());
}

export async function getCredit(id) {
    return api.get(profileUrl(`/${id}`));
}

export async function createCredit(data) {
    return api.post(profileUrl(), data);
}

export async function updateCredit(id, data) {
    return api.put(profileUrl(`/${id}`), data);
}

export async function deleteCredit(id) {
    return api.delete(profileUrl(`/${id}`));
}
