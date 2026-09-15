import React, { useState, useId, useMemo } from 'react';
import { UserAccount, UserProgress } from '../types';
import { authEngine } from '../engine/authEngine';
import { getLevelInfo, BADGES_LIST } from '../engine/gamificationEngine';
import { AppLogo } from './AppLogo';
import {
  User,
  LogIn,
  UserPlus,
  KeyRound,
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
  HelpCircle,
  Sparkles,
  GraduationCap,
  Zap,
  RotateCcw,
  Users,
  Info,
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
  badgeLabel: string;
  description: string;
  icon: React.ReactNode;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'student',
    title: 'Estudante / Aluno',
    badgeLabel: 'Escolar',
    description: 'Para aulas de Educação Física, aprender rodízio e cumprir desafios didáticos.',
    icon: <GraduationCap className="w-5 h-5 text-blue-700" />,
  },
  {
    id: 'athlete',
    title: 'Atleta',
    badgeLabel: 'Competição',
    description: 'Para treinamento tático avançado, jogadas combinadas e vôlei de praia.',
    icon: <Zap className="w-5 h-5 text-amber-600" />,
  },
  {
    id: 'teacher',
    title: 'Professor(a) / Técnico',
    badgeLabel: 'Gestão',
    description: 'Para coordenar turmas, acompanhar progresso de alunos e emitir relatórios.',
    icon: <Shield className="w-5 h-5 text-emerald-700" />,
  },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  currentUser,
  onUserChange,
  onNavigateToTactics,
  currentProgress,
}) => {
  const [activeMode, setActiveMode] = useState<AuthMode>('login');

  // Estados dos formulários
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [avatar, setAvatar] = useState('🏐');
  const [role, setRole] = useState<UserRole>('student');
  const [schoolName, setSchoolName] = useState(currentProgress.schoolName || '');
  const [classCode, setClassCode] = useState(currentProgress.classCode || '');

  // Feedbacks visuais e estados assíncronos
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
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  // IDs únicos para acessibilidade (WCAG)
  const loginUsernameId = useId();
  const loginPinId = useId();
  const regUsernameId = useId();
  const regDisplayNameId = useId();
  const regPinId = useId();
  const regConfirmPinId = useId();
  const regSchoolId = useId();
  const regClassId = useId();

  const savedAccounts = authEngine.getSavedAccounts();

  // Validação em tempo real do PIN no cadastro
  const pinStrength = useMemo(() => {
    if (!pin) return { level: 'empty', label: '', percent: 0, color: 'bg-slate-200' };
    if (pin.length < 4) {
      return { level: 'weak', label: 'Curto (mínimo 4 dígitos recomendados)', percent: 33, color: 'bg-amber-400' };
    }
    if (pin.length >= 4 && pin.length <= 6) {
      return { level: 'good', label: 'PIN ideal de 4 a 6 dígitos', percent: 100, color: 'bg-emerald-500' };
    }
    return { level: 'good', label: 'Seguro', percent: 100, color: 'bg-emerald-500' };
  }, [pin]);

  const pinsMatch = useMemo(() => {
    if (!pin && !confirmPin) return true;
    return pin === confirmPin;
  }, [pin, confirmPin]);

  // Manipulador de Login com proteção contra envio duplo e validações
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) {
      setFieldErrors({ username: 'Informe seu nome de usuário para entrar.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulação rápida para feedback tátil suave
      await new Promise((r) => setTimeout(r, 220));

      const res = authEngine.login(cleanUser, pin || undefined);
      if (res.success && res.user) {
        onUserChange(res.user);
        setSuccessMsg(`Bem-vindo de volta, ${res.user.displayName}! Progresso sincronizado com sucesso.`);
        setUsername('');
        setPin('');
      } else {
        setErrorMsg(res.error || 'Não foi possível efetuar o login. Verifique seus dados.');
        if (res.error?.toLowerCase().includes('usuário')) {
          setFieldErrors({ username: res.error });
        } else if (res.error?.toLowerCase().includes('pin')) {
          setFieldErrors({ pin: res.error });
        }
      }
    } catch {
      setErrorMsg('Ocorreu um erro inesperado ao processar o login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manipulador de Cadastro com validações completas
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});

    const cleanUser = username.trim().toLowerCase();
    const newFieldErrors: Record<string, string> = {};

    if (!cleanUser || cleanUser.length < 3) {
      newFieldErrors.username = 'O nome de usuário deve conter no mínimo 3 caracteres.';
    }

    if (pin && pin !== confirmPin) {
      newFieldErrors.confirmPin = 'Os PINs digitados não coincidem. Digite o mesmo PIN nos dois campos.';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setErrorMsg('Por favor, corrija os campos indicados antes de prosseguir.');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((r) => setTimeout(r, 250));

      const res = authEngine.registerUser({
        username: cleanUser,
        displayName: displayName.trim() || cleanUser,
        pin: pin ? pin.trim() : undefined,
        avatar,
        role,
        schoolName: schoolName.trim() || undefined,
        classCode: classCode.trim() || undefined,
        initialProgress: currentProgress,
      });

      if (res.success && res.user) {
        onUserChange(res.user);
        setSuccessMsg('Conta criada com sucesso! Todas as suas conquistas, Quests e configurações foram salvas.');
        setUsername('');
        setDisplayName('');
        setPin('');
        setConfirmPin('');
      } else {
        setErrorMsg(res.error || 'Erro ao registrar sua conta.');
        if (res.error?.toLowerCase().includes('já existe')) {
          setFieldErrors({ username: res.error });
        }
      }
    } catch {
      setErrorMsg('Ocorreu um erro inesperado ao salvar a nova conta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Troca de conta com PIN ou direta
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
        setSuccessMsg(`Conectado como ${res.user.displayName}!`);
      }
    }
  };

  const handleConfirmPinModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinPromptAccount) return;

    const res = authEngine.switchAccount(pinPromptAccount.id, pinInputModal);
    if (res.success && res.user) {
      onUserChange(res.user);
      setSuccessMsg(`Conectado como ${res.user.displayName}!`);
      setPinPromptAccount(null);
      setPinInputModal('');
      setPinModalError(null);
    } else {
      setPinModalError(res.error || 'PIN incorreto. Tente novamente.');
    }
  };

  const handleLogout = () => {
    authEngine.logout();
    onUserChange(null);
    setSuccessMsg('Você desconectou da sua conta. Seus dados permanecem salvos neste dispositivo.');
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirmAccount({ id, name });
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Banner Superior Institucional */}
      <header className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Linha decorativa de topo na identidade do projeto */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1e3a8a] via-blue-700 to-yellow-500" />

        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="w-14 h-14 rounded-2xl bg-[#1e3a8a] text-yellow-400 font-black text-3xl flex items-center justify-center shadow-md border-2 border-yellow-400 shrink-0">
              {currentUser.avatar}
            </div>
          ) : (
            <AppLogo size="lg" className="shrink-0" />
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-[#1e3a8a] tracking-tight">
                {currentUser ? currentUser.displayName : 'REDE VÔLEI'}
              </h1>
              {currentUser && (
                <span className="bg-yellow-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                  {currentUser.role === 'teacher'
                    ? 'Professor'
                    : currentUser.role === 'athlete'
                    ? 'Atleta'
                    : 'Estudante'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              {currentUser
                ? `Usuário @${currentUser.username} • ${currentUser.schoolName || 'Escola de Vôlei'} • Turma ${currentUser.classCode || 'Geral'}`
                : 'Acesso pedagógico, sincronização de Quests e controle de turmas.'}
            </p>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button
              onClick={onNavigateToTactics}
              className="flex-1 md:flex-none min-h-[44px] px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-98"
            >
              Ir para a Prancheta <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="min-h-[44px] px-3.5 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center"
              title="Desconectar da conta atual"
            >
              Sair
            </button>
          </div>
        )}
      </header>

      {/* Alertas Visuais com Suporte a Acessibilidade */}
      {errorMsg && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 bg-rose-50 border border-rose-300 text-rose-950 rounded-xl text-xs sm:text-sm font-semibold flex items-start gap-3 shadow-xs animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-black text-rose-900">Atenção</strong>
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-700 hover:text-rose-950 font-bold text-sm px-1"
            aria-label="Fechar mensagem de erro"
          >
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs sm:text-sm font-semibold flex items-start gap-3 shadow-xs animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-black text-emerald-900">Sucesso</strong>
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-sm px-1"
            aria-label="Fechar mensagem de sucesso"
          >
            ✕
          </button>
        </div>
      )}

      {/* Painel de Estatísticas do Atleta Conectado */}
      {currentUser && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Card de Nível e XP */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Estatísticas Gerais</span>
              <h2 className="text-base font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Nível {currentLevelInfo.level}: {currentLevelInfo.title}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Total acumulado de <strong>{currentUser.progress.xp} XP</strong>.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                <span>Próximo Nível</span>
                <span>{currentLevelInfo.progressPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${currentLevelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card de Quests Concluídas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Desafios Táticos</span>
              <h2 className="text-base font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500" />
                {Object.keys(currentUser.progress.completedQuests).length} Quests Concluídas
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Desafios superados na quadra indoor e no vôlei de praia.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Tema de Quadra:</span>
              <span className="capitalize px-2 py-0.5 bg-blue-50 text-blue-900 rounded-md border border-blue-200">
                {currentUser.progress.selectedTheme.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Card de Medalhas / Badges */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Conquistas</span>
              <h2 className="text-base font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                {currentUser.progress.unlockedBadges.length} Medalhas Desbloqueadas
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Reconhecimentos de rodízio, bloqueio e regras FIVB.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto py-1">
              {currentUser.progress.unlockedBadges.map((badgeId) => {
                const b = BADGES_LIST.find((item) => item.id === badgeId);
                return (
                  <span
                    key={badgeId}
                    className="w-8 h-8 rounded-lg bg-yellow-100 border border-yellow-400 text-base flex items-center justify-center shrink-0 shadow-xs"
                    title={b ? `${b.title}: ${b.description}` : badgeId}
                  >
                    {b ? b.icon : '🏅'}
                  </span>
                );
              })}
              {currentUser.progress.unlockedBadges.length === 0 && (
                <span className="text-xs text-slate-400 italic">Nenhuma medalha ainda</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bloco Central de Autenticação / Perfis */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navegação por Abas (Login / Cadastro / Perfis) */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveMode('login');
              setErrorMsg(null);
              setFieldErrors({});
            }}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 ${
              activeMode === 'login'
                ? 'bg-[#1e3a8a] text-yellow-400 shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" /> Entrar na Conta
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('register');
              setErrorMsg(null);
              setFieldErrors({});
            }}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 ${
              activeMode === 'register'
                ? 'bg-[#1e3a8a] text-yellow-400 shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Criar Nova Conta
          </button>

          {savedAccounts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setActiveMode('profiles');
                setErrorMsg(null);
                setFieldErrors({});
              }}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 ml-auto ${
                activeMode === 'profiles'
                  ? 'bg-yellow-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Perfis Salvos ({savedAccounts.length})</span>
            </button>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 1. TELA DE LOGIN                                             */}
        {/* ------------------------------------------------------------- */}
        {activeMode === 'login' && (
          <div className="p-5 sm:p-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] mb-3">
                  <LogIn className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Bem-vindo de volta
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Acesse sua conta para continuar suas Quests e sincronizar suas táticas.
                </p>
              </div>

              <form onSubmit={handleLogin} noValidate className="space-y-4">
                {/* Campo: Nome de Usuário */}
                <div className="space-y-1.5">
                  <label
                    htmlFor={loginUsernameId}
                    className="block text-xs font-bold text-slate-700"
                  >
                    Nome de Usuário (@usuario) <span className="text-rose-500">*</span>
                  </label>
                  <div
                    className={`relative flex items-center w-full rounded-xl border bg-slate-50/70 transition-all ${
                      fieldErrors.username
                        ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-300'
                        : 'border-slate-300 hover:border-slate-400 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20'
                    }`}
                  >
                    <span className="pl-3.5 text-slate-400 shrink-0">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id={loginUsernameId}
                      type="text"
                      autoComplete="username"
                      autoCapitalize="none"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (fieldErrors.username) {
                          setFieldErrors((prev) => ({ ...prev, username: '' }));
                        }
                      }}
                      placeholder="Ex: aluno_volei"
                      aria-invalid={Boolean(fieldErrors.username)}
                      aria-describedby={fieldErrors.username ? `${loginUsernameId}-error` : undefined}
                      className="w-full min-h-[44px] px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                    />
                  </div>
                  {fieldErrors.username && (
                    <p
                      id={`${loginUsernameId}-error`}
                      className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.username}</span>
                    </p>
                  )}
                </div>

                {/* Campo: Senha / PIN */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={loginPinId}
                      className="block text-xs font-bold text-slate-700"
                    >
                      PIN de Acesso / Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsRecoveryModalOpen(true)}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      Ajuda com o PIN?
                    </button>
                  </div>
                  <div
                    className={`relative flex items-center w-full rounded-xl border bg-slate-50/70 transition-all ${
                      fieldErrors.pin
                        ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-300'
                        : 'border-slate-300 hover:border-slate-400 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20'
                    }`}
                  >
                    <span className="pl-3.5 text-slate-400 shrink-0">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id={loginPinId}
                      type={showPin ? 'text' : 'password'}
                      autoComplete="current-password"
                      inputMode="numeric"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value);
                        if (fieldErrors.pin) {
                          setFieldErrors((prev) => ({ ...prev, pin: '' }));
                        }
                      }}
                      placeholder="Deixe em branco se não configurou PIN"
                      aria-invalid={Boolean(fieldErrors.pin)}
                      aria-describedby={fieldErrors.pin ? `${loginPinId}-error` : undefined}
                      className="w-full min-h-[44px] px-3 py-2.5 text-sm font-mono tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal focus:outline-none bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="p-2.5 pr-3 text-slate-400 hover:text-slate-700 transition-colors"
                      aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.pin ? (
                    <p
                      id={`${loginPinId}-error`}
                      className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.pin}</span>
                    </p>
                  ) : (
                    <span className="text-[11px] text-slate-500 block">
                      Se você não definiu PIN durante o cadastro, deixe este campo vazio.
                    </span>
                  )}
                </div>

                {/* Botão de Submissão com Estado de Carregamento */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[48px] py-3 px-4 bg-[#1e3a8a] hover:bg-blue-900 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin text-yellow-400" />
                      <span>Verificando Acesso...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 text-yellow-400" />
                      <span>Entrar na Conta</span>
                    </>
                  )}
                </button>
              </form>

              {/* Link para Alternar para Cadastro */}
              <div className="mt-6 pt-5 border-t border-slate-200 text-center space-y-2">
                <p className="text-xs sm:text-sm text-slate-600">
                  Ainda não possui uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('register');
                      setErrorMsg(null);
                      setFieldErrors({});
                    }}
                    className="font-black text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    Cadastre-se gratuitamente
                  </button>
                </p>

                {savedAccounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('profiles');
                      setErrorMsg(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors pt-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Acessar via lista de perfis salvos neste dispositivo ({savedAccounts.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 2. TELA DE CADASTRO                                          */}
        {/* ------------------------------------------------------------- */}
        {activeMode === 'register' && (
          <div className="p-5 sm:p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-700 mb-3">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Criar sua Conta de Atleta
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Salve suas conquistas, histórico de rotações e acompanhamento pedagógico.
                </p>
              </div>

              <form onSubmit={handleRegister} noValidate className="space-y-6">
                {/* Seção: Como você deseja utilizar a plataforma? */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                      1. Como você deseja utilizar a plataforma? <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">Selecione seu perfil</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {ROLE_OPTIONS.map((opt) => {
                      const isSelected = role === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setRole(opt.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between relative ${
                            isSelected
                              ? 'bg-blue-50/80 border-[#1e3a8a] ring-2 ring-[#1e3a8a]/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                                {opt.icon}
                              </div>
                              {isSelected ? (
                                <span className="w-5 h-5 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-xs">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {opt.badgeLabel}
                                </span>
                              )}
                            </div>
                            <h3 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
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

                {/* Seção: Informações Pessoais & Identificação */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                    2. Informações de Identificação
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Username */}
                    <div className="space-y-1.5">
                      <label htmlFor={regUsernameId} className="block text-xs font-bold text-slate-700">
                        Nome de Usuário (@login) <span className="text-rose-500">*</span>
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
                            setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                            if (fieldErrors.username) {
                              setFieldErrors((prev) => ({ ...prev, username: '' }));
                            }
                          }}
                          placeholder="ex: pedro_volei"
                          aria-invalid={Boolean(fieldErrors.username)}
                          aria-describedby={fieldErrors.username ? `${regUsernameId}-error` : undefined}
                          className="w-full min-h-[44px] px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                        />
                      </div>
                      {fieldErrors.username ? (
                        <p
                          id={`${regUsernameId}-error`}
                          className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.username}</span>
                        </p>
                      ) : (
                        <span className="text-[11px] text-slate-500 block">
                          Mínimo de 3 caracteres. Letras, números e underline.
                        </span>
                      )}
                    </div>

                    {/* Display Name */}
                    <div className="space-y-1.5">
                      <label htmlFor={regDisplayNameId} className="block text-xs font-bold text-slate-700">
                        Nome Completo / Exibição
                      </label>
                      <div className="relative flex items-center w-full rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-50/70 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20 transition-all">
                        <span className="pl-3.5 text-slate-400 shrink-0">
                          <Award className="w-4 h-4" />
                        </span>
                        <input
                          id={regDisplayNameId}
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="ex: Pedro Henrique"
                          className="w-full min-h-[44px] px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Como você será identificado nas tabelas e relatórios.
                      </span>
                    </div>
                  </div>

                  {/* Seletor de Avatar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        Escolha seu Avatar Esportivo
                      </label>
                      <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                        Selecionado: <span className="text-lg">{avatar}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {AVATAR_OPTIONS.map((av) => {
                        const isSelected = avatar === av;
                        return (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setAvatar(av)}
                            className={`w-11 h-11 text-2xl rounded-xl border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-yellow-100 border-yellow-500 scale-105 shadow-xs ring-2 ring-yellow-400'
                                : 'bg-white border-slate-200 hover:bg-slate-100 hover:scale-102'
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
                </div>

                {/* Seção: Segurança & Acesso (PIN) */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                      3. Segurança & Senha (Opcional)
                    </label>
                    <span className="text-[11px] text-slate-500">Pode ser alterado depois</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* PIN */}
                    <div className="space-y-1.5">
                      <label htmlFor={regPinId} className="block text-xs font-bold text-slate-700">
                        PIN de Acesso (Opcional)
                      </label>
                      <div className="relative flex items-center w-full rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-50/70 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20 transition-all">
                        <span className="pl-3.5 text-slate-400 shrink-0">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          id={regPinId}
                          type={showPin ? 'text' : 'password'}
                          inputMode="numeric"
                          maxLength={6}
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          placeholder="Até 6 dígitos (ex: 1234)"
                          className="w-full min-h-[44px] px-3 py-2.5 text-sm font-mono tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal focus:outline-none bg-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="p-2.5 pr-3 text-slate-400 hover:text-slate-700 transition-colors"
                          aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {pin && (
                        <div className="pt-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>Força do PIN:</span>
                            <span>{pinStrength.label}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${pinStrength.color} transition-all duration-300`}
                              style={{ width: `${pinStrength.percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirmar PIN */}
                    <div className="space-y-1.5">
                      <label htmlFor={regConfirmPinId} className="block text-xs font-bold text-slate-700">
                        Confirmar PIN
                      </label>
                      <div
                        className={`relative flex items-center w-full rounded-xl border bg-slate-50/70 transition-all ${
                          fieldErrors.confirmPin
                            ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-300'
                            : confirmPin && pinsMatch
                            ? 'border-emerald-400 bg-emerald-50/30'
                            : 'border-slate-300 hover:border-slate-400 focus-within:bg-white focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-[#1e3a8a]/20'
                        }`}
                      >
                        <span className="pl-3.5 text-slate-400 shrink-0">
                          <KeyRound className="w-4 h-4" />
                        </span>
                        <input
                          id={regConfirmPinId}
                          type={showConfirmPin ? 'text' : 'password'}
                          inputMode="numeric"
                          maxLength={6}
                          disabled={!pin}
                          value={confirmPin}
                          onChange={(e) => {
                            setConfirmPin(e.target.value);
                            if (fieldErrors.confirmPin) {
                              setFieldErrors((prev) => ({ ...prev, confirmPin: '' }));
                            }
                          }}
                          placeholder={pin ? 'Repita o PIN acima' : 'Digite o PIN primeiro'}
                          aria-invalid={Boolean(fieldErrors.confirmPin)}
                          aria-describedby={fieldErrors.confirmPin ? `${regConfirmPinId}-error` : undefined}
                          className="w-full min-h-[44px] px-3 py-2.5 text-sm font-mono tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal focus:outline-none bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPin(!showConfirmPin)}
                          disabled={!pin}
                          className="p-2.5 pr-3 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
                          aria-label={showConfirmPin ? 'Ocultar confirmação de PIN' : 'Mostrar confirmação de PIN'}
                        >
                          {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {fieldErrors.confirmPin && (
                        <p
                          id={`${regConfirmPinId}-error`}
                          className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.confirmPin}</span>
                        </p>
                      )}

                      {confirmPin && pinsMatch && (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> PINs conferem corretamente!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seção: Escola & Turma */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                    4. Contexto Escolar / Clube
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Escola */}
                    <div className="space-y-1.5">
                      <label htmlFor={regSchoolId} className="block text-xs font-bold text-slate-700">
                        Nome da Escola ou Clube
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

                    {/* Turma */}
                    <div className="space-y-1.5">
                      <label htmlFor={regClassId} className="block text-xs font-bold text-slate-700">
                        Turma / Categoria / Ano
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

                {/* Botão de Envio do Cadastro */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[48px] py-3.5 px-4 bg-yellow-500 hover:bg-yellow-400 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed text-slate-950 font-black text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Salvando sua Conta...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Concluir Cadastro & Iniciar Jornada</span>
                    </>
                  )}
                </button>
              </form>

              {/* Link para Voltar ao Login */}
              <div className="mt-6 pt-5 border-t border-slate-200 text-center">
                <p className="text-xs sm:text-sm text-slate-600">
                  Já possui uma conta criada?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('login');
                      setErrorMsg(null);
                      setFieldErrors({});
                    }}
                    className="font-black text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    Fazer Login
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 3. TELA DE PERFIS SALVOS (TROCA RÁPIDA)                       */}
        {/* ------------------------------------------------------------- */}
        {activeMode === 'profiles' && (
          <div className="p-5 sm:p-8">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Perfis Salvos neste Dispositivo
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Troque de atleta rapidamente em ambiente escolar ou de treino coletivo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('register');
                    setErrorMsg(null);
                  }}
                  className="min-h-[40px] px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1e3a8a] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Novo Atleta
                </button>
              </div>

              {savedAccounts.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Nenhum perfil salvo encontrado neste navegador.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveMode('register')}
                    className="px-4 py-2 bg-[#1e3a8a] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Criar Primeira Conta
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedAccounts.map((account) => {
                    const isCurrent = currentUser?.id === account.id;
                    const levelData = getLevelInfo(account.progress.xp);

                    return (
                      <div
                        key={account.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-300/40 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                        }`}
                      >
                        <div
                          onClick={() => handleSwitchAccount(account)}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                            {account.avatar || '🏐'}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <strong className="text-xs sm:text-sm font-black text-slate-900">
                                {account.displayName}
                              </strong>
                              {account.pin && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded border border-slate-200">
                                  <Lock className="w-2.5 h-2.5 text-slate-500" /> Com PIN
                                </span>
                              )}
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                                @{account.username}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded">
                                  Ativo agora
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">
                              {account.progress.xp} XP • {Object.keys(account.progress.completedQuests).length} Quests • Nível {levelData.level} ({levelData.title})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleSwitchAccount(account)}
                            className="min-h-[40px] px-3.5 py-2 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl transition-all shadow-xs"
                          >
                            {isCurrent ? 'Recarregar' : 'Acessar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(account.id, account.displayName)}
                            className="min-h-[40px] min-w-[40px] p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center"
                            title={`Remover perfil de ${account.displayName}`}
                            aria-label={`Remover perfil de ${account.displayName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAIS IN-APP (ACESSIBILIDADE E SEGURANÇA)                   */}
      {/* ------------------------------------------------------------- */}

      {/* Modal In-App: Digitar PIN para Perfil Protegido */}
      {pinPromptAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">Digite seu PIN de Acesso</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {pinPromptAccount.displayName} (@{pinPromptAccount.username})
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmPinModal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">PIN Numérico</label>
                <div className="relative flex items-center w-full rounded-xl border border-slate-300 bg-slate-50/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e3a8a]/20 focus-within:border-[#1e3a8a] transition-all">
                  <span className="pl-3.5 text-slate-400 shrink-0">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showModalPin ? 'text' : 'password'}
                    autoFocus
                    inputMode="numeric"
                    maxLength={6}
                    value={pinInputModal}
                    onChange={(e) => {
                      setPinInputModal(e.target.value);
                      setPinModalError(null);
                    }}
                    placeholder="Digite seu PIN de segurança"
                    className="w-full min-h-[44px] px-3 py-2 text-sm font-mono tracking-widest text-center text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal focus:outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPin(!showModalPin)}
                    className="p-2.5 pr-3 text-slate-400 hover:text-slate-700 transition-colors"
                    aria-label={showModalPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                  >
                    {showModalPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pinModalError && (
                  <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1">
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
                  className="min-h-[42px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-4 py-2 bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
                >
                  Entrar no Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal In-App: Confirmação de Exclusão de Perfil Local */}
      {deleteConfirmAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-rose-300 p-5 sm:p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">Remover Perfil Local</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {deleteConfirmAccount.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium mb-4 leading-relaxed">
              Tem certeza que deseja desvincular este perfil deste aparelho? Os dados salvos localmente deste atleta serão excluídos.
            </p>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmAccount(null)}
                className="min-h-[42px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="min-h-[42px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal In-App: Ajuda de Acesso e Recuperação de PIN */}
      {isRecoveryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e3a8a] flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm sm:text-base text-slate-900">
                  Ajuda com o Acesso e PIN
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecoveryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg px-2"
                aria-label="Fechar modal de ajuda"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Armazenamento Local e Seguro:</strong> O REDE VÔLEI funciona 100% offline em quadras e ginásios. Suas contas e Quests ficam salvas com segurança no seu próprio navegador.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-black text-slate-800 text-xs">Esqueceu seu PIN?</h4>
                <p>
                  Se você definiu um PIN e não se lembra, você pode pedir ao professor(a) responsável pela sua turma para verificar seu perfil na lista de alunos, ou você pode criar um novo perfil mantendo suas táticas.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-black text-slate-800 text-xs">Acesso sem PIN</h4>
                <p>
                  O PIN é totalmente opcional. Se preferir facilidade de troca durante a aula prática, crie sua conta deixando o campo de PIN em branco.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsRecoveryModalOpen(false)}
                className="min-h-[42px] px-5 py-2 bg-[#1e3a8a] hover:bg-blue-900 text-white font-black text-xs rounded-xl shadow-xs transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

