import { api, getActiveProfileId } from './client';

export async function getDashboardData() {
    return api.get(`/profiles/${getActiveProfileId()}/dashboard`);
}
