import { LearningTrail, Quest, UserProgress, Badge, CourtTheme } from '../types';

export const LEVEL_TITLES: { minLevel: number; title: string; icon: string }[] = [
  { minLevel: 1, title: 'Gandula Aprendiz', icon: '🏐' },
  { minLevel: 5, title: 'Passador de Escola', icon: '⚡' },
  { minLevel: 10, title: 'Levantador de Base', icon: '🎯' },
  { minLevel: 20, title: 'Capitão da Equipe', icon: '🛡️' },
  { minLevel: 30, title: 'Estrategista 5x1', icon: '🧠' },
  { minLevel: 40, title: 'Mestre do Circuito Mundial', icon: '🥇' },
  { minLevel: 50, title: 'Técnico Campeão Olímpico', icon: '🏆' },
];

export function getLevelInfo(xp: number): { level: number; title: string; icon: string; currentLevelXp: number; nextLevelXp: number; progressPercent: number } {
  // 100 XP por nível nos primeiros 10 níveis, depois escala suavemente
  const level = Math.min(50, Math.max(1, Math.floor(xp / 120) + 1));
  const currentLevelXp = (level - 1) * 120;
  const nextLevelXp = level * 120;
  const progressPercent = Math.min(100, Math.max(0, ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));

  let currentTitle = LEVEL_TITLES[0].title;
  let currentIcon = LEVEL_TITLES[0].icon;

  for (const item of LEVEL_TITLES) {
    if (level >= item.minLevel) {
      currentTitle = item.title;
      currentIcon = item.icon;
    }
  }

  return { level, title: currentTitle, icon: currentIcon, currentLevelXp, nextLevelXp, progressPercent };
}

export const BADGES_LIST: Badge[] = [
  {
    id: 'first_step',
    title: 'Primeiro Toque',
    description: 'Completou seu primeiro desafio tático na quadra.',
    icon: '🏐',
    conditionDescription: 'Completar 1 quest qualquer.',
  },
  {
    id: 'muralha_3m',
    title: 'Muralha dos Três Metros',
    description: 'Compreendeu perfeitamente a restrição de ataque dos jogadores da linha de fundo (Posições 1, 6 e 5).',
    icon: '🧱',
    conditionDescription: 'Completar os desafios de Fundamentos & Linha de Ataque.',
  },
  {
    id: 'infiltracao_ninja',
    title: 'Infiltração Ninja',
    description: 'Posicionou o levantador do 5x1 para infiltrar sem cometer falta de posição.',
    icon: '🥷',
    conditionDescription: 'Completar os 3 desafios da Trilha 5x1.',
  },
  {
    id: 'olho_de_aguia',
    title: 'Olho de Águia',
    description: 'Identificou 5 faltas de posição em menos de 10 segundos no modo Blitz.',
    icon: '🦅',
    conditionDescription: 'Superar o modo Blitz com pontuação perfeita.',
  },
  {
    id: 'rei_da_praia',
    title: 'Rei da Praia',
    description: 'Leu 10 sinais de bloqueio de duplas e cobriu a zona de defesa correta.',
    icon: '🏖️',
    conditionDescription: 'Completar todos os cenários da Trilha de Vôlei de Praia.',
  },
  {
    id: 'troca_libero',
    title: 'Mestre das Substituições',
    description: 'Realizou a troca do Líbero pelo Central de fundo respeitando a zona de substituição livre.',
    icon: '🔄',
    conditionDescription: 'Completar a Quest do Líbero.',
  },
];

