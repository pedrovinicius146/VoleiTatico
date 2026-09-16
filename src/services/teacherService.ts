import { UserProgress, UserAccount } from '../types';
import { LEARNING_TRAILS, BADGES_LIST, getLevelInfo } from '../engine/gamificationEngine';
import { StudentRecord, CompetencySummary, ClassKpis } from '../components/teacher/types';

// Alunos de referência da turma padrão da escola (dados pedagógicos iniciais da turma)
const BASE_CLASS_STUDENTS: Omit<StudentRecord, 'totalQuestsCount' | 'progressPercentage' | 'levelTitle' | 'status'>[] = [
  {
    id: 'std_lucas_silva',
    name: 'Lucas Silva',
    username: 'lucas_silva',
    avatar: '⚡',
    schoolName: 'E.E. Prof. Darcy Ribeiro',
    classCode: 'VOL-TURMA-2026',
    xp: 420,
    level: 4,
    questsDoneCount: 5,
    unlockedBadges: ['first_step', 'muralha_3m'],
    completedQuests: {
      q1_zones_serve: { stars: 3, timestamp: Date.now() - 86400000 * 3 },
      q2_three_meter_rule: { stars: 2, timestamp: Date.now() - 86400000 * 3 },
      q3_clockwise_rotation: { stars: 3, timestamp: Date.now() - 86400000 * 2 },
      q4_front_back_fault: { stars: 2, timestamp: Date.now() - 86400000 * 1 },
      q7_hide_setter_r1: { stars: 1, timestamp: Date.now() - 86400000 * 1 },
    },
    lastActiveAt: 'Hoje às 09:30',
  },
  {
    id: 'std_mariana_costa',
    name: 'Mariana Costa',
    username: 'mari_costa',
    avatar: '🌟',
    schoolName: 'E.E. Prof. Darcy Ribeiro',
    classCode: 'VOL-TURMA-2026',
    xp: 680,
    level: 6,
    questsDoneCount: 8,
    unlockedBadges: ['first_step', 'muralha_3m', 'infiltracao_ninja', 'troca_libero'],
    completedQuests: {
      q1_zones_serve: { stars: 3, timestamp: Date.now() - 86400000 * 5 },
      q2_three_meter_rule: { stars: 3, timestamp: Date.now() - 86400000 * 5 },
      q3_clockwise_rotation: { stars: 3, timestamp: Date.now() - 86400000 * 4 },
      q4_front_back_fault: { stars: 3, timestamp: Date.now() - 86400000 * 4 },
      q5_lateral_fault: { stars: 2, timestamp: Date.now() - 86400000 * 3 },
      q7_hide_setter_r1: { stars: 3, timestamp: Date.now() - 86400000 * 2 },
      q8_infiltration_r4: { stars: 3, timestamp: Date.now() - 86400000 * 2 },
      q9_libero_swap: { stars: 2, timestamp: Date.now() - 86400000 * 1 },
    },
    lastActiveAt: 'Ontem às 15:40',
  },
  {
    id: 'std_gabriel_santos',
    name: 'Gabriel Santos',
    username: 'gabriel_s',
    avatar: '🎯',
    schoolName: 'E.E. Prof. Darcy Ribeiro',
    classCode: 'VOL-TURMA-2026',
    xp: 210,
    level: 2,
    questsDoneCount: 3,
    unlockedBadges: ['first_step'],
    completedQuests: {
      q1_zones_serve: { stars: 2, timestamp: Date.now() - 86400000 * 4 },
      q2_three_meter_rule: { stars: 1, timestamp: Date.now() - 86400000 * 4 },
      q3_clockwise_rotation: { stars: 2, timestamp: Date.now() - 86400000 * 3 },
    },
    lastActiveAt: 'Há 4 dias',
  },
  {
    id: 'std_beatriz_lima',
    name: 'Beatriz Lima',
    username: 'bia_lima',
    avatar: '👑',
    schoolName: 'E.E. Prof. Darcy Ribeiro',
    classCode: 'VOL-TURMA-2026',
    xp: 850,
    level: 8,
    questsDoneCount: 10,
    unlockedBadges: ['first_step', 'muralha_3m', 'infiltracao_ninja', 'olho_de_aguia', 'rei_da_praia'],
    completedQuests: {
      q1_zones_serve: { stars: 3, timestamp: Date.now() - 86400000 * 7 },
      q2_three_meter_rule: { stars: 3, timestamp: Date.now() - 86400000 * 7 },
      q3_clockwise_rotation: { stars: 3, timestamp: Date.now() - 86400000 * 6 },
      q4_front_back_fault: { stars: 3, timestamp: Date.now() - 86400000 * 6 },
      q5_lateral_fault: { stars: 3, timestamp: Date.now() - 86400000 * 5 },
      q6_blitz_time_attack: { stars: 2, timestamp: Date.now() - 86400000 * 4 },
      q7_hide_setter_r1: { stars: 3, timestamp: Date.now() - 86400000 * 3 },
      q8_infiltration_r4: { stars: 3, timestamp: Date.now() - 86400000 * 3 },
      q9_libero_swap: { stars: 3, timestamp: Date.now() - 86400000 * 2 },
      q10_beach_line_signal: { stars: 2, timestamp: Date.now() - 86400000 * 1 },
    },
    lastActiveAt: 'Hoje às 11:15',
  },
  {
    id: 'std_rodrigo_melo',
    name: 'Rodrigo Melo',
    username: 'rodrigo_m',
    avatar: '🛡️',
    schoolName: 'E.E. Prof. Darcy Ribeiro',
    classCode: 'VOL-TURMA-2026',
    xp: 180,
    level: 2,
    questsDoneCount: 2,
    unlockedBadges: ['first_step'],
    completedQuests: {
      q1_zones_serve: { stars: 2, timestamp: Date.now() - 86400000 * 6 },
      q2_three_meter_rule: { stars: 1, timestamp: Date.now() - 86400000 * 5 },
    },
    lastActiveAt: 'Há 5 dias',
  },
  {
    id: 'std_camila_rocha',
    name: 'Camila Rocha',
    username: 'camila_r',
    avatar: '🔥',
    schoolName: 'E.E. Prof. Darcy Ribeiro',
    classCode: 'VOL-TURMA-2026',
    xp: 540,
    level: 5,
    questsDoneCount: 6,
    unlockedBadges: ['first_step', 'muralha_3m', 'infiltracao_ninja'],
    completedQuests: {
      q1_zones_serve: { stars: 3, timestamp: Date.now() - 86400000 * 4 },
      q2_three_meter_rule: { stars: 3, timestamp: Date.now() - 86400000 * 4 },
      q3_clockwise_rotation: { stars: 2, timestamp: Date.now() - 86400000 * 3 },
      q4_front_back_fault: { stars: 2, timestamp: Date.now() - 86400000 * 2 },
      q7_hide_setter_r1: { stars: 2, timestamp: Date.now() - 86400000 * 2 },
      q8_infiltration_r4: { stars: 2, timestamp: Date.now() - 86400000 * 1 },
    },
    lastActiveAt: 'Hoje às 08:20',
  },
];

