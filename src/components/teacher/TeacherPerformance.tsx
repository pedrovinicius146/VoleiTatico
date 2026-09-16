import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  Target,
  ArrowUpRight,
  Filter,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { StudentRecord, CompetencySummary, ClassKpis } from './types';
import { LEARNING_TRAILS } from '../../engine/gamificationEngine';

interface TeacherPerformanceProps {
  students: StudentRecord[];
  competencies: CompetencySummary[];
  kpis: ClassKpis;
  classCode: string;
  onSelectStudent: (studentId: string) => void;
}

export const TeacherPerformance: React.FC<TeacherPerformanceProps> = ({
  students,
  competencies,
  kpis,
  classCode,
  onSelectStudent,
}) => {
  const [selectedCompetencyFilter, setSelectedCompetencyFilter] = useState<string>('all');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');

  // Distribuição de alunos por faixa de XP
  const xpBuckets = useMemo(() => {
    const buckets = {
      '0-200': 0,
      '201-400': 0,
      '401-600': 0,
      '601-800': 0,
      '801+': 0,
    };

    for (const s of students) {
      if (s.xp <= 200) buckets['0-200']++;
      else if (s.xp <= 400) buckets['201-400']++;
      else if (s.xp <= 600) buckets['401-600']++;
      else if (s.xp <= 800) buckets['601-800']++;
      else buckets['801+']++;
    }

    return buckets;
  }, [students]);

  // Taxa de conclusão por trilha de aprendizagem
  const trailCompletionStats = useMemo(() => {
    return LEARNING_TRAILS.map((trail) => {
      const trailQuestIds = trail.quests.map((q) => q.id);
      let totalStarsInTrail = 0;
      let totalCompletedQuestsInTrail = 0;

      for (const s of students) {
        for (const qId of trailQuestIds) {
          const questData = s.completedQuests[qId];
          if (questData && questData.stars > 0) {
            totalCompletedQuestsInTrail++;
            totalStarsInTrail += questData.stars;
          }
        }
      }

      const maxPossibleQuests = students.length * trail.quests.length;
      const completionRate = maxPossibleQuests > 0
        ? Math.round((totalCompletedQuestsInTrail / maxPossibleQuests) * 100)
        : 0;

      return {
        id: trail.id,
        title: trail.title,
        icon: trail.icon,
        completionRate,
        totalCompletedQuests: totalCompletedQuestsInTrail,
        totalStars: totalStarsInTrail,
      };
    });
  }, [students]);

  // Estudantes ordenados por taxa de progresso
  const topPerformers = useMemo(() => {
    return [...students].sort((a, b) => b.progressPercentage - a.progressPercentage);
  }, [students]);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* CABEÇALHO ANALÍTICO                                           */}
      {/* ------------------------------------------------------------- */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#173B8F]" />
          <span>Análise de Desempenho e Evolução da Turma</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Métricas consolidadas de progressão pedagógica, proficiência por trilha e distribuição de pontuação na turma <strong className="font-mono text-blue-900">{classCode}</strong>.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RESUMO ESTATÍSTICO DE DESEMPENHO                               */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
            Média Geral da Turma
          </span>
          <div className="text-2xl font-black text-blue-900">{kpis.averageProgress}%</div>
          <span className="text-[10px] text-slate-500 font-medium">Conclusão dos 12 desafios</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
            Pontuação Média (XP)
          </span>
          <div className="text-2xl font-black text-slate-900">{kpis.averageXp} XP</div>
          <span className="text-[10px] text-slate-500 font-medium">Por aluno participante</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
            Nível Médio Alcançado
          </span>
          <div className="text-2xl font-black text-purple-900">Nv. {kpis.averageLevel}</div>
          <span className="text-[10px] text-slate-500 font-medium">Graduação de Treinador</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
            Engajamento em Quests
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {students.reduce((acc, s) => acc + s.questsDoneCount, 0)}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Desafios resolvidos na turma</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* GRÁFICO 1: EVOLUÇÃO POR TRILHA CURRICULAR                     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-700" />
              <span>Taxa de Aproveitamento por Trilha Pedagógica</span>
            </h3>
            <p className="text-xs text-slate-500">
              Percentual de acerto acumulado de toda a turma em cada bloco temático.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {trailCompletionStats.map((trail) => (
            <div key={trail.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span>{trail.icon}</span>
                  <span>{trail.title}</span>
                </span>
                <span className="font-mono font-black text-blue-900">
                  {trail.completionRate}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    trail.completionRate >= 70
                      ? 'bg-emerald-500'
                      : trail.completionRate >= 40
                      ? 'bg-[#173B8F]'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${trail.completionRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{trail.totalCompletedQuests} quests resolvidas por alunos</span>
                <span>⭐ {trail.totalStars} estrelas conquistadas</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* GRÁFICO 2: DISTRIBUIÇÃO DE FREQUÊNCIA DE XP NA TURMA          */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Distribuição de Pontuação (XP)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Número de estudantes em cada faixa de experiência acumulada.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {(Object.entries(xpBuckets) as [string, number][]).map(([bucket, count]) => {
              const percentOfClass = students.length > 0
                ? Math.round((count / students.length) * 100)
                : 0;

              return (
                <div key={bucket} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{bucket} XP</span>
                    <span className="font-bold text-slate-900">
                      {count} {count === 1 ? 'aluno' : 'alunos'} ({percentOfClass}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentOfClass}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* RANKING COMPARATIVO DE PROFICIÊNCIA                           */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#173B8F]" />
              <span>Classificação Geral da Turma</span>
            </h3>
            <p className="text-xs text-slate-500">
              Estudantes ordenados por progresso curricular global.
            </p>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {topPerformers.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => onSelectStudent(s.id)}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3 text-xs transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 text-center font-bold text-slate-400 text-[11px]">
                    {idx + 1}º
                  </span>
                  <span className="text-lg">{s.avatar}</span>
                  <span className="font-bold text-slate-900 truncate">{s.name}</span>
                </div>

                <div className="text-right shrink-0 flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-700">{s.xp} XP</span>
                  <span className="inline-block px-2 py-0.5 rounded-full font-black text-[10px] bg-blue-100 text-blue-900">
                    {s.progressPercentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
