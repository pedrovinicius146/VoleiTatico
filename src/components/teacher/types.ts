import { UserProgress, UserAccount } from '../../types';

export type TeacherView = 
  | 'overview'
  | 'students'
  | 'student-detail'
  | 'competencies'
  | 'performance'
  | 'achievements'
  | 'reports'
  | 'settings';

export interface StudentRecord {
  id: string;
  name: string;
  username: string;
  avatar: string;
  schoolName: string;
  classCode: string;
  xp: number;
  level: number;
  levelTitle: string;
  questsDoneCount: number;
  totalQuestsCount: number;
  progressPercentage: number;
  status: 'Destaque' | 'Ativo' | 'Atenção' | 'Concluído';
  statusReason?: string;
  unlockedBadges: string[];
  completedQuests: UserProgress['completedQuests'];
  lastActiveAt?: string;
  isRealUser?: boolean;
}

export interface CompetencySummary {
  id: 'fundamentals' | 'fault_hunter' | 'tactics_5x1' | 'beach_master';
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  totalQuests: number;
  averageProgressPercentage: number;
  masteredCount: number;      // 100%
  developingCount: number;    // > 0% e < 100%
  notStartedCount: number;    // 0%
  masteredStudents: StudentRecord[];
  developingStudents: StudentRecord[];
  notStartedStudents: StudentRecord[];
}

export interface ClassKpis {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  totalXp: number;
  averageXp: number;
  averageLevel: number;
  attentionCount: number;
  featuredCount: number;
}
