import { UserAccount, UserProgress } from '../types';
import { DEFAULT_USER_PROGRESS } from './gamificationEngine';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const ACCOUNTS_STORAGE_KEY = 'volei_tatico_accounts_v1';
const ACTIVE_USER_ID_KEY = 'volei_tatico_active_user_id_v1';

interface SupabaseProfileRow {
  id: string;
  username: string | null;
  display_name: string;
  email: string | null;
  avatar: string;
  role: 'student' | 'teacher' | 'athlete';
  school_name: string;
  class_code: string;
  progress: Partial<UserProgress> | null;
  created_at: string;
  last_login_at: string;
}

export interface AuthActionResult {
  success: boolean;
  user?: UserAccount;
  error?: string;
  requiresEmailConfirmation?: boolean;
  message?: string;
}

function translateSupabaseError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos. Verifique os dados e tente novamente.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirme seu e-mail através do link enviado para sua caixa de entrada antes de entrar.';
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'Este e-mail já está cadastrado. Tente fazer login ou recuperar sua senha.';
  }
  if (lower.includes('password should be at least')) {
    return 'A senha deve ter no mínimo 6 caracteres.';
  }
  if (lower.includes('unable to validate email address') || lower.includes('invalid email')) {
    return 'Informe um endereço de e-mail válido.';
  }
  if (lower.includes('email rate limit') || lower.includes('over_email_send_rate_limit')) {
    return 'Limite gratuito de envio de e-mails do Supabase atingido (2 e-mails/hora). No painel do Supabase, vá em Authentication → Providers → Email e desative "Confirm email" (ou aguarde alguns minutos).';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Muitas requisições ao servidor de autenticação. Aguarde alguns minutos e tente novamente.';
  }
  if (lower.includes('duplicate key value') && lower.includes('username')) {
    return 'Este nome de usuário (@login) já está em uso. Escolha outro.';
  }
  return message;
}

class AuthEngine {
  private listeners: Array<(user: UserAccount | null) => void> = [];
  private currentSupabaseUser: UserAccount | null = null;
  private initialized = false;

  constructor() {
    this.initSupabaseListener();
  }

  public isCloudEnabled(): boolean {
    return isSupabaseConfigured && supabase !== null;
  }

