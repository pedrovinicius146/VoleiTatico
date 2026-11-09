import React from 'react';
import { UserProgress } from '../types';
import { Award, CheckCircle, Download, Printer, X, Shield, Star } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProgress: UserProgress;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  userProgress,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const certificateCode = `FIVB-CBV-${userProgress.classCode || 'EDU'}-${userProgress.xp.toString().padStart(5, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header de Ação (Fechar & Imprimir) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-black text-sm tracking-wide">
              Certificado Oficial de Habilitação Tática
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              aria-label="Fechar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Corpo do Certificado (Imprimível em formato diploma) */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-stone-50 text-slate-900 select-none">
          {/* Moldura Clássica de Certificado com Bordas Ornamentadas em Ouro e Titânio */}
          <div className="relative p-6 sm:p-10 bg-white border-4 border-double border-amber-600/70 rounded-2xl shadow-md flex flex-col items-center text-center">
            {/* Brasão Superior & Marcas D'Água */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 text-white flex items-center justify-center shadow-md font-black text-xl border-2 border-white">
                🏐
              </div>
            </div>

            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-amber-800/90 mb-1">
              Plataforma Nacional de Educação Física & Treinamento de Base
            </span>

            <h1 className="text-xl sm:text-3xl font-black text-slate-950 tracking-tight mb-2">
              CERTIFICADO DE EXCELÊNCIA TÁTICA
            </h1>

            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 rounded-full mb-6" />

            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl leading-relaxed mb-4">
              Certificamos para os devidos fins de formação esportiva e pedagógica que o(a) atleta-estudante
            </p>

            <h2 className="text-lg sm:text-2xl font-black text-blue-950 tracking-tight mb-1 border-b-2 border-slate-200 pb-1 px-8">
              {userProgress.studentName || 'Aluno(a) Atleta'}
            </h2>

            <span className="text-xs text-slate-500 font-medium mb-5">
              Matrícula Institucional: {userProgress.schoolName || 'Escola de Base'} • Turma {userProgress.classCode || 'CBV-2026'}
            </span>

            <p className="text-xs sm:text-sm text-slate-700 max-w-xl leading-relaxed mb-6">
              completou com distinção o programa integral de <strong>Sistemas Táticos de Voleibol (6x0, 4x2, 5x1 e Praia 2x2)</strong>,
              demonstrando pleno domínio das <strong>regras oficiais de posicionamento, rodízio, restrição dos 3 metros,
              substituição de líbero e leitura de bloqueio</strong>.
            </p>

            {/* Selos de Competência e Carimbo Pedagógico */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-3 border-y border-slate-200 mb-6 text-left">
              <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                <span className="text-[10px] uppercase font-bold text-amber-900 block">Pontuação</span>
                <strong className="text-xs sm:text-sm font-black text-amber-950">{userProgress.xp} XP</strong>
              </div>
              <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-200/60">
                <span className="text-[10px] uppercase font-bold text-blue-900 block">Nível Atingido</span>
                <strong className="text-xs sm:text-sm font-black text-blue-950">Nível {userProgress.level}</strong>
              </div>
              <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-200/60">
                <span className="text-[10px] uppercase font-bold text-emerald-900 block">Validação</span>
                <strong className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Aprovado
                </strong>
              </div>
              <div className="bg-slate-100/70 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-700 block">Emissão</span>
                <strong className="text-xs sm:text-sm font-black text-slate-900">{currentDate.split(' de ')[2] || '2026'}</strong>
              </div>
            </div>

            {/* Assinaturas Digitais Oficiais */}
            <div className="w-full flex items-end justify-between pt-4 text-left">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">CÓDIGO DE AUTENTICIDADE:</span>
                <span className="text-xs font-mono font-bold text-slate-700">{certificateCode}</span>
              </div>

              <div className="text-center">
                <div className="w-36 border-b border-slate-800 mb-1" />
                <span className="text-[10px] font-black uppercase text-slate-800 block">Coordenação Pedagógica</span>
                <span className="text-[9px] text-slate-500 font-medium">REDE VÔLEI • Ensino & Base</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
