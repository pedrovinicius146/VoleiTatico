import React, { useRef, useState, useEffect } from 'react';
import { PlayerPosition, PositionalFault, CourtTheme, SystemType, BeachSignal, WindDirection } from '../types';
import { COURT_ZONES_COORDINATES } from '../constants/tacticsData';
import { CourtPlayerCharacter } from './CourtPlayerCharacter';

interface Court2DProps {
  players: PlayerPosition[];
  onPlayerMove?: (playerId: string, newX: number, newY: number) => void;
  onPlayerClick?: (player: PlayerPosition) => void;
  faults?: PositionalFault[];
  theme?: CourtTheme;
  system: SystemType;
  isBeach?: boolean;
  beachSignal?: BeachSignal;
  beachAttackerSide?: 'left' | 'right';
  showShadowCones?: boolean;
  showZoneNumbers?: boolean;
  showTrajectoryArrows?: boolean;
  wind?: WindDirection;
  selectedPlayerId?: string | null;
  interactive?: boolean;
}

export const Court2D: React.FC<Court2DProps> = ({
  players,
  onPlayerMove,
  onPlayerClick,
  faults = [],
  theme = 'taraflex_blue',
  system,
  isBeach = false,
  beachSignal = '1_finger',
  beachAttackerSide = 'left',
  showShadowCones = true,
  showZoneNumbers = true,
  showTrajectoryArrows = true,
  wind = 'none',
  selectedPlayerId = null,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);

  // Armazena os dados da sessão de interação atual para diferenciar 1 clique de clique-e-arrasta/segura
  const interactionSessionRef = useRef<{
    playerId: string;
    player: PlayerPosition;
    startX: number;
    startY: number;
    startTime: number;
    hasMoved: boolean;
    isHold: boolean;
    dragOffsetX: number;
    dragOffsetY: number;
  } | null>(null);

  const holdTimerRef = useRef<number | null>(null);

  // Map of faults by player ID for quick lookups
  const faultPlayerIds = new Set<string>();
  faults.forEach((f) => {
    faultPlayerIds.add(f.player1Id);
    faultPlayerIds.add(f.player2Id);
  });

  // Ao pressionar (PointerDown): inicia o rastreio sem abrir o modal imediatamente
  const handlePointerDown = (e: React.PointerEvent, player: PlayerPosition) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const offsetX = clickX - player.x;
    const offsetY = clickY - player.y;

    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
    }

    interactionSessionRef.current = {
      playerId: player.id,
      player,
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now(),
      hasMoved: false,
      isHold: false,
      dragOffsetX: offsetX,
      dragOffsetY: offsetY,
    };

    setActiveDraggingId(player.id);

    // Se o usuário clicar e segurar por >= 220ms sem soltar, marca como "clique e segura"
    // Dessa forma, ao soltar o mouse/dedo, o modal NÃO se abre!
    holdTimerRef.current = window.setTimeout(() => {
      if (interactionSessionRef.current) {
        interactionSessionRef.current.isHold = true;
      }
    }, 220);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!activeDraggingId || !containerRef.current || !interactionSessionRef.current) return;

      const session = interactionSessionRef.current;
      const dist = Math.hypot(e.clientX - session.startX, e.clientY - session.startY);

      // Tolerância mínima de 4px para ignorar tremor involuntário em cliques rápidos
      if (dist > 4) {
        session.hasMoved = true;
        if (holdTimerRef.current) {
          window.clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
      }

      // Se houver movimento intencional ou se já estiver segurando para arrastar
      if (onPlayerMove && (session.hasMoved || session.isHold)) {
        const rect = containerRef.current.getBoundingClientRect();
        let newX = ((e.clientX - rect.left) / rect.width) * 100 - session.dragOffsetX;
        let newY = ((e.clientY - rect.top) / rect.height) * 100 - session.dragOffsetY;

        // Limitar dentro das linhas da quadra com margem de segurança (6% a 94%)
        newX = Math.max(6, Math.min(94, newX));
        newY = Math.max(6, Math.min(94, newY));

        onPlayerMove(session.playerId, Math.round(newX * 10) / 10, Math.round(newY * 10) / 10);
      }
    };

    const handlePointerUp = () => {
      if (holdTimerRef.current) {
        window.clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }

      if (interactionSessionRef.current) {
        const session = interactionSessionRef.current;
        const elapsed = Date.now() - session.startTime;

        // 1 clique rápido (sem arrasto e sem ter segurado por tempo prolongado):
        // -> Abre o modal do jogador
        const isQuickClick = !session.hasMoved && !session.isHold && elapsed < 220;

        if (isQuickClick) {
          if (onPlayerClick) {
            onPlayerClick(session.player);
          }
        }
        // Se houve clique e segura (isHold) OU arrasto (hasMoved):
        // -> Apenas reposicionou o boneco na quadra. O modal NÃO abre!
      }

      interactionSessionRef.current = null;
      setActiveDraggingId(null);
    };

    const handlePointerCancel = () => {
      if (holdTimerRef.current) {
        window.clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      interactionSessionRef.current = null;
      setActiveDraggingId(null);
    };

    if (activeDraggingId) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerCancel);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      if (holdTimerRef.current) {
        window.clearTimeout(holdTimerRef.current);
      }
    };
  }, [activeDraggingId, onPlayerMove, onPlayerClick]);

  // Estilização dos Temas da Quadra
  const getThemeClasses = () => {
    if (theme === 'high_contrast') {
      return {
        outerBg: 'bg-black border-4 border-white',
        courtBg: 'bg-zinc-950',
        lines: 'stroke-white stroke-[3]',
        attackLine: 'stroke-yellow-400 stroke-[3] stroke-dasharray-[6,6]',
        zoneText: 'fill-white/40',
      };
    }
    if (isBeach || theme === 'beach_gold') {
      return {
        outerBg: 'bg-amber-950/60 border-2 border-amber-600/60 shadow-2xl',
        courtBg: 'bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 shadow-inner',
        lines: 'stroke-blue-700 stroke-[3]',
        attackLine: 'stroke-blue-600/30 stroke-[2] stroke-dasharray-[4,4]',
        zoneText: 'fill-amber-900/30 font-bold',
      };
    }
    if (theme === 'neon_night') {
      return {
        outerBg: 'bg-slate-950 border-2 border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.2)]',
        courtBg: 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900',
        lines: 'stroke-cyan-400 stroke-[2.5]',
        attackLine: 'stroke-fuchsia-400 stroke-[2.5] stroke-dasharray-[6,4]',
        zoneText: 'fill-cyan-300/30',
      };
    }
    if (theme === 'classic_wood') {
      return {
        outerBg: 'bg-amber-950 border-2 border-amber-700/60 shadow-xl',
        courtBg: 'bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900',
        lines: 'stroke-white stroke-[2.5]',
        attackLine: 'stroke-white stroke-[2.5] stroke-dasharray-[6,4]',
        zoneText: 'fill-amber-200/30',
      };
    }
    // Default: Taraflex Blue/Orange oficial
    return {
      outerBg: 'bg-[#1e3a8a] border-4 border-yellow-500 shadow-xl',
      courtBg: 'bg-blue-600',
      lines: 'stroke-white stroke-[3]',
      attackLine: 'stroke-white stroke-[2.5] stroke-dasharray-[5,4]',
      zoneText: 'fill-white/30',
    };
  };

  const themeStyles = getThemeClasses();
  const activeLibero = players.find((p) => p.isLibero || p.role === 'L');

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      {/* Indicador em Destaque do Líbero em Quadra */}
      {activeLibero && (
        <div className="mb-2.5 flex items-center justify-between gap-2 bg-amber-50 border-2 border-amber-400 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-950 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🛡️</span>
            <span>
              <strong className="text-amber-900 font-black">LÍBERO EM QUADRA:</strong>{' '}
              {activeLibero.roleName.split('(')[0].trim()} (Posição {activeLibero.rotationIndex})
            </span>
          </div>
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
            Uniforme Diferenciado #{activeLibero.jerseyNumber || 10}
          </span>
        </div>
      )}

      {/* Indicador de Vento no topo se for praia */}
      {isBeach && wind !== 'none' && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 bg-[#1e3a8a] border border-yellow-400 px-3 py-1 rounded-full text-xs font-bold text-yellow-300 shadow-md">
          <span className="text-sm">💨</span>
          <span>
            {wind === 'favor' && 'Vento a Favor (Bola Longa)'}
            {wind === 'against' && 'Vento Contra (Largadas Caem Rápido)'}
            {wind === 'cross_left' && 'Vento Cruzado (Esquerda → Direita)'}
            {wind === 'cross_right' && 'Vento Cruzado (Direita → Esquerda)'}
          </span>
        </div>
      )}

      {/* Container da Quadra em formato Proporcional (9m x 9m = proporção 1:1 para meia quadra ou 1:1.15 com área livre) */}
      <div
        ref={containerRef}
        className={`relative w-full aspect-[1/1.08] sm:aspect-[1/1.05] rounded-2xl overflow-hidden p-3.5 sm:p-5 flex items-center justify-center ${themeStyles.outerBg}`}
      >
        {/* SVG da Quadra */}
        <svg
          viewBox="0 0 100 100"
          className={`w-full h-full rounded-xl ${themeStyles.courtBg}`}
          preserveAspectRatio="none"
        >
          {/* Definição de Gradientes e Padrões */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            </pattern>
            {/* Gradiente do Cone de Sombra do Bloqueio */}
            <linearGradient id="shadowConeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="defenseZoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Textura de Fundo */}
          <rect width="100" height="100" fill="url(#grid)" />

          {/* ======================================================== */}
          {/* CONE DE SOMBRA DO BLOQUEIO & LINHAS DE VISÃO (VÔLEI DE PRAIA) */}
          {/* ======================================================== */}
          {isBeach && showShadowCones && (
            <>
              {/* Cone de Sombra Bloqueada (Área que o bloqueio protege) */}
              {beachAttackerSide === 'left' ? (
                beachSignal === '1_finger' ? (
                  // Bloqueador fechando a Linha Esquerda -> Sombra na Paralela
                  <polygon
                    points="25,2 10,100 40,100"
                    fill="url(#shadowConeGrad)"
                    className="animate-pulse"
                  />
                ) : (
                  // Bloqueador fechando a Diagonal -> Sombra na Diagonal Cruzada
                  <polygon
                    points="25,2 45,100 95,100"
                    fill="url(#shadowConeGrad)"
                    className="animate-pulse"
                  />
                )
              ) : (
                beachSignal === '1_finger' ? (
                  // Ataque da Direita, Bloqueio fechando Linha Direita
                  <polygon
                    points="75,2 60,100 90,100"
                    fill="url(#shadowConeGrad)"
                    className="animate-pulse"
                  />
                ) : (
                  // Ataque da Direita, Bloqueio fechando Diagonal
                  <polygon
                    points="75,2 5,100 55,100"
                    fill="url(#shadowConeGrad)"
                    className="animate-pulse"
                  />
                )
              )}

              {/* Área Recomendada para a Defesa (Verde) */}
              {beachAttackerSide === 'left' ? (
                beachSignal === '1_finger' ? (
                  // Defesa deve cobrir a Diagonal (Lado Direito)
                  <rect x="50" y="55" width="45" height="40" rx="4" fill="url(#defenseZoneGrad)" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,3" />
                ) : (
                  // Defesa deve cobrir a Linha (Lado Esquerdo)
                  <rect x="5" y="55" width="40" height="40" rx="4" fill="url(#defenseZoneGrad)" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,3" />
                )
              ) : (
                beachSignal === '1_finger' ? (
                  <rect x="5" y="55" width="45" height="40" rx="4" fill="url(#defenseZoneGrad)" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,3" />
                ) : (
                  <rect x="55" y="55" width="40" height="40" rx="4" fill="url(#defenseZoneGrad)" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,3" />
                )
              )}

              {/* Rótulo da Área Desprotegida / Defesa */}
              <text
                x={beachAttackerSide === 'left' && beachSignal === '1_finger' ? '72' : '25'}
                y="75"
                textAnchor="middle"
                className="fill-emerald-400 text-[3.5px] font-extrabold drop-shadow"
              >
                ZONA DE COBERTURA DA DEFESA
              </text>
            </>
          )}

          {/* Linhas Perimetrais da Quadra */}
          <rect
            x="5"
            y="2"
            width="90"
            height="95"
            fill="none"
            className={themeStyles.lines}
          />

          {/* Linha dos 3 Metros (Ataque) - apenas para quadra indoor */}
          {!isBeach && (
            <>
              <line
                x1="5"
                y1="34"
                x2="95"
                y2="34"
                className={themeStyles.attackLine}
              />
              {/* Linhas de extensão dos 3m fora da quadra */}
              <line x1="0" y1="34" x2="4" y2="34" className="stroke-white/60 stroke-[1.5] stroke-dasharray-[2,2]" />
              <line x1="96" y1="34" x2="100" y2="34" className="stroke-white/60 stroke-[1.5] stroke-dasharray-[2,2]" />
              {/* Rótulo da Linha dos 3m */}
              <text x="50" y="32.5" textAnchor="middle" className="fill-white/50 text-[2.8px] font-bold tracking-widest">
                LINHA DOS 3 METROS (ZONA DE ATAQUE)
              </text>
            </>
          )}

          {/* Divisão de Meia Quadra para Vôlei de Praia */}
          {isBeach && (
            <line
              x1="50"
              y1="2"
              x2="50"
              y2="97"
              className="stroke-blue-500/40 stroke-[1.5] stroke-dasharray-[4,4]"
            />
          )}

          {/* Rótulos das Zonas 1 a 6 com Números Oficiais em Segundo Plano */}
          {showZoneNumbers && !isBeach && (
            <g className={themeStyles.zoneText}>
              {/* Zona 4: Frente Esquerda */}
              <text x="20" y="20" textAnchor="middle" className="text-[12px] font-black opacity-30 select-none">4</text>
              {/* Zona 3: Frente Centro */}
              <text x="50" y="20" textAnchor="middle" className="text-[12px] font-black opacity-30 select-none">3</text>
              {/* Zona 2: Frente Direita */}
              <text x="80" y="20" textAnchor="middle" className="text-[12px] font-black opacity-30 select-none">2</text>
              {/* Zona 5: Fundo Esquerda */}
              <text x="20" y="72" textAnchor="middle" className="text-[12px] font-black opacity-30 select-none">5</text>
              {/* Zona 6: Fundo Centro */}
              <text x="50" y="72" textAnchor="middle" className="text-[12px] font-black opacity-30 select-none">6</text>
              {/* Zona 1: Fundo Direita (Saque) */}
              <text x="80" y="72" textAnchor="middle" className="text-[12px] font-black opacity-30 select-none">1</text>
            </g>
          )}

          {/* Linhas Conectoras de Faltas de Posição (Linhas vermelhas piscantes entre infratores) */}
          {faults.map((fault, idx) => {
            const p1 = players.find((p) => p.id === fault.player1Id);
            const p2 = players.find((p) => p.id === fault.player2Id);
            if (!p1 || !p2) return null;

            return (
              <g key={`fault-line-${idx}`} className="animate-pulse">
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="3,3"
                />
                <circle cx={(p1.x + p2.x) / 2} cy={(p1.y + p2.y) / 2} r="3" fill="#ef4444" />
                <text
                  x={(p1.x + p2.x) / 2}
                  y={(p1.y + p2.y) / 2 - 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  className="text-[3px] font-extrabold fill-red-400 bg-black"
                >
                  ⚠️ FALTA DE POSIÇÃO
                </text>
              </g>
            );
          })}

          {/* A Rede (Topo da Quadra) */}
          <g>
            {/* Faixa Superior da Rede */}
            <rect x="0" y="0" width="100" height="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="0" y1="1.5" x2="100" y2="1.5" stroke="#475569" strokeWidth="0.8" />
            {/* Antenas nas Extremidades (Listradas Vermelho e Branco) */}
            <rect x="5" y="-3" width="1.5" height="7" fill="#ef4444" />
            <rect x="5" y="-1" width="1.5" height="1.5" fill="#ffffff" />
            <rect x="5" y="2" width="1.5" height="1.5" fill="#ffffff" />

            <rect x="93.5" y="-3" width="1.5" height="7" fill="#ef4444" />
            <rect x="93.5" y="-1" width="1.5" height="1.5" fill="#ffffff" />
            <rect x="93.5" y="2" width="1.5" height="1.5" fill="#ffffff" />

            {/* Rótulo da Rede */}
            <text x="50" y="2.2" textAnchor="middle" className="fill-slate-900 text-[2.2px] font-black tracking-widest uppercase">
              REDE (LINHA CENTRAL)
            </text>
          </g>
        </svg>

        {/* Personagens Jogadores de Vôlei com cores e atributos específicos por posição */}
        {players.map((player) => {
          const hasFault = faultPlayerIds.has(player.id);
          const isSelected = selectedPlayerId === player.id;
          const isDragging = activeDraggingId === player.id;

          return (
            <CourtPlayerCharacter
              key={player.id}
              player={player}
              isSelected={isSelected}
              isDragging={isDragging}
              hasFault={hasFault}
              system={system}
              isBeach={isBeach}
              onPointerDown={(e) => handlePointerDown(e, player)}
            />
          );
        })}
      </div>

      {/* Legenda Pedagógica Completa com Personagens e Cores por Posição em Quadra */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold text-slate-700 px-2">
        {isBeach ? (
          <>
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300 text-amber-950 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-400 inline-block shadow-xs" />
              <span>🧱 Bloqueador da Rede (Dourado)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-300 text-sky-950 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-sky-500 border border-sky-400 inline-block shadow-xs" />
              <span>⚡ Defensor de Fundo (Ciano)</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-300 text-amber-950 shadow-xs">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-400 inline-block shadow-xs" />
              <span>🎯 Levantador (Dourado)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-lg border border-blue-300 text-blue-950 shadow-xs">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-blue-400 inline-block shadow-xs" />
              <span>⚡ Ponteiro (Azul Real)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded-lg border border-orange-300 text-orange-950 shadow-xs">
              <span className="w-3.5 h-3.5 rounded-full bg-orange-600 border border-orange-400 inline-block shadow-xs" />
              <span>🧱 Central (Laranja Coral)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-50 px-2 py-1 rounded-lg border border-purple-300 text-purple-950 shadow-xs">
              <span className="w-3.5 h-3.5 rounded-full bg-purple-600 border border-purple-400 inline-block shadow-xs" />
              <span>💥 Oposto (Roxo Púrpura)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-lg border-2 border-emerald-400 text-emerald-950 font-black shadow-xs">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-400 inline-block shadow-xs" />
              <span>🛡️ Líbero (Verde Neon FIVB)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
