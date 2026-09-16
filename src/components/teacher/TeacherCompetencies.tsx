import React, { useState } from 'react';
import { Target, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, User } from 'lucide-react';
import { CompetencySummary, StudentRecord } from './types';

interface TeacherCompetenciesProps {
  competencies: CompetencySummary[];
  onSelectStudent: (studentId: string) => void;
}

export const TeacherCompetencies: React.FC<TeacherCompetenciesProps> = ({
  competencies,
  onSelectStudent,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(competencies[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* CABEÇALHO DE COMPETÊNCIAS                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Target className="w-6 h-6 text-[#173B8F]" />
          <span>Matriz de Competências & Habilidades (BNCC)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Acompanhamento pedagógico estruturado do domínio tático: Fundamentos de Quadra, Julgamento de Faltas, Sistema 5x1 e Sinais de Praia.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LISTA DAS 4 COMPETÊNCIAS COM DRILLDOWN                         */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        {competencies.map((comp) => {
          const isExpanded = expandedId === comp.id;

          return (
            <div
              key={comp.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
            >
              {/* Card Principal / Header Clicável */}
              <div
                onClick={() => toggleExpand(comp.id)}
                className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl shrink-0">
                      {comp.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {comp.title}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {comp.totalQuests} exercícios
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                        {comp.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between sm:justify-end self-stretch sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-2xl font-black text-blue-900 block">
                        {comp.averageProgressPercentage}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        Progresso Médio da Turma
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso Geral */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        comp.averageProgressPercentage >= 70
                          ? 'bg-emerald-500'
                          : comp.averageProgressPercentage >= 40
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${comp.averageProgressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Resumo de Proporção: Dominam, Em Aprendizado, Ainda Não Começaram */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                  <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                    <span className="text-emerald-800 font-black block text-sm">
                      {comp.masteredCount}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">Já Dominam (100%)</span>
                  </div>

                  <div className="bg-blue-50 p-2 rounded-xl border border-blue-200">
                    <span className="text-blue-800 font-black block text-sm">
                      {comp.developingCount}
                    </span>
                    <span className="text-[10px] text-blue-700 font-bold">Em Aprendizado</span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-700 font-black block text-sm">
                      {comp.notStartedCount}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">Ainda Não Começaram</span>
                  </div>
                </div>
              </div>

              {/* Drill-down: Listagem de Alunos por Nível de Domínio */}
              {isExpanded && (
                <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-5 animate-in fade-in duration-200">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-700">
                    Distribuição dos Alunos nesta Competência
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Coluna 1: Dominam */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Dominam Plenamente ({comp.masteredStudents.length})</span>
                      </div>
                      <div className="space-y-1.5 max-h-60 overflow-y-auto">
                        {comp.masteredStudents.length > 0 ? (
                          comp.masteredStudents.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => onSelectStudent(s.id)}
                              className="p-2.5 bg-white rounded-xl border border-emerald-200 hover:border-emerald-400 cursor-pointer flex items-center justify-between transition-all"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span>{s.avatar}</span>
                                <span className="font-bold text-xs text-slate-900 truncate">{s.name}</span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                100%
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-[11px] text-slate-400 bg-white rounded-xl border border-slate-200">
                            Nenhum aluno ainda
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Coluna 2: Em Desenvolvimento */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-blue-800">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Em Desenvolvimento ({comp.developingStudents.length})</span>
                      </div>
                      <div className="space-y-1.5 max-h-60 overflow-y-auto">
                        {comp.developingStudents.length > 0 ? (
                          comp.developingStudents.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => onSelectStudent(s.id)}
                              className="p-2.5 bg-white rounded-xl border border-blue-200 hover:border-blue-400 cursor-pointer flex items-center justify-between transition-all"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span>{s.avatar}</span>
                                <span className="font-bold text-xs text-slate-900 truncate">{s.name}</span>
                              </div>
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                Em curso
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-[11px] text-slate-400 bg-white rounded-xl border border-slate-200">
                            Nenhum aluno nesta faixa
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Coluna 3: Não Iniciados / Em Atenção */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span>Ainda Não Iniciaram ({comp.notStartedStudents.length})</span>
                      </div>
                      <div className="space-y-1.5 max-h-60 overflow-y-auto">
                        {comp.notStartedStudents.length > 0 ? (
                          comp.notStartedStudents.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => onSelectStudent(s.id)}
                              className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-amber-300 cursor-pointer flex items-center justify-between transition-all"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span>{s.avatar}</span>
                                <span className="font-bold text-xs text-slate-700 truncate">{s.name}</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                0%
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-[11px] text-emerald-600 bg-white rounded-xl border border-emerald-100">
                            Todos já iniciaram!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
