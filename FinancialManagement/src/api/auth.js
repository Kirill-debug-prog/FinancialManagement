import { api, setToken, parseJwt } from './client';

export async function login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    setToken(data.token);
    return data.token;
}

export async function register(email, password, confirmPassword) {
    const data = await api.post('/auth/register', { email, password, confirmPassword });
    return data;
}

export function getUserIdFromToken(token) {
    const payload = parseJwt(token);
    if (!payload) return null;
    return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub;
}
