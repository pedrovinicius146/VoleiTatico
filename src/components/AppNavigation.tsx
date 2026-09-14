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

  const navItems: Array<{ id: NavTabId; label: string; shortLabel: string; icon: React.ReactNode; badge?: string }> = [
    {
      id: 'tactics',
      label: 'Prancheta Tática (6x0, 4x2, 5x1)',
      shortLabel: 'Tática',
      icon: <LayoutGrid className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'beach',
      label: 'Vôlei de Praia & Sinais',
      shortLabel: 'Praia',
      icon: <Waves className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'quests',
      label: 'Quests & Desafios',
      shortLabel: 'Quests',
      icon: <Trophy className="w-4 h-4 shrink-0" />,
      badge: `${completedCount}/12`,
    },
    {
      id: 'teacher',
      label: 'Modo Professor & Relatório',
      shortLabel: 'Professor',
      icon: <GraduationCap className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'account',
      label: currentUser ? `${currentUser.displayName.split(' ')[0]} (Perfil)` : 'Login / Contas',
      shortLabel: currentUser ? 'Perfil' : 'Conta',
      icon: <UserCheck className="w-4 h-4 shrink-0" />,
    },
  ];

  const handleItemClick = (id: NavTabId) => {
    onSelectTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#1e3a8a] text-white border-b-4 border-yellow-500 shadow-md">
        {/* Barra Superior Principal */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 min-w-0">
          {/* Logo e Título com Flexibilidade Responsiva */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <AppLogo size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white flex items-center gap-1">
                  VÔLEY <span className="text-yellow-400">TÁTICO</span>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1 py-0.5 rounded bg-blue-950/80 text-yellow-300 border border-yellow-500/40">
                    BRAZIL
                  </span>
                </h1>
                <span className="hidden lg:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-800 text-sky-200 border border-blue-700">
                  Educação Física & Base
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-blue-200 font-medium truncate max-w-[150px] xs:max-w-[220px] sm:max-w-xs md:max-w-none">
                Simulador Tático & Vôlei de Praia
              </p>
            </div>
          </div>

          {/* Área de Ações do Header (XP, Perfil, Configurações, Menu Mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* XP Pill - compacto em telas pequenas */}
            <button
              onClick={() => handleItemClick('quests')}
              className="flex items-center gap-1.5 bg-blue-900/90 hover:bg-blue-800 px-2 sm:px-3 py-1.5 rounded-full text-xs font-mono font-bold text-yellow-400 border border-blue-700 shadow-xs transition-all active:scale-95"
              title={`Nível ${levelInfo.level}: ${levelInfo.title} (${userProgress.xp} XP)`}
            >
              <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500 shrink-0" />
              <span className="text-[11px] sm:text-xs font-black">{userProgress.xp} <span className="hidden xs:inline">XP</span></span>
            </button>

            {/* Botão de Usuário / Login (Desktop e Tablet) */}
            <button
              onClick={() => handleItemClick('account')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all border shadow-xs ${
                activeTab === 'account'
                  ? 'bg-yellow-400 text-slate-950 border-yellow-500 ring-2 ring-yellow-300'
                  : currentUser
                  ? 'bg-blue-800 hover:bg-blue-700 text-yellow-300 border-blue-700'
                  : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 border-yellow-600'
              }`}
              title={currentUser ? `Conectado como ${currentUser.displayName}` : 'Entrar / Criar Conta'}
            >
              {currentUser ? (
                <>
                  <span className="text-base leading-none">{currentUser.avatar || '🏐'}</span>
                  <div className="text-left leading-tight">
                    <span className="block text-[11px] font-black max-w-[80px] truncate">{currentUser.displayName.split(' ')[0]}</span>
                    <span className="block text-[9px] text-blue-200 font-bold">Logado</span>
                  </div>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-slate-950" />
                  <span className="text-xs font-black">Entrar</span>
                </>
              )}
            </button>

            {/* Botão de Acessibilidade */}
            <button
              onClick={onOpenSettings}
              className="p-2 sm:px-2.5 sm:py-1.5 bg-blue-900 hover:bg-blue-800 rounded-lg border border-blue-700 text-blue-100 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs active:scale-95"
              title="Configurações & Acessibilidade"
              aria-label="Configurações e Acessibilidade"
            >
              <Settings className="w-4 h-4 text-yellow-400 shrink-0" />
              <span className="hidden xl:inline">Acessibilidade</span>
            </button>

            {/* Botão Menu Hambúrguer para Telas Menores (Mobile/Tablet) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-700 text-white flex items-center justify-center transition-all active:scale-95"
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-yellow-400" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Abas de Navegação em Desktop / Telas Médias e Maiores */}
        <div className="hidden md:block max-w-7xl mx-auto px-3 sm:px-6">
          <nav className="flex items-center gap-1 lg:gap-2 overflow-x-auto py-2 no-scrollbar border-t border-blue-800/80">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`px-3 lg:px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-yellow-500 text-slate-900 font-black shadow-sm scale-102'
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-slate-900 text-yellow-400' : 'bg-blue-900 text-yellow-300'
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

            {/* Links de Navegação */}
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={`mobile-menu-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full p-3 rounded-xl text-left text-sm font-bold flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-yellow-400 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-black bg-blue-900 text-yellow-400">
                        {item.badge}
                      </span>
                    )}
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
                <Settings className="w-4 h-4 text-blue-700" /> Configurações & Acessibilidade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar Mobile Fixa (Navegação Rápida com Polegar em Smartphones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-1 py-1 flex items-center justify-around safe-area-bottom">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={`bottom-nav-${item.id}`}
              onClick={() => handleItemClick(item.id)}
              className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all ${
                isActive
                  ? 'text-blue-900 font-black scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className={`p-1 rounded-md ${isActive ? 'bg-yellow-400 text-slate-950 shadow-xs' : 'text-slate-600'}`}>
                {item.icon}
              </div>
              <span className="text-[10px] leading-tight text-center tracking-tight truncate max-w-full">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