export const LEARNING_TRAILS: LearningTrail[] = [
  {
    id: 'fundamentals',
    title: 'Trilha 1: Fundamentos & Zonas',
    subtitle: 'O Calouro do Voleibol',
    icon: '🏐',
    description: 'Aprenda a numeração das 6 zonas oficiais, o sentido do rodízio e as regras da linha de 3 metros.',
    quests: [
      {
        id: 'q1_zones_serve',
        trailId: 'fundamentals',
        title: 'Quem sou eu? (Zona do Saque)',
        description: 'No voleibol, o jogador que executa o saque é sempre aquele que se encontra na Posição 1.',
        objective: 'Arraste o jogador selecionado para a Zona 1 (Fundo à Direita) para autorizar o saque.',
        system: '6x0',
        rotation: 1,
        phase: 'reception',
        type: 'drag_target',
        targetZoneRequirement: {
          playerId: 'J1',
          targetZone: 1,
        },
        hint: 'A Zona 1 fica no canto inferior direito da quadra de defesa.',
        pedagogicalTip: 'O rodízio acontece em sentido horário, mas as zonas 1 a 6 são numeradas em sentido anti-horário começando na defesa direita (Posição 1).',
        xpReward: 50,
      },
      {
        id: 'q2_three_meter_rule',
        trailId: 'fundamentals',
        title: 'A Linha dos Três Metros',
        description: 'Os jogadores da linha de fundo (Posições 1, 6 e 5) NÃO podem saltar dentro da zona de ataque (à frente da linha dos 3m) para atacar uma bola acima da borda superior da rede.',
        objective: 'Identifique e posicione o Central e o Ponteiro de fundo atrás da linha tracejada dos 3 metros.',
        system: '6x0',
        rotation: 1,
        phase: 'reception',
        type: 'drag_target',
        targetZoneRequirement: {
          playerId: 'J6',
          targetZone: 6,
        },
        hint: 'A linha dos 3 metros separa a zona de ataque (rede) da zona de defesa (fundo).',
        pedagogicalTip: 'Se um jogador de trás pisar na linha dos 3 metros antes de saltar para atacar, é marcada Falta de Ataque de Fundo.',
        xpReward: 60,
      },
      {
        id: 'q3_clockwise_rotation',
        trailId: 'fundamentals',
        title: 'Sentido Horário do Rodízio',
        description: 'Quando sua equipe ganha o direito de sacar (recupera a posse), todos os jogadores avançam 1 posição no sentido horário (Pos 2 vai para 1, Pos 1 vai para 6, etc.).',
        objective: 'Avance a rotação e observe a transição dos jogadores pelas 6 zonas da quadra.',
        system: '6x0',
        rotation: 2,
        phase: 'reception',
        type: 'drag_target',
        hint: 'Observe como o jogador que estava na Posição 2 agora desce para a Posição 1 para sacar.',
        pedagogicalTip: 'Compreender o sentido horário do rodízio é o primeiro passo para não se perder na quadra durante o jogo.',
        xpReward: 70,
      },
    ],
  },
  {
    id: 'fault_hunter',
    title: 'Trilha 2: Caçador de Faltas',
    subtitle: 'O Olho de Águia',
    icon: '🦅',
    description: 'Treine a visão de árbitro para detectar violações de adjacência antes do golpe do saque.',
    quests: [
      {
        id: 'q4_front_back_fault',
        trailId: 'fault_hunter',
        title: 'Falta na Linha Frente/Trás',
        description: 'Nesta formação, o jogador da Posição 5 ultrapassou o jogador da Posição 4 em direção à rede antes do saque.',
        objective: 'Identifique o erro e arraste o jogador 5 de volta para trás do jogador 4.',
        system: '5x1',
        rotation: 1,
        phase: 'reception',
        type: 'identify_fault',
        isFaultPreset: true,
        faultExplanation: 'O jogador da Posição 5 está mais próximo da rede do que seu par da frente (Posição 4). Isso é FALTA DE POSIÇÃO!',
        hint: 'Verifique se todos os jogadores de trás (5, 6, 1) estão atrás dos seus respectivos pares da frente (4, 3, 2).',
        pedagogicalTip: 'A regra de frente/trás exige que os pés do jogador da frente estejam mais próximos da linha central do que os pés do jogador de trás.',
        xpReward: 80,
      },
      {
        id: 'q5_lateral_fault',
        trailId: 'fault_hunter',
        title: 'Falta Lateral de Inversão',
        description: 'O Central da rede (Pos 3) deslocou-se muito para a esquerda, ultrapassando o Ponta da esquerda (Pos 4) antes do saque.',
        objective: 'Corrija o posicionamento lateral colocando o jogador da Posição 4 à esquerda do jogador da Posição 3.',
        system: '5x1',
        rotation: 1,
        phase: 'reception',
        type: 'identify_fault',
        isFaultPreset: true,
        faultExplanation: 'Posição 4 deve sempre estar mais próxima da linha lateral esquerda do que a Posição 3 no momento do saque.',
        hint: 'Na rede, a ordem obrigatória da esquerda para a direita é: Posição 4 -> Posição 3 -> Posição 2.',
        pedagogicalTip: 'Jogadores podem cruzar a quadra para trocar de posição APENAS DEPOIS que o sacador golpear a bola.',
        xpReward: 90,
      },
      {
        id: 'q6_blitz_time_attack',
        trailId: 'fault_hunter',
        title: 'Modo Time-Attack (Blitz do Apito)',
        description: 'O árbitro vai apitar em 5 segundos! Decida se a formação apresentada é LEGAL ou FALTA DE POSIÇÃO.',
        objective: 'Analise rapidamente as linhas de adjacência e clique no botão correto.',
        system: '5x1',
        rotation: 3,
        phase: 'reception',
        type: 'blitz_decision',
        blitzTimeLimit: 8,
        hint: 'Olhe primeiro se algum jogador de trás está à frente da linha do seu companheiro.',
        pedagogicalTip: 'Em competições oficiais, o segundo árbitro (árbitro de baixo) foca seus olhos exclusivamente nessas linhas imaginárias no momento do apito.',
        xpReward: 120,
      },
    ],
  },
  {
    id: 'tactics_5x1',
    title: 'Trilha 3: Táticas Avançadas (5x1)',
    subtitle: 'O Estrategista das Trocas',
    icon: '🧠',
    description: 'Domine a arte de esconder o levantador na recepção e as infiltrações rápidas.',
    quests: [
      {
        id: 'q7_hide_setter_r1',
        trailId: 'tactics_5x1',
        title: 'Esconda o Levantador no R1',
        description: 'Na Rotação 1 (R1), o levantador não deve receber o saque para poder levantar a bola perfeita.',
        objective: 'Posicione o Levantador na Posição 1 protegido atrás da linha de passe de 3 jogadores (P1, P2 e Líbero).',
        system: '5x1',
        rotation: 1,
        phase: 'reception',
        type: 'drag_target',
        targetZoneRequirement: {
          playerId: 'S',
          targetZone: 1,
        },
        hint: 'O Levantador fica colado atrás do seu companheiro para iniciar a corrida no momento do saque.',
        pedagogicalTip: 'Ao "esconder" o levantador, garantimos que ele não toque na 1ª bola e chegue com facilidade na Zona 2/3.',
        xpReward: 100,
      },
      {
        id: 'q8_infiltration_r4',
        trailId: 'tactics_5x1',
        title: 'A Infiltração Perfeita no R4',
        description: 'Na Rotação 4 (R4), o levantador está na rede na Posição 4 e precisa trocar com o atacante para ir à Posição 2.',
        objective: 'Execute a transição para o Golpe do Saque e veja a troca sincronizada entre Levantador e Ponteiro.',
        system: '5x1',
        rotation: 4,
        phase: 'serve_hit',
        type: 'drag_target',
        hint: 'Avance a fase para o "Golpe do Saque" e acompanhe a linha de infiltração pontilhada.',
        pedagogicalTip: 'As trocas de posição no 5x1 permitem que os atacantes ataquem nas suas zonas favoritas (Ponta na 4, Central na 3, Oposto na 2).',
        xpReward: 110,
      },
      {
        id: 'q9_libero_swap',
        trailId: 'tactics_5x1',
        title: 'Entra o Líbero!',
        description: 'O Líbero é o especialista em defesa e recepção. Ele substitui os Centrais quando estes passam para a linha de fundo.',
        objective: 'Realize a substituição do Central 1 de fundo pelo Líbero na Posição 6/5.',
        system: '5x1',
        rotation: 1,
        phase: 'reception',
        type: 'libero_swap',
        hint: 'A troca do Líbero não conta como substituição oficial e pode ser feita entre os pontos.',
        pedagogicalTip: 'O Líbero veste uniforme com cor contrastante e não pode sacar, bloquear ou atacar acima da rede.',
        xpReward: 120,
      },
    ],
  },
  {
    id: 'beach_master',
    title: 'Trilha 4: Mestre da Areia & Sinais',
    subtitle: 'Leitura de Bloqueio em Duplas',
    icon: '🏖️',
    description: 'Aprenda a linguagem secreta dos dedos nas costas do bloqueador e a cobertura de meia-quadra.',
    quests: [
      {
        id: 'q10_beach_line_signal',
        trailId: 'beach_master',
        title: 'Sinal 1 Dedo: Bloqueio na Linha',
        description: 'O bloqueador na rede sinaliza "1 Dedo" na mão esquerda para o atacante da entrada.',
        objective: 'Se o bloqueio fecha a Linha, arraste o defensor para a DIAGONAL para defender o ataque cruzado.',
        system: 'beach_2x2',
        rotation: 1,
        phase: 'transition',
        type: 'beach_defense',
        hint: 'Bloqueio na linha deixa a diagonal livre para a bola passar. Vá para o lado oposto no fundo!',
        pedagogicalTip: 'No vôlei de praia, o bloqueador protege metade da quadra e a defesa cobre exatamente o restante.',
        xpReward: 100,
      },
      {
        id: 'q11_beach_cross_signal',
        trailId: 'beach_master',
        title: 'Sinal 2 Dedos: Bloqueio na Diagonal',
        description: 'O parceiro faz sinal de "2 Dedos" (V) na mão direita, fechando a diagonal do atacante da saída.',
        objective: 'Como a diagonal está bloqueada, posicione o defensor no corredor da PARALELA/LINHA.',
        system: 'beach_2x2',
        rotation: 1,
        phase: 'transition',
        type: 'beach_defense',
        hint: 'Fique no corredor lateral para pegar a bola reta do atacante.',
        pedagogicalTip: 'O sinal de 2 dedos é muito comum contra atacantes com pancada forte na diagonal.',
        xpReward: 110,
      },
      {
        id: 'q12_beach_wind_tactics',
        trailId: 'beach_master',
        title: 'A Influência do Vento na Areia',
        description: 'O vento sopra forte a favor do adversário, empurrando as pancadas para a linha de fundo.',
        objective: 'Recue 2 passos na defesa para pegar bolas que flutuam no fundo e evite ser encoberto.',
        system: 'beach_2x2',
        rotation: 1,
        phase: 'transition',
        type: 'beach_defense',
        hint: 'Com vento a favor do ataque, a bola viaja com mais velocidade e cai mais longe.',
        pedagogicalTip: 'Grandes duplas mudam os sinais de bloqueio a cada troca de lado de acordo com a direção da brisa.',
        xpReward: 130,
      },
    ],
  },
];

