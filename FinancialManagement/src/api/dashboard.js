import { api } from './client';
import { buildProfileUrl } from './utils';

/**
 * Получить данные для панели управления
 * Возвращает сводку по счетам, категориям, последним транзакциям и т.д.
 * @returns {Promise<Object>} Объект с данными панели управления
 */
export async function getDashboardData() {
    return api.get(buildProfileUrl('dashboard'));
}
