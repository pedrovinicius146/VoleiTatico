import React, { useState, useEffect } from 'react';
import { UserProgress, UserAccount } from './types';
import { loadUserProgress, saveUserProgress } from './engine/gamificationEngine';
import { authEngine } from './engine/authEngine';
import { TacticalBoard } from './components/TacticalBoard';
import { BeachSimulator } from './components/BeachSimulator';
import { QuestSystem } from './components/QuestSystem';
import { TeacherDashboard } from './components/TeacherDashboard';
import { A11yAndSettingsModal } from './components/A11yAndSettingsModal';
import { LoginScreen } from './components/LoginScreen';
import { AppNavigation, NavTabId } from './components/AppNavigation';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('tactics');
  const [userProgress, setUserProgress] = useState<UserProgress>(loadUserProgress());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(authEngine.getCurrentUser());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Carregar e persistir o progresso localmente
  useEffect(() => {
    const loaded = loadUserProgress();
    setUserProgress(loaded);
  }, []);

  // Monitorar sincronização com a conta de usuário
  useEffect(() => {
    const unsubscribe = authEngine.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        setUserProgress(user.progress);
        saveUserProgress(user.progress);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleProgressUpdate = (updated: UserProgress) => {
    setUserProgress(updated);
    saveUserProgress(updated);
    if (currentUser) {
      authEngine.updateCurrentProgress(updated);
    }
  };

  const handleUserChange = (user: UserAccount | null) => {
    setCurrentUser(user);
    if (user) {
      setUserProgress(user.progress);
      saveUserProgress(user.progress);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${userProgress.highContrast ? 'bg-black text-white' : 'bg-slate-100 text-slate-900 font-sans'}`}>
      {/* Navegação Responsiva Integrada (Desktop Header + Mobile Drawer + Bottom Bar) */}
      <AppNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userProgress={userProgress}
        currentUser={currentUser}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area com padding inferior seguro para Mobile Bottom Bar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-20 md:pb-6 min-w-0">
        {activeTab === 'tactics' && (
          <TacticalBoard
            theme={userProgress.selectedTheme}
            onOpenTeacherView={() => setActiveTab('teacher')}
          />
        )}

        {activeTab === 'beach' && (
          <BeachSimulator theme={userProgress.selectedTheme} />
        )}

        {activeTab === 'quests' && (
          <QuestSystem
            userProgress={userProgress}
            onProgressUpdate={handleProgressUpdate}
            theme={userProgress.selectedTheme}
          />
        )}

        {activeTab === 'teacher' && (
          <TeacherDashboard
            userProgress={userProgress}
            onProgressUpdate={handleProgressUpdate}
          />
        )}

        {activeTab === 'account' && (
          <LoginScreen
            currentUser={currentUser}
            onUserChange={handleUserChange}
            onNavigateToTactics={() => setActiveTab('tactics')}
            currentProgress={userProgress}
          />
        )}
      </main>

      {/* Rodapé Amigável para Usuários Iniciantes */}
      <footer className="hidden md:flex h-12 bg-white border-t border-slate-200 items-center justify-between px-4 sm:px-8 text-xs font-semibold text-slate-600 shadow-xs">
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="flex items-center gap-2 text-emerald-800 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Pronto para usar na aula ou treino
          </span>
          <span className="text-slate-500 font-medium">
            📱 Funciona mesmo sem internet (salvo no seu aparelho)
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-slate-700 font-bold">REDE VÔLEI • Educação Física Base</span>
          <div className="h-4 w-px bg-slate-200"></div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-blue-700 hover:text-blue-900 font-bold hover:underline flex items-center gap-1"
          >
            🎨 Ajustar Letras e Cores
          </button>
        </div>
      </footer>

      {/* Modal de Configurações e Acessibilidade */}
      <A11yAndSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userProgress={userProgress}
        onProgressUpdate={handleProgressUpdate}
      />
    </div>
  );
}
