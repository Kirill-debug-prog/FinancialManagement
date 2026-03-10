import { api } from './client';

export async function getProfiles() {
    return api.get('/profiles');
}

export async function getProfile(profileId) {
    return api.get(`/profiles/${profileId}`);
}

export async function createProfile(name, mainCurrency) {
    return api.post('/profiles', { name, mainCurrency });
}

export async function updateProfile(profileId, name) {
    return api.put(`/profiles/${profileId}`, { name });
}

export async function deleteProfile(profileId) {
    return api.delete(`/profiles/${profileId}`);
}