export class TeacherService {
  private totalSystemQuestsCount: number;

  constructor() {
    this.totalSystemQuestsCount = LEARNING_TRAILS.reduce((acc, t) => acc + t.quests.length, 0);
  }

  public getTotalQuestsCount(): number {
    return this.totalSystemQuestsCount;
  }

  /**
   * Obtém os estudantes da turma combinando o usuário atual, as contas locais salvas
   * e a turma base pedagógica.
   */
  public getStudentsForClass(
    classCode: string,
    currentProgress: UserProgress,
    savedAccounts: UserAccount[]
  ): StudentRecord[] {
    const list: StudentRecord[] = [];
    const processedIds = new Set<string>();

    // 1. Adicionar o estudante ativo da sessão atual (se for estudante ou progresso ativo)
    const activeStudentName = currentProgress.studentName?.trim() || 'Estudante Atual';
    const activeCompletedCount = Object.keys(currentProgress.completedQuests || {}).length;
    const activeLevel = getLevelInfo(currentProgress.xp);
    const activePercentage = Math.round((activeCompletedCount / this.totalSystemQuestsCount) * 100);

    const activeRecord: StudentRecord = {
      id: 'active_session_student',
      name: activeStudentName,
      username: (activeStudentName.toLowerCase().replace(/\s+/g, '_')) || 'estudante',
      avatar: '🏐',
      schoolName: currentProgress.schoolName || 'Escola Estadual',
      classCode: classCode || currentProgress.classCode || 'VOL-TURMA-2026',
      xp: currentProgress.xp,
      level: activeLevel.level,
      levelTitle: activeLevel.title,
      questsDoneCount: activeCompletedCount,
      totalQuestsCount: this.totalSystemQuestsCount,
      progressPercentage: activePercentage,
      status: this.determineStudentStatus(activeCompletedCount, currentProgress.xp),
      statusReason: this.determineStatusReason(activeCompletedCount, currentProgress.xp),
      unlockedBadges: currentProgress.unlockedBadges || [],
      completedQuests: currentProgress.completedQuests || {},
      lastActiveAt: 'Agora (Sessão Atual)',
      isRealUser: true,
    };

    list.push(activeRecord);
    processedIds.add(activeRecord.id);
    processedIds.add(activeRecord.username);

    // 2. Adicionar as contas de estudantes registradas localmente no navegador
    for (const acc of savedAccounts) {
      if (acc.role === 'teacher') continue; // Ignora professores na lista de alunos
      if (processedIds.has(acc.id) || processedIds.has(acc.username)) continue;

      const accQuestsCount = Object.keys(acc.progress?.completedQuests || {}).length;
      const accLvl = getLevelInfo(acc.progress?.xp || 0);
      const accPercent = Math.round((accQuestsCount / this.totalSystemQuestsCount) * 100);

      list.push({
        id: acc.id,
        name: acc.displayName || acc.username,
        username: acc.username,
        avatar: acc.avatar || '🏐',
        schoolName: acc.schoolName || currentProgress.schoolName,
        classCode: acc.classCode || classCode,
        xp: acc.progress?.xp || 0,
        level: accLvl.level,
        levelTitle: accLvl.title,
        questsDoneCount: accQuestsCount,
        totalQuestsCount: this.totalSystemQuestsCount,
        progressPercentage: accPercent,
        status: this.determineStudentStatus(accQuestsCount, acc.progress?.xp || 0),
        statusReason: this.determineStatusReason(accQuestsCount, acc.progress?.xp || 0),
        unlockedBadges: acc.progress?.unlockedBadges || [],
        completedQuests: acc.progress?.completedQuests || {},
        lastActiveAt: acc.lastLoginAt ? new Date(acc.lastLoginAt).toLocaleDateString('pt-BR') : 'Recentemente',
        isRealUser: true,
      });

      processedIds.add(acc.id);
      processedIds.add(acc.username);
    }

    // 3. Complementar com os alunos da turma base
    for (const base of BASE_CLASS_STUDENTS) {
      if (processedIds.has(base.id) || processedIds.has(base.username)) continue;

      const lvl = getLevelInfo(base.xp);
      const percent = Math.round((base.questsDoneCount / this.totalSystemQuestsCount) * 100);

      list.push({
        ...base,
        levelTitle: lvl.title,
        totalQuestsCount: this.totalSystemQuestsCount,
        progressPercentage: percent,
        status: this.determineStudentStatus(base.questsDoneCount, base.xp),
        statusReason: this.determineStatusReason(base.questsDoneCount, base.xp),
      });

      processedIds.add(base.id);
    }

    return list;
  }

