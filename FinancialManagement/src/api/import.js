import { getToken } from './client';
import { API_BASE_URL } from './config';

export async function importBankStatement(walletId, file) {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
        `${API_BASE_URL}/import/bank-statement?walletId=${walletId}`,
        {
            method: 'POST',
            // No Content-Type header — browser sets multipart/form-data with boundary
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        }
    );

    if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Сессия истекла');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}
