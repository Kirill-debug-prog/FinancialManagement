import { api, getActiveProfileId } from './client';
import { buildProfileUrl } from './utils';
import { invalidateAccountsCache, invalidateAccountCache } from './cacheInvalidation';

export async function getAccounts() {
    const url = buildProfileUrl('accounts');
    const wallets = await api.get(url);
    if (!wallets || !wallets.length) return [];

    const withBalances = await Promise.all(
        wallets.map(async (wallet) => {
            try {
                const bal = await api.get(`/transaction/balance?walletId=${wallet.id}`);
                return { ...wallet, balance: bal?.balance ?? wallet.initialBalance ?? 0 };
            } catch {
                return { ...wallet, balance: wallet.initialBalance ?? 0 };
            }
        })
    );
    return withBalances;
}

export async function getAccount(id) {
    return api.get(buildProfileUrl('accounts', `/${id}`));
}

export async function createAccount(data) {
    const profileId = getActiveProfileId();
    const result = await api.post('/wallet', {
        profileId,
        name: data.name,
        sortOrder: data.sortOrder ?? 0,
        currencyId: data.currencyId,
        initialBalance: data.initialBalance ?? 0,
        icon: data.icon || null,
        note: data.note || null,
    });
    invalidateAccountsCache();
    return result;
}

export async function updateAccount(id, data) {
    const result = await api.put(`/wallet/${id}/rename`, data.name);
    invalidateAccountCache(id);
    return result;
}

export async function deleteAccount(id) {
    const result = await api.delete(`/wallet/${id}`);
    invalidateAccountsCache();
    return result;
}

export async function archiveAccount(id) {
    const result = await api.post(`/wallet/${id}/archive`);
    invalidateAccountsCache();
    return result;
}