  private determineStudentStatus(questsDone: number, xp: number): StudentRecord['status'] {
    if (questsDone >= 10 || xp >= 750) {
      return 'Destaque';
    }
    if (questsDone >= 8 || xp >= 550) {
      return 'Concluído';
    }
    if (questsDone <= 3 && xp <= 250) {
      return 'Atenção';
    }
    return 'Ativo';
  }

  private determineStatusReason(questsDone: number, xp: number): string | undefined {
    if (questsDone <= 3 && xp <= 250) {
      return `${questsDone}/${this.totalSystemQuestsCount} quests concluídas • Precisa de apoio nas regras`;
    }
    if (questsDone >= 10 || xp >= 750) {
      return `Alto rendimento tático • ${xp} XP conquistados`;
    }
    return undefined;
  }

  /**
   * Calcula os KPIs agregados da turma.
   */
  public calculateClassKpis(students: StudentRecord[]): ClassKpis {
    const total = students.length;
    if (total === 0) {
      return {
        totalStudents: 0,
        activeStudents: 0,
        averageProgress: 0,
        totalXp: 0,
        averageXp: 0,
        averageLevel: 0,
        attentionCount: 0,
        featuredCount: 0,
      };
    }

    const totalXp = students.reduce((acc, s) => acc + s.xp, 0);
    const totalProgress = students.reduce((acc, s) => acc + s.progressPercentage, 0);
    const totalLevels = students.reduce((acc, s) => acc + s.level, 0);
    const attention = students.filter((s) => s.status === 'Atenção').length;
    const featured = students.filter((s) => s.status === 'Destaque').length;
    const active = students.filter((s) => s.questsDoneCount > 0).length;

    return {
      totalStudents: total,
      activeStudents: active,
      averageProgress: Math.round(totalProgress / total),
      totalXp,
      averageXp: Math.round(totalXp / total),
      averageLevel: Number((totalLevels / total).toFixed(1)),
      attentionCount: attention,
      featuredCount: featured,
    };
  }

