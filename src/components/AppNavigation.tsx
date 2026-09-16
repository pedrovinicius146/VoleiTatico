import React, { useState } from 'react';
import { UserProgress, UserAccount } from '../types';
import { getLevelInfo } from '../engine/gamificationEngine';
import { AppLogo } from './AppLogo';
import {
  LayoutGrid,
  Trophy,
  GraduationCap,
  Settings,
  Waves,
  UserCheck,
  LogIn,
  Menu,
  X,
  Zap,
  Palette,
} from 'lucide-react';

export type NavTabId = 'tactics' | 'beach' | 'quests' | 'teacher' | 'account';

interface AppNavigationProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  userProgress: UserProgress;
  currentUser: UserAccount | null;
  onOpenSettings: () => void;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({
  activeTab,
  onSelectTab,
  userProgress,
  currentUser,
  onOpenSettings,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const levelInfo = getLevelInfo(userProgress.xp);
  const completedCount = Object.keys(userProgress.completedQuests).length;

  const navItems: Array<{
    id: NavTabId;
    label: string;
    description: string;
    shortLabel: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'tactics',
      label: 'Quadra e Posições (Rodízio)',
      description: 'Veja onde cada jogador fica e como funciona o giro oficial',
      shortLabel: 'Quadra',
      icon: <LayoutGrid className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'beach',
      label: 'Vôlei de Praia (Sinais de Mão)',
      description: 'Aprenda os sinais secretos dos dedos e o jogo em dupla',
      shortLabel: 'Praia',
      icon: <Waves className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'quests',
      label: 'Exercícios Práticos',
      description: 'Desafios fáceis para você testar se aprendeu as posições',
      shortLabel: 'Exercícios',
      icon: <Trophy className="w-4 h-4 shrink-0" />,
      badge: `${completedCount}/12 feitos`,
    },
    {
      id: 'teacher',
      label: 'Área do Professor',
      description: 'Acompanhar o progresso dos alunos e imprimir relatórios',
      shortLabel: 'Professor',
      icon: <GraduationCap className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'account',
      label: currentUser ? `${currentUser.displayName.split(' ')[0]} (Meu Perfil)` : 'Entrar ou Cadastrar',
      description: currentUser ? 'Ver suas medalhas e trocar de aluno' : 'Acesse com seu nome para salvar seu progresso',
      shortLabel: currentUser ? 'Perfil' : 'Entrar',
      icon: <UserCheck className="w-4 h-4 shrink-0" />,
    },
  ];

  const handleItemClick = (id: NavTabId) => {
    onSelectTab(id);
    setIsMobileMenuOpen(false);
  };

  const themeLabelMap: Record<string, string> = {
    modern_pro: 'Modern Pro',
    taraflex_blue: 'Olímpico',
    neon_night: 'Cyber Night',
    classic_wood: 'Madeira',
    beach_gold: 'Praia',
    high_contrast: 'Alto Contraste',
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md text-white border-b border-slate-800/80 shadow-md">
        {/* Faixa Superior com Gradiente Dinâmico Moderno */}
        <div className="h-[2.5px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400" />

        {/* Barra Superior Principal */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 min-w-0">
          {/* Logo e Título com Flexibilidade Responsiva */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <AppLogo size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white flex items-center gap-1">
                  REDE <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">VÔLEI</span>
                </h1>
                <span className="hidden lg:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900 text-blue-300 border border-slate-700/80">
                  Educação Física & Base
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate max-w-[150px] xs:max-w-[220px] sm:max-w-xs md:max-w-none">
                Simulador Tático & Vôlei de Praia
              </p>
            </div>
          </div>

          {/* Área de Ações do Header (XP, Perfil, Configurações, Menu Mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* XP Pill - amigável para iniciantes com explicação de Pontos */}
            <button
              onClick={() => handleItemClick('quests')}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold text-amber-400 border border-slate-800 shadow-xs transition-all active:scale-95"
              title={`Nível ${levelInfo.level}: ${levelInfo.title} • Você tem ${userProgress.xp} pontos de experiência acumulados`}
            >
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
              <span className="text-[11px] sm:text-xs font-black">{userProgress.xp} <span className="hidden xs:inline">pontos</span></span>
            </button>

            {/* Seletor Rápido de Tema Visual Moderno */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white transition-all text-xs font-bold shadow-xs active:scale-95"
              title="Trocar tema visual da quadra ou ajustar acessibilidade"
              aria-label="Ajustar tema e opções visuais"
            >
              <Palette className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="hidden xl:inline text-[11px] text-slate-400 font-medium">
                Tema: <strong className="text-white font-bold">{themeLabelMap[userProgress.selectedTheme] || 'Moderno'}</strong>
              </span>
              <span className="xl:hidden hidden sm:inline text-[11px] font-bold">Tema</span>
            </button>

            {/* Botão de Usuário / Login (Desktop e Tablet) */}
            <button
              onClick={() => handleItemClick('account')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border shadow-xs ${
                activeTab === 'account'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300/30'
                  : currentUser
                  ? 'bg-slate-900 hover:bg-slate-850 text-amber-300 border-slate-700/80'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-transparent'
              }`}
              title={currentUser ? `Conectado como ${currentUser.displayName}. Clique para ver seu perfil.` : 'Entrar ou Criar Conta de Aluno/Professor'}
            >
              {currentUser ? (
                <>
                  <span className="text-base leading-none">{currentUser.avatar || '🏐'}</span>
                  <div className="text-left leading-tight">
                    <span className="block text-[11px] font-black max-w-[80px] truncate">{currentUser.displayName.split(' ')[0]}</span>
                    <span className="block text-[9px] text-slate-400 font-bold">Meu Perfil</span>
                  </div>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-black">Acessar Conta</span>
                </>
              )}
            </button>

            {/* Botão de Ajustes e Acessibilidade */}
            <button
              onClick={onOpenSettings}
              className="p-2 sm:px-2.5 sm:py-1.5 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs active:scale-95"
              title="Ajustar cores, tamanho de letras e acessibilidade"
              aria-label="Ajustar configurações gerais"
            >
              <Settings className="w-4 h-4 text-slate-400 hover:text-white shrink-0" />
            </button>

            {/* Botão Menu Hambúrguer para Telas Menores (Mobile/Tablet) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white flex items-center justify-center transition-all active:scale-95"
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Abas de Navegação em Desktop / Telas Médias e Maiores */}
        <div className="hidden md:block max-w-7xl mx-auto px-3 sm:px-6">
          <nav className="flex items-center gap-1.5 lg:gap-2 overflow-x-auto py-2 no-scrollbar border-t border-slate-800/80">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`px-3 lg:px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-md shadow-blue-600/20 ring-1 ring-white/15 scale-[1.01]'
                      : 'text-slate-300 hover:bg-slate-850 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-slate-950 text-amber-400 border border-white/10' : 'bg-slate-900 text-blue-300 border border-slate-700/80'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Menu Drawer Mobile para Dispositivos Menores */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end sm:justify-start">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-none sm:rounded-b-2xl border-t sm:border-b-2 border-yellow-500 p-4 shadow-2xl z-10 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-top duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <AppLogo size="sm" />
                <span className="font-black text-sm text-slate-900">Menu Principal</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Status do Usuário no Mobile Menu */}
            <div className="my-3 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{currentUser ? currentUser.avatar || '🏐' : '👤'}</span>
                <div>
                  <div className="font-black text-xs text-slate-900">
                    {currentUser ? currentUser.displayName : 'Modo Visitante'}
                  </div>
                  <div className="text-[11px] text-blue-700 font-semibold">
                    Nível {levelInfo.level} • {levelInfo.title}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleItemClick('account')}
                className="px-2.5 py-1.5 rounded-lg bg-yellow-500 text-slate-950 text-xs font-black"
              >
                {currentUser ? 'Perfil' : 'Entrar'}
              </button>
            </div>

            {/* Links de Navegação com Explicação Curta */}
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={`mobile-menu-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all border ${
                      isActive
                        ? 'bg-yellow-400 text-slate-950 border-yellow-500 font-black shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`p-1.5 rounded-lg ${isActive ? 'bg-slate-950 text-yellow-400' : 'bg-blue-100 text-blue-900'}`}>
                          {item.icon}
                        </span>
                        <div>
                          <div className="text-sm font-black">{item.label}</div>
                          <div className={`text-[11px] font-medium leading-tight ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-blue-900 text-yellow-400 shrink-0 ml-2">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4 text-blue-700" /> Ajustar Cores, Letras e Dicas de Uso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar Mobile Fixa com Visual Moderno Glassmorphic */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 shadow-2xl px-1 py-1 flex items-center justify-around safe-area-bottom">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={`bottom-nav-${item.id}`}
              onClick={() => handleItemClick(item.id)}
              className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
                isActive
                  ? 'text-white font-black scale-105'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-white/20'
                  : 'text-slate-400'
              }`}>
                {item.icon}
              </div>
              <span className={`text-[10px] leading-tight text-center tracking-tight truncate max-w-full ${
                isActive ? 'text-amber-400 font-black' : 'text-slate-400'
              }`}>
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