  private initSupabaseListener(): void {
    if (!supabase || this.initialized) return;
    this.initialized = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const account = await this.loadOrCreateSupabaseProfile(data.session.user);
        this.currentSupabaseUser = account;
        this.notifyListeners(account);
      }
    });

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        if (this.currentSupabaseUser) {
          this.currentSupabaseUser = null;
          this.notifyListeners(null);
        }
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const account = await this.loadOrCreateSupabaseProfile(session.user);
        this.currentSupabaseUser = account;
        this.notifyListeners(account);
      }
    });
  }

  private mapRowToAccount(row: SupabaseProfileRow): UserAccount {
    const mergedProgress: UserProgress = {
      ...DEFAULT_USER_PROGRESS,
      ...(row.progress || {}),
      studentName: row.display_name || DEFAULT_USER_PROGRESS.studentName,
      schoolName: row.school_name || DEFAULT_USER_PROGRESS.schoolName,
      classCode: row.class_code || DEFAULT_USER_PROGRESS.classCode,
    };

    return {
      id: row.id,
      username: row.username || (row.email ? row.email.split('@')[0] : 'atleta'),
      displayName: row.display_name,
      email: row.email || undefined,
      authProvider: 'supabase',
      avatar: row.avatar || '🏐',
      role: row.role || 'student',
      schoolName: row.school_name || 'Escola de Vôlei',
      classCode: row.class_code || 'TURMA-2026',
      progress: mergedProgress,
      createdAt: row.created_at || new Date().toISOString(),
      lastLoginAt: row.last_login_at || new Date().toISOString(),
    };
  }

  private async loadOrCreateSupabaseProfile(
    supaUser: SupabaseUser,
    overrideData?: {
      username?: string;
      displayName?: string;
      avatar?: string;
      role?: 'student' | 'teacher' | 'athlete';
      schoolName?: string;
      classCode?: string;
      initialProgress?: UserProgress;
    }
  ): Promise<UserAccount> {
    if (!supabase) {
      throw new Error('Supabase não configurado.');
    }

    const { data: existingRow, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supaUser.id)
      .maybeSingle();

    if (!selectError && existingRow) {
      const nowIso = new Date().toISOString();
      await supabase
        .from('profiles')
        .update({ last_login_at: nowIso })
        .eq('id', supaUser.id);

      return this.mapRowToAccount({
        ...(existingRow as SupabaseProfileRow),
        last_login_at: nowIso,
      });
    }

    const meta = (supaUser.user_metadata || {}) as Record<string, unknown>;
    const displayName =
      overrideData?.displayName ||
      (typeof meta.display_name === 'string' && meta.display_name) ||
      (typeof meta.full_name === 'string' && meta.full_name) ||
      (supaUser.email ? supaUser.email.split('@')[0] : 'Atleta');

    const rawUsername =
      overrideData?.username ||
      (typeof meta.username === 'string' && meta.username) ||
      `${(supaUser.email || 'atleta').split('@')[0]}_${supaUser.id.slice(0, 4)}`;
    const cleanUsername = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const role =
      overrideData?.role ||
      (meta.role === 'teacher' || meta.role === 'athlete' || meta.role === 'student'
        ? meta.role
        : 'student');

    const schoolName =
      overrideData?.schoolName ||
      (typeof meta.school_name === 'string' && meta.school_name) ||
      'Escola de Vôlei';

    const classCode =
      overrideData?.classCode ||
      (typeof meta.class_code === 'string' && meta.class_code) ||
      'TURMA-2026';

    const avatar =
      overrideData?.avatar ||
      (typeof meta.avatar === 'string' && meta.avatar) ||
      '🏐';

    const progress: UserProgress = {
      ...(overrideData?.initialProgress || DEFAULT_USER_PROGRESS),
      studentName: displayName,
      schoolName,
      classCode,
    };

    const nowIso = new Date().toISOString();
    const newRow: SupabaseProfileRow = {
      id: supaUser.id,
      username: cleanUsername,
      display_name: displayName,
      email: supaUser.email || null,
      avatar,
      role,
      school_name: schoolName,
      class_code: classCode,
      progress,
      created_at: nowIso,
      last_login_at: nowIso,
    };

    const { data: upserted, error: upsertError } = await supabase
      .from('profiles')
      .upsert(newRow, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (upsertError) {
      console.warn('Perfil Supabase será mantido em memória até tabela estar configurada:', upsertError.message);
      return this.mapRowToAccount(newRow);
    }

    return this.mapRowToAccount((upserted as SupabaseProfileRow) || newRow);
  }

  // =========================================================================
  // MÉTODOS SUPABASE (AUTENTICAÇÃO EM NUVEM)
  // =========================================================================

  public async signUpWithSupabase(params: {
    email: string;
    password: string;
    username: string;
    displayName: string;
    avatar: string;
    role: 'student' | 'teacher' | 'athlete';
    schoolName?: string;
    classCode?: string;
    initialProgress: UserProgress;
  }): Promise<AuthActionResult> {
    if (!supabase) {
      return {
        success: false,
        error: 'Conexão com o Supabase não configurada neste ambiente.',
      };
    }

    const cleanEmail = params.email.trim().toLowerCase();
    const cleanUsername = params.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const cleanDisplayName = params.displayName.trim() || cleanUsername;

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: params.password,
      options: {
        data: {
          username: cleanUsername,
          display_name: cleanDisplayName,
          avatar: params.avatar || '🏐',
          role: params.role || 'student',
          school_name: params.schoolName?.trim() || 'Escola de Vôlei',
          class_code: params.classCode?.trim() || 'TURMA-2026',
          initial_progress: {
            ...params.initialProgress,
            studentName: cleanDisplayName,
            schoolName: params.schoolName?.trim() || params.initialProgress.schoolName,
            classCode: params.classCode?.trim() || params.initialProgress.classCode,
          },
        },
      },
    });

    if (error) {
      return { success: false, error: translateSupabaseError(error.message) };
    }

    if (data.user && !data.session) {
      return {
        success: true,
        requiresEmailConfirmation: true,
        message:
          'Cadastro realizado! Enviamos um link de confirmação para o seu e-mail. Confirme-o e depois faça login.',
      };
    }

    if (data.user && data.session) {
      const account = await this.loadOrCreateSupabaseProfile(data.user, {
        username: cleanUsername,
        displayName: cleanDisplayName,
        avatar: params.avatar,
        role: params.role,
        schoolName: params.schoolName,
        classCode: params.classCode,
        initialProgress: params.initialProgress,
      });
      this.currentSupabaseUser = account;
      this.notifyListeners(account);
      return { success: true, user: account };
    }

    return { success: false, error: 'Não foi possível concluir o cadastro.' };
  }

  public async loginWithSupabase(email: string, password: string): Promise<AuthActionResult> {
    if (!supabase) {
      return {
        success: false,
        error: 'Conexão com o Supabase não configurada neste ambiente.',
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { success: false, error: translateSupabaseError(error.message) };
    }

    if (data.user) {
      const account = await this.loadOrCreateSupabaseProfile(data.user);
      this.currentSupabaseUser = account;
      this.notifyListeners(account);
      return { success: true, user: account };
    }

    return { success: false, error: 'Erro ao autenticar usuário.' };
  }

  public async resetPasswordSupabase(email: string): Promise<AuthActionResult> {
    if (!supabase) {
      return {
        success: false,
        error: 'Recuperação por e-mail requer conexão ativa com o Supabase.',
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
    });

    if (error) {
      return { success: false, error: translateSupabaseError(error.message) };
    }

    return {
      success: true,
      message: 'Enviamos instruções de redefinição de senha para o seu e-mail.',
    };
  }

  public async updateProfile(updates: {
    displayName: string;
    avatar: string;
    role: 'student' | 'teacher' | 'athlete';
    schoolName: string;
    classCode: string;
  }): Promise<AuthActionResult> {
    const current = this.getCurrentUser();
    if (!current) {
      return { success: false, error: 'Nenhuma conta conectada.' };
    }

    const updatedProgress: UserProgress = {
      ...current.progress,
      studentName: updates.displayName.trim() || current.displayName,
      schoolName: updates.schoolName.trim() || current.schoolName,
      classCode: updates.classCode.trim() || current.classCode,
    };

    const updatedAccount: UserAccount = {
      ...current,
      displayName: updates.displayName.trim() || current.displayName,
      avatar: updates.avatar || current.avatar,
      role: updates.role || current.role,
      schoolName: updates.schoolName.trim() || current.schoolName,
      classCode: updates.classCode.trim() || current.classCode,
      progress: updatedProgress,
    };

    if (current.authProvider === 'supabase' && supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: updatedAccount.displayName,
          avatar: updatedAccount.avatar,
          role: updatedAccount.role,
          school_name: updatedAccount.schoolName,
          class_code: updatedAccount.classCode,
          progress: updatedProgress,
        })
        .eq('id', current.id);

      if (error) {
        return { success: false, error: translateSupabaseError(error.message) };
      }

      this.currentSupabaseUser = updatedAccount;
      this.notifyListeners(updatedAccount);
      return { success: true, user: updatedAccount };
    }

    // Atualização local
    const accounts = this.getSavedAccounts();
    const index = accounts.findIndex((acc) => acc.id === current.id);
    if (index !== -1) {
      accounts[index] = updatedAccount;
      this.saveAccounts(accounts);
      this.notifyListeners(updatedAccount);
    }

    return { success: true, user: updatedAccount };
  }

  // =========================================================================
  // MÉTODOS LOCAIS (FALLBACK OFFLINE E PERFIS COMPARTILHADOS)
  // =========================================================================

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
    if (this.currentSupabaseUser) {
      return this.currentSupabaseUser;
    }

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
    email?: string;
    pin?: string;
    avatar: string;
    role: 'student' | 'teacher' | 'athlete';
    schoolName?: string;
    classCode?: string;
    initialProgress: UserProgress;
  }): AuthActionResult {
    const cleanUsername = params.username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: 'O nome de usuário deve conter no mínimo 3 caracteres.' };
    }

    const accounts = this.getSavedAccounts();
    const existing = accounts.find((acc) => acc.username.toLowerCase() === cleanUsername);
    if (existing) {
      return {
        success: false,
        error: 'Já existe uma conta com este nome de usuário. Faça login ou use outro nome.',
      };
    }

    const now = new Date().toISOString();
    const newUser: UserAccount = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      username: cleanUsername,
      displayName: params.displayName.trim() || params.username,
      email: params.email?.trim().toLowerCase() || undefined,
      authProvider: 'local',
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

  public login(identifier: string, pin?: string): AuthActionResult {
    const clean = identifier.trim().toLowerCase();
    const accounts = this.getSavedAccounts();
    const user = accounts.find(
      (acc) => acc.username.toLowerCase() === clean || (acc.email && acc.email.toLowerCase() === clean)
    );

    if (!user) {
      return {
        success: false,
        error: 'Usuário não encontrado neste dispositivo. Crie uma conta ou verifique a digitação.',
      };
    }

    if (user.pin && user.pin !== pin?.trim()) {
      return { success: false, error: 'Senha / PIN de acesso incorreto.' };
    }

    user.lastLoginAt = new Date().toISOString();
    this.saveAccounts(accounts);
    this.setActiveUser(user.id);

    return { success: true, user };
  }

  public switchAccount(userId: string, pin?: string): AuthActionResult {
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

  public async logout(): Promise<void> {
    if (this.currentSupabaseUser && supabase) {
      await supabase.auth.signOut();
      this.currentSupabaseUser = null;
    }
    this.setActiveUser(null);
  }

  public async updateCurrentProgress(progress: UserProgress): Promise<void> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    if (currentUser.authProvider === 'supabase' && supabase) {
      this.currentSupabaseUser = {
        ...currentUser,
        progress,
      };
      const { error } = await supabase
        .from('profiles')
        .update({ progress })
        .eq('id', currentUser.id);
      if (error) {
        console.warn('Falha ao sincronizar progresso no Supabase:', error.message);
      }
      return;
    }

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
