import React, { useState, useId, useMemo } from 'react';
import { UserAccount, UserProgress } from '../types';
import { authEngine } from '../engine/authEngine';
import { getLevelInfo, BADGES_LIST } from '../engine/gamificationEngine';
import { AppLogo } from './AppLogo';
import {
  User,
  LogIn,
  UserPlus,
  Award,
  Shield,
  Check,
  School,
  Trash2,
  ArrowRight,
  Star,
  Trophy,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Zap,
  RotateCcw,
  Users,
  Mail,
  Pencil,
  KeyRound,
  X,
} from 'lucide-react';

interface LoginScreenProps {
  currentUser: UserAccount | null;
  onUserChange: (user: UserAccount | null) => void;
  onNavigateToTactics: () => void;
  currentProgress: UserProgress;
}

const AVATAR_OPTIONS = ['🏐', '⚡', '🛡️', '🔥', '👑', '🌟', '🎯', '🚀', '🦅', '🦁', '🏆', '💎'];

type AuthMode = 'login' | 'register' | 'profiles';
type UserRole = 'student' | 'athlete' | 'teacher';

interface RoleOption {
  id: UserRole;
  title: string;
  tag: string;
  description: string;
  icon: React.ReactNode;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'student',
    title: 'Estudante / Aluno',
    tag: 'Escolar',
    description: 'Para aulas de Educação Física, aprender rodízio e cumprir desafios práticos.',
    icon: <GraduationCap className="w-5 h-5 text-blue-700" />,
  },
  {
    id: 'athlete',
    title: 'Atleta',
    tag: 'Competição',
    description: 'Para treinamento tático avançado, sistemas 5x1 e vôlei de praia 3D.',
    icon: <Zap className="w-5 h-5 text-amber-600" />,
  },
  {
    id: 'teacher',
    title: 'Professor(a) / Técnico',
    tag: 'Gestão',
    description: 'Para coordenar turmas, acompanhar desempenho e gerar relatórios.',
    icon: <Shield className="w-5 h-5 text-emerald-700" />,
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginScreen: React.FC<LoginScreenProps> = ({
  currentUser,
  onUserChange,
  onNavigateToTactics,
  currentProgress,
}) => {
  const isCloud = authEngine.isCloudEnabled();
  const [activeMode, setActiveMode] = useState<AuthMode>('login');

  // Campos de Login e Cadastro
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatar, setAvatar] = useState('🏐');
  const [role, setRole] = useState<UserRole>('student');
  const [schoolName, setSchoolName] = useState(currentProgress.schoolName || '');
  const [classCode, setClassCode] = useState(currentProgress.classCode || '');

  // Estados de feedback e carregamento
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modais in-app
  const [pinPromptAccount, setPinPromptAccount] = useState<UserAccount | null>(null);
  const [pinInputModal, setPinInputModal] = useState('');
  const [showModalPin, setShowModalPin] = useState(false);
  const [pinModalError, setPinModalError] = useState<string | null>(null);
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<{ id: string; name: string } | null>(null);

  // Recuperação de senha
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);
  const [recoveryFeedback, setRecoveryFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edição de perfil autenticado
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser?.displayName || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '🏐');
  const [editRole, setEditRole] = useState<UserRole>(currentUser?.role || 'student');
  const [editSchool, setEditSchool] = useState(currentUser?.schoolName || '');
  const [editClass, setEditClass] = useState(currentUser?.classCode || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // IDs de acessibilidade
  const loginIdentifierId = useId();
  const loginPasswordId = useId();
  const regEmailId = useId();
  const regUsernameId = useId();
  const regDisplayNameId = useId();
  const regPasswordId = useId();
  const regConfirmPasswordId = useId();
  const regSchoolId = useId();
  const regClassId = useId();

  const savedAccounts = authEngine.getSavedAccounts();

  // Força da senha / PIN
  const passwordStrength = useMemo(() => {
    if (!password) return { label: '', percent: 0, color: 'bg-slate-200' };
    if (isCloud) {
      let score = 0;
      if (password.length >= 6) score += 1;
      if (password.length >= 8) score += 1;
      if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
      if (score <= 1) return { label: 'Fraca (mínimo 6 caracteres)', percent: 33, color: 'bg-amber-500' };
      if (score === 2) return { label: 'Boa', percent: 66, color: 'bg-blue-600' };
      return { label: 'Forte', percent: 100, color: 'bg-emerald-600' };
    } else {
      if (password.length < 4) return { label: 'Curta (mínimo 4 caracteres recomendados)', percent: 33, color: 'bg-amber-500' };
      return { label: 'Adequada', percent: 100, color: 'bg-emerald-600' };
    }
  }, [password, isCloud]);

  const passwordsMatch = useMemo(() => {
    if (!password && !confirmPassword) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const resetForms = () => {
    setEmail('');
    setUsername('');
    setDisplayName('');
    setPassword('');
    setConfirmPassword('');
    setFieldErrors({});
  };

  // Submissão de Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});

    const rawIdentifier = email.trim();
    const newErrors: Record<string, string> = {};

    if (!rawIdentifier) {
      newErrors.email = isCloud
        ? 'Informe seu e-mail cadastrado.'
        : 'Informe seu e-mail ou nome de usuário.';
    } else if (isCloud && !EMAIL_REGEX.test(rawIdentifier)) {
      newErrors.email = 'Digite um e-mail válido para entrar.';
    }

    if (isCloud && !password) {
      newErrors.password = 'Digite sua senha de acesso.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = isCloud
        ? await authEngine.loginWithSupabase(rawIdentifier, password)
        : authEngine.login(rawIdentifier, password || undefined);

      if (res.success && res.user) {
        onUserChange(res.user);
        setSuccessMsg(`Bem-vindo(a) de volta, ${res.user.displayName}! Seu progresso foi carregado.`);
        resetForms();
      } else {
        const msg = res.error || 'Não foi possível entrar. Verifique seus dados.';
        setErrorMsg(msg);
        if (msg.toLowerCase().includes('e-mail') || msg.toLowerCase().includes('usuário')) {
          setFieldErrors({ email: msg });
        } else if (msg.toLowerCase().includes('senha') || msg.toLowerCase().includes('pin')) {
          setFieldErrors({ password: msg });
        }
      }
    } catch {
      setErrorMsg('Erro inesperado ao conectar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login com Google via Supabase OAuth
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const res = await authEngine.loginWithGoogleSupabase();
      if (!res.success) {
        setErrorMsg(res.error || 'Não foi possível iniciar o login com Google.');
      }
    } catch {
      setErrorMsg('Falha ao conectar com a autenticação Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submissão de Cadastro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});

    const cleanEmail = email.trim().toLowerCase();
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const cleanName = displayName.trim();
    const newErrors: Record<string, string> = {};

    if (!cleanName || cleanName.length < 2) {
      newErrors.displayName = 'Informe seu nome completo.';
    }

    if (!cleanUser || cleanUser.length < 3) {
      newErrors.username = 'O nome de usuário deve ter pelo menos 3 caracteres.';
    }

    if (isCloud) {
      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        newErrors.email = 'Informe um endereço de e-mail válido.';
      }
      if (!password || password.length < 6) {
        newErrors.password = 'A senha deve conter no mínimo 6 caracteres.';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'As senhas digitadas não coincidem.';
      }
    } else {
      if (cleanEmail && !EMAIL_REGEX.test(cleanEmail)) {
        newErrors.email = 'Formato de e-mail inválido.';
      }
      if (password && password !== confirmPassword) {
        newErrors.confirmPassword = 'As senhas digitadas não coincidem.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setErrorMsg('Revise os campos destacados antes de concluir seu cadastro.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = isCloud
        ? await authEngine.signUpWithSupabase({
            email: cleanEmail,
            password,
            username: cleanUser,
            displayName: cleanName,
            avatar,
            role,
            schoolName: schoolName.trim() || undefined,
            classCode: classCode.trim() || undefined,
            initialProgress: currentProgress,
          })
        : authEngine.registerUser({
            username: cleanUser,
            displayName: cleanName,
            email: cleanEmail || undefined,
            pin: password ? password.trim() : undefined,
            avatar,
            role,
            schoolName: schoolName.trim() || undefined,
            classCode: classCode.trim() || undefined,
            initialProgress: currentProgress,
          });

      if (res.success && res.requiresEmailConfirmation) {
        setSuccessMsg(
          res.message ||
            'Cadastro criado! Confira seu e-mail para confirmar a conta e depois faça login.'
        );
        resetForms();
        setActiveMode('login');
      } else if (res.success && res.user) {
        onUserChange(res.user);
        setSuccessMsg('Conta criada e sincronizada com sucesso!');
        resetForms();
      } else {
        const msg = res.error || 'Não foi possível concluir o cadastro.';
        setErrorMsg(msg);
        if (msg.toLowerCase().includes('e-mail')) {
          setFieldErrors({ email: msg });
        } else if (msg.toLowerCase().includes('usuário')) {
          setFieldErrors({ username: msg });
        }
      }
    } catch {
      setErrorMsg('Erro inesperado ao registrar conta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recuperação de senha
  const handleSendRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryFeedback(null);

    if (!EMAIL_REGEX.test(recoveryEmail.trim())) {
      setRecoveryFeedback({ type: 'error', text: 'Digite um endereço de e-mail válido.' });
      return;
    }

    setIsSendingRecovery(true);
    try {
      const res = await authEngine.resetPasswordSupabase(recoveryEmail.trim());
      if (res.success) {
        setRecoveryFeedback({
          type: 'success',
          text: res.message || 'Link de redefinição enviado para o seu e-mail.',
        });
      } else {
        setRecoveryFeedback({
          type: 'error',
          text: res.error || 'Não foi possível enviar o link de recuperação.',
        });
      }
    } finally {
      setIsSendingRecovery(false);
    }
  };

  // Edição de Perfil
  const openEditProfile = () => {
    if (!currentUser) return;
    setEditName(currentUser.displayName);
    setEditAvatar(currentUser.avatar);
    setEditRole(currentUser.role);
    setEditSchool(currentUser.schoolName);
    setEditClass(currentUser.classCode);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!editName.trim()) {
      setErrorMsg('O nome de exibição não pode ficar vazio.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await authEngine.updateProfile({
        displayName: editName.trim(),
        avatar: editAvatar,
        role: editRole,
        schoolName: editSchool.trim() || 'Escola de Vôlei',
        classCode: editClass.trim() || 'TURMA-2026',
      });

      if (res.success && res.user) {
        onUserChange(res.user);
        setSuccessMsg('Perfil atualizado com sucesso.');
        setIsEditProfileOpen(false);
      } else {
        setErrorMsg(res.error || 'Erro ao atualizar perfil.');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Troca rápida entre perfis locais
  const handleSwitchAccount = (account: UserAccount) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (account.pin) {
      setPinPromptAccount(account);
      setPinInputModal('');
      setPinModalError(null);
      setShowModalPin(false);
    } else {
      const res = authEngine.switchAccount(account.id);
      if (res.success && res.user) {
        onUserChange(res.user);
        setSuccessMsg(`Conectado como ${res.user.displayName}.`);
      }
    }
  };

  const handleConfirmPinModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinPromptAccount) return;

    const res = authEngine.switchAccount(pinPromptAccount.id, pinInputModal);
    if (res.success && res.user) {
      onUserChange(res.user);
      setSuccessMsg(`Conectado como ${res.user.displayName}.`);
      setPinPromptAccount(null);
      setPinInputModal('');
      setPinModalError(null);
    } else {
      setPinModalError(res.error || 'Senha/PIN incorreto. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    await authEngine.logout();
    onUserChange(null);
    setSuccessMsg('Você saiu da sua conta.');
  };

  const handleExecuteDelete = () => {
    if (!deleteConfirmAccount) return;
    authEngine.deleteAccount(deleteConfirmAccount.id);
    setSuccessMsg(`Perfil de ${deleteConfirmAccount.name} removido deste dispositivo.`);
    setDeleteConfirmAccount(null);
  };

  const currentLevelInfo = currentUser
    ? getLevelInfo(currentUser.progress.xp)
    : getLevelInfo(currentProgress.xp);

  const roleLabel =
    currentUser?.role === 'teacher'
      ? 'Professor(a) / Técnico'
      : currentUser?.role === 'athlete'
      ? 'Atleta'
      : 'Estudante';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho da Conta */}
      <header className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {currentUser ? (
            <div className="w-14 h-14 rounded-2xl bg-[#1e3a8a] text-yellow-400 font-black text-3xl flex items-center justify-center border-2 border-yellow-400 shrink-0">
              {currentUser.avatar}
            </div>
          ) : (
            <AppLogo size="lg" className="shrink-0" />
          )}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              {currentUser ? currentUser.displayName : 'Conta e Sincronização · REDE VÔLEI'}
            </h1>
            {currentUser ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                <span className="text-slate-700 font-semibold">{roleLabel}</span>
                <span aria-hidden="true">·</span>
                <span>@{currentUser.username}</span>
                {currentUser.email && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{currentUser.email}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{currentUser.schoolName}</span>
                <span aria-hidden="true">·</span>
                <span>Turma {currentUser.classCode}</span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Entre ou crie sua conta para salvar seu progresso tático, medalhas e avaliações.
              </p>
            )}
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onNavigateToTactics}
              className="flex-1 md:flex-none min-h-[42px] px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              <span>Ir para a Prancheta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={openEditProfile}
              className="min-h-[42px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Editar Perfil</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[42px] px-3.5 py-2 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center whitespace-nowrap shrink-0"
            >
              Sair
            </button>
          </div>
        )}
      </header>

      {/* Alertas */}
      {errorMsg && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 bg-rose-50 border border-rose-300 text-rose-950 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold text-rose-900">Atenção</strong>
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-700 hover:text-rose-950 p-1"
            aria-label="Fechar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold text-emerald-900">Tudo certo</strong>
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1"
            aria-label="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Estatísticas do Usuário Conectado */}
      {currentUser && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">Nível e Experiência</span>
              <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Nível {currentLevelInfo.level} · {currentLevelInfo.title}</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1 tabular-nums">
                Total acumulado: <strong className="text-slate-900">{currentUser.progress.xp} XP</strong>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5 tabular-nums">
                <span>Progresso do nível</span>
                <span>{currentLevelInfo.progressPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${currentLevelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">Desafios Táticos</span>
              <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2 tabular-nums">
                <Star className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{Object.keys(currentUser.progress.completedQuests).length} Quests Concluídas</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Exercícios práticos resolvidos na quadra indoor e no vôlei de praia.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Tema da quadra</span>
              <span className="font-semibold text-slate-900 capitalize">
                {currentUser.progress.selectedTheme.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">Conquistas</span>
              <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2 tabular-nums">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{currentUser.progress.unlockedBadges.length} Medalhas Desbloqueadas</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Reconhecimentos de rodízio, bloqueio e regras oficiais FIVB.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto py-0.5">
              {currentUser.progress.unlockedBadges.map((badgeId) => {
                const b = BADGES_LIST.find((item) => item.id === badgeId);
                return (
                  <span
                    key={badgeId}
                    className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-300 text-base flex items-center justify-center shrink-0"
                    title={b ? `${b.title}: ${b.description}` : badgeId}
                  >
                    {b ? b.icon : '🏅'}
                  </span>
                );
              })}
              {currentUser.progress.unlockedBadges.length === 0 && (
                <span className="text-xs text-slate-400">Nenhuma medalha desbloqueada ainda</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Área Principal de Login / Cadastro / Perfis */}
      {(!currentUser || savedAccounts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Painel Informativo Lateral */}
          <aside className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight leading-snug text-balance">
                Sua evolução tática salva e organizada em um só lugar
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Crie sua conta gratuita para registrar pontuações nas trilhas de aprendizagem, conquistar medalhas e acompanhar o desempenho nas simulações 3D.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-white">Progresso e XP sincronizados</strong>
                  <span className="text-xs text-slate-400">
                    Continue suas Quests de rodízio 5x1 e vôlei de praia de onde parou.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-white">Certificação e Turmas</strong>
                  <span className="text-xs text-slate-400">
                    Vincule sua escola ou clube para relatórios pedagógicos do professor.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-white">Acesso rápido em aula</strong>
                  <span className="text-xs text-slate-400">
                    Alterne entre perfis em tablets ou computadores compartilhados da escola.
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Bloco de Formulários */}
          <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            {/* Abas */}
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('login');
                  setErrorMsg(null);
                  setFieldErrors({});
                }}
                className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  activeMode === 'login'
                    ? 'bg-[#1e3a8a] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode('register');
                  setErrorMsg(null);
                  setFieldErrors({});
                }}
                className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  activeMode === 'register'
                    ? 'bg-[#1e3a8a] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta</span>
              </button>

              {savedAccounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('profiles');
                    setErrorMsg(null);
                    setFieldErrors({});
                  }}
                  className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ml-auto ${
                    activeMode === 'profiles'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="tabular-nums">Perfis Locais ({savedAccounts.length})</span>
                </button>
              )}
            </div>

            {/* 1. LOGIN */}
            {activeMode === 'login' && (
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Acesse sua conta
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {isCloud
                      ? 'Entre com seu e-mail e senha cadastrados ou utilize sua conta Google.'
                      : 'Entre com seu usuário ou e-mail para carregar seus dados.'}
                  </p>
                </div>

                {isCloud && (
                  <div className="mb-5">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isSubmitting}
                      className="w-full min-h-[46px] px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2.5 shadow-2xs disabled:opacity-60"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                        />
                      </svg>
                      <span>Continuar com Google</span>
                    </button>

                    <div className="relative flex items-center my-5">
                      <div className="flex-grow border-t border-slate-200" />
                      <span className="shrink mx-3 text-xs font-medium text-slate-400">ou com e-mail</span>
                      <div className="flex-grow border-t border-slate-200" />
                    </div>
                  </div>
                )}

                <form onSubmit={handleLogin} noValidate className="space-y-4">
                  {/* E-mail ou Usuário */}
                  <div className="space-y-1.5">
                    <label htmlFor={loginIdentifierId} className="block text-xs font-bold text-slate-700">
                      {isCloud ? 'E-mail' : 'E-mail ou Nome de Usuário'} <span className="text-rose-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center w-full rounded-xl border bg-slate-50/70 transition-all ${
                        fieldErrors.email
                          ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-300'
                          : 'border-slate-300 hover:border-slate-400 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20'
                      }`}
                    >
                      <span className="pl-3.5 text-slate-400 shrink-0">
                        {isCloud ? <Mail className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </span>
                      <input
                        id={loginIdentifierId}
                        type={isCloud ? 'email' : 'text'}
                        autoComplete={isCloud ? 'email' : 'username'}
                        autoCapitalize="none"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                        }}
                        placeholder={isCloud ? 'seu.email@exemplo.com' : 'ex: aluno_volei ou e-mail'}
                        aria-invalid={Boolean(fieldErrors.email)}
                        className="w-full min-h-[44px] px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Senha / PIN */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor={loginPasswordId} className="block text-xs font-bold text-slate-700">
                        {isCloud ? 'Senha' : 'Senha / PIN de Acesso'}
                        {isCloud && <span className="text-rose-500"> *</span>}
                      </label>
                      {isCloud && (
                        <button
                          type="button"
                          onClick={() => {
                            setRecoveryEmail(email);
                            setRecoveryFeedback(null);
                            setIsRecoveryModalOpen(true);
                          }}
                          className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          Esqueci minha senha
                        </button>
                      )}
                    </div>
                    <div
                      className={`relative flex items-center w-full rounded-xl border bg-slate-50/70 transition-all ${
                        fieldErrors.password
                          ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-300'
                          : 'border-slate-300 hover:border-slate-400 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20'
                      }`}
                    >
                      <span className="pl-3.5 text-slate-400 shrink-0">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        id={loginPasswordId}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
                        }}
                        placeholder={isCloud ? 'Digite sua senha' : 'Deixe vazio se não definiu senha'}
                        aria-invalid={Boolean(fieldErrors.password)}
                        className="w-full min-h-[44px] px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-2.5 pr-3 text-slate-400 hover:text-slate-700 transition-colors"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.password}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[46px] py-3 px-4 bg-[#1e3a8a] hover:bg-blue-900 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Entrando...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 text-amber-400" />
                        <span>Entrar na Conta</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs sm:text-sm text-slate-600">
                  Ainda não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('register');
                      setErrorMsg(null);
                      setFieldErrors({});
                    }}
                    className="font-bold text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    Criar conta gratuita
                  </button>
                </div>
              </div>
            )}

            {/* 2. CADASTRO */}
            {activeMode === 'register' && (
              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Criar sua conta
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Preencha seus dados para salvar conquistas, treinos táticos e relatórios.
                  </p>
                </div>

                <form onSubmit={handleRegister} noValidate className="space-y-6">
                  {/* Perfil */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold text-slate-700">
                      1. Perfil de atuação <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {ROLE_OPTIONS.map((opt) => {
                        const isSelected = role === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setRole(opt.id)}
                            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-blue-50/80 border-[#1e3a8a] ring-2 ring-[#1e3a8a]/20'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                                  {opt.icon}
                                </div>
                                {isSelected ? (
                                  <span className="w-5 h-5 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5" />
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-medium text-slate-400">
                                    {opt.tag}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                                {opt.title}
                              </h3>
                              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                {opt.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Identificação e Acesso */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <span className="block text-xs font-bold text-slate-700">
                      2. Dados de acesso e identificação
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Nome Completo */}
                      <div className="space-y-1.5">
                        <label htmlFor={regDisplayNameId} className="block text-xs font-semibold text-slate-700">
                          Nome Completo <span className="text-rose-500">*</span>
                        </label>
                        <div
                          className={`relative flex items-center w-full rounded-xl border bg-slate-50/70 transition-all ${
                            fieldErrors.displayName
                              ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-300'
                              : 'border-slate-300 hover:border-slate-400 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20'
                          }`}
                        >
                          <span className="pl-3.5 text-slate-400 shrink-0">
                            <Award className="w-4 h-4" />
                          </span>
                          <input
                            id={regDisplayNameId}
                            type="text"
                            autoComplete="name"
                            value={displayName}
                            onChange={(e) => {
                              setDisplayName(e.target.value);
                              if (fieldErrors.displayName) setFieldErrors((p) => ({ ...p, displayName: '' }));
                            }}
                            placeholder="ex: Pedro Henrique"
                            className="w-full min-h-[44px] px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                          />
                        </div>
                        {fieldErrors.displayName && (
                          <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{fieldErrors.displayName}</span>
                          </p>
                        )}
                      </div>

                      {/* Nome de usuário */}
                      <div className="space-y-1.5">
                        <label htmlFor={regUsernameId} className="block text-xs font-semibold text-slate-700">
                          Nome de Usuário <span className="text-rose-500">*</span>
                        </label>
                        <div
                          className={`relative flex items-center w-full rounded-xl border bg-slate-50/70 transition-all ${
                            fieldErrors.username
                              ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-300'
                              : 'border-slate-300 hover:border-slate-400 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20'
                          }`}
                        >
                          <span className="pl-3.5 text-slate-400 shrink-0 font-bold text-xs">@</span>
                          <input
                            id={regUsernameId}
                            type="text"
                            autoCapitalize="none"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => {
                              setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                              if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: '' }));
                            }}
                            placeholder="ex: pedro_volei"
                            className="w-full min-h-[44px] px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                          />
                        </div>
                        {fieldErrors.username && (
                          <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{fieldErrors.username}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* E-mail */}
                    <div className="space-y-1.5">
                      <label htmlFor={regEmailId} className="block text-xs font-semibold text-slate-700">
                        E-mail {isCloud ? <span className="text-rose-500">*</span> : <span className="text-slate-400">(Opcional)</span>}
                      </label>
                      <div
                        className={`relative flex items-center w-full rounded-xl border bg-slate-50/70 transition-all ${
                          fieldErrors.email
                            ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-300'
                            : 'border-slate-300 hover:border-slate-400 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20'
                        }`}
                      >
                        <span className="pl-3.5 text-slate-400 shrink-0">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          id={regEmailId}
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                          }}
                          placeholder="seu.email@exemplo.com"
                          className="w-full min-h-[44px] px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                        />
                      </div>
                      {fieldErrors.email && (
                        <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Senha & Confirmação */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor={regPasswordId} className="block text-xs font-semibold text-slate-700">
                          {isCloud ? (
                            <>
                              Senha (mín. 6 caracteres) <span className="text-rose-500">*</span>
                            </>
                          ) : (
                            'Senha / PIN (Opcional)'
                          )}
                        </label>
                        <div
                          className={`relative flex items-center w-full rounded-xl border bg-slate-50/70 transition-all ${
                            fieldErrors.password
                              ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-300'
                              : 'border-slate-300 hover:border-slate-400 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20'
                          }`}
                        >
                          <span className="pl-3.5 text-slate-400 shrink-0">
                            <Lock className="w-4 h-4" />
                          </span>
                          <input
                            id={regPasswordId}
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
                            }}
                            placeholder={isCloud ? 'Crie uma senha segura' : 'Opcional (ex: 1234)'}
                            className="w-full min-h-[44px] px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-2.5 pr-3 text-slate-400 hover:text-slate-700"
                            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {fieldErrors.password && (
                          <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{fieldErrors.password}</span>
                          </p>
                        )}
                        {password && (
                          <div className="pt-1">
                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
                              <span>Segurança</span>
                              <span>{passwordStrength.label}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                style={{ width: `${passwordStrength.percent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor={regConfirmPasswordId} className="block text-xs font-semibold text-slate-700">
                          Confirmar Senha {isCloud && <span className="text-rose-500">*</span>}
                        </label>
                        <div
                          className={`relative flex items-center w-full rounded-xl border bg-slate-50/70 transition-all ${
                            fieldErrors.confirmPassword
                              ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-300'
                              : confirmPassword && passwordsMatch
                              ? 'border-emerald-400 bg-emerald-50/30'
                              : 'border-slate-300 hover:border-slate-400 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20'
                          }`}
                        >
                          <span className="pl-3.5 text-slate-400 shrink-0">
                            <KeyRound className="w-4 h-4" />
                          </span>
                          <input
                            id={regConfirmPasswordId}
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            disabled={!password}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (fieldErrors.confirmPassword) {
                                setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
                              }
                            }}
                            placeholder={password ? 'Repita a senha' : 'Digite a senha primeiro'}
                            className="w-full min-h-[44px] px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={!password}
                            className="p-2.5 pr-3 text-slate-400 hover:text-slate-700 disabled:opacity-50"
                            aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {fieldErrors.confirmPassword && (
                          <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{fieldErrors.confirmPassword}</span>
                          </p>
                        )}
                        {confirmPassword && passwordsMatch && (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Senhas conferem
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Avatar e Contexto Escolar */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <span className="block text-xs font-bold text-slate-700">
                      3. Personalização e Turma
                    </span>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Avatar Esportivo</span>
                        <span className="text-slate-500">Selecionado: {avatar}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                        {AVATAR_OPTIONS.map((av) => {
                          const isSelected = avatar === av;
                          return (
                            <button
                              key={av}
                              type="button"
                              onClick={() => setAvatar(av)}
                              className={`w-10 h-10 text-xl rounded-lg border flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400/50 scale-105'
                                  : 'bg-white border-slate-200 hover:bg-slate-100'
                              }`}
                              aria-label={`Avatar ${av}`}
                              aria-pressed={isSelected}
                            >
                              {av}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor={regSchoolId} className="block text-xs font-semibold text-slate-700">
                          Escola ou Clube
                        </label>
                        <div className="relative flex items-center w-full rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-50/70 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20 transition-all">
                          <span className="pl-3.5 text-slate-400 shrink-0">
                            <School className="w-4 h-4" />
                          </span>
                          <input
                            id={regSchoolId}
                            type="text"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            placeholder="ex: Escola Estadual Santos Dumont"
                            className="w-full min-h-[44px] px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor={regClassId} className="block text-xs font-semibold text-slate-700">
                          Turma ou Categoria
                        </label>
                        <div className="relative flex items-center w-full rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-50/70 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20 transition-all">
                          <span className="pl-3.5 text-slate-400 shrink-0">
                            <Users className="w-4 h-4" />
                          </span>
                          <input
                            id={regClassId}
                            type="text"
                            value={classCode}
                            onChange={(e) => setClassCode(e.target.value)}
                            placeholder="ex: 8º Ano B ou Sub-17"
                            className="w-full min-h-[44px] px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[46px] py-3 px-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-slate-950 font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        <span>Criando conta...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Concluir Cadastro</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs sm:text-sm text-slate-600">
                  Já tem conta cadastrada?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('login');
                      setErrorMsg(null);
                      setFieldErrors({});
                    }}
                    className="font-bold text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    Fazer login
                  </button>
                </div>
              </div>
            )}

            {/* 3. PERFIS SALVOS LOCAIS */}
            {activeMode === 'profiles' && (
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Perfis Salvos neste Dispositivo
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Troque rapidamente entre perfis em aulas práticas ou dispositivos compartilhados.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('register');
                      setErrorMsg(null);
                    }}
                    className="min-h-[40px] px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1e3a8a] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Novo Perfil</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {savedAccounts.map((account) => {
                    const isCurrent = currentUser?.id === account.id;
                    const levelData = getLevelInfo(account.progress.xp);

                    return (
                      <div
                        key={account.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-300/40'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <div
                          onClick={() => handleSwitchAccount(account)}
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                        >
                          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                            {account.avatar || '🏐'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <strong className="text-sm font-bold text-slate-900 truncate">
                                {account.displayName}
                              </strong>
                              <span className="text-xs text-slate-500">@{account.username}</span>
                              {account.pin && (
                                <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Protegido
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-xs font-bold text-emerald-700">· Ativo</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 tabular-nums">
                              {account.progress.xp} XP · {Object.keys(account.progress.completedQuests).length} Quests · Nível {levelData.level} ({levelData.title})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSwitchAccount(account)}
                            className="min-h-[40px] px-3.5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl transition-colors whitespace-nowrap"
                          >
                            {isCurrent ? 'Recarregar' : 'Acessar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmAccount({ id: account.id, name: account.displayName })}
                            className="min-h-[40px] min-w-[40px] p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center"
                            aria-label={`Remover perfil de ${account.displayName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Modal: Recuperar Senha (Supabase) */}
      {isRecoveryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#1e3a8a]" />
                <h3 className="font-bold text-base text-slate-900">Redefinir Senha</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecoveryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendRecovery} className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600">
                Informe o e-mail da sua conta para receber o link de redefinição de senha.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">E-mail cadastrado</label>
                <div className="relative flex items-center w-full rounded-xl border border-slate-300 bg-slate-50/70 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20">
                  <span className="pl-3.5 text-slate-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full min-h-[44px] px-3 py-2 text-sm text-slate-900 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {recoveryFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 border ${
                    recoveryFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {recoveryFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{recoveryFeedback.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecoveryModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={isSendingRecovery}
                  className="min-h-[42px] px-4 py-2 bg-[#1e3a8a] hover:bg-blue-900 disabled:opacity-60 text-white text-xs font-bold rounded-xl"
                >
                  {isSendingRecovery ? 'Enviando...' : 'Enviar Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Perfil */}
      {isEditProfileOpen && currentUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#1e3a8a]" />
                <h3 className="font-bold text-base text-slate-900">Editar Perfil</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Nome de Exibição</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#1e3a8a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Perfil</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:border-[#1e3a8a]"
                >
                  <option value="student">Estudante / Aluno</option>
                  <option value="athlete">Atleta</option>
                  <option value="teacher">Professor(a) / Técnico</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Escola / Clube</label>
                  <input
                    type="text"
                    value={editSchool}
                    onChange={(e) => setEditSchool(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#1e3a8a]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Turma / Categoria</label>
                  <input
                    type="text"
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#1e3a8a]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Avatar</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setEditAvatar(av)}
                      className={`w-9 h-9 text-lg rounded-lg border flex items-center justify-center ${
                        editAvatar === av
                          ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400/50'
                          : 'bg-white border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="min-h-[42px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="min-h-[42px] px-4 py-2 bg-[#1e3a8a] hover:bg-blue-900 disabled:opacity-60 text-white text-xs font-bold rounded-xl"
                >
                  {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Digitar PIN/Senha para Perfil Local */}
      {pinPromptAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Digite sua Senha / PIN</h3>
                <p className="text-xs text-slate-500">
                  {pinPromptAccount.displayName} (@{pinPromptAccount.username})
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmPinModal} className="space-y-4">
              <div className="space-y-1.5">
                <div className="relative flex items-center w-full rounded-xl border border-slate-300 bg-slate-50/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e3a8a]/20 focus-within:border-[#1e3a8a]">
                  <span className="pl-3.5 text-slate-400 shrink-0">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showModalPin ? 'text' : 'password'}
                    autoFocus
                    value={pinInputModal}
                    onChange={(e) => {
                      setPinInputModal(e.target.value);
                      setPinModalError(null);
                    }}
                    placeholder="Digite seu PIN ou senha"
                    className="w-full min-h-[44px] px-3 py-2 text-sm text-slate-900 focus:outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPin(!showModalPin)}
                    className="p-2.5 pr-3 text-slate-400 hover:text-slate-700"
                    aria-label={showModalPin ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showModalPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pinModalError && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{pinModalError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPinPromptAccount(null);
                    setPinInputModal('');
                    setPinModalError(null);
                  }}
                  className="min-h-[42px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-4 py-2 bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs font-bold rounded-xl"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmação de Exclusão de Perfil Local */}
      {deleteConfirmAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-rose-300 p-5 sm:p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Remover Perfil Local</h3>
                <p className="text-xs text-slate-500">{deleteConfirmAccount.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Deseja desvincular este perfil deste navegador? Os dados locais deste atleta serão excluídos.
            </p>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmAccount(null)}
                className="min-h-[42px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="min-h-[42px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
