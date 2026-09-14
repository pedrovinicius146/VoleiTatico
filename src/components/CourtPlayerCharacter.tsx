import React from 'react';
import { PlayerPosition } from '../types';

interface CourtPlayerCharacterProps {
  player: PlayerPosition;
  isSelected?: boolean;
  isDragging?: boolean;
  hasFault?: boolean;
  system?: string;
  isBeach?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
}

// Configuração visual rica e padronizada de cada posição em quadra
export interface PositionVisualConfig {
  roleCode: string;
  roleShort: string;
  roleName: string;
  badgeIcon: string;
  themeColor: string; // Hex principal
  darkColor: string;
  lightColor: string;
  glowColor: string;
  borderClass: string;
  badgeBgClass: string;
  textClass: string;
  description: string;
}

export const getPositionConfig = (player: PlayerPosition, isBeach = false): PositionVisualConfig => {
  const isLibero = player.isLibero || player.role === 'L';

  if (isBeach) {
    if (player.id === 'BLOQ' || player.label === 'BLOQ' || player.id === 'b1') {
      return {
        roleCode: 'BLOQ',
        roleShort: 'BLOQ',
        roleName: 'Bloqueador (Rede)',
        badgeIcon: '🧱',
        themeColor: '#f59e0b',
        darkColor: '#b45309',
        lightColor: '#fef3c7',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        borderClass: 'border-amber-400',
        badgeBgClass: 'bg-amber-500',
        textClass: 'text-amber-950',
        description: 'Jogador da rede especializado em leitura de ataque e bloqueio.',
      };
    }
    return {
      roleCode: 'DEF',
      roleShort: 'DEF',
      roleName: 'Defensor (Fundo)',
      badgeIcon: '⚡',
      themeColor: '#0284c7',
      darkColor: '#0369a1',
      lightColor: '#e0f2fe',
      glowColor: 'rgba(2, 132, 199, 0.4)',
      borderClass: 'border-sky-400',
      badgeBgClass: 'bg-sky-500',
      textClass: 'text-sky-950',
      description: 'Jogador veloz de fundo de quadra com cobertura e contra-ataque.',
    };
  }

  // Líbero: Uniforme regulamentar obrigatório com cor de contraste (FIVB)
  if (isLibero) {
    return {
      roleCode: 'LIB',
      roleShort: 'LIB',
      roleName: 'Líbero Especialista',
      badgeIcon: '🛡️',
      themeColor: '#10b981', // Verde Neon / Esmeralda Elétrico de Alto Contraste
      darkColor: '#047857',
      lightColor: '#d1fae5',
      glowColor: 'rgba(16, 185, 129, 0.5)',
      borderClass: 'border-emerald-400',
      badgeBgClass: 'bg-emerald-500',
      textClass: 'text-emerald-950',
      description: 'Especialista defensivo e recepção; cor de contraste oficial FIVB.',
    };
  }

  // Levantador (S / S2)
  if (player.role === 'S' || player.role === 'S2') {
    return {
      roleCode: 'LEV',
      roleShort: 'LEV',
      roleName: 'Levantador (Cérebro)',
      badgeIcon: '🎯',
      themeColor: '#f59e0b', // Dourado Ouro Olímpico
      darkColor: '#b45309',
      lightColor: '#fef3c7',
      glowColor: 'rgba(245, 158, 11, 0.5)',
      borderClass: 'border-amber-400',
      badgeBgClass: 'bg-amber-500',
      textClass: 'text-amber-950',
      description: 'O maestro e distribuidor das jogadas ofensivas.',
    };
  }

  // Oposto (OP)
  if (player.role === 'OP') {
    return {
      roleCode: 'OP',
      roleShort: 'OP',
      roleName: 'Oposto (Canhão)',
      badgeIcon: '💥',
      themeColor: '#9333ea', // Roxo / Púrpura Poderoso
      darkColor: '#6b21a8',
      lightColor: '#f3e8ff',
      glowColor: 'rgba(147, 51, 234, 0.45)',
      borderClass: 'border-purple-400',
      badgeBgClass: 'bg-purple-600',
      textClass: 'text-purple-950',
      description: 'Principal atacante de segurança e força nas bolas altas de saída.',
    };
  }

  // Centrais (MB1, MB2)
  if (player.role === 'MB1' || player.role === 'MB2') {
    return {
      roleCode: 'CEN',
      roleShort: 'CEN',
      roleName: 'Central / Meio-de-Rede',
      badgeIcon: '🧱',
      themeColor: '#ea580c', // Laranja Coral Intenso
      darkColor: '#c2410c',
      lightColor: '#ffedd5',
      glowColor: 'rgba(234, 88, 12, 0.45)',
      borderClass: 'border-orange-400',
      badgeBgClass: 'bg-orange-600',
      textClass: 'text-orange-950',
      description: 'O paredão do bloqueio duplo e ataque rápido de 1º tempo.',
    };
  }

  // Ponteiros / Entradas (OH1, OH2 / P1, P2)
  return {
    roleCode: 'PON',
    roleShort: 'PON',
    roleName: 'Ponteiro Passador',
    badgeIcon: '⚡',
    themeColor: '#2563eb', // Azul Real Clássico
    darkColor: '#1d4ed8',
    lightColor: '#dbeafe',
    glowColor: 'rgba(37, 99, 235, 0.45)',
    borderClass: 'border-blue-400',
    badgeBgClass: 'bg-blue-600',
    textClass: 'text-blue-950',
    description: 'Atacante de ponta (entrada de rede) e pilar de passe de recepção.',
  };
};