  /**
   * Calcula o resumo das 4 competências da BNCC / Voleibol para a turma.
   */
  public calculateCompetenciesSummary(students: StudentRecord[]): CompetencySummary[] {
    return LEARNING_TRAILS.map((trail) => {
      const trailQuestIds = trail.quests.map((q) => q.id);
      const totalInTrail = trail.quests.length;

      const masteredStudents: StudentRecord[] = [];
      const developingStudents: StudentRecord[] = [];
      const notStartedStudents: StudentRecord[] = [];

      let sumPercentages = 0;

      for (const student of students) {
        const completedInTrail = trailQuestIds.filter(
          (qId) => student.completedQuests[qId] && student.completedQuests[qId].stars > 0
        ).length;

        const percentage = Math.round((completedInTrail / totalInTrail) * 100);
        sumPercentages += percentage;

        if (completedInTrail === totalInTrail) {
          masteredStudents.push(student);
        } else if (completedInTrail > 0) {
          developingStudents.push(student);
        } else {
          notStartedStudents.push(student);
        }
      }

      const averageProgressPercentage = students.length > 0
        ? Math.round(sumPercentages / students.length)
        : 0;

      return {
        id: trail.id,
        title: trail.title,
        subtitle: trail.subtitle,
        icon: trail.icon,
        description: trail.description,
        totalQuests: totalInTrail,
        averageProgressPercentage,
        masteredCount: masteredStudents.length,
        developingCount: developingStudents.length,
        notStartedCount: notStartedStudents.length,
        masteredStudents,
        developingStudents,
        notStartedStudents,
      };
    });
  }

  /**
   * Resumo de conquistas e medalhas desbloqueadas na turma.
   */
  public calculateBadgesSummary(students: StudentRecord[]) {
    const total = students.length || 1;

    return BADGES_LIST.map((badge) => {
      const unlockedStudents = students.filter((s) => s.unlockedBadges.includes(badge.id));
      const percentage = Math.round((unlockedStudents.length / total) * 100);

      return {
        badge,
        unlockedCount: unlockedStudents.length,
        percentage,
        unlockedStudents,
        isRare: percentage < 40,
        isCommon: percentage >= 70,
      };
    });
  }

  /**
   * Gera e baixa arquivo CSV compatível com Excel / Google Sheets
   */
  public exportClassToCsv(classCode: string, schoolName: string, students: StudentRecord[]): void {
    const headers = [
      'Estudante',
      'Nome de Usuario',
      'Escola',
      'Turma',
      'Nivel',
      'Titulo do Nivel',
      'XP Total',
      'Quests Concluidas',
      'Progresso (%)',
      'Status Pedagogico',
      'Medalhas',
    ];

    const rows = students.map((s) => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.username}"`,
      `"${s.schoolName.replace(/"/g, '""')}"`,
      `"${s.classCode}"`,
      s.level,
      `"${s.levelTitle}"`,
      s.xp,
      `${s.questsDoneCount}/${s.totalQuestsCount}`,
      `${s.progressPercentage}%`,
      `"${s.status}"`,
      `"${s.unlockedBadges.join(', ')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `REDE_VOLEI_Turma_${classCode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const teacherService = new TeacherService();
