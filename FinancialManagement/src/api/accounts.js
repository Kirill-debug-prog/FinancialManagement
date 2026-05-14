import { api, getActiveProfileId } from './client';
import { buildProfileUrl } from './utils';

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
    return api.post('/wallet', {
        profileId,
        name: data.name,
        sortOrder: data.sortOrder ?? 0,
        currencyId: data.currencyId,
        initialBalance: data.initialBalance ?? 0,
        icon: data.icon || null,
        note: data.note || null,
    });
}

export async function updateAccount(id, data) {
    return api.put(`/wallet/${id}/rename`, data.name);
}

export async function deleteAccount(id) {
    return api.delete(`/wallet/${id}`);
}

export async function archiveAccount(id) {
    return api.post(`/wallet/${id}/archive`);
}
