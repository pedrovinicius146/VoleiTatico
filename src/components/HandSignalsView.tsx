import React from 'react';
import { BeachSignal } from '../types';
import { BEACH_SIGNALS_GUIDE } from '../constants/tacticsData';

interface HandSignalsViewProps {
  leftSignal: BeachSignal;
  rightSignal: BeachSignal;
  onLeftSignalChange?: (signal: BeachSignal) => void;
  onRightSignalChange?: (signal: BeachSignal) => void;
  interactive?: boolean;
  compact?: boolean;
}

export const HandSignalsView: React.FC<HandSignalsViewProps> = ({
  leftSignal,
  rightSignal,
  onLeftSignalChange,
  onRightSignalChange,
  interactive = true,
  compact = false,
}) => {
  const signals: { id: BeachSignal; label: string; num: string }[] = [
    { id: '1_finger', label: '1 - Linha', num: '1' },
    { id: '2_fingers', label: '2 - Diagonal', num: '2' },
    { id: 'open_hand', label: 'Mão Aberta', num: '✋' },
    { id: 'closed_fist', label: 'Punho Fechado', num: '✊' },
    { id: 'shade_cut', label: 'Largada / Cut', num: '👌' },
  ];

  return (
    <div className={`flex flex-col items-center bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-slate-900 ${compact ? 'max-w-md' : 'w-full'}`}>
      <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤫</span>
          <div>
            <h4 className="font-black text-sm sm:text-base text-slate-900 tracking-tight">
              Sinais Secretos nas Costas do Bloqueador
            </h4>
            <p className="text-xs text-slate-500">
              Mão Esquerda = Marca Atacante da Esquerda | Mão Direita = Marca Atacante da Direita
            </p>
          </div>
        </div>
      </div>

      {/* Ilustração das Costas do Bloqueador com Mãos em SVG */}
      <div className="relative w-full max-w-sm h-48 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden my-2">
        {/* Camiseta / Costas do Bloqueador */}
        <div className="absolute top-0 w-44 h-32 bg-[#1e3a8a] rounded-b-3xl border-b-4 border-yellow-500 shadow-md flex flex-col items-center pt-2">
          <span className="text-yellow-400 text-xs font-black uppercase tracking-widest">BRASIL</span>
          <span className="text-white font-black text-2xl drop-shadow">1</span>
          <div className="text-[10px] text-blue-100 mt-1 font-bold bg-blue-900/90 px-2.5 py-0.5 rounded-full border border-blue-700">
            COSTAS DO BLOQUEADOR
          </div>
        </div>

        {/* Mão Esquerda (Fica no lado ESQUERDO da tela para quem olha de trás) */}
        <div className="absolute bottom-2 sm:bottom-4 left-3 sm:left-8 flex flex-col items-center">
          <div className="text-[9px] sm:text-[10px] font-bold text-blue-950 mb-1 bg-white px-1.5 sm:px-2 py-0.5 rounded border border-slate-200 shadow-xs">
            Mão Esq (Entrada)
          </div>
          <div className="p-1.5 sm:p-2 bg-white rounded-xl border border-slate-200 shadow-sm scale-90 sm:scale-100">
            <HandSvg signal={leftSignal} isLeft={true} />
          </div>
          <span className="text-[11px] sm:text-xs font-extrabold text-slate-800 mt-0.5 sm:mt-1">
            {BEACH_SIGNALS_GUIDE[leftSignal].name.split('(')[0]}
          </span>
        </div>

        {/* Mão Direita (Fica no lado DIREITO da tela para quem olha de trás) */}
        <div className="absolute bottom-2 sm:bottom-4 right-3 sm:right-8 flex flex-col items-center">
          <div className="text-[9px] sm:text-[10px] font-bold text-blue-950 mb-1 bg-white px-1.5 sm:px-2 py-0.5 rounded border border-slate-200 shadow-xs">
            Mão Dir (Saída)
          </div>
          <div className="p-1.5 sm:p-2 bg-white rounded-xl border border-slate-200 shadow-sm scale-90 sm:scale-100">
            <HandSvg signal={rightSignal} isLeft={false} />
          </div>
          <span className="text-[11px] sm:text-xs font-extrabold text-slate-800 mt-0.5 sm:mt-1">
            {BEACH_SIGNALS_GUIDE[rightSignal].name.split('(')[0]}
          </span>
        </div>
      </div>

      {/* Controles Interativos dos Sinais */}
      {interactive && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-3">
          {/* Controle Mão Esquerda */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-blue-900">Mão Esquerda (Atacante Zona 4)</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {signals.map((s) => (
                <button
                  key={`left-${s.id}`}
                  onClick={() => onLeftSignalChange && onLeftSignalChange(s.id)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${
                    leftSignal === s.id
                      ? 'bg-yellow-500 text-slate-950 ring-2 ring-yellow-400 shadow-sm font-black'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                  title={BEACH_SIGNALS_GUIDE[s.id].name}
                >
                  <span className="text-sm">{s.num}</span>
                  <span className="text-[9px] truncate w-full text-center">{s.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Controle Mão Direita */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-blue-900">Mão Direita (Atacante Zona 2)</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {signals.map((s) => (
                <button
                  key={`right-${s.id}`}
                  onClick={() => onRightSignalChange && onRightSignalChange(s.id)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${
                    rightSignal === s.id
                      ? 'bg-yellow-500 text-slate-950 ring-2 ring-yellow-400 shadow-sm font-black'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                  title={BEACH_SIGNALS_GUIDE[s.id].name}
                >
                  <span className="text-sm">{s.num}</span>
                  <span className="text-[9px] truncate w-full text-center">{s.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de mão vetorial precisa em SVG
const HandSvg: React.FC<{ signal: BeachSignal; isLeft: boolean }> = ({ signal, isLeft }) => {
  const flip = isLeft ? '' : 'scale-x-[-1]';

  // Renderização vetorial detalhada baseada no sinal
  return (
    <svg
      viewBox="0 0 60 70"
      className={`w-14 h-16 transform ${flip} transition-transform drop-shadow-md`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Palma / Base da mão */}
      <path
        d="M18 35 C18 28, 22 25, 30 25 C38 25, 42 28, 42 35 C42 45, 40 58, 30 62 C20 58, 18 45, 18 35 Z"
        fill="#f59e0b"
        stroke="#b45309"
        strokeWidth="2"
      />
      {/* Punho */}
      <rect x="22" y="58" width="16" height="10" rx="3" fill="#d97706" stroke="#b45309" strokeWidth="1.5" />

      {signal === '1_finger' && (
        <>
          {/* Indicador estendido para baixo */}
          <path d="M22 35 L22 6 L28 6 L28 35" fill="#fcd34d" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
          {/* Demais dedos fechados */}
          <rect x="29" y="30" width="6" height="12" rx="3" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
          <rect x="36" y="32" width="5" height="10" rx="2.5" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
          <rect x="42" y="35" width="4" height="8" rx="2" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
          {/* Polegar dobrado */}
          <path d="M16 40 C14 36, 18 32, 22 35" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
        </>
      )}

      {signal === '2_fingers' && (
        <>
          {/* Indicador e Médio em V */}
          <path d="M20 35 L17 8 L23 8 L25 35" fill="#fcd34d" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
          <path d="M26 35 L33 8 L39 8 L32 35" fill="#fcd34d" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
          {/* Anelar e mínimo fechados */}
          <rect x="35" y="32" width="6" height="10" rx="3" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
          <rect x="41" y="35" width="5" height="8" rx="2.5" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
        </>
      )}

      {signal === 'open_hand' && (
        <>
          {/* Todos os 5 dedos abertos estendidos */}
          <path d="M12 36 L7 18 L12 17 L18 32" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />
          <path d="M19 30 L16 8 L22 7 L24 30" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />
          <path d="M25 28 L28 5 L34 5 L32 28" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />
          <path d="M33 30 L39 8 L44 9 L39 30" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />
          <path d="M40 33 L48 18 L52 20 L45 36" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />
        </>
      )}

      {signal === 'closed_fist' && (
        <>
          {/* Punho cerrado com nós dos dedos */}
          <rect x="18" y="28" width="24" height="16" rx="6" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
          <line x1="24" y1="28" x2="24" y2="44" stroke="#92400e" strokeWidth="1.5" />
          <line x1="30" y1="28" x2="30" y2="44" stroke="#92400e" strokeWidth="1.5" />
          <line x1="36" y1="28" x2="36" y2="44" stroke="#92400e" strokeWidth="1.5" />
          {/* Polegar dobrado sobre os dedos */}
          <path d="M16 38 C16 32, 28 32, 32 36" fill="#d97706" stroke="#92400e" strokeWidth="2" />
        </>
      )}

      {signal === 'shade_cut' && (
        <>
          {/* Sinal de Cut / Polegar com indicador formando arco e outros 3 abertos */}
          <circle cx="23" cy="22" r="6" stroke="#b45309" strokeWidth="2" fill="#fcd34d" />
          <path d="M30 28 L35 7 L40 8 L34 28" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />
          <path d="M35 30 L43 10 L47 12 L40 31" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />
          <path d="M41 33 L49 18 L53 20 L45 35" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
};
