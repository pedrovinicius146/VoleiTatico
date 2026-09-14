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

      {/* Rodapé Responsivo */}
      <footer className="hidden md:flex h-12 bg-white border-t border-slate-200 items-center justify-between px-4 sm:px-8 text-[11px] font-bold text-slate-500 shadow-inner">
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> SISTEMA OK (PWA OFF-LINE)
          </span>
          <span className="text-slate-400">LATÊNCIA: 0ms (LOCAL)</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-slate-800 font-bold">SECRETARIA DE EDUCAÇÃO</span>
          <div className="h-4 w-px bg-slate-300"></div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-blue-700 hover:text-blue-900 font-bold uppercase"
          >
            Modo Acessível (Letras & Cores)
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
