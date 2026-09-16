import React, { useState } from 'react';
import { BeachSignal, WindDirection, PlayerPosition, CourtTheme } from '../types';
import { HandSignalsView } from './HandSignalsView';
import { Court2D } from './Court2D';
import { BEACH_SIGNALS_GUIDE } from '../constants/tacticsData';
import { validateBeachTactic } from '../engine/rulesValidator';
import confetti from 'canvas-confetti';
import { Wind, ShieldAlert, Sparkles, CheckCircle2, RefreshCw, HelpCircle, Eye } from 'lucide-react';

interface BeachSimulatorProps {
  theme: CourtTheme;
}

export const BeachSimulator: React.FC<BeachSimulatorProps> = ({ theme }) => {
  const [leftSignal, setLeftSignal] = useState<BeachSignal>('1_finger');
  const [rightSignal, setRightSignal] = useState<BeachSignal>('2_fingers');
  const [attackerSide, setAttackerSide] = useState<'left' | 'right'>('left');
  const [wind, setWind] = useState<WindDirection>('none');
  const [showShadowCones, setShowShadowCones] = useState<boolean>(true);
  const [feedbackResult, setFeedbackResult] = useState<{
    isCorrect: boolean;
    score: number;
    feedback: string;
    pedagogicalAdvice: string;
  } | null>(null);

  // Posições iniciais dos 2 jogadores da praia
  const [players, setPlayers] = useState<PlayerPosition[]>([
    { id: 'BLOQ', role: 'P2', label: 'BLOQ', roleName: 'Bloqueador', jerseyNumber: 1, rotationIndex: 2, x: 25, y: 12, isFrontRow: true },
    { id: 'DEF', role: 'P1', label: 'DEF', roleName: 'Defensor', jerseyNumber: 2, rotationIndex: 1, x: 72, y: 75, isFrontRow: false },
  ]);

  // Atualizar posição do bloqueador dependendo do lado do atacante
  const handleAttackerSideChange = (side: 'left' | 'right') => {
    setAttackerSide(side);
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === 'BLOQ') {
          return { ...p, x: side === 'left' ? 25 : 75 };
        }
        return p;
      })
    );
    setFeedbackResult(null);
  };

  const handlePlayerMove = (playerId: string, newX: number, newY: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, x: newX, y: newY } : p))
    );
    // Limpar feedback antigo ao mover
    setFeedbackResult(null);
  };

  // Validar a decisão tática da defesa
  const handleValidatePosition = () => {
    const activeSignal = attackerSide === 'left' ? leftSignal : rightSignal;
    const defender = players.find((p) => p.id === 'DEF')!;
    const res = validateBeachTactic(activeSignal, attackerSide, { x: defender.x, y: defender.y }, wind);

    setFeedbackResult(res);

    if (res.isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  // Sugerir posição correta automaticamente
  const handleAutoPosition = () => {
    const activeSignal = attackerSide === 'left' ? leftSignal : rightSignal;
    let targetX = 72;
    let targetY = 75;

    if (activeSignal === '1_finger') {
      // Bloqueio Linha -> Defesa Diagonal
      targetX = attackerSide === 'left' ? 72 : 28;
      targetY = 75;
    } else if (activeSignal === '2_fingers') {
      // Bloqueio Diagonal -> Defesa Linha
      targetX = attackerSide === 'left' ? 28 : 72;
      targetY = 75;
    } else if (activeSignal === 'open_hand') {
      targetX = 50;
      targetY = 70;
    } else if (activeSignal === 'closed_fist') {
      targetX = 50;
      targetY = 75;
    }

    setPlayers((prev) =>
      prev.map((p) => (p.id === 'DEF' ? { ...p, x: targetX, y: targetY } : p))
    );
    setFeedbackResult(null);
  };

  const currentSignal = attackerSide === 'left' ? leftSignal : rightSignal;
  const signalInfo = BEACH_SIGNALS_GUIDE[currentSignal];

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Header do Módulo de Praia */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏖️</span>
              <h2 className="text-xl font-black text-slate-900">
                Vôlei de Praia: Sinais Secretos com os Dedos & Defesa
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Como funciona: o jogador que está na rede faz sinais escondidos com os dedos nas costas antes do saque. A dupla combina quem bloqueia e onde o parceiro deve correr para defender!
            </p>
          </div>

          {/* Toggle de Cones de Sombra */}
          <button
            onClick={() => setShowShadowCones(!showShadowCones)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
              showShadowCones
                ? 'bg-yellow-500 text-slate-950 border-yellow-600 shadow-sm font-black'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Mostra a área do chão que fica protegida pelo corpo do bloqueador"
          >
            <Eye className="w-3.5 h-3.5" />
            {showShadowCones ? 'Área de Sombra (Visível)' : 'Área de Sombra (Oculta)'}
          </button>
        </div>
      </div>

      {/* Grid Principal: Mãos nas Costas + Quadra de Areia + Simulador de Vento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Painel Esquerdo: Mãos em SVG + Seletor de Ataque & Vento (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Mãos Vetoriais Interativas */}
          <HandSignalsView
            leftSignal={leftSignal}
            rightSignal={rightSignal}
            onLeftSignalChange={setLeftSignal}
            onRightSignalChange={setRightSignal}
          />

          {/* Seletor do Lado do Atacante Adversário */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              🎯 De onde vem o ataque adversário?
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAttackerSideChange('left')}
                className={`py-2.5 px-3 rounded-lg text-xs font-black transition-all flex flex-col items-center border ${
                  attackerSide === 'left'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>Entrada (Esquerda)</span>
                <span className={`text-[10px] ${attackerSide === 'left' ? 'text-blue-100' : 'text-slate-500'}`}>Sinal: Mão Esquerda</span>
              </button>

              <button
                onClick={() => handleAttackerSideChange('right')}
                className={`py-2.5 px-3 rounded-lg text-xs font-black transition-all flex flex-col items-center border ${
                  attackerSide === 'right'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>Saída (Direita)</span>
                <span className={`text-[10px] ${attackerSide === 'right' ? 'text-blue-100' : 'text-slate-500'}`}>Sinal: Mão Direita</span>
              </button>
            </div>
          </div>

          {/* Simulador de Vento */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-blue-600" /> Condições do Vento na Praia
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Empurra ou segura a bola</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'none', label: 'Sem Vento (Calmo)' },
                { id: 'favor', label: 'Vento a Favor 💨' },
                { id: 'against', label: 'Vento Contra 💨' },
                { id: 'cross_left', label: 'Soprando da Esquerda' },
                { id: 'cross_right', label: 'Soprando da Direita' },
              ].map((w) => (
                <button
                  key={`wind-${w.id}`}
                  onClick={() => setWind(w.id as WindDirection)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                    wind === w.id
                      ? 'bg-yellow-500 text-slate-950 border-yellow-600 shadow-sm font-black'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Painel Central: Quadra de Areia + Teste de Decisão (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Cartão de Resumo Tático do Sinal Ativo */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-blue-900">
                O que o sinal significa: {signalInfo.name}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {attackerSide === 'left' ? 'Atacante da Esquerda' : 'Atacante da Direita'}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>O que o Bloqueador vai fazer:</strong> {signalInfo.blockerAction}
            </p>
            <p className="text-xs text-emerald-800 font-bold mt-1">
              <strong>Onde o Defensor deve ficar:</strong> {signalInfo.defenderPosition}
            </p>
          </div>

          {/* Quadra 2D na Areia com Cones e Defesa */}
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <Court2D
              players={players}
              onPlayerMove={handlePlayerMove}
              theme="beach_gold"
              system="beach_2x2"
              isBeach={true}
              beachSignal={currentSignal}
              beachAttackerSide={attackerSide}
              showShadowCones={showShadowCones}
              wind={wind}
            />
          </div>

          {/* Controles de Validação do Posicionamento do Defensor */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleValidatePosition}
              className="w-full sm:flex-1 py-2.5 px-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-lg shadow-sm text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              title="Conferir se o jogador defensor está cobrindo o lugar certo da quadra"
            >
              <Sparkles className="w-4 h-4" /> Conferir Se Minha Defesa Está Certa
            </button>
            <button
              onClick={handleAutoPosition}
              className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-200"
              title="Mover o defensor automaticamente para a posição ideal"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> Mostrar Onde o Defensor Deve Ficar
            </button>
          </div>

          {/* Card de Resultado da Tomada de Decisão */}
          {feedbackResult && (
            <div
              className={`p-4 rounded-xl border transition-all animate-in fade-in zoom-in-95 shadow-sm ${
                feedbackResult.isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {feedbackResult.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-black text-sm text-emerald-900">
                      PONTO TÁTICO! Decisão Correta ({feedbackResult.score}%)
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    <span className="font-black text-sm text-rose-900">
                      ZONA DESPROTEGIDA!
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-800 mt-1 leading-relaxed font-medium">
                {feedbackResult.feedback}
              </p>
              <p className="text-xs text-blue-900 mt-1.5 font-bold">
                💡 <strong>Dica do Treinador:</strong> {feedbackResult.pedagogicalAdvice}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
