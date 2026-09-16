import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Target,
  Trophy,
  FileText,
  Settings,
  Menu,
  X,
  Printer,
  ChevronDown,
  AlertTriangle,
  School,
  Sparkles,
} from 'lucide-react';
import { TeacherView } from './types';
import { AppLogo } from '../AppLogo';

interface TeacherShellProps {
  currentView: TeacherView;
  onNavigate: (view: TeacherView) => void;
  classCode: string;
  onChangeClassCode: (newCode: string) => void;
  schoolName: string;
  totalStudents: number;
  attentionCount: number;
  onOpenExportModal: () => void;
  children: React.ReactNode;
}

interface NavItem {
  id: TeacherView;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
}

export const TeacherShell: React.FC<TeacherShellProps> = ({
  currentView,
  onNavigate,
  classCode,
  schoolName,
  totalStudents,
  attentionCount,
  onOpenExportModal,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'students',
      label: 'Alunos',
      icon: <Users className="w-5 h-5" />,
      badge: totalStudents,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'performance',
      label: 'Desempenho',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'competencies',
      label: 'Competências',
      icon: <Target className="w-5 h-5" />,
    },
    {
      id: 'achievements',
      label: 'Conquistas',
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleSelectNav = (view: TeacherView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className="w-full flex flex-col md:flex-row min-h-[calc(100vh-140px)] bg-[#F8FAFC] rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-900">
      {/* ------------------------------------------------------------- */}
      {/* SIDEBAR DESKTOP (Fixa e Estruturada)                          */}
      {/* ------------------------------------------------------------- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 select-none">
        {/* Topo da Sidebar: Identidade Pedagógica */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173B8F] text-white flex items-center justify-center font-black shadow-sm">
              <span className="text-xl">🏐</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-[#173B8F] tracking-tight">REDE VÔLEI</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-yellow-400 text-slate-950">
                  EDU
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-500">Gestão Pedagógica</p>
            </div>
          </div>
        </div>

        {/* Menu Principal de Navegação */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Menu Pedagógico
            </span>

            {navItems.map((item) => {
              const isActive = currentView === item.id || (item.id === 'students' && currentView === 'student-detail');
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                    isActive
                      ? 'bg-[#173B8F] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-yellow-400' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Seção Inferior da Sidebar: Configurações & Status */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => handleSelectNav('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                currentView === 'settings'
                  ? 'bg-[#173B8F] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Settings className={`w-5 h-5 ${currentView === 'settings' ? 'text-yellow-400' : 'text-slate-500'}`} />
              <span>Configurações da Turma</span>
            </button>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                <School className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span className="truncate">{schoolName || 'Escola de Vôlei'}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Turma Ativa:</span>
                <span className="font-mono font-bold text-blue-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {classCode}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* ÁREA PRINCIPAL + TOPBAR                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            {/* Botão Hambúrguer Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
              aria-label="Abrir menu do professor"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  {getGreeting()}, Professor(a) 👋
                </h1>
                {attentionCount > 0 && (
                  <button
                    onClick={() => onNavigate('students')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-black hover:bg-amber-100 transition-colors"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>{attentionCount} {attentionCount === 1 ? 'aluno precisa de apoio' : 'alunos precisam de apoio'}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate hidden sm:block">
                Acompanhe o desempenho, as competências e a evolução da sua turma.
              </p>
            </div>
          </div>

          {/* Lado Direito da Topbar: Seletor de Turma & Ação Rápida */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Seletor Rápido de Turma */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 text-xs font-bold transition-colors"
                aria-label="Alternar turma"
              >
                <span className="text-[10px] text-slate-500 uppercase font-black">Turma:</span>
                <span className="font-mono font-black text-[#173B8F]">{classCode}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {isClassDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-30 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Turmas Disponíveis
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsClassDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold bg-blue-50 text-blue-950 flex items-center justify-between"
                  >
                    <span>{classCode} (Atual)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsClassDropdownOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Gerenciar turmas...</span>
                  </button>
                </div>
              )}
            </div>

            {/* Botão de Exportação / Relatório Rápido */}
            <button
              type="button"
              onClick={onOpenExportModal}
              className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar Relatório</span>
              <span className="sm:hidden">Relatório</span>
            </button>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL DAS VISÕES */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DRAWER MOBILE RESPONSIVO                                      */}
      {/* ------------------------------------------------------------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Painel do Drawer */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col p-4 z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏐</span>
                <div>
                  <h2 className="font-black text-sm text-[#173B8F]">REDE VÔLEI</h2>
                  <p className="text-[10px] text-slate-500 font-bold">Modo Professor</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Itens de Navegação Mobile */}
            <div className="py-4 space-y-1 flex-1 overflow-y-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-2">
                Navegação
              </span>
              {navItems.map((item) => {
                const isActive = currentView === item.id || (item.id === 'students' && currentView === 'student-detail');
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-black transition-all ${
                      isActive
                        ? 'bg-[#173B8F] text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-yellow-400' : 'text-slate-500'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                          isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Rodapé do Drawer Mobile */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                onClick={() => handleSelectNav('settings')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-100"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Configurações</span>
              </button>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                <div className="font-bold text-slate-800">{schoolName}</div>
                <div className="text-slate-500 font-mono mt-0.5">Turma: {classCode}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
