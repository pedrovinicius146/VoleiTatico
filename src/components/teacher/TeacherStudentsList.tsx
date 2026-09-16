import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Users,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Award,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { StudentRecord } from './types';

interface TeacherStudentsListProps {
  students: StudentRecord[];
  onSelectStudent: (studentId: string) => void;
  classCode: string;
}

export const TeacherStudentsList: React.FC<TeacherStudentsListProps> = ({
  students,
  onSelectStudent,
  classCode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Destaque' | 'Ativo' | 'Atenção' | 'Concluído'>('Todos');
  const [levelFilter, setLevelFilter] = useState<'Todos' | 'iniciante' | 'intermediario' | 'avancado'>('Todos');
  const [sortBy, setSortBy] = useState<'xp_desc' | 'name_asc' | 'level_desc' | 'progress_desc'>('xp_desc');

  // Filtragem e ordenação dos alunos
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Busca textual
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.username.toLowerCase().includes(term) ||
          s.schoolName.toLowerCase().includes(term)
      );
    }

    // Filtro por status
    if (statusFilter !== 'Todos') {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Filtro por nível
    if (levelFilter === 'iniciante') {
      result = result.filter((s) => s.level <= 3);
    } else if (levelFilter === 'intermediario') {
      result = result.filter((s) => s.level >= 4 && s.level <= 6);
    } else if (levelFilter === 'avancado') {
      result = result.filter((s) => s.level >= 7);
    }

    // Ordenação
    result.sort((a, b) => {
      if (sortBy === 'xp_desc') return b.xp - a.xp;
      if (sortBy === 'level_desc') return b.level - a.level;
      if (sortBy === 'progress_desc') return b.progressPercentage - a.progressPercentage;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [students, searchTerm, statusFilter, levelFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('Todos');
    setLevelFilter('Todos');
    setSortBy('xp_desc');
  };

  const getStatusBadge = (status: StudentRecord['status']) => {
    switch (status) {
      case 'Destaque':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-yellow-100 text-yellow-900 border border-yellow-300">
            <Sparkles className="w-3 h-3 text-yellow-600" /> Destaque
          </span>
        );
      case 'Concluído':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Award className="w-3 h-3 text-emerald-600" /> Concluído
          </span>
        );
      case 'Atenção':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Atenção
          </span>
        );
      case 'Ativo':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-800 border border-blue-200">
            Ativo
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------------------- */}
      {/* CABEÇALHO DA PÁGINA DE ALUNOS                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">Alunos da Turma</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black">
              {students.length} cadastrados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie e acompanhe a evolução individual dos estudantes na turma <strong className="font-mono text-blue-900">{classCode}</strong>.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BARRA DE CONTROLE: BUSCA & FILTROS                             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Campo de Busca Textual */}
          <div className="sm:col-span-6 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome do aluno para buscar..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro de Status */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Todos">Situação: Todos</option>
              <option value="Destaque">Em Destaque</option>
              <option value="Ativo">Ativos</option>
              <option value="Atenção">Precisam de Ajuda</option>
              <option value="Concluído">Concluíram Tudo</option>
            </select>
          </div>

          {/* Filtro de Nível */}
          <div className="sm:col-span-2">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Todos">Nível: Todos</option>
              <option value="iniciante">Iniciantes (Níveis 1 a 3)</option>
              <option value="intermediario">Intermediários (4 a 6)</option>
              <option value="avancado">Avançados (7 ou mais)</option>
            </select>
          </div>

          {/* Ordenação */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="xp_desc">Mais Pontos (XP)</option>
              <option value="progress_desc">Mais Avançados (%)</option>
              <option value="level_desc">Nível Mais Alto</option>
              <option value="name_asc">Nome (Ordem Alfabética)</option>
            </select>
          </div>
        </div>

        {/* Resumo de Filtros Ativos */}
        {(searchTerm || statusFilter !== 'Todos' || levelFilter !== 'Todos') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Exibindo <strong>{filteredStudents.length}</strong> de {students.length} alunos
            </span>
            <button
              onClick={clearFilters}
              className="text-blue-700 font-bold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar filtros</span>
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LISTA / TABELA DE ALUNOS                                       */}
      {/* ------------------------------------------------------------- */}
      {filteredStudents.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Versão Desktop & Tablet: Tabela Completa */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Aluno(a)</th>
                  <th className="py-3 px-4">Nível Escolar</th>
                  <th className="py-3 px-4">Pontos (XP)</th>
                  <th className="py-3 px-4">Progresso Geral</th>
                  <th className="py-3 px-4">Exercícios Feitos</th>
                  <th className="py-3 px-4">Situação</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => onSelectStudent(student.id)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    {/* Aluno */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0 border border-slate-200">
                          {student.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-[#173B8F] transition-colors flex items-center gap-1.5">
                            <span className="truncate">{student.name}</span>
                            {student.isRealUser && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Usuário Ativo" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            @{student.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Nível */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-blue-900">
                        Nível {student.level}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                        {student.levelTitle}
                      </div>
                    </td>

                    {/* XP */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-black text-slate-900">
                        {student.xp.toLocaleString('pt-BR')} XP
                      </div>
                    </td>

                    {/* Progresso Geral */}
                    <td className="py-3 px-4">
                      <div className="w-28 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                          <span>{student.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              student.progressPercentage >= 70
                                ? 'bg-emerald-500'
                                : student.progressPercentage >= 40
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${student.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Quests */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">
                        {student.questsDoneCount}/{student.totalQuestsCount}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {getStatusBadge(student.status)}
                    </td>

                    {/* Ação */}
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#173B8F] group-hover:translate-x-0.5 transition-transform">
                        <span>Ver Perfil</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Versão Mobile: Cards Confortáveis e Responsivos */}
          <div className="block sm:hidden divide-y divide-slate-100 p-3 space-y-3">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student.id)}
                className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 active:bg-blue-50 transition-colors space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl">{student.avatar}</span>
                    <div className="min-w-0">
                      <div className="font-black text-xs text-slate-900 truncate">
                        {student.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        @{student.username}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(student.status)}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-center text-xs">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase font-black block">Nível</span>
                    <strong className="font-bold text-blue-900">Nv {student.level}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase font-black block">XP</span>
                    <strong className="font-mono font-black text-slate-900">{student.xp}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase font-black block">Exercícios</span>
                    <strong className="font-bold text-slate-700">{student.questsDoneCount}/{student.totalQuestsCount}</strong>
                  </div>
                </div>

                {/* Barra de Progresso Mobile */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Progresso da Trilha</span>
                    <span className="font-bold text-slate-800">{student.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${student.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200 space-y-3">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-black text-sm text-slate-800">
            Nenhum aluno encontrado
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Não encontramos nenhum estudante correspondente aos filtros selecionados. Tente alterar os termos de busca ou limpar os filtros.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </div>
  );
};
