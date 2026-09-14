export type SystemType = '6x0' | '4x2_simple' | '4x2_inversion' | '5x1' | 'beach_2x2';

export type RotationIndex = 1 | 2 | 3 | 4 | 5 | 6;

export type GamePhase = 'reception' | 'serve_hit' | 'transition';

export type PlayerRole = 
  | 'S'    // Levantador (Setter)
  | 'S2'   // Segundo Levantador (em 4x2)
  | 'OP'   // Oposto (Opposite)
  | 'OH1'  // Ponteiro 1 (Outside Hitter 1)
  | 'OH2'  // Ponteiro 2 (Outside Hitter 2)
  | 'MB1'  // Central 1 (Middle Blocker 1)
  | 'MB2'  // Central 2 (Middle Blocker 2)
  | 'L'    // Líbero
  | 'P1'   // Jogador 1 (Praia)
  | 'P2';  // Jogador 2 (Praia)

export interface PlayerPosition {
  id: string;
  role: PlayerRole;
  label: string;
  roleName: string;
  jerseyNumber: number;
  rotationIndex: RotationIndex; // Posição formal de rodízio (1 a 6)
  x: number; // Percentual 0 a 100 da quadra
  y: number; // Percentual 0 a 100 da quadra (0 = rede, 100 = linha de fundo)
  isLibero?: boolean;
  isFrontRow?: boolean;
  highlighted?: boolean;
  hasFault?: boolean;
  faultMessage?: string;
  targetX?: number;
  targetY?: number;
}

export interface PositionalFault {
  player1Id: string;
  player2Id: string;
  player1Label: string;
  player2Label: string;
  type: 'front_back' | 'left_right';
  description: string;
}

export type BeachSignal = 
  | '1_finger'   // Linha / Paralela
  | '2_fingers'  // Diagonal
  | 'open_hand'  // Bola / Leitura
  | 'closed_fist'// Não bloqueia / Recuo
  | 'shade_cut'; // Largada / Cut

export type WindDirection = 'none' | 'favor' | 'against' | 'cross_left' | 'cross_right';

export interface BeachScenario {
  id: string;
  title: string;
  leftHandSignal: BeachSignal;
  rightHandSignal: BeachSignal;
  attackerSide: 'left' | 'right'; // De onde vem o ataque adversário
  wind: WindDirection;
  windExplanation: string;
  correctDefenderZone: 'line' | 'diagonal' | 'center_read' | 'back_double_pull';
  explanation: string;
}

export interface Quest {
  id: string;
  trailId: 'fundamentals' | 'fault_hunter' | 'tactics_5x1' | 'beach_master';
  title: string;
  description: string;
  objective: string;
  system: SystemType;
  rotation: RotationIndex;
  phase: GamePhase;
  type: 'drag_target' | 'identify_fault' | 'blitz_decision' | 'beach_defense' | 'libero_swap';
  initialPlayers?: Partial<PlayerPosition>[];
  targetZoneRequirement?: {
    playerId: string;
    targetZone: number; // 1 a 6
    tolerance?: number;
  };
  blitzTimeLimit?: number; // em segundos
  isFaultPreset?: boolean;
  faultExplanation?: string;
  hint: string;
  pedagogicalTip: string;
  xpReward: number;
}

export interface LearningTrail {
  id: 'fundamentals' | 'fault_hunter' | 'tactics_5x1' | 'beach_master';
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  quests: Quest[];
}

export interface UserProgress {
  xp: number;
  level: number;
  completedQuests: Record<string, { stars: number; highscore?: number; timestamp: number }>;
  unlockedBadges: string[];
  selectedTheme: CourtTheme;
  highContrast: boolean;
  studentName: string;
  schoolName: string;
  classCode: string;
}

export type CourtTheme = 'taraflex_blue' | 'classic_wood' | 'beach_gold' | 'neon_night' | 'high_contrast';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredXp?: number;
  conditionDescription: string;
}

export interface UserAccount {
  id: string;
  username: string;
  displayName: string;
  pin?: string;
  avatar: string;
  role: 'student' | 'teacher' | 'athlete';
  schoolName: string;
  classCode: string;
  progress: UserProgress;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  savedAccounts: UserAccount[];
}
