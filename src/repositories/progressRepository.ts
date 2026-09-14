import { UserProgress } from '../types';
import { IStorageAdapter, defaultStorage } from '../services/storageAdapter';

const PROGRESS_STORAGE_KEY = 'voleitatico_progress_v1';

export const DEFAULT_INITIAL_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  completedQuests: {},
  unlockedBadges: [],
  selectedTheme: 'taraflex_blue',
  highContrast: false,
  studentName: 'Atleta Estudante',
  schoolName: 'Escola Municipal de Voleibol',
  classCode: 'TURMA-2026',
};

/**
 * Repositório centralizado de progresso, XP e conquistas.
 * Utiliza adapter agnóstico de plataforma.
 */
export class ProgressRepository {
  constructor(private storage: IStorageAdapter = defaultStorage) {}

  public loadProgress(): UserProgress {
    const saved = this.storage.getItem<Partial<UserProgress>>(PROGRESS_STORAGE_KEY);
    if (!saved) return DEFAULT_INITIAL_PROGRESS;
    return {
      ...DEFAULT_INITIAL_PROGRESS,
      ...saved,
    };
  }

  public saveProgress(progress: UserProgress): void {
    this.storage.setItem(PROGRESS_STORAGE_KEY, progress);
  }

  public resetProgress(): UserProgress {
    const fresh: UserProgress = {
      ...DEFAULT_INITIAL_PROGRESS,
      selectedTheme: 'taraflex_blue',
    };
    this.saveProgress(fresh);
    return fresh;
  }
}

export const progressRepository = new ProgressRepository();
