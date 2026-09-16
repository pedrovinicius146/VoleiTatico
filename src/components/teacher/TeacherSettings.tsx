import React, { useState } from 'react';
import { Settings, School, Users, Copy, Check, RefreshCw, ShieldCheck, Save } from 'lucide-react';
import { UserProgress } from '../../types';

interface TeacherSettingsProps {
  userProgress: UserProgress;
  onProgressUpdate: (updated: UserProgress) => void;
  onRefreshData: () => void;
}

export const TeacherSettings: React.FC<TeacherSettingsProps> = ({
  userProgress,
  onProgressUpdate,
  onRefreshData,
}) => {
  const [classCode, setClassCode] = useState(userProgress.classCode || 'VOL-TURMA-2026');
  const [schoolName, setSchoolName] = useState(userProgress.schoolName || 'E.E. Prof. Darcy Ribeiro');
  const [studentName, setStudentName] = useState(userProgress.studentName || 'Professor Responsável');
  const [copied, setCopied] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleGenerateCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `VOL-TURMA-${randomNum}`;
    setClassCode(newCode);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProgress = {
      ...userProgress,
      classCode: classCode.trim().toUpperCase(),
      schoolName: schoolName.trim(),
      studentName: studentName.trim(),
    };
    onProgressUpdate(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Cabeçalho */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#173B8F]" />
          <span>Configurações da Turma & Unidade Escolar</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Defina o identificador da turma, a unidade escolar e os parâmetros de emissão dos relatórios oficiais.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Card 1: Identificação da Turma e Código de Sincronização */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-700" />
              <span>Código Oficial da Turma</span>
            </h3>
            <button
              type="button"
              onClick={handleGenerateCode}
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Gerar Novo Código</span>
            </button>
          </div>

          <p className="text-xs text-slate-600">
            Os estudantes inserem este código ao entrar no simulador para sincronizar os dados com a planilha e relatórios da sua turma.
          </p>

          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-blue-600">
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="Ex: VOL-TURMA-2026"
              className="font-mono font-black text-sm text-[#173B8F] tracking-wider bg-transparent px-2 py-1 flex-1 focus:outline-none uppercase"
            />
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-slate-200 shadow-2xs shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Dados Institucionais */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <School className="w-4 h-4 text-blue-700" />
            <span>Dados da Unidade Escolar & Docente</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nome da Unidade Escolar:
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Ex: E.E. Prof. Darcy Ribeiro"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nome do(a) Professor(a) / Responsável Técnico:
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ex: Prof. Carlos Eduardo"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Garantias de Privacidade e Conformidade Offline */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Arquitetura Segura & Conformidade Escolar</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            O sistema REDE VÔLEI opera em modo PWA com persistência local no dispositivo da escola. Não armazena dados de cartão, senhas vulneráveis ou informações biométricas de menores, garantindo conformidade rigorosa para o uso em Educação Física Escolar.
          </p>
        </div>

        {/* Botão Salvar */}
        <div className="flex items-center justify-between pt-2">
          {savedFeedback ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              <Check className="w-4 h-4" />
              <span>Configurações atualizadas com sucesso!</span>
            </span>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#173B8F] hover:bg-blue-800 text-yellow-400 font-black text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
