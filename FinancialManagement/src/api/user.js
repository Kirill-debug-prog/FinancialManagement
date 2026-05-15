import { api, getToken, parseJwt } from './client';

function getUserId() {
    const payload = parseJwt(getToken());
    return payload?.sub ?? null
}

export async function getCurrentUser() {
    return api.get(`/user/${getUserId()}`);
}

export async function changeEmail(newEmail) {
    return api.put(
        `/user/${getUserId()}/change-email`,
        newEmail,
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}

export async function changePassword(currentPassword, newPassword) {
    return api.put(`/user/${getUserId()}/change-password`, {
        currentPassword,
        newPassword,
    });
}

export async function changeProfile(firstName, lastName, phone) {
    return api.put(`/user/${getUserId()}/change-profile`, {
        firstName,
        lastName,
        phone,
    });
}