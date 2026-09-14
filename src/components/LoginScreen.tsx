import React, { useState } from 'react';
import { UserAccount, UserProgress } from '../types';
import { authEngine } from '../engine/authEngine';
import { getLevelInfo, BADGES_LIST } from '../engine/gamificationEngine';
import { AppLogo } from './AppLogo';
import { User, LogIn, UserPlus, KeyRound, Award, Shield, Check, School, Trash2, ArrowRight, Star, Trophy, Lock } from 'lucide-react';

interface LoginScreenProps {
  currentUser: UserAccount | null;
  onUserChange: (user: UserAccount | null) => void;
  onNavigateToTactics: () => void;
  currentProgress: UserProgress;
}

const AVATAR_OPTIONS = ['🏐', '⚡', '🛡️', '🔥', '👑', '🌟', '🎯', '🚀', '🦅', '🦁', '🏆', '💎'];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  currentUser,
  onUserChange,
  onNavigateToTactics,
  currentProgress,
}) => {
  const [activeMode, setActiveMode] = useState<'login' | 'register' | 'profiles'>('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pin, setPin] = useState('');
  const [avatar, setAvatar] = useState('🏐');
  const [role, setRole] = useState<'student' | 'teacher' | 'athlete'>('student');
  const [schoolName, setSchoolName] = useState(currentProgress.schoolName || '');
  const [classCode, setClassCode] = useState(currentProgress.classCode || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modais in-app (substitutos de prompt/confirm)
  const [pinPromptAccount, setPinPromptAccount] = useState<UserAccount | null>(null);
  const [pinInputModal, setPinInputModal] = useState('');
  const [pinModalError, setPinModalError] = useState<string | null>(null);
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<{ id: string; name: string } | null>(null);

  const savedAccounts = authEngine.getSavedAccounts();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = authEngine.login(username, pin || undefined);
    if (res.success && res.user) {
      onUserChange(res.user);
      setSuccessMsg(`Bem-vindo de volta, ${res.user.displayName}! Progresso sincronizado.`);
    } else {
      setErrorMsg(res.error || 'Erro ao efetuar login.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = authEngine.registerUser({
      username,
      displayName: displayName || username,
      pin: pin || undefined,
      avatar,
      role,
      schoolName,
      classCode,
      initialProgress: currentProgress,
    });

    if (res.success && res.user) {
      onUserChange(res.user);
      setSuccessMsg('Conta criada com sucesso! Todas as suas conquistas, XP e configurações foram salvas.');
    } else {
      setErrorMsg(res.error || 'Erro ao registrar.');
    }
  };

  const handleSwitchAccount = (account: UserAccount) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (account.pin) {
      setPinPromptAccount(account);
      setPinInputModal('');
      setPinModalError(null);
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
      setPinModalError(res.error || 'PIN inválido. Tente novamente.');
    }
  };

  const handleLogout = () => {
    authEngine.logout();
    onUserChange(null);
    setSuccessMsg('Você saiu da sua conta.');
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirmAccount({ id, name });
  };

  const handleExecuteDelete = () => {
    if (!deleteConfirmAccount) return;
    authEngine.deleteAccount(deleteConfirmAccount.id);
    setSuccessMsg(`Perfil de ${deleteConfirmAccount.name} removido com sucesso.`);
    setDeleteConfirmAccount(null);
  };

  const currentLevelInfo = currentUser
    ? getLevelInfo(currentUser.progress.xp)
    : getLevelInfo(currentProgress.xp);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Banner Superior Pedagógico */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="w-14 h-14 rounded-2xl bg-[#1e3a8a] text-yellow-400 font-black text-3xl flex items-center justify-center shadow-md border-2 border-yellow-400 shrink-0">
              {currentUser.avatar}
            </div>
          ) : (
            <AppLogo size="lg" className="shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-[#1e3a8a]">
                {currentUser ? `Painel do Atleta: ${currentUser.displayName}` : 'Vôley Tático Brazil - Acesso & Conquistas'}
              </h2>
              {currentUser && (
                <span className="bg-yellow-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-md">
                  {currentUser.role === 'teacher' ? 'Professor' : currentUser.role === 'athlete' ? 'Atleta' : 'Estudante'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {currentUser
                ? `Usuário @${currentUser.username} • Turma ${currentUser.classCode || 'Geral'} • Salvo localmente sem necessidade de internet.`
                : 'Crie uma conta para salvar seu progresso nas Quests, nível de treinador e conquistas desbloqueadas.'}
            </p>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={onNavigateToTactics}
              className="flex-1 md:flex-none px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              Ir para a Prancheta <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors"
            >
              Sair
            </button>
          </div>
        )}
      </div>

      {/* Alertas */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border-2 border-rose-300 text-rose-950 rounded-xl text-xs sm:text-sm font-bold animate-in fade-in">
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 rounded-xl text-xs sm:text-sm font-bold animate-in fade-in">
          ✅ {successMsg}
        </div>
      )}

      {/* Se o usuário estiver conectado: exibe estatísticas e perfil */}
      {currentUser ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card de Nível e XP */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Estatísticas Gerais</span>
              <h3 className="text-base font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Nível {currentLevelInfo.level}: {currentLevelInfo.title}
              </h3>
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
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Desafios Táticos</span>
              <h3 className="text-base font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500" />
                {Object.keys(currentUser.progress.completedQuests).length} Quests Concluídas
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Desafios táticos superados na quadra e no vôlei de praia.
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
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Conquistas</span>
              <h3 className="text-base font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                {currentUser.progress.unlockedBadges.length} Medalhas Desbloqueadas
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Reconhecimentos obtidos pelas regras e rodízio.
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
      ) : null}

      {/* Formulários de Autenticação / Perfis */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm">
        {/* Abas de Modo */}
        <div className="flex border-b-2 border-slate-100 pb-2 gap-2">
          <button
            onClick={() => { setActiveMode('login'); setErrorMsg(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeMode === 'login'
                ? 'bg-[#1e3a8a] text-yellow-400 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Fazer Login
          </button>
          <button
            onClick={() => { setActiveMode('register'); setErrorMsg(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeMode === 'register'
                ? 'bg-[#1e3a8a] text-yellow-400 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Criar Nova Conta
          </button>
          {savedAccounts.length > 0 && (
            <button
              onClick={() => { setActiveMode('profiles'); setErrorMsg(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ml-auto ${
                activeMode === 'profiles'
                  ? 'bg-yellow-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Perfis Salvos ({savedAccounts.length})</span>
            </button>
          )}
        </div>

        {/* Formulário: Login */}
        {activeMode === 'login' && (
          <form onSubmit={handleLogin} className="mt-5 space-y-4 max-w-md w-full min-w-0">
            <div className="w-full min-w-0">
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome de Usuário</label>
              <div className="relative flex items-center w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-[#1e3a8a] transition-all overflow-hidden box-border">
                <span className="pl-3.5 text-slate-400 shrink-0">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: aluno_volei"
                  className="w-full min-w-0 px-3 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent box-border"
                />
              </div>
            </div>

            <div className="w-full min-w-0">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                PIN Numérico de Acesso (Deixe em branco caso não use)
              </label>
              <div className="relative flex items-center w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-[#1e3a8a] transition-all overflow-hidden box-border">
                <span className="pl-3.5 text-slate-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN de segurança (até 6 dígitos)"
                  className="w-full min-w-0 px-3 py-2.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent box-border"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1e3a8a] hover:bg-blue-900 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-yellow-400" /> Entrar e Carregar Conquistas
            </button>
          </form>
        )}

        {/* Formulário: Registro */}
        {activeMode === 'register' && (
          <form onSubmit={handleRegister} className="mt-5 space-y-4 w-full min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="w-full min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome de Usuário (Login)</label>
                <div className="relative flex items-center w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-[#1e3a8a] transition-all overflow-hidden box-border">
                  <span className="pl-3.5 text-slate-400 shrink-0">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: pedro_volei"
                    className="w-full min-w-0 px-3 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent box-border"
                  />
                </div>
              </div>

              <div className="w-full min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo / Exibição</label>
                <div className="relative flex items-center w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-[#1e3a8a] transition-all overflow-hidden box-border">
                  <span className="pl-3.5 text-slate-400 shrink-0">
                    <Award className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="ex: Pedro Henrique"
                    className="w-full min-w-0 px-3 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent box-border"
                  />
                </div>
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="w-full min-w-0">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Escolha seu Avatar</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-10 h-10 text-xl rounded-xl border flex items-center justify-center transition-all ${
                      avatar === av
                        ? 'bg-yellow-100 border-yellow-500 scale-110 shadow-xs ring-2 ring-yellow-400'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="w-full min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1">Perfil</label>
                <div className="relative flex items-center w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-[#1e3a8a] transition-all overflow-hidden box-border">
                  <span className="pl-3.5 text-slate-400 shrink-0">
                    <Shield className="w-4 h-4" />
                  </span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full min-w-0 px-3 py-2.5 text-xs font-medium text-slate-900 bg-transparent focus:outline-none box-border"
                  >
                    <option value="student">Aluno(a)</option>
                    <option value="athlete">Atleta</option>
                    <option value="teacher">Professor(a)</option>
                  </select>
                </div>
              </div>

              <div className="w-full min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN Numérico (Opcional)</label>
                <div className="relative flex items-center w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-[#1e3a8a] transition-all overflow-hidden box-border">
                  <span className="pl-3.5 text-slate-400 shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Até 6 dígitos"
                    className="w-full min-w-0 px-3 py-2.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent box-border"
                  />
                </div>
              </div>

              <div className="w-full min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1">Turma / Classe</label>
                <div className="relative flex items-center w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-[#1e3a8a] transition-all overflow-hidden box-border">
                  <span className="pl-3.5 text-slate-400 shrink-0">
                    <School className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    placeholder="ex: 8º Ano A"
                    className="w-full min-w-0 px-3 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent box-border"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Criar Conta & Vincular Meu Progresso Atual
            </button>
          </form>
        )}

        {/* Lista de Perfis Salvos para Troca */}
        {activeMode === 'profiles' && (
          <div className="mt-5 space-y-3">
            <p className="text-xs text-slate-600 font-medium">
              Contas salvas neste dispositivo para troca rápida em ambiente de aula ou quadra:
            </p>
            {savedAccounts.map((account) => (
              <div
                key={account.id}
                className={`p-3.5 rounded-xl border-2 flex items-center justify-between transition-all ${
                  currentUser?.id === account.id
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div
                  onClick={() => handleSwitchAccount(account)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <span className="text-3xl">{account.avatar || '🏐'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs sm:text-sm font-black text-slate-900">{account.displayName}</strong>
                      {account.pin && <KeyRound className="w-3.5 h-3.5 text-slate-400" title="Protegido por PIN" />}
                      <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-1.5 py-0.2 rounded">
                        @{account.username}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {account.progress.xp} XP • {Object.keys(account.progress.completedQuests).length} Quests • Nível {getLevelInfo(account.progress.xp).level}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSwitchAccount(account)}
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-lg transition-all shadow-xs"
                  >
                    Acessar
                  </button>
                  <button
                    onClick={() => handleDeleteClick(account.id, account.displayName)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remover perfil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal In-App: Digitar PIN de Segurança */}
      {pinPromptAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-[#1e3a8a] p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
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

            <form onSubmit={handleConfirmPinModal} className="space-y-4 w-full min-w-0">
              <div className="w-full min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN Numérico</label>
                <div className="relative flex items-center w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-[#1e3a8a] transition-all overflow-hidden box-border">
                  <span className="pl-3.5 text-slate-400 shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    autoFocus
                    maxLength={6}
                    value={pinInputModal}
                    onChange={(e) => {
                      setPinInputModal(e.target.value);
                      setPinModalError(null);
                    }}
                    placeholder="Digite o PIN (até 6 dígitos)"
                    className="w-full min-w-0 px-3 py-2.5 text-sm font-mono tracking-widest text-center text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent box-border"
                  />
                </div>
                {pinModalError && (
                  <p className="text-xs text-rose-600 font-bold mt-1.5">{pinModalError}</p>
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
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal In-App: Confirmação de Exclusão de Perfil */}
      {deleteConfirmAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-rose-300 p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
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
              Tem certeza que deseja desvincular e remover este perfil deste dispositivo? Esta ação excluirá os dados locais salvos deste atleta.
            </p>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmAccount(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
