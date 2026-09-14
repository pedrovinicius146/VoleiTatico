import React, { useState } from 'react';
import { UserProgress } from '../types';
import { LEARNING_TRAILS, getLevelInfo, BADGES_LIST } from '../engine/gamificationEngine';
import { AppLogo } from './AppLogo';
import { Printer, GraduationCap, Users, FileText, Sparkles, CheckSquare, Award, Copy, Check, User, School } from 'lucide-react';

interface TeacherDashboardProps {
  userProgress: UserProgress;
  onProgressUpdate: (updated: UserProgress) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  userProgress,
  onProgressUpdate,
}) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>(userProgress.studentName);
  const [schoolName, setSchoolName] = useState<string>(userProgress.schoolName);
  const [classCode, setClassCode] = useState<string>(userProgress.classCode);

  const levelInfo = getLevelInfo(userProgress.xp);

  // Calcular progresso por competência
  const totalQuestsCount = LEARNING_TRAILS.reduce((acc, t) => acc + t.quests.length, 0);
  const completedCount = Object.keys(userProgress.completedQuests).length;
  const completionPercentage = Math.round((completedCount / totalQuestsCount) * 100);

  // Salvar dados do aluno
  const handleSaveProfile = () => {
    const updated: UserProgress = {
      ...userProgress,
      studentName,
      schoolName,
      classCode,
    };
    onProgressUpdate(updated);
  };

  // Gerar novo código de turma aleatório
  const handleGenerateNewClassCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `VOL-ESCOLA-${randomNum}`;
    setClassCode(newCode);
    onProgressUpdate({
      ...userProgress,
      classCode: newCode,
    });
  };

  const copyClassCode = () => {
    navigator.clipboard.writeText(classCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Imprimir Relatório Pedagógico / Salvar como PDF nativo do navegador
  const handlePrintReport = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Impressão direta não suportada no iframe atual:', e);
    }
  };

  // Lista simulada de alunos para demonstração do professor
  const mockStudents = [
    { name: studentName || 'Aluno Atual', xp: userProgress.xp, level: levelInfo.level, questsDone: completedCount, status: 'Ativo' },
    { name: 'Lucas Silva', xp: 420, level: 4, questsDone: 5, status: 'Concluído' },
    { name: 'Mariana Costa', xp: 680, level: 6, questsDone: 8, status: 'Destaque' },
    { name: 'Gabriel Santos', xp: 210, level: 2, questsDone: 3, status: 'Em Progresso' },
    { name: 'Beatriz Lima', xp: 850, level: 8, questsDone: 10, status: 'Destaque' },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Banner Principal do Modo Professor */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center font-black text-2xl shadow-sm border border-blue-900">
            <GraduationCap className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Painel Pedagógico & Escolar
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              Modo Professor: Gestão de Turmas & Relatório PDF
            </h2>
          </div>
        </div>

        <button
          onClick={handlePrintReport}
          className="w-full sm:w-auto px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" /> Imprimir Relatório / Salvar em PDF
        </button>
      </div>

      {/* Grid: Configuração da Turma & Perfil do Aluno */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card: Código da Turma */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600 shrink-0" /> Código da Turma Escolar
              </span>
              <button
                onClick={handleGenerateNewClassCode}
                className="text-xs font-bold text-blue-700 hover:underline shrink-0"
              >
                Gerar Novo Código
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Compartilhe este código no quadro da quadra para que os alunos sincronizem seus relatórios.
            </p>

            {/* Input Box para Código da Turma */}
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600 transition-all w-full min-w-0 box-border">
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="EX: VOLEI-2026"
                className="font-mono font-black text-sm text-blue-950 tracking-wider bg-transparent px-2 py-1 flex-1 min-w-0 focus:outline-none uppercase box-border"
              />
              <button
                onClick={copyClassCode}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-all border border-slate-200 shadow-xs shrink-0"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                {copiedCode ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            ✅ 100% Offline e Seguro: Nenhum cadastro de senha ou e-mail é exigido dos alunos.
          </div>
        </div>

        {/* Card: Identificação do Aluno */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-w-0">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              👤 Identificação do Estudante
            </span>
            <div className="space-y-3">
              <div className="w-full min-w-0">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Nome do Aluno(a):</label>
                <div className="relative flex items-center w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600 transition-all overflow-hidden box-border">
                  <span className="pl-3 text-slate-400 shrink-0">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Ex: Pedro Henrique"
                    className="w-full min-w-0 bg-transparent px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none box-border"
                  />
                </div>
              </div>

              <div className="w-full min-w-0">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Escola / Turma:</label>
                <div className="relative flex items-center w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600 transition-all overflow-hidden box-border">
                  <span className="pl-3 text-slate-400 shrink-0">
                    <School className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Ex: E.E. Prof. Darcy Ribeiro - 9º Ano B"
                    className="w-full min-w-0 bg-transparent px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none box-border"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="mt-4 w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-yellow-400 font-black rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Salvar Dados no Relatório
          </button>
        </div>
      </div>

      {/* Relatório Pedagógico Formatado para Impressão / Visualização Oficial */}
      <div id="printable-report" className="bg-white text-slate-950 p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-200 gap-4">
          <div className="flex items-center gap-3.5">
            <AppLogo size="md" className="shrink-0" />
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-blue-900">
                SECRETARIA DE EDUCAÇÃO • EDUCAÇÃO FÍSICA ESCOLAR
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Relatório de Avaliação Tática de Voleibol
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vôley Tático Brazil • Simulador Digital & Motor de Regras
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg font-mono font-bold text-xs">
              Turma: {classCode}
            </span>
            <div className="text-[11px] text-slate-500 mt-1">Data: {new Date().toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        {/* Dados do Aluno no Relatório */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block">Estudante:</span>
            <strong className="text-slate-900 text-sm">{userProgress.studentName}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Unidade Escolar:</span>
            <strong className="text-slate-900">{userProgress.schoolName}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Nível de Treinador Alcançado:</span>
            <strong className="text-blue-900 text-sm">
              Nível {levelInfo.level} — {levelInfo.title}
            </strong>
          </div>
        </div>

        {/* Rubrica Pedagógica por Competência */}
        <div className="my-5">
          <h4 className="font-black text-sm text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-blue-600" /> Matriz de Competências & Habilidades (BNCC)
          </h4>

          <div className="space-y-2.5">
            {LEARNING_TRAILS.map((trail) => {
              const completedInTrail = trail.quests.filter((q) => userProgress.completedQuests[q.id]?.stars > 0).length;
              const isMastered = completedInTrail === trail.quests.length;

              return (
                <div
                  key={`report-${trail.id}`}
                  className="p-3 rounded-lg border border-slate-200 flex items-center justify-between bg-slate-50/70"
                >
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                      <span>{trail.icon}</span>
                      <span>{trail.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{trail.description}</p>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
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

        {/* Conquistas e Medalhas Obtidas */}
        <div className="my-4 pt-3 border-t border-slate-200">
          <h4 className="font-black text-xs text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-yellow-600" /> Badges & Conquistas Desbloqueadas
          </h4>
          <div className="flex flex-wrap gap-2">
            {userProgress.unlockedBadges.length > 0 ? (
              userProgress.unlockedBadges.map((bId) => {
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
                Nenhuma medalha desbloqueada ainda. Complete as quests para conquistar badges!
              </span>
            )}
          </div>
        </div>

        {/* Assinatura Pedagógica */}
        <div className="mt-8 pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
          <div className="text-center sm:text-left">
            <div className="w-48 border-b border-slate-400 mb-1" />
            <span>Assinatura do(a) Professor(a) de Educação Física</span>
          </div>
          <div className="text-center sm:text-right">
            <div className="w-48 border-b border-slate-400 mb-1" />
            <span>Assinatura do(a) Estudante</span>
          </div>
        </div>
      </div>

      {/* Tabela / Lista de Monitoramento da Turma (Híbrida: Tabela no Desktop, Cards no Mobile) */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="font-black text-sm text-slate-900 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" /> Painel de Acompanhamento de Alunos da Turma ({classCode})
        </h4>

        {/* Mobile View: Cards empilhados confortáveis */}
        <div className="block sm:hidden space-y-2.5">
          {mockStudents.map((s, idx) => (
            <div
              key={`mobile-student-${idx}`}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                  {idx === 0 && <span className="text-yellow-500">★</span>} {s.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.status === 'Destaque'
                      ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                      : s.status === 'Concluído'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Nível</span>
                  <span className="font-bold text-blue-700">Nv {s.level}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">XP</span>
                  <span className="font-mono font-bold text-slate-800">{s.xp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Quests</span>
                  <span className="font-bold text-slate-700">{s.questsDone}/12</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop & Tablet View: Tabela completa */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Estudante</th>
                <th className="py-2.5 px-3">Nível</th>
                <th className="py-2.5 px-3">XP Total</th>
                <th className="py-2.5 px-3">Quests Concluídas</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockStudents.map((s, idx) => (
                <tr key={`mock-student-${idx}`} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                    {idx === 0 && <span className="text-yellow-500">★</span>} {s.name}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-blue-700">Nível {s.level}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.xp} XP</td>
                  <td className="py-2.5 px-3 font-semibold">{s.questsDone}/12</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'Destaque'
                          ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                          : s.status === 'Concluído'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