export const CourtPlayerCharacter: React.FC<CourtPlayerCharacterProps> = ({
  player,
  isSelected = false,
  isDragging = false,
  hasFault = false,
  system = '6x0',
  isBeach = false,
  onPointerDown,
}) => {
  const config = getPositionConfig(player, isBeach);
  const isLibero = player.isLibero || player.role === 'L';
  const jerseyNum = player.jerseyNumber || player.rotationIndex || 1;

  // Lógica 5x1: quem passa vs quem cobre
  const is5x1Passer = isLibero || player.role === 'OH1' || player.role === 'OH2' || player.role === 'P1' || player.role === 'P2';

  return (
    <div
      id={`player-${player.id}`}
      onPointerDown={onPointerDown}
      style={{
        left: `${player.x}%`,
        top: `${player.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      className={`absolute select-none touch-none z-10 flex flex-col items-center group ${
        isDragging
          ? 'scale-125 z-40 drop-shadow-2xl cursor-grabbing transition-none'
          : 'hover:scale-110 cursor-grab transition-transform'
      }`}
    >
      {/* Indicador de Falta de Posição Superior */}
      {hasFault && (
        <div className="absolute -top-7 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-lg animate-bounce z-30 flex items-center gap-0.5 whitespace-nowrap">
          <span>⚠️</span> FALTA DE POSIÇÃO!
        </div>
      )}

      {/* Destaque Regulamentar de Líbero */}
      {isLibero && !hasFault && (
        <div className="absolute -top-6 bg-emerald-500 text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-300 shadow-md flex items-center gap-1 whitespace-nowrap z-20">
          <span>🛡️</span> LÍBERO (FIVB)
        </div>
      )}

      {/* Container do Personagem Atleta */}
      <div className="relative flex flex-col items-center">
        {/* Sombra de Contato com o Piso da Quadra */}
        <div
          className={`w-10 h-3 rounded-full bg-slate-950/30 blur-xs transition-all absolute -bottom-1 ${
            isDragging ? 'scale-150 opacity-40 translate-y-3' : 'scale-100 opacity-60'
          }`}
        />

        {/* Aura de Seleção / Foco Tático */}
        {isSelected && (
          <div
            className="absolute inset-0 -m-2 rounded-2xl ring-4 ring-yellow-400 ring-offset-2 ring-offset-transparent animate-pulse pointer-events-none"
            style={{ filter: `drop-shadow(0 0 8px ${config.glowColor})` }}
          />
        )}

        {/* Ilustração Vetorial Completa do Personagem Jogador de Vôlei */}
        <svg
          viewBox="0 0 54 62"
          className={`w-13 h-15 sm:w-15 sm:h-17 transition-all filter drop-shadow-md ${
            hasFault ? 'ring-4 ring-rose-500 rounded-2xl bg-rose-500/20' : ''
          }`}
        >
          <defs>
            {/* Gradiente da Camisa de acordo com a posição */}
            <linearGradient id={`jersey-grad-${player.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.themeColor} />
              <stop offset="100%" stopColor={config.darkColor} />
            </linearGradient>

            {/* Gradiente do Cabelo */}
            <linearGradient id="hair-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Gradiente da Pele */}
            <linearGradient id="skin-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fdba74" />
            </linearGradient>
          </defs>

          {/* Braços Prontos para Toque / Manchete / Bloqueio */}
          <g>
            {/* Braço Esquerdo */}
            <path
              d="M 12 28 C 7 32, 6 42, 10 46"
              stroke="url(#skin-grad)"
              strokeWidth="4.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Munhequeira Esquerda */}
            <path
              d="M 9 37 C 8 39, 8 41, 10 42"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Braço Direito */}
            <path
              d="M 42 28 C 47 32, 48 42, 44 46"
              stroke="url(#skin-grad)"
              strokeWidth="4.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Munhequeira Direita */}
            <path
              d="M 45 37 C 46 39, 46 41, 44 42"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Pernas e Shorts Esportivos */}
          <g>
            {/* Pernas do Atleta */}
            <rect x="19" y="47" width="5" height="11" rx="2.5" fill="url(#skin-grad)" />
            <rect x="30" y="47" width="5" height="11" rx="2.5" fill="url(#skin-grad)" />

            {/* Joelheiras Oficiais de Vôlei */}
            <rect x="18" y="50" width="7" height="6" rx="2" fill="#1e293b" />
            <rect x="29" y="50" width="7" height="6" rx="2" fill="#1e293b" />
            <rect x="19.5" y="52" width="4" height="2" rx="1" fill="#cbd5e1" />
            <rect x="30.5" y="52" width="4" height="2" rx="1" fill="#cbd5e1" />

            {/* Calção / Shorts do Uniforme */}
            <path
              d="M 16 41 L 38 41 L 37 49 L 29 49 L 27 45 L 25 49 L 17 49 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="0.8"
            />
            {/* Faixa lateral do calção com a cor da posição */}
            <line x1="17" y1="42" x2="18" y2="48" stroke={config.themeColor} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="37" y1="42" x2="36" y2="48" stroke={config.themeColor} strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Tronco / Regata de Vôlei na Cor Oficial da Posição */}
          <g>
            <path
              d="M 15 25 Q 12 28, 14 42 L 40 42 Q 42 28, 39 25 Q 33 28, 27 28 Q 21 28, 15 25 Z"
              fill={`url(#jersey-grad-${player.id})`}
              stroke="#0f172a"
              strokeWidth="1"
            />
            {/* Gola da Camisa */}
            <path
              d="M 22 25 Q 27 29, 32 25"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Detalhes de Costura / Listras Esportivas */}
            <path
              d="M 16 32 L 20 42"
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.75"
              strokeLinecap="round"
            />
            <path
              d="M 38 32 L 34 42"
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.75"
              strokeLinecap="round"
            />

            {/* Número Oficial da Camisa no Peito */}
            <circle cx="27" cy="34.5" r="5.5" fill="#ffffff" opacity="0.95" />
            <text
              x="27"
              y="37"
              textAnchor="middle"
              className="font-black text-[7px]"
              fill={config.darkColor}
            >
              {jerseyNum}
            </text>
          </g>

          {/* Cabeça, Rosto e Cabelo do Atleta */}
          <g>
            {/* Pescoço */}
            <rect x="24.5" y="21" width="5" height="5" fill="url(#skin-grad)" />

            {/* Orelhas */}
            <circle cx="17.5" cy="16" r="2.2" fill="url(#skin-grad)" />
            <circle cx="36.5" cy="16" r="2.2" fill="url(#skin-grad)" />

            {/* Rosto */}
            <ellipse cx="27" cy="15.5" rx="9" ry="9.5" fill="url(#skin-grad)" />

            {/* Cabelo Traseiro e Corte Esportivo */}
            <path
              d="M 18 13 C 17 6, 37 6, 36 13 C 37 8, 35 3, 27 3 C 19 3, 17 8, 18 13 Z"
              fill="url(#hair-grad)"
            />

            {/* Faixa de Cabeça Esportiva (Headband) na Cor da Posição */}
            <path
              d="M 18 11.5 Q 27 13.5, 36 11.5 L 36.2 9.5 Q 27 11.5, 17.8 9.5 Z"
              fill={config.themeColor}
              stroke="#ffffff"
              strokeWidth="0.8"
            />

            {/* Franja / Cabelo Frontal */}
            <path
              d="M 19 9 Q 24 6, 27 9 Q 31 6, 35 9 Q 33 6, 27 5 Q 21 6, 19 9 Z"
              fill="url(#hair-grad)"
            />

            {/* Olhos Focados no Jogo */}
            <ellipse cx="23.5" cy="15.5" rx="1.2" ry="1.6" fill="#0f172a" />
            <ellipse cx="30.5" cy="15.5" rx="1.2" ry="1.6" fill="#0f172a" />
            <circle cx="23.2" cy="15" r="0.5" fill="#ffffff" />
            <circle cx="30.2" cy="15" r="0.5" fill="#ffffff" />

            {/* Sobrancelhas Esportivas */}
            <path d="M 21.5 13 Q 24 12.5, 25.5 13.5" stroke="#0f172a" strokeWidth="0.8" fill="none" />
            <path d="M 32.5 13.5 Q 30 12.5, 28.5 13.5" stroke="#0f172a" strokeWidth="0.8" fill="none" />

            {/* Nariz e Sorriso Confiante */}
            <path d="M 27 16.5 L 26.5 18 L 27.5 18" stroke="#ea580c" strokeWidth="0.6" fill="none" />
            <path d="M 24.5 20 Q 27 22, 29.5 20" stroke="#b45309" strokeWidth="0.9" fill="none" strokeLinecap="round" />
          </g>

          {/* Mini Distintivo da Função (Ex: LEV, PON, CEN, OP, LIB) */}
          <g transform="translate(14, 53)">
            <rect
              x="0"
              y="0"
              width="26"
              height="8"
              rx="4"
              fill="#0f172a"
              stroke={config.themeColor}
              strokeWidth="1.2"
            />
            <text
              x="13"
              y="6"
              textAnchor="middle"
              className="font-black text-[5.5px] fill-white tracking-wider"
            >
              {config.roleShort}
            </text>
          </g>
        </svg>

        {/* Tag Flutuante de Posição de Rodízio Oficial (P1 a P6) no Ombro */}
        {!isBeach && (
          <div
            className="absolute -top-1.5 -right-1.5 bg-slate-950 text-amber-300 text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-full border-2 border-amber-400 shadow-md z-20 flex items-center justify-center"
            title={`Posição de Rodízio P${player.rotationIndex}`}
          >
            P{player.rotationIndex}
          </div>
        )}
      </div>

      {/* Rótulo Didático Inferior com Nome da Posição e Cor */}
      <div className="mt-1 flex flex-col items-center gap-0.5 pointer-events-none">
        <span
          className="text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-md border flex items-center gap-1 whitespace-nowrap"
          style={{ backgroundColor: config.darkColor, borderColor: config.themeColor }}
        >
          <span>{config.badgeIcon}</span>
          <span>{config.roleName.split(' ')[0]}</span>
        </span>

        {/* Em 5x1: Tag de Função (Passe vs Cobertura) */}
        {system === '5x1' && (
          <span
            className={`text-[8px] font-black px-1.5 py-0.2 rounded shadow-xs whitespace-nowrap ${
              is5x1Passer
                ? 'bg-emerald-600 text-white border border-emerald-400'
                : 'bg-slate-900 text-slate-300 border border-slate-700'
            }`}
          >
            {is5x1Passer ? '📥 PASSE' : '🚫 COBERTURA'}
          </span>
        )}
      </div>
    </div>
  );
};
