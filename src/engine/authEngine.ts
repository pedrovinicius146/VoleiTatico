import { UserAccount, UserProgress } from '../types';
import { DEFAULT_USER_PROGRESS } from './gamificationEngine';

const ACCOUNTS_STORAGE_KEY = 'volei_tatico_accounts_v1';
const ACTIVE_USER_ID_KEY = 'volei_tatico_active_user_id_v1';

class AuthEngine {
  private listeners: Array<(user: UserAccount | null) => void> = [];

  public getSavedAccounts(): UserAccount[] {
    try {
      const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Falha ao ler contas locais:', e);
    }
    return [];
  }

  private saveAccounts(accounts: UserAccount[]): void {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Falha ao salvar contas:', e);
    }
  }

  public getCurrentUser(): UserAccount | null {
    try {
      const activeId = localStorage.getItem(ACTIVE_USER_ID_KEY);
      if (!activeId) return null;
      const accounts = this.getSavedAccounts();
      return accounts.find((acc) => acc.id === activeId) || null;
    } catch {
      return null;
    }
  }

  public registerUser(params: {
    username: string;
    displayName: string;
    pin?: string;
    avatar: string;
    role: 'student' | 'teacher' | 'athlete';
    schoolName?: string;
    classCode?: string;
    initialProgress: UserProgress;
  }): { success: boolean; user?: UserAccount; error?: string } {
    const cleanUsername = params.username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: 'O nome de usuário deve conter no mínimo 3 caracteres.' };
    }

    const accounts = this.getSavedAccounts();
    const existing = accounts.find((acc) => acc.username.toLowerCase() === cleanUsername);
    if (existing) {
      return { success: false, error: 'Já existe uma conta com este nome de usuário. Faça login ou use outro nome.' };
    }

    const now = new Date().toISOString();
    const newUser: UserAccount = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      username: cleanUsername,
      displayName: params.displayName.trim() || params.username,
      pin: params.pin ? params.pin.trim() : undefined,
      avatar: params.avatar || '🏐',
      role: params.role || 'student',
      schoolName: params.schoolName?.trim() || 'Escola de Vôlei',
      classCode: params.classCode?.trim() || 'TURMA-2026',
      progress: {
        ...params.initialProgress,
        studentName: params.displayName.trim() || params.username,
        schoolName: params.schoolName?.trim() || params.initialProgress.schoolName,
        classCode: params.classCode?.trim() || params.initialProgress.classCode,
      },
      createdAt: now,
      lastLoginAt: now,
    };

    accounts.push(newUser);
    this.saveAccounts(accounts);
    this.setActiveUser(newUser.id);

    return { success: true, user: newUser };
  }

  public login(username: string, pin?: string): { success: boolean; user?: UserAccount; error?: string } {
    const cleanUsername = username.trim().toLowerCase();
    const accounts = this.getSavedAccounts();
    const user = accounts.find((acc) => acc.username.toLowerCase() === cleanUsername);

    if (!user) {
      return { success: false, error: 'Usuário não encontrado. Crie uma conta ou verifique a digitação.' };
    }

    if (user.pin && user.pin !== pin?.trim()) {
      return { success: false, error: 'PIN de acesso incorreto.' };
    }

    user.lastLoginAt = new Date().toISOString();
    this.saveAccounts(accounts);
    this.setActiveUser(user.id);

    return { success: true, user };
  }

  public switchAccount(userId: string, pin?: string): { success: boolean; user?: UserAccount; error?: string } {
    const accounts = this.getSavedAccounts();
    const user = accounts.find((acc) => acc.id === userId);
    if (!user) {
      return { success: false, error: 'Perfil não encontrado.' };
    }

    if (user.pin && user.pin !== pin?.trim()) {
      return { success: false, error: 'PIN incorreto para este perfil.' };
    }

    user.lastLoginAt = new Date().toISOString();
    this.saveAccounts(accounts);
    this.setActiveUser(user.id);

    return { success: true, user };
  }

  public setActiveUser(userId: string | null): void {
    if (userId) {
      localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
    } else {
      localStorage.removeItem(ACTIVE_USER_ID_KEY);
    }
    const user = this.getCurrentUser();
    this.notifyListeners(user);
  }

  public logout(): void {
    this.setActiveUser(null);
  }

  public updateCurrentProgress(progress: UserProgress): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const accounts = this.getSavedAccounts();
    const index = accounts.findIndex((acc) => acc.id === currentUser.id);
    if (index !== -1) {
      accounts[index].progress = progress;
      this.saveAccounts(accounts);
    }
  }

  public deleteAccount(userId: string): void {
    let accounts = this.getSavedAccounts();
    accounts = accounts.filter((acc) => acc.id !== userId);
    this.saveAccounts(accounts);
    if (this.getCurrentUser()?.id === userId) {
      this.logout();
    }
  }

  public onAuthStateChanged(callback: (user: UserAccount | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.getCurrentUser());
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(user: UserAccount | null): void {
    this.listeners.forEach((callback) => {
      try {
        callback(user);
      } catch (e) {
        console.error('Erro em listener:', e);
      }
    });
  }
}

export const authEngine = new AuthEngine();
