import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Users,
  User,
  Target,
  CheckSquare,
  Award,
  Calendar,
  School,
  Sparkles,
} from 'lucide-react';
import { StudentRecord, CompetencySummary, ClassKpis } from './types';
import { AppLogo } from '../AppLogo';
import { BADGES_LIST, LEARNING_TRAILS, getLevelInfo } from '../../engine/gamificationEngine';

interface TeacherReportsProps {
  students: StudentRecord[];
  competencies: CompetencySummary[];
  kpis: ClassKpis;
  classCode: string;
  schoolName: string;
  onExportCsv: () => void;
  selectedStudentForReport?: StudentRecord | null;
}

export const TeacherReports: React.FC<TeacherReportsProps> = ({
  students,
  competencies,
  kpis,
  classCode,
  schoolName,
  onExportCsv,
  selectedStudentForReport,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'class' | 'student' | 'competencies'>('class');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    selectedStudentForReport?.id || students[0]?.id || ''
  );

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Erro ao chamar window.print:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* CABEÇALHO DA CENTRAL DE RELATÓRIOS                             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#173B8F]" />
            <span>Central de Relatórios Pedagógicos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gere documentos oficiais e tabelas analíticas para comprovação curricular e reuniões pedagógicas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Planilha (Excel)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir ou Salvar em PDF</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SELEÇÃO DO MODELO DE RELATÓRIO                                */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
        {/* Opção 1: Relatório de Turma Geral */}
        <div
          onClick={() => setActiveReportTab('class')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeReportTab === 'class'
              ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/20 shadow-2xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Users className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-xs text-slate-900">Relatório da Turma Completa</h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Visão consolidada com indicadores gerais, lista de todos os alunos e médias por competência.
          </p>
        </div>

        {/* Opção 2: Ficha Individual do Aluno */}
        <div
          onClick={() => setActiveReportTab('student')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeReportTab === 'student'
              ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/20 shadow-2xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <User className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-xs text-slate-900">Ficha Individual do Aluno</h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Boletim pedagógico individual com nível, XP, exercícios concluídos e notas detalhadas.
          </p>
        </div>

        {/* Opção 3: Matriz de Competências BNCC */}
        <div
          onClick={() => setActiveReportTab('competencies')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeReportTab === 'competencies'
              ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/20 shadow-2xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Target className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-xs text-slate-900">Matriz de Competências (BNCC)</h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Detalhamento curricular das 4 competências fundamentais e distribuição dos alunos.
          </p>
        </div>
      </div>

      {/* Seletor de Aluno quando a aba for "student" */}
      {activeReportTab === 'student' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-black uppercase text-slate-700">Selecione o Estudante para o Boletim:</span>
          </div>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.xp} XP • Nível {s.level})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DOCUMENTO OFICIAL FORMATADO PARA IMPRESSÃO E PREVIEW NATIVO   */}
      {/* ------------------------------------------------------------- */}
      <div
        id="printable-report"
        className="bg-white text-slate-950 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* Cabeçalho Oficial da Secretaria de Educação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-300 gap-4">
          <div className="flex items-center gap-3.5">
            <AppLogo size="md" className="shrink-0" />
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-[#173B8F]">
                SECRETARIA DE EDUCAÇÃO • EDUCAÇÃO FÍSICA ESCOLAR
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {activeReportTab === 'class' && 'Relatório Geral da Turma — Avaliação Tática'}
                {activeReportTab === 'student' && 'Ficha Individual de Avaliação Tática'}
                {activeReportTab === 'competencies' && 'Matriz Curricular de Habilidades & Regras'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                REDE VÔLEI • Plataforma Educacional & Simulador Digital de Voleibol
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 text-slate-900 rounded-lg font-mono font-bold text-xs">
              Turma: {classCode}
            </span>
            <div className="text-[11px] text-slate-500 mt-1">
              Data de Emissão: {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Metadados da Unidade Escolar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block">Unidade Escolar:</span>
            <strong className="text-slate-900 text-sm">{schoolName}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Turma / Período:</span>
            <strong className="text-slate-900 text-sm">{classCode}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Total de Alunos Registrados:</span>
            <strong className="text-blue-900 text-sm">{students.length} Estudantes</strong>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CORPO DO RELATÓRIO CONFORME A OPÇÃO ATIVA                     */}
        {/* ------------------------------------------------------------- */}

        {/* 1. RELATÓRIO DE TURMA */}
        {activeReportTab === 'class' && (
          <div className="space-y-6">
            {/* Resumo de Indicadores da Turma */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Progresso Médio</span>
                <span className="text-base font-black text-blue-900">{kpis.averageProgress}%</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">XP Médio</span>
                <span className="text-base font-mono font-black text-slate-900">{kpis.averageXp}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Nível Médio</span>
                <span className="text-base font-black text-purple-900">Nv {kpis.averageLevel}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Engajamento</span>
                <span className="text-base font-black text-emerald-700">{kpis.activeStudents} ativos</span>
              </div>
            </div>

            {/* Matriz de Competências no Relatório de Turma */}
            <div className="space-y-2">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-700" />
                <span>Médias de Domínio por Competência Curricular</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {competencies.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{c.icon} {c.title}</div>
                      <span className="text-[10px] text-slate-500">{c.masteredCount} dominam plenamente</span>
                    </div>
                    <span className="font-black text-sm text-blue-900">{c.averageProgressPercentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista Completa dos Estudantes */}
            <div className="space-y-2">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-700" />
                <span>Relação Nominal dos Estudantes e Avaliações</span>
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Aluno(a)</th>
                      <th className="py-2 px-3">Nível</th>
                      <th className="py-2 px-3">Pontos (XP)</th>
                      <th className="py-2 px-3">Exercícios</th>
                      <th className="py-2 px-3">Aproveitamento</th>
                      <th className="py-2 px-3">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td className="py-2 px-3 font-bold text-slate-900">{s.name}</td>
                        <td className="py-2 px-3 font-semibold text-blue-900">Nv {s.level} — {s.levelTitle}</td>
                        <td className="py-2 px-3 font-mono font-bold">{s.xp}</td>
                        <td className="py-2 px-3">{s.questsDoneCount}/12</td>
                        <td className="py-2 px-3 font-bold">{s.progressPercentage}%</td>
                        <td className="py-2 px-3 font-semibold">{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. FICHA INDIVIDUAL DO ALUNO */}
        {activeReportTab === 'student' && currentStudent && (
          <div className="space-y-5">
            {/* Cabeçalho do Estudante */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Estudante Avaliado</span>
                <h4 className="text-lg font-black text-slate-900">{currentStudent.name}</h4>
                <p className="text-xs text-slate-500">
                  Usuário: @{currentStudent.username} • Situação: <strong>{currentStudent.status}</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-blue-900 block">
                  Nível {currentStudent.level} — {currentStudent.levelTitle}
                </span>
                <span className="font-mono text-xs text-slate-700">
                  {currentStudent.xp} XP Conquistados
                </span>
              </div>
            </div>

            {/* Rubrica Pedagógica por Competência do Estudante */}
            <div className="space-y-2">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-blue-700" />
                <span>Rubrica Pedagógica de Habilidades (BNCC)</span>
              </h4>
              <div className="space-y-2">
                {LEARNING_TRAILS.map((trail) => {
                  const completedInTrail = trail.quests.filter(
                    (q) => currentStudent.completedQuests[q.id]?.stars > 0
                  ).length;
                  const isMastered = completedInTrail === trail.quests.length;

                  return (
                    <div
                      key={`student-report-trail-${trail.id}`}
                      className="p-3 rounded-lg border border-slate-200 flex items-center justify-between bg-slate-50/70 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{trail.icon}</span>
                          <span>{trail.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{trail.description}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            isMastered
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : completedInTrail > 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {completedInTrail}/{trail.quests.length} Desafios
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                          {isMastered ? '✅ Competência Plena' : completedInTrail > 0 ? '🟡 Em Desenvolvimento' : '⚪ Não Iniciado'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Medalhas e Conquistas do Estudante */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-yellow-600" />
                <span>Medalhas & Badges Oficiais Desbloqueadas</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentStudent.unlockedBadges.length > 0 ? (
                  currentStudent.unlockedBadges.map((bId) => {
                    const badge = BADGES_LIST.find((b) => b.id === bId);
                    if (!badge) return null;
                    return (
                      <span
                        key={badge.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 border border-yellow-300 text-yellow-900 rounded-lg text-xs font-bold"
                      >
                        <span>{badge.icon}</span> {badge.title}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-500 italic">
                    Nenhuma medalha registrada no momento.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. RELATÓRIO DE COMPETÊNCIAS */}
        {activeReportTab === 'competencies' && (
          <div className="space-y-5">
            <div className="space-y-3">
              {competencies.map((comp) => (
                <div key={comp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{comp.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{comp.title}</h4>
                        <p className="text-[11px] text-slate-500">{comp.description}</p>
                      </div>
                    </div>
                    <span className="font-black text-base text-blue-900">
                      {comp.averageProgressPercentage}% Domínio Médio
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center text-[11px]">
                    <div>
                      <strong className="text-emerald-700 block">{comp.masteredCount} estudantes</strong>
                      <span className="text-slate-500">Dominam plenamente</span>
                    </div>
                    <div>
                      <strong className="text-blue-700 block">{comp.developingCount} estudantes</strong>
                      <span className="text-slate-500">Em desenvolvimento</span>
                    </div>
                    <div>
                      <strong className="text-slate-600 block">{comp.notStartedCount} estudantes</strong>
                      <span className="text-slate-500">Não iniciaram</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assinatura Pedagógica Obrigatória */}
        <div className="mt-8 pt-6 border-t-2 border-slate-300 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-6">
          <div className="text-center sm:text-left">
            <div className="w-52 border-b border-slate-400 mb-1" />
            <span>Assinatura do(a) Professor(a) de Educação Física</span>
          </div>
          <div className="text-center sm:text-right">
            <div className="w-52 border-b border-slate-400 mb-1" />
            <span>Coordenação Pedagógica / Direção Escolar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
