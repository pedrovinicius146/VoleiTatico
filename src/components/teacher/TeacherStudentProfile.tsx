import React from 'react';
import {
  ArrowLeft,
  Award,
  Zap,
  CheckCircle2,
  Circle,
  Star,
  Printer,
  Calendar,
  School,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { StudentRecord } from './types';
import { LEARNING_TRAILS, BADGES_LIST, getLevelInfo } from '../../engine/gamificationEngine';

interface TeacherStudentProfileProps {
  student: StudentRecord;
  onBack: () => void;
  onPrintStudentReport: (student: StudentRecord) => void;
}

export const TeacherStudentProfile: React.FC<TeacherStudentProfileProps> = ({
  student,
  onBack,
  onPrintStudentReport,
}) => {
  const levelInfo = getLevelInfo(student.xp);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* NAVEGAÇÃO DE VOLTA & AÇÕES                                     */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Lista de Alunos</span>
        </button>

        <button
          onClick={() => onPrintStudentReport(student)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs shadow-2xs transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Ficha Completa do Aluno</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CARTÃO DE IDENTIFICAÇÃO DO ALUNO                              */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-3xl shrink-0 shadow-xs">
              {student.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {student.name}
                </h2>
                <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  @{student.username}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                  {student.status}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-blue-700" />
                  <span>{student.schoolName}</span>
                </span>
                <span>•</span>
                <span>Turma: <strong>{student.classCode}</strong></span>
                {student.lastActiveAt && (
                  <>
                    <span>•</span>
                    <span>Última atividade: {student.lastActiveAt}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Placar de XP e Nível */}
          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Nível Atual</span>
              <div className="text-lg font-black text-blue-900">
                Nível {student.level}
              </div>
              <span className="text-[10px] font-bold text-slate-600 block">
                {student.levelTitle}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pontos (XP)</span>
              <div className="text-lg font-mono font-black text-slate-900">
                {student.xp.toLocaleString('pt-BR')}
              </div>
              <span className="text-[10px] font-bold text-emerald-600 block">
                {student.questsDoneCount} de {student.totalQuestsCount} exercícios
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso até o Próximo Nível */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              Progresso do Nível {levelInfo.level} ({student.xp} / {levelInfo.nextLevelXp} XP)
            </span>
            <span className="font-bold text-blue-900">
              {Math.round(levelInfo.progressPercent)}% para Nível {levelInfo.level + 1}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SEÇÃO: DESEMPENHO POR COMPETÊNCIA DO ALUNO                     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-700" />
          <span>Desempenho por Competência Curricular</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LEARNING_TRAILS.map((trail) => {
            const trailQuests = trail.quests;
            const completedInTrail = trailQuests.filter(
              (q) => student.completedQuests[q.id] && student.completedQuests[q.id].stars > 0
            ).length;
            const percent = Math.round((completedInTrail / trailQuests.length) * 100);

            return (
              <div
                key={trail.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{trail.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{trail.title}</h4>
                      <p className="text-[10px] text-slate-500">{trail.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-blue-900">{percent}%</span>
                    <span className="text-[10px] text-slate-500 block">
                      {completedInTrail}/{trailQuests.length} concluiu
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      percent === 100
                        ? 'bg-emerald-500'
                        : percent > 0
                        ? 'bg-blue-600'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="text-[11px] font-bold">
                  {percent === 100 ? (
                    <span className="text-emerald-700">✅ Competência Dominada</span>
                  ) : percent > 0 ? (
                    <span className="text-blue-700">🟡 Em Desenvolvimento</span>
                  ) : (
                    <span className="text-slate-400">⚪ Ainda não iniciado</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SEÇÃO: CONQUISTAS E MEDALHAS DO ESTUDANTE                      */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <span>Medalhas & Badges Desbloqueadas ({student.unlockedBadges.length}/{BADGES_LIST.length})</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BADGES_LIST.map((badge) => {
            const isUnlocked = student.unlockedBadges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-yellow-50/60 border-yellow-200 text-slate-900'
                    : 'bg-slate-50/50 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                    isUnlocked
                      ? 'bg-yellow-100 border-yellow-300 shadow-xs'
                      : 'bg-slate-200 border-slate-300 grayscale'
                  }`}
                >
                  {badge.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{badge.title}</h4>
                    {isUnlocked && (
                      <span className="text-[9px] font-black uppercase text-yellow-800 bg-yellow-200/80 px-1 rounded">
                        Obtido
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SEÇÃO: HISTÓRICO COMPLETO DE EXERCÍCIOS                       */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Matriz de Desafios Práticos (12 Exercícios)</span>
        </h3>

        <div className="space-y-4">
          {LEARNING_TRAILS.map((trail) => (
            <div key={`trail-group-${trail.id}`} className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>{trail.icon}</span>
                <span>{trail.title}</span>
              </h4>

              <div className="grid grid-cols-1 gap-2">
                {trail.quests.map((quest) => {
                  const questData = student.completedQuests[quest.id];
                  const isDone = Boolean(questData && questData.stars > 0);

                  return (
                    <div
                      key={quest.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        isDone
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className={`font-bold block truncate ${isDone ? 'text-slate-900' : 'text-slate-600'}`}>
                            {quest.title}
                          </span>
                          <span className="text-[10px] text-slate-500 line-clamp-1">
                            {quest.objective}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        {isDone ? (
                          <div className="flex items-center gap-0.5 text-yellow-500">
                            {[1, 2, 3].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-3 h-3 ${
                                  starIdx <= (questData?.stars || 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Pendente</span>
                        )}

                        <span className="font-mono text-[10px] font-bold text-blue-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          +{quest.xpReward} XP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