const STORAGE_KEY = 'volei_tatico_user_progress_v2';

export const DEFAULT_USER_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  completedQuests: {},
  unlockedBadges: [],
  selectedTheme: 'taraflex_blue',
  highContrast: false,
  studentName: 'Aluno(a) Atleta',
  schoolName: 'Escola Pública Estadual',
  classCode: 'VOL-TURMA-2026',
};

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USER_PROGRESS, ...parsed };
  } catch (e) {
    console.warn('Erro ao carregar progresso local:', e);
    return DEFAULT_USER_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Erro ao salvar progresso local:', e);
  }
}

export function recordQuestCompletion(
  current: UserProgress,
  questId: string,
  stars: number,
  earnedXp: number
): { updated: UserProgress; newBadges: Badge[]; leveledUp: boolean } {
  const prevLevel = getLevelInfo(current.xp).level;
  const existingQuest = current.completedQuests[questId];
  const oldStars = existingQuest ? existingQuest.stars : 0;
  const isBetter = stars > oldStars;

  const newXp = current.xp + (isBetter ? earnedXp : Math.floor(earnedXp * 0.25));
  const newCompletedQuests = {
    ...current.completedQuests,
    [questId]: {
      stars: Math.max(stars, oldStars),
      timestamp: Date.now(),
    },
  };

  const newBadges: Badge[] = [];
  const currentBadgeIds = new Set(current.unlockedBadges);

  // Checar condições de badges
  const totalCompleted = Object.keys(newCompletedQuests).length;

  if (totalCompleted >= 1 && !currentBadgeIds.has('first_step')) {
    newBadges.push(BADGES_LIST.find((b) => b.id === 'first_step')!);
    currentBadgeIds.add('first_step');
  }

  if (newCompletedQuests['q1_zones_serve'] && newCompletedQuests['q2_three_meter_rule'] && !currentBadgeIds.has('muralha_3m')) {
    newBadges.push(BADGES_LIST.find((b) => b.id === 'muralha_3m')!);
    currentBadgeIds.add('muralha_3m');
  }

  if (newCompletedQuests['q7_hide_setter_r1'] && newCompletedQuests['q8_infiltration_r4'] && !currentBadgeIds.has('infiltracao_ninja')) {
    newBadges.push(BADGES_LIST.find((b) => b.id === 'infiltracao_ninja')!);
    currentBadgeIds.add('infiltracao_ninja');
  }

  if (newCompletedQuests['q6_blitz_time_attack'] && !currentBadgeIds.has('olho_de_aguia')) {
    newBadges.push(BADGES_LIST.find((b) => b.id === 'olho_de_aguia')!);
    currentBadgeIds.add('olho_de_aguia');
  }

  if (newCompletedQuests['q10_beach_line_signal'] && newCompletedQuests['q11_beach_cross_signal'] && !currentBadgeIds.has('rei_da_praia')) {
    newBadges.push(BADGES_LIST.find((b) => b.id === 'rei_da_praia')!);
    currentBadgeIds.add('rei_da_praia');
  }

  if (newCompletedQuests['q9_libero_swap'] && !currentBadgeIds.has('troca_libero')) {
    newBadges.push(BADGES_LIST.find((b) => b.id === 'troca_libero')!);
    currentBadgeIds.add('troca_libero');
  }

  const newLevel = getLevelInfo(newXp).level;
  const leveledUp = newLevel > prevLevel;

  const updated: UserProgress = {
    ...current,
    xp: newXp,
    level: newLevel,
    completedQuests: newCompletedQuests,
    unlockedBadges: Array.from(currentBadgeIds),
  };

  saveUserProgress(updated);
  return { updated, newBadges, leveledUp };
}
