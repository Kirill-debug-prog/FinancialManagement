import { API_BASE_URL } from './config';

export function getToken() {
    return localStorage.getItem('token');
}

export function setToken(token) {
    localStorage.setItem('token', token);
}

export function getActiveProfileId() {
    return localStorage.getItem('profileId');
}

export function setActiveProfileId(id) {
    localStorage.setItem('profileId', id);
}

export function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('profileId');
    localStorage.removeItem('auth');
    localStorage.removeItem('onboarding');
}

export function isAuthenticated() {
    const token = getToken();
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export function parseJwt(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch {
        return null;
    }
}

async function request(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        clearAuth();
        window.location.href = '/login';
        throw new Error('Сессия истекла');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
}

export const api = {
    get: (url) => request(url),
    post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
    put: (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (url) => request(url, { method: 'DELETE' }),
};
