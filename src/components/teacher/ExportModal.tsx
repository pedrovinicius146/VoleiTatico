import React, { useState } from 'react';
import { X, FileText, Table, Printer, Download, Check, Users, User, Target } from 'lucide-react';
import { StudentRecord } from './types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
  classCode: string;
  onExportPdf: (type: 'class' | 'student' | 'competencies', studentId?: string) => void;
  onExportCsv: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  students,
  classCode,
  onExportPdf,
  onExportCsv,
}) => {
  const [reportType, setReportType] = useState<'class' | 'student' | 'competencies'>('class');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');

  if (!isOpen) return null;

  const handleExport = () => {
    if (format === 'csv') {
      onExportCsv();
      onClose();
    } else {
      onExportPdf(reportType, reportType === 'student' ? selectedStudentId : undefined);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header do Modal */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center">
              <Printer className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Exportar Relatório Pedagógico</h3>
              <p className="text-xs text-slate-500">Turma {classCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-5 space-y-4">
          {/* Tipo de Relatório */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2">
              Tipo de Relatório:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReportType('class')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  reportType === 'class'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 text-blue-700" />
                <span>Turma Geral</span>
              </button>

              <button
                type="button"
                onClick={() => setReportType('student')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  reportType === 'student'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4 text-blue-700" />
                <span>Aluno</span>
              </button>

              <button
                type="button"
                onClick={() => setReportType('competencies')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  reportType === 'competencies'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Target className="w-4 h-4 text-blue-700" />
                <span>Competências</span>
              </button>
            </div>
          </div>

          {/* Seleção do Aluno (se o tipo for individual) */}
          {reportType === 'student' && (
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">
                Selecione o Estudante:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.xp} XP • Nv {s.level})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Formato de Exportação */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2">
              Formato do Documento:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  format === 'pdf'
                    ? 'bg-yellow-50 border-yellow-500 text-yellow-950 font-black'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-yellow-600" />
                <span>PDF (Oficial)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  format === 'csv'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Table className="w-4 h-4 text-emerald-600" />
                <span>Excel / CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="px-5 py-2.5 bg-[#173B8F] hover:bg-blue-800 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
          >
            {format === 'pdf' ? <Printer className="w-4 h-4 text-yellow-400" /> : <Download className="w-4 h-4 text-yellow-400" />}
            <span>Exportar Relatório</span>
          </button>
        </div>
      </div>
    </div>
  );
};
