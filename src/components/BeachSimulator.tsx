import React, { useState } from 'react';
import { BeachSignal, WindDirection, PlayerPosition, CourtTheme } from '../types';
import {
  BEACH_ATTACK_SCENARIOS,
  BeachAttackScenario,
  calculateBeachTacticalPositions,
} from '../constants/beachAttacksData';
import { HandSignalsView } from './HandSignalsView';
import { BeachCourt3D, PlayResultInfo } from './BeachCourt3D';
import { BeachSignalsExplainer } from './BeachSignalsExplainer';
import confetti from 'canvas-confetti';
import {
  Wind,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Eye,
  X,
  Zap,
  Shield,
  Play,
  RotateCcw,
  Trophy,
  HelpCircle,
} from 'lucide-react';

interface BeachSimulatorProps {
  theme: CourtTheme;
}

export const BeachSimulator: React.FC<BeachSimulatorProps> = ({ theme }) => {
  const [leftSignal, setLeftSignal] = useState<BeachSignal>('1_finger');
  const [rightSignal, setRightSignal] = useState<BeachSignal>('1_finger');
  const [attackerSide, setAttackerSide] = useState<'left' | 'right'>('left');
  const [wind, setWind] = useState<WindDirection>('none');
  const [showShadowCones, setShowShadowCones] = useState<boolean>(true);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerPosition | null>(null);

  // Attack Filter: Todos | Entrada (Esquerda) | Saída (Direita)
  const [attackFilter, setAttackFilter] = useState<'all' | 'left' | 'right'>('all');

  // Outcome mode override: Auto | Forçar Toco | Forçar Defesa
  const [outcomeMode, setOutcomeMode] = useState<'auto' | 'block_point' | 'defense_dig'>('auto');

  // Attack selection
  const [selectedAttackId, setSelectedAttackId] = useState<string>('entrada_line_spike');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Single action execution state
  const [isExecutingPlay, setIsExecutingPlay] = useState<boolean>(false);
  const [lastPlayResult, setLastPlayResult] = useState<PlayResultInfo | null>(null);

  // Match score tracking
  const [matchScore, setMatchScore] = useState<{ userPoints: number; opponentPoints: number }>({
    userPoints: 0,
    opponentPoints: 0,
  });

  const activeAttack =
    BEACH_ATTACK_SCENARIOS.find((a) => a.id === selectedAttackId) || BEACH_ATTACK_SCENARIOS[0];

  // User-positioned players (Bloqueador e Defensor)
  const [players, setPlayers] = useState<PlayerPosition[]>([
    {
      id: 'BLOQ',
      role: 'P2',
      label: 'BLOQ',
      roleName: 'Bloqueador da Rede',
      jerseyNumber: 1,
      rotationIndex: 2,
      x: 18,
      y: 12,
      isFrontRow: true,
    },
    {
      id: 'DEF',
      role: 'P1',
      label: 'DEF',
      roleName: 'Defensor de Fundo',
      jerseyNumber: 2,
      rotationIndex: 1,
      x: 74,
      y: 76,
      isFrontRow: false,
    },
  ]);

  // Aplica sugestão tática de posicionamento
  const applyTacticalAdjustment = (signal: BeachSignal, side: 'left' | 'right') => {
    const { blocker, defender } = calculateBeachTacticalPositions(signal, side);
    setPlayers([
      {
        id: 'BLOQ',
        role: 'P2',
        label: 'BLOQ',
        roleName: 'Bloqueador da Rede',
        jerseyNumber: 1,
        rotationIndex: 2,
        x: blocker.x,
        y: blocker.y,
        isFrontRow: true,
      },
      {
        id: 'DEF',
        role: 'P1',
        label: 'DEF',
        roleName: 'Defensor de Fundo',
        jerseyNumber: 2,
        rotationIndex: 1,
        x: defender.x,
        y: defender.y,
        isFrontRow: false,
      },
    ]);
  };

  const handleLeftSignalChange = (s: BeachSignal) => {
    setLeftSignal(s);
    setLastPlayResult(null);
  };

  const handleRightSignalChange = (s: BeachSignal) => {
    setRightSignal(s);
    setLastPlayResult(null);
  };

  const handleAttackerSideChange = (side: 'left' | 'right') => {
    setAttackerSide(side);
    const firstMatching = BEACH_ATTACK_SCENARIOS.find((scen) => scen.attackerSide === side);
    if (firstMatching) {
      setSelectedAttackId(firstMatching.id);
    }
    setLastPlayResult(null);
  };

  const handleSelectAttackScenario = (scenario: BeachAttackScenario) => {
    setSelectedAttackId(scenario.id);
    setAttackerSide(scenario.attackerSide);
    setIsExecutingPlay(false);
    setLastPlayResult(null);
  };

  // Movimentação manual do boneco via arrasto livre
  const handlePlayerMove = (playerId: string, newX: number, newY: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, x: newX, y: newY } : p))
    );
    setLastPlayResult(null);
  };

  // Iniciar a Jogada: Executa a ação única contra o atacante a partir de onde os bonecos estão
  const handleStartPlay = () => {
    setIsExecutingPlay(true);
    setLastPlayResult(null);
  };

  // Reposicionar bonecos
  const handleResetPlay = () => {
    setIsExecutingPlay(false);
    setLastPlayResult(null);
  };

  // Ajustar automaticamente para a posição ideal de cartilha
  const handleIdealPositioning = () => {
    const currentSignal = attackerSide === 'left' ? leftSignal : rightSignal;
    applyTacticalAdjustment(currentSignal, attackerSide);
    setLastPlayResult(null);
  };

  // Callback chamado ao final da jogada pelo 3D
  const handlePlayCompleted = (result: PlayResultInfo) => {
    setIsExecutingPlay(false);
    setLastPlayResult(result);

    if (result.outcome === 'toco' || result.outcome === 'defense') {
      setMatchScore((prev) => ({ ...prev, userPoints: prev.userPoints + 1 }));
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.65 },
      });
    } else {
      setMatchScore((prev) => ({ ...prev, opponentPoints: prev.opponentPoints + 1 }));
    }
  };

  const filteredScenarios = BEACH_ATTACK_SCENARIOS.filter((scen) => {
    if (attackFilter === 'all') return true;
    return scen.attackerSide === attackFilter;
  });

  const currentSignal = attackerSide === 'left' ? leftSignal : rightSignal;

  return (
    <div className="w-full flex flex-col gap-5">
      {/* 1. Header Compacto e Elegante */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏖️</span>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Arena Tática 3D · Vôlei de Praia
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Posicione o bloqueador e defensor na areia e teste sua defesa contra cada ataque adversário.
            </p>
          </div>
        </div>

        {/* Placar & Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Nosso Time: <strong className="text-emerald-400">{matchScore.userPoints}</strong></span>
            <span className="text-slate-500">x</span>
            <span>Adversário: <strong className="text-rose-400">{matchScore.opponentPoints}</strong></span>
          </div>

          <button
            onClick={() => setShowShadowCones(!showShadowCones)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              showShadowCones
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs font-black'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Mostra a área do chão protegida pelo corpo do bloqueador"
          >
            <Eye className="w-3.5 h-3.5" />
            {showShadowCones ? 'Sombra Ativa' : 'Sombra Oculta'}
          </button>
        </div>
      </div>

      {/* 2. Seletor de Cenários de Ataque (SEM a dica visual do toco) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
              Escolha o Ataque Adversário para Desafiar
            </span>
          </div>

          {/* Filtro: Todos | Entrada (Esquerda) | Saída (Direita) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
            <button
              onClick={() => setAttackFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                attackFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({BEACH_ATTACK_SCENARIOS.length})
            </button>
            <button
              onClick={() => setAttackFilter('left')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                attackFilter === 'left'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <span>👈 Entrada (Pos 4)</span>
            </button>
            <button
              onClick={() => setAttackFilter('right')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                attackFilter === 'right'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              <span>👉 Saída (Pos 2)</span>
            </button>
          </div>
        </div>

        {/* Grid de Ataques sem spoilers de toco */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {filteredScenarios.map((scen) => {
            const isSelected = selectedAttackId === scen.id;
            const isEntrada = scen.attackerSide === 'left';
            return (
              <button
                key={scen.id}
                onClick={() => handleSelectAttackScenario(scen)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all text-xs ${
                  isSelected
                    ? 'bg-slate-900 text-white border-amber-500 shadow-md ring-2 ring-amber-400/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{scen.icon}</span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      isEntrada
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {isEntrada ? 'Entrada' : 'Saída'}
                  </span>
                </div>
                <div>
                  <strong className="font-black text-xs block leading-tight">{scen.shortName}</strong>
                  <span className={`text-[10px] block mt-1 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                    {scen.tag}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. A ARENA 3D EM LARGURA COMPLETA (FULL-WIDTH 3D ARENA) */}
      <div className="w-full flex flex-col gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
              Arena 3D Full-Size • {activeAttack.name}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={handleIdealPositioning}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
              title="Posicionar bloqueador e defensor na posição tática recomendada"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sugerir Posição Ideal</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">
              Arraste o defensor e o bloqueador livremente para onde quiser
            </span>
          </div>
        </div>

        {/* 3D WebGL Canvas Full-Width */}
        <BeachCourt3D
          players={players}
          onPlayerMove={handlePlayerMove}
          onPlayerDoubleClick={(p) => setSelectedPlayer(p)}
          beachSignal={currentSignal}
          attackerSide={attackerSide}
          showShadowCones={showShadowCones}
          wind={wind}
          selectedPlayerId={selectedPlayer?.id}
          interactive={true}
          attackScenario={activeAttack}
          isExecutingPlay={isExecutingPlay}
          onStartPlay={handleStartPlay}
          onResetPlay={handleResetPlay}
          onPlayCompleted={handlePlayCompleted}
          playbackSpeed={playbackSpeed}
          onChangePlaybackSpeed={(s) => setPlaybackSpeed(s)}
          forceOutcome={outcomeMode}
        />

        {/* Feedback Detalhado do Resultado da Jogada */}
        {lastPlayResult && (
          <div
            className={`p-4 rounded-xl border transition-all animate-in fade-in zoom-in-95 shadow-sm ${
              lastPlayResult.outcome === 'toco'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : lastPlayResult.outcome === 'defense'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {lastPlayResult.outcome === 'toco' && (
                <>
                  <Sparkles className="w-5 h-5 text-rose-600" />
                  <span className="font-black text-sm text-rose-900">
                    🛑 PONTO DE BLOQUEIO! MONSTER BLOCK (TOCO NA FITA)! (+1 Ponto)
                  </span>
                </>
              )}
              {lastPlayResult.outcome === 'defense' && (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-black text-sm text-emerald-900">
                    ✅ DEFESA RECUPERADA COM SUCESSO! (+1 Ponto)
                  </span>
                </>
              )}
              {lastPlayResult.outcome === 'opponent_point' && (
                <>
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <span className="font-black text-sm text-red-900">
                    💥 PONTO DO ADVERSÁRIO! BOLA NO CHÃO DA SUA QUADRA! (+1 Ponto Adversário)
                  </span>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-800 mt-1 leading-relaxed font-medium">
              {lastPlayResult.outcome === 'toco' && (
                <>
                  Você fechou o corredor correto na fita da rede. O golpe do atacante explodiu na mão do bloqueador e voltou cravada no chão adversário!
                </>
              )}
              {lastPlayResult.outcome === 'defense' && (
                <>
                  Excelente posicionamento! O defensor estava a apenas{' '}
                  <strong>{lastPlayResult.defenderDistance.toFixed(1)} metros</strong> do ponto de contato, executando o mergulho na areia e erguendo a bola em manchete!
                </>
              )}
              {lastPlayResult.outcome === 'opponent_point' && (
                <>
                  O defensor estava a <strong>{lastPlayResult.defenderDistance.toFixed(1)} metros</strong> de distância do local da queda da bola. Em quadra de areia, o limite máximo de recuperação com mergulho é de cerca de 2.2 metros.
                </>
              )}
            </p>

            <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-amber-800">
                💡 Como defender este golpe ({activeAttack.shortName}): {activeAttack.defenderActionText}
              </span>
              <button
                onClick={handleIdealPositioning}
                className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all text-[11px]"
              >
                Colocar na Posição Ideal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Painel de Controle de Marcação de Sinais & Vento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Mãos com Sinais de Dedos */}
        <HandSignalsView
          leftSignal={leftSignal}
          rightSignal={rightSignal}
          onLeftSignalChange={handleLeftSignalChange}
          onRightSignalChange={handleRightSignalChange}
        />

        {/* Lado do Atacante & Condições de Vento */}
        <div className="flex flex-col gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              🎯 Lado da Rede do Atacante Adversário
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAttackerSideChange('left')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex flex-col items-center border ${
                  attackerSide === 'left'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>👈 Entrada de Rede</span>
                <span className={`text-[10px] ${attackerSide === 'left' ? 'text-blue-100' : 'text-slate-500'}`}>
                  Posição 4 • Mão Esquerda
                </span>
              </button>

              <button
                onClick={() => handleAttackerSideChange('right')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex flex-col items-center border ${
                  attackerSide === 'right'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>👉 Saída de Rede</span>
                <span className={`text-[10px] ${attackerSide === 'right' ? 'text-amber-950 font-bold' : 'text-slate-500'}`}>
                  Posição 2 • Mão Direita
                </span>
              </button>
            </div>
          </div>

          {/* Vento na Praia */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-blue-600" /> Condições do Vento (Biruta 3D)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'none', label: 'Sem Vento' },
                { id: 'favor', label: 'A Favor 💨' },
                { id: 'against', label: 'Contra 💨' },
                { id: 'cross_left', label: 'Esquerda' },
                { id: 'cross_right', label: 'Direita' },
              ].map((w) => (
                <button
                  key={`wind-${w.id}`}
                  onClick={() => setWind(w.id as WindDirection)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                    wind === w.id
                      ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs font-black'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. SEGMENTO PEDAGÓGICO ESPECÍFICO: O QUE CADA MARCAÇÃO DE BLOQUEIO FAZ */}
      <BeachSignalsExplainer
        activeSignal={currentSignal}
        onSelectSignal={(s) => {
          if (attackerSide === 'left') {
            setLeftSignal(s);
          } else {
            setRightSignal(s);
          }
          setLastPlayResult(null);
        }}
      />

      {/* Modal Técnico do Atleta (Clique Duplo) */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="bg-white border-2 border-amber-500 rounded-2xl p-5 w-full max-w-md text-slate-900 shadow-2xl animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
                  {selectedPlayer.id === 'BLOQ' ? '🏐' : '🛡️'}
                </span>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {selectedPlayer.id === 'BLOQ' ? 'Boneco Bloqueador da Rede' : 'Boneco Defensor de Fundo'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Atleta de Areia • Camisa #{selectedPlayer.jerseyNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="font-black text-amber-950 block mb-1">
                  {selectedPlayer.id === 'BLOQ'
                    ? '🎯 Função Tática no Bloqueio'
                    : '🛡️ Função Tática na Defesa'}
                </span>
                <p className="text-amber-900 font-medium">
                  {selectedPlayer.id === 'BLOQ'
                    ? 'O Bloqueador sela o corredor combinado com as mãos nas costas. Se ele acertar o lado do golpe do atacante, ele CRAVA O TOCO direto para o chão adversário. Se fechar o ângulo complementar, ele cria uma "sombra" segura para o parceiro defender.'
                    : 'O Defensor posiciona-se em base baixa de manchete onde você o colocar na areia! Se a bola for atacada muito longe de onde você o posicionou, o adversário pontua.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Sinal de Marcação Ativo:</span>
                <p className="text-slate-600">
                  {currentSignal === '1_finger' && '👉 1 Dedo: Bloqueio na paralela (linha). Fecha a antena.'}
                  {currentSignal === '2_fingers' && '✌️ 2 Dedos: Bloqueio na diagonal. Fecha o ângulo cruzado.'}
                  {currentSignal === 'open_hand' && '✋ Mão Aberta: Bloqueio na bola. Leitura total da armada adversária.'}
                  {currentSignal === 'closed_fist' && '✊ Punho Fechado: Recuo (pull). Não há bloqueio; 2 defendem no chão.'}
                  {currentSignal === 'shade_cut' && '👌 Cut Shot: Bloqueador invade com braço interno na diagonal curta.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlayer(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
