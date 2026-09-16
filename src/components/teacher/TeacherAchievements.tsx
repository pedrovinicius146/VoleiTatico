import React, { useState } from 'react';
import { Trophy, Award, Users, ChevronDown, ChevronUp, Sparkles, ShieldCheck } from 'lucide-react';
import { StudentRecord } from './types';
import { teacherService } from '../../services/teacherService';

interface TeacherAchievementsProps {
  students: StudentRecord[];
  onSelectStudent: (studentId: string) => void;
}

export const TeacherAchievements: React.FC<TeacherAchievementsProps> = ({
  students,
  onSelectStudent,
}) => {
  const badgesSummary = teacherService.calculateBadgesSummary(students);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(badgesSummary[0]?.badge.id || null);

  const toggleSelectBadge = (id: string) => {
    setSelectedBadgeId(selectedBadgeId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* CABEÇALHO DE CONQUISTAS                                       */}
      {/* ------------------------------------------------------------- */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <span>Mural de Conquistas & Badges da Turma</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Acompanhamento das medalhas pedagógicas conquistadas pelos alunos na resolução dos desafios práticos.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* GRADE DE CONQUISTAS COM ESTATÍSTICA REAL                       */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badgesSummary.map(({ badge, unlockedCount, percentage, unlockedStudents, isRare, isCommon }) => {
          const isSelected = selectedBadgeId === badge.id;

          return (
            <div
              key={badge.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                isSelected ? 'border-yellow-400 ring-2 ring-yellow-400/20 shadow-sm' : 'border-slate-200 shadow-2xs'
              }`}
            >
              <div
                onClick={() => toggleSelectBadge(badge.id)}
                className="p-5 cursor-pointer hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                      {badge.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-slate-900">{badge.title}</h3>
                        {isRare && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                            Conquista Rara
                          </span>
                        )}
                        {isCommon && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                            Conquista Base
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                        {badge.description}
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                        Critério: {badge.conditionDescription}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-black text-base text-yellow-600">
                      {percentage}%
                    </div>
                    <div className="text-[10px] font-bold text-slate-500">
                      {unlockedCount} de {students.length} alunos
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso da Turma */}
                <div className="mt-4">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                  <span className="font-medium">
                    {unlockedCount > 0 ? `${unlockedCount} estudantes já conquistaram` : 'Nenhum estudante ainda'}
                  </span>
                  <span className="text-blue-700 font-bold flex items-center gap-1">
                    <span>{isSelected ? 'Ocultar alunos' : 'Ver quem conquistou'}</span>
                    {isSelected ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </span>
                </div>
              </div>

              {/* Lista de Alunos que desbloquearam este Badge */}
              {isSelected && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2.5 animate-in fade-in duration-200">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-700" />
                    <span>Estudantes com esta medalha ({unlockedStudents.length})</span>
                  </h4>

                  {unlockedStudents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {unlockedStudents.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => onSelectStudent(s.id)}
                          className="p-2 bg-white rounded-lg border border-slate-200 hover:border-blue-300 cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span>{s.avatar}</span>
                            <span className="font-bold text-xs text-slate-900 truncate">{s.name}</span>
                          </div>
                          <span className="font-mono text-[10px] font-bold text-blue-900 bg-slate-100 px-1.5 py-0.5 rounded">
                            {s.xp} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400 bg-white rounded-lg border border-dashed border-slate-200">
                      Nenhum aluno da turma conquistou esta medalha ainda.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
