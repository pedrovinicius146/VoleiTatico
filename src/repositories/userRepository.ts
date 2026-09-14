import { UserAccount } from '../types';
import { IStorageAdapter, defaultStorage } from '../services/storageAdapter';

const ACCOUNTS_STORAGE_KEY = 'voleitatico_accounts_v1';
const CURRENT_USER_ID_KEY = 'voleitatico_current_user_id';

/**
 * Repositório centralizado de usuários e sessão.
 */
export class UserRepository {
  constructor(private storage: IStorageAdapter = defaultStorage) {}

  public getAccounts(): UserAccount[] {
    const raw = this.storage.getItem<UserAccount[]>(ACCOUNTS_STORAGE_KEY);
    return Array.isArray(raw) ? raw : [];
  }

  public saveAccounts(accounts: UserAccount[]): void {
    this.storage.setItem(ACCOUNTS_STORAGE_KEY, accounts);
  }

  public getCurrentUserId(): string | null {
    return this.storage.getItem<string>(CURRENT_USER_ID_KEY);
  }

  public setCurrentUserId(id: string | null): void {
    if (id) {
      this.storage.setItem(CURRENT_USER_ID_KEY, id);
    } else {
      this.storage.removeItem(CURRENT_USER_ID_KEY);
    }
  }

  public findById(id: string): UserAccount | null {
    const accounts = this.getAccounts();
    return accounts.find((a) => a.id === id) || null;
  }

  public findByUsername(username: string): UserAccount | null {
    const clean = username.trim().toLowerCase();
    const accounts = this.getAccounts();
    return accounts.find((a) => a.username.toLowerCase() === clean) || null;
  }
}

export const userRepository = new UserRepository();
