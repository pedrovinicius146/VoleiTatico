import React from 'react';
import {
  Users,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  ChevronRight,
  School,
  Copy,
  Check,
  Trophy,
} from 'lucide-react';
import { StudentRecord, CompetencySummary, ClassKpis, TeacherView } from './types';

interface TeacherOverviewProps {
  kpis: ClassKpis;
  competencies: CompetencySummary[];
  students: StudentRecord[];
  classCode: string;
  schoolName: string;
  onNavigate: (view: TeacherView) => void;
  onSelectStudent: (studentId: string) => void;
  onSelectCompetency: (competencyId: string) => void;
}

export const TeacherOverview: React.FC<TeacherOverviewProps> = ({
  kpis,
  competencies,
  students,
  classCode,
  schoolName,
  onNavigate,
  onSelectStudent,
  onSelectCompetency,
}) => {
  const [copiedCode, setCopiedCode] = React.useState(false);

  // Alunos que precisam de atenção
  const attentionStudents = students.filter((s) => s.status === 'Atenção');
  // Alunos em destaque
  const featuredStudents = students
    .filter((s) => s.status === 'Destaque' || s.xp >= 600)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 3);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* CARD BANNER / BOAS-VINDAS COM CONTEXTO DA TURMA               */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-[#173B8F] to-[#2449A3] text-white p-5 sm:p-6 rounded-2xl shadow-sm relative overflow-hidden">
        {/* Detalhe de fundo decorativo */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-20 top-2 w-20 h-20 rounded-full bg-yellow-400/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/10 text-yellow-300 text-xs font-bold mb-2 backdrop-blur-xs">
              <School className="w-3.5 h-3.5" />
              <span>{schoolName || 'Unidade Escolar'}</span>
              <span>•</span>
              <span className="font-mono text-white">Turma: {classCode}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Painel de Gestão Pedagógica
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Acompanhe a proficiência dos estudantes nas regras oficiais, rodízio 6x0, 5x1 e leitura tática no vôlei de praia.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-white/20 transition-all active:scale-95"
            >
              {copiedCode ? <Check className="w-4 h-4 text-yellow-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código da Turma'}</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>Ver Relatório</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* GRADE DE KPIS REAIS DA TURMA                                   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI: Total de Alunos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Alunos</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{kpis.totalStudents}</div>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Cadastrados na turma</p>
          </div>
        </div>

        {/* KPI: Alunos Ativos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ativos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{kpis.activeStudents}</div>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
              {kpis.totalStudents > 0 ? Math.round((kpis.activeStudents / kpis.totalStudents) * 100) : 0}% engajamento
            </p>
          </div>
        </div>

        {/* KPI: Conclusão Média */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Conclusão</span>
            <TrendingUp className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <div className="text-2xl font-black text-blue-900">{kpis.averageProgress}%</div>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Média dos 12 exercícios</p>
          </div>
        </div>

        {/* KPI: Pontos (XP) Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pontos (XP)</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{kpis.totalXp.toLocaleString('pt-BR')}</div>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Total acumulado</p>
          </div>
        </div>

        {/* KPI: Pontos Médios */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Média de Pontos</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{kpis.averageXp}</div>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Por estudante</p>
          </div>
        </div>

        {/* KPI: Nível Médio */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Nível Médio</span>
            <Target className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{kpis.averageLevel}</div>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Escala de 1 a 50</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SEÇÃO PRINCIPAL: DESEMPENHO POR COMPETÊNCIA                    */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-5">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#173B8F]" />
              <span>Desempenho da Turma por Competência</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Matriz curricular de Educação Física Base (Zonas, Falta de Posição, 5x1 e Sinais de Praia).
            </p>
          </div>
          <button
            onClick={() => onNavigate('competencies')}
            className="text-xs font-black text-[#173B8F] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Ver matriz detalhada</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Barras Horizontais das 4 Competências */}
        <div className="space-y-4">
          {competencies.map((comp) => {
            return (
              <div
                key={comp.id}
                onClick={() => onSelectCompetency(comp.id)}
                className="group p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50/70 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{comp.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-900 transition-colors">
                        {comp.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">{comp.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-sm font-black text-blue-900">
                      {comp.averageProgressPercentage}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {comp.masteredCount} de {students.length} dominam
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso com Cor Semântica */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      comp.averageProgressPercentage >= 70
                        ? 'bg-emerald-500'
                        : comp.averageProgressPercentage >= 45
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${comp.averageProgressPercentage}%` }}
                  />
                </div>

                {/* Sub-informações da Competência */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
                  <span>{comp.totalQuests} desafios curriculares</span>
                  <span className="flex items-center gap-1 text-blue-700 font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>Ver alunos</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* GRID DUPLO: CENTRAL DE ATENÇÃO + ALUNOS EM DESTAQUE           */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. CENTRAL DE ATENÇÃO: Alunos que precisam de apoio pedagógico */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    Alunos que precisam de atenção
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {attentionStudents.length > 0
                      ? `${attentionStudents.length} alunos com ritmo inicial ou dificuldades pontuais`
                      : 'Nenhum aluno em alerta crítico no momento'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('students')}
                className="text-xs font-black text-blue-700 hover:underline shrink-0"
              >
                Ver todos
              </button>
            </div>

            {attentionStudents.length > 0 ? (
              <div className="space-y-2.5">
                {attentionStudents.slice(0, 4).map((student) => (
                  <div
                    key={student.id}
                    onClick={() => onSelectStudent(student.id)}
                    className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl">{student.avatar}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {student.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Nível {student.level} • {student.questsDoneCount}/{student.totalQuestsCount} exercícios concluídos
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                        {student.progressPercentage}% progresso
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Turma sem pendências críticas!</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Todos os alunos estão avançando regularmente nas trilhas.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('students')}
            className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Gerenciar Alunos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. ALUNOS EM DESTAQUE */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center font-bold">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    Alunos em destaque
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Estudantes com maior proficiência e medalhas conquistadas
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('students')}
                className="text-xs font-black text-blue-700 hover:underline shrink-0"
              >
                Classificação
              </button>
            </div>

            <div className="space-y-2.5">
              {featuredStudents.map((student, idx) => (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent(student.id)}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-yellow-400 hover:bg-yellow-50/30 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center font-black text-xs shrink-0">
                      {idx + 1}º
                    </span>
                    <span className="text-xl">{student.avatar}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {student.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Nível {student.level} — {student.levelTitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-xs text-blue-900">
                      {student.xp} XP
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">
                      {student.progressPercentage}% concluído
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('achievements')}
            className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Ver Mural de Conquistas da Turma</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
