import { SystemType, RotationIndex, GamePhase, PlayerPosition, BeachSignal } from '../types';

export interface SystemInfo {
  id: SystemType;
  name: string;
  shortDesc: string;
  pedagogicalFocus: string;
  logic: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  playersCount: number;
}

export const SYSTEMS_CATALOG: SystemInfo[] = [
  {
    id: '6x0',
    name: 'Sistema 6x0 (Básico)',
    shortDesc: 'Todos atacam, todos defendem e quem estiver na Posição 3/2 levanta.',
    pedagogicalFocus: 'Iniciação esportiva, compreensão de rodízio e ocupação de espaço sem especialização precoce.',
    logic: 'Não há funções fixas. O jogador que no rodízio ocupa a rede central (Posição 3) atua como levantador da jogada.',
    difficulty: 'Iniciante',
    playersCount: 6,
  },
  {
    id: '4x2_simple',
    name: 'Sistema 4x2 Simples',
    shortDesc: '2 Levantadores opostos e 4 Atacantes. O levantador da rede distribui.',
    pedagogicalFocus: 'Introdução à especialização de funções sem a complexidade de infiltrações do fundo.',
    logic: 'Os dois levantadores ficam em posições opostas no rodízio (ex: P1 e P4). O que estiver na rede (Posição 3 ou 2) sempre levanta.',
    difficulty: 'Intermediário',
    playersCount: 6,
  },
  {
    id: '4x2_inversion',
    name: 'Sistema 4x2 Invertido (com Infiltração)',
    shortDesc: 'Levantador do fundo infiltra na rede, mantendo 3 atacantes sempre prontos.',
    pedagogicalFocus: 'Domínio do tempo de infiltração após o saque adversário e ataques pelas 3 zonas da rede.',
    logic: 'O levantador que está no fundo de quadra infiltra para a rede logo após o golpe do saque, liberando os 3 jogadores da frente para o ataque.',
    difficulty: 'Intermediário',
    playersCount: 6,
  },
  {
    id: '5x1',
    name: 'Sistema 5x1 (Avançado)',
    shortDesc: '1 Levantador, 1 Oposto, 2 Centrais, 2 Ponteiros e Líbero.',
    pedagogicalFocus: 'Compreensão de infiltrações em 3 posições do rodízio, trocas táticas e regra do Líbero.',
    logic: 'O único levantador distribui em todas as rotações. Quando está no fundo, infiltra mantendo 3 atacantes. O Líbero substitui o central de fundo.',
    difficulty: 'Avançado',
    playersCount: 6,
  },
  {
    id: 'beach_2x2',
    name: 'Vôlei de Praia (Duplas 2x2)',
    shortDesc: '2 Jogadores, alternância de saque, sinais de bloqueio e cobertura de meia-quadra.',
    pedagogicalFocus: 'Comunicação não-verbal (sinais de mão), leitura de vento e posicionamento complementar bloqueio/defesa.',
    logic: 'Sem posições formais fixas, mas com alternância rigorosa de sacador. Divisão da quadra em cunha ou paralelas.',
    difficulty: 'Intermediário',
    playersCount: 2,
  },
];

// Mapeamento das zonas oficiais de vôlei (centro de cada zona em percentuais X: 0-100, Y: 0-100)
// Rede fica em Y = 0; Linha de fundo fica em Y = 100
// Linha dos 3m fica aproximadamente em Y = 33
export const COURT_ZONES_COORDINATES: Record<number, { x: number; y: number; name: string; isFront: boolean }> = {
  4: { x: 20, y: 18, name: 'Posição 4 (Entrada de Rede / Ponta Esquerda)', isFront: true },
  3: { x: 50, y: 18, name: 'Posição 3 (Centro da Rede / Ataque Rápido)', isFront: true },
  2: { x: 80, y: 18, name: 'Posição 2 (Saída de Rede / Ponta Direita)', isFront: true },
  5: { x: 20, y: 75, name: 'Posição 5 (Defesa Esquerda)', isFront: false },
  6: { x: 50, y: 75, name: 'Posição 6 (Defesa Central / Fundo)', isFront: false },
  1: { x: 80, y: 75, name: 'Posição 1 (Saque / Defesa Direita)', isFront: false },
};

// Dados completos de posicionamento para cada Sistema, Rotação e Fase
export const TACTICAL_FORMATIONS: Record<
  SystemType,
  Record<
    RotationIndex,
    Record<GamePhase, { players: PlayerPosition[]; pedagogicalTip: string }>
  >
> = {
  // ==========================
  // SISTEMA 5x1
  // ==========================
  '5x1': {
    1: {
      // R1: Levantador na P1 (Fundo/Saque)
      reception: {
        pedagogicalTip: 'R1 Recepção do Saque: APENAS os Ponteiros (P1 e P2) e o Líbero (LIB) realizam o passe em W/U de 3 passadores. O Levantador (P1) fica escondido no fundo à direita para infiltrar na Posição 2/3. O Central 2 (P3) e o Oposto (P4) NÃO passam: ficam colados à rede para preparar o ataque e a cobertura do bloqueio.',
        players: [
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Não Passa / Infiltração)', jerseyNumber: 1, rotationIndex: 1, x: 82, y: 78, isFrontRow: false },
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Passador / Defesa)', jerseyNumber: 10, rotationIndex: 6, x: 50, y: 82, isLibero: true, isFrontRow: false },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Passador Principal)', jerseyNumber: 7, rotationIndex: 5, x: 22, y: 78, isFrontRow: false },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Não Passa / Ataque Rede)', jerseyNumber: 9, rotationIndex: 4, x: 18, y: 28, isFrontRow: true },
          { id: 'MB2', role: 'MB2', label: 'C2', roleName: 'Central 2 (Não Passa / Meio)', jerseyNumber: 11, rotationIndex: 3, x: 48, y: 22, isFrontRow: true },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Passador / Rede)', jerseyNumber: 14, rotationIndex: 2, x: 78, y: 28, isFrontRow: true },
        ],
      },
      serve_hit: {
        pedagogicalTip: 'R1 Golpe do Saque: No instante do apito/saque adversário, o Levantador infiltra em velocidade para a Posição 2/3 na rede. O Central 2 salta para a bola rápida de 1º tempo enquanto o Oposto e Ponteiro preparam a passada de ataque.',
        players: [
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Infiltrando na Rede)', jerseyNumber: 1, rotationIndex: 1, x: 72, y: 15, isFrontRow: false, highlighted: true },
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Cobriu Passe / Apoio)', jerseyNumber: 10, rotationIndex: 6, x: 50, y: 76, isLibero: true, isFrontRow: false },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Passou / Prepara Ataque)', jerseyNumber: 7, rotationIndex: 5, x: 25, y: 72, isFrontRow: false },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Ataque Entrada/Saída)', jerseyNumber: 9, rotationIndex: 4, x: 20, y: 16, isFrontRow: true },
          { id: 'MB2', role: 'MB2', label: 'C2', roleName: 'Central 2 (Ataque Rápido 1º Tempo)', jerseyNumber: 11, rotationIndex: 3, x: 48, y: 14, isFrontRow: true },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Ataque Ponta)', jerseyNumber: 14, rotationIndex: 2, x: 82, y: 22, isFrontRow: true },
        ],
      },
      transition: {
        pedagogicalTip: 'R1 Transição e Cobertura de Ataque: Levantador distribui para o Ponta (Pos 4), Central (Pos 3) ou Oposto (Pos 2). Após levantar, o Levantador, o Central e o Líbero fecham o arco de COBERTURA próximo ao atacante para recuperar tocos do bloqueio.',
        players: [
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Distribuição / Cobertura 1ª)', jerseyNumber: 1, rotationIndex: 1, x: 74, y: 12, isFrontRow: false },
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Cobertura Defesa / Fundo)', jerseyNumber: 10, rotationIndex: 6, x: 50, y: 70, isLibero: true, isFrontRow: false },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Ataque Fundo / Cobertura)', jerseyNumber: 7, rotationIndex: 5, x: 22, y: 65, isFrontRow: false },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Ataque Saída Pos 2)', jerseyNumber: 9, rotationIndex: 4, x: 82, y: 14, isFrontRow: true },
          { id: 'MB2', role: 'MB2', label: 'C2', roleName: 'Central 2 (Ataque Meio / Cobertura Toco)', jerseyNumber: 11, rotationIndex: 3, x: 50, y: 12, isFrontRow: true },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Ataque Entrada Pos 4)', jerseyNumber: 14, rotationIndex: 2, x: 18, y: 14, isFrontRow: true },
        ],
      },
    },
    2: {
      // R2: Levantador na P6 (Fundo Central)
      reception: {
        pedagogicalTip: 'R2 Recepção do Saque: Apenas os Ponteiros (P1 e P2) e o Líbero (LIB) passam. O Levantador (P6) fica no centro do fundo protegido atrás dos passadores. O Oposto (P3) e Central 2 (P2) na rede NÃO passam: ficam na linha dos 3m prontos para atacar e cobrir.',
        players: [
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Passador Fundo)', jerseyNumber: 14, rotationIndex: 1, x: 78, y: 78, isFrontRow: false },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Não Passa / Infiltra P6)', jerseyNumber: 1, rotationIndex: 6, x: 50, y: 76, isFrontRow: false },
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Passador / Substitui C1)', jerseyNumber: 10, rotationIndex: 5, x: 22, y: 78, isLibero: true, isFrontRow: false },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Passador / Rede)', jerseyNumber: 7, rotationIndex: 4, x: 20, y: 28, isFrontRow: true },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Não Passa / Ataque Meio/Saída)', jerseyNumber: 9, rotationIndex: 3, x: 48, y: 22, isFrontRow: true },
          { id: 'MB2', role: 'MB2', label: 'C2', roleName: 'Central 2 (Não Passa / Bloqueio)', jerseyNumber: 11, rotationIndex: 2, x: 78, y: 28, isFrontRow: true },
        ],
      },
      serve_hit: {
        pedagogicalTip: 'R2 Golpe do Saque: O Levantador corre da Posição 6 em direção à rede pelo corredor direito. O Central 2 e Oposto abrem o leque ofensivo na rede.',
        players: [
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Passou / Cobertura)', jerseyNumber: 14, rotationIndex: 1, x: 76, y: 72, isFrontRow: false },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Infiltrando da 6)', jerseyNumber: 1, rotationIndex: 6, x: 72, y: 15, isFrontRow: false, highlighted: true },
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Defesa de Fundo)', jerseyNumber: 10, rotationIndex: 5, x: 28, y: 74, isLibero: true, isFrontRow: false },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Ataque Entrada)', jerseyNumber: 7, rotationIndex: 4, x: 18, y: 15, isFrontRow: true },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Desloca para Saída Pos 2)', jerseyNumber: 9, rotationIndex: 3, x: 80, y: 15, isFrontRow: true },
          { id: 'MB2', role: 'MB2', label: 'C2', roleName: 'Central 2 (Ataque Meio 1º Tempo)', jerseyNumber: 11, rotationIndex: 2, x: 48, y: 12, isFrontRow: true },
        ],
      },
      transition: {
        pedagogicalTip: 'R2 Transição e Cobertura: Especialização consolidada com Ponteiro na 4, Central na 3 e Oposto na 2. Quando o atacante golpeia, os jogadores que não receberam a bola fecham o círculo de apoio/cobertura ao ataque.',
        players: [
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Ataque Fundo / Cobertura)', jerseyNumber: 14, rotationIndex: 1, x: 78, y: 68, isFrontRow: false },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Levantamento / Cobertura)', jerseyNumber: 1, rotationIndex: 6, x: 74, y: 12, isFrontRow: false },
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Defesa Fundo Centro)', jerseyNumber: 10, rotationIndex: 5, x: 48, y: 72, isLibero: true, isFrontRow: false },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Ataque Pos 4)', jerseyNumber: 7, rotationIndex: 4, x: 18, y: 14, isFrontRow: true },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Ataque Pos 2)', jerseyNumber: 9, rotationIndex: 3, x: 82, y: 14, isFrontRow: true },
          { id: 'MB2', role: 'MB2', label: 'C2', roleName: 'Central 2 (Ataque Pos 3 / Cobertura)', jerseyNumber: 11, rotationIndex: 2, x: 50, y: 12, isFrontRow: true },
        ],
      },
    },
    3: {
      // R3: Levantador na P5 (Fundo Esquerdo)
      reception: {
        pedagogicalTip: 'R3 Recepção do Saque: Apenas P1, P2 e Líbero (LIB) passam! O Levantador (P5) fica na esquerda do fundo protegido para não tocar no passe. O Central 1 (P4) e o Oposto (P2) na rede NÃO passam: Central prepara a bola rápida e Oposto prepara o contra-ataque.',
        players: [
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Passador / Substitui C2)', jerseyNumber: 10, rotationIndex: 1, x: 78, y: 78, isLibero: true, isFrontRow: false },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Passador Fundo)', jerseyNumber: 14, rotationIndex: 6, x: 50, y: 78, isFrontRow: false },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Não Passa / Infiltra P5)', jerseyNumber: 1, rotationIndex: 5, x: 20, y: 76, isFrontRow: false },
          { id: 'MB1', role: 'MB1', label: 'C1', roleName: 'Central 1 (Não Passa / Rede)', jerseyNumber: 3, rotationIndex: 4, x: 22, y: 26, isFrontRow: true },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Passador / Rede)', jerseyNumber: 7, rotationIndex: 3, x: 48, y: 24, isFrontRow: true },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Não Passa / Ataque Saída)', jerseyNumber: 9, rotationIndex: 2, x: 80, y: 26, isFrontRow: true },
        ],
      },
      serve_hit: {
        pedagogicalTip: 'R3 Golpe do Saque: O Levantador realiza uma longa infiltração cruzando por trás dos passadores até a Zona 2/3. Central 1 cruza para o meio e Ponteiro 1 abre para a entrada.',
        players: [
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Passou / Defesa Fundo)', jerseyNumber: 10, rotationIndex: 1, x: 78, y: 72, isLibero: true, isFrontRow: false },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Passou / Fundo)', jerseyNumber: 14, rotationIndex: 6, x: 50, y: 74, isFrontRow: false },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Infiltração Longa)', jerseyNumber: 1, rotationIndex: 5, x: 72, y: 15, isFrontRow: false, highlighted: true },
          { id: 'MB1', role: 'MB1', label: 'C1', roleName: 'Central 1 (Desloca para Meio Pos 3)', jerseyNumber: 3, rotationIndex: 4, x: 50, y: 12, isFrontRow: true },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Abre para Entrada Pos 4)', jerseyNumber: 7, rotationIndex: 3, x: 18, y: 15, isFrontRow: true },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Posicionado na Saída Pos 2)', jerseyNumber: 9, rotationIndex: 2, x: 82, y: 15, isFrontRow: true },
        ],
      },
      transition: {
        pedagogicalTip: 'R3 Transição e Cobertura: Central na 3, Ponta na 4 e Oposto na 2. Central e Oposto realizam cobertura rápida junto à rede para assegurar o rebote de qualquer bloqueio adversário.',
        players: [
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Defesa Fundo Direita)', jerseyNumber: 10, rotationIndex: 1, x: 78, y: 70, isLibero: true, isFrontRow: false },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Ataque Fundo / Cobertura)', jerseyNumber: 14, rotationIndex: 6, x: 48, y: 70, isFrontRow: false },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Armação / Cobertura)', jerseyNumber: 1, rotationIndex: 5, x: 74, y: 12, isFrontRow: false },
          { id: 'MB1', role: 'MB1', label: 'C1', roleName: 'Central 1 (Ataque Pos 3 / Cobertura)', jerseyNumber: 3, rotationIndex: 4, x: 50, y: 12, isFrontRow: true },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Ataque Pos 4)', jerseyNumber: 7, rotationIndex: 3, x: 18, y: 14, isFrontRow: true },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Ataque Pos 2 / Cobertura)', jerseyNumber: 9, rotationIndex: 2, x: 82, y: 14, isFrontRow: true },
        ],
      },
    },
    4: {
      // R4: Levantador na P4 (Entrada de Rede)
      reception: {
        pedagogicalTip: 'R4 Recepção do Saque: O Levantador agora está na REDE (P4) e NÃO passa o saque! O Oposto (P1 no fundo) também NÃO passa (fica escondido atrás do passador). Apenas P1, P2 e o Líbero (LIB na 6) executam o passe.',
        players: [
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Não Passa / Fundo Escondido)', jerseyNumber: 9, rotationIndex: 1, x: 78, y: 78, isFrontRow: false },
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Passador / Substitui C2)', jerseyNumber: 10, rotationIndex: 6, x: 50, y: 82, isLibero: true, isFrontRow: false },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Passador Fundo)', jerseyNumber: 14, rotationIndex: 5, x: 22, y: 78, isFrontRow: false },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Não Passa / Na Rede Pos 4)', jerseyNumber: 1, rotationIndex: 4, x: 22, y: 18, isFrontRow: true },
          { id: 'MB1', role: 'MB1', label: 'C1', roleName: 'Central 1 (Não Passa / Meio Pos 3)', jerseyNumber: 3, rotationIndex: 3, x: 50, y: 22, isFrontRow: true },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Passador / Recuado)', jerseyNumber: 7, rotationIndex: 2, x: 78, y: 28, isFrontRow: true },
        ],
      },
      serve_hit: {
        pedagogicalTip: 'R4 Golpe do Saque: O Levantador corre da P4 para a P2 na rede para levantar. O Ponteiro 1 troca com o Levantador indo para a P4, e o Oposto se prepara para o ataque do fundo (pipe/saída).',
        players: [
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Prepara Ataque Fundo)', jerseyNumber: 9, rotationIndex: 1, x: 78, y: 70, isFrontRow: false },
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Passou / Defesa Fundo)', jerseyNumber: 10, rotationIndex: 6, x: 50, y: 76, isLibero: true, isFrontRow: false },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Passou / Cobertura)', jerseyNumber: 14, rotationIndex: 5, x: 22, y: 72, isFrontRow: false },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Troca P4 -> P2 na Rede)', jerseyNumber: 1, rotationIndex: 4, x: 74, y: 12, isFrontRow: true, highlighted: true },
          { id: 'MB1', role: 'MB1', label: 'C1', roleName: 'Central 1 (Ataque Meio 1º Tempo)', jerseyNumber: 3, rotationIndex: 3, x: 50, y: 12, isFrontRow: true },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Troca P2 -> P4 Entrada)', jerseyNumber: 7, rotationIndex: 2, x: 20, y: 14, isFrontRow: true },
        ],
      },
      transition: {
        pedagogicalTip: 'R4 Transição e Cobertura: O Levantador agora na rede pode fintar ou atacar de 2ª intenção. Oposto ataca do fundo (trás da linha dos 3m) enquanto Ponteiro 2 e Central fazem a cobertura do bloqueio.',
        players: [
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Ataque Fundo Pipe / Trás 3m)', jerseyNumber: 9, rotationIndex: 1, x: 80, y: 65, isFrontRow: false },
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Defesa Fundo Centro)', jerseyNumber: 10, rotationIndex: 6, x: 50, y: 70, isLibero: true, isFrontRow: false },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Ataque Fundo / Cobertura)', jerseyNumber: 14, rotationIndex: 5, x: 20, y: 65, isFrontRow: false },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Armação / Ataque 2ª Intenção)', jerseyNumber: 1, rotationIndex: 4, x: 74, y: 12, isFrontRow: true },
          { id: 'MB1', role: 'MB1', label: 'C1', roleName: 'Central 1 (Ataque Pos 3 / Cobertura)', jerseyNumber: 3, rotationIndex: 3, x: 50, y: 12, isFrontRow: true },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Ataque Pos 4)', jerseyNumber: 7, rotationIndex: 2, x: 18, y: 14, isFrontRow: true },
        ],
      },
    },
    5: {
      // R5: Levantador na P3 (Centro da Rede)
      reception: {
        pedagogicalTip: 'R5 Recepção do Saque: Apenas P1, P2 e o Líbero (LIB na 5) passam! O Levantador (P3) já está na rede e NÃO passa. O Oposto (P6 no fundo) também NÃO passa (fica protegido atrás do passe). Central 1 (P2) fica na rede pronto para o meio.',
        players: [
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Passador Fundo)', jerseyNumber: 7, rotationIndex: 1, x: 78, y: 78, isFrontRow: false },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Não Passa / Escondido na 6)', jerseyNumber: 9, rotationIndex: 6, x: 50, y: 78, isFrontRow: false },
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Passador / Substitui C2)', jerseyNumber: 10, rotationIndex: 5, x: 22, y: 78, isLibero: true, isFrontRow: false },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Passador / Rede)', jerseyNumber: 14, rotationIndex: 4, x: 20, y: 26, isFrontRow: true },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Não Passa / Rede Pos 3)', jerseyNumber: 1, rotationIndex: 3, x: 50, y: 18, isFrontRow: true },
          { id: 'MB1', role: 'MB1', label: 'C1', roleName: 'Central 1 (Não Passa / Rede Pos 2)', jerseyNumber: 3, rotationIndex: 2, x: 78, y: 26, isFrontRow: true },
        ],
      },
      serve_hit: {
        pedagogicalTip: 'R5 Golpe do Saque: O Levantador desloca-se da P3 para a P2 (saída de rede) e o Central 1 assume a P3 no centro da rede para o ataque rápido.',
        players: [
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Passou / Fundo)', jerseyNumber: 7, rotationIndex: 1, x: 78, y: 72, isFrontRow: false },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Prepara Ataque Fundo)', jerseyNumber: 9, rotationIndex: 6, x: 50, y: 74, isFrontRow: false },
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Defesa Fundo Esquerda)', jerseyNumber: 10, rotationIndex: 5, x: 22, y: 72, isLibero: true, isFrontRow: false },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Abre para Ataque Pos 4)', jerseyNumber: 14, rotationIndex: 4, x: 18, y: 14, isFrontRow: true },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Desloca P3 -> P2)', jerseyNumber: 1, rotationIndex: 3, x: 74, y: 12, isFrontRow: true, highlighted: true },
          { id: 'MB1', role: 'MB1', label: 'C1', roleName: 'Central 1 (Desloca P2 -> P3 Meio)', jerseyNumber: 3, rotationIndex: 2, x: 50, y: 12, isFrontRow: true },
        ],
      },
      transition: {
        pedagogicalTip: 'R5 Transição e Cobertura: Formação ofensiva ideal na rede com Ponteiro 2 na 4, Central 1 no meio e Levantador na saída. Central, Líbero e Oposto compõem o sistema de cobertura curta e longa ao atacante.',
        players: [
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Ataque Fundo / Cobertura)', jerseyNumber: 7, rotationIndex: 1, x: 78, y: 68, isFrontRow: false },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Ataque Fundo Pipe / Trás)', jerseyNumber: 9, rotationIndex: 6, x: 50, y: 70, isFrontRow: false },
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Defesa Fundo Esquerda)', jerseyNumber: 10, rotationIndex: 5, x: 22, y: 68, isLibero: true, isFrontRow: false },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Ataque Pos 4)', jerseyNumber: 14, rotationIndex: 4, x: 18, y: 14, isFrontRow: true },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Armação / Cobertura)', jerseyNumber: 1, rotationIndex: 3, x: 74, y: 12, isFrontRow: true },
          { id: 'MB1', role: 'MB1', label: 'C1', roleName: 'Central 1 (Ataque Pos 3 / Cobertura Toco)', jerseyNumber: 3, rotationIndex: 2, x: 50, y: 12, isFrontRow: true },
        ],
      },
    },
    6: {
      // R6: Levantador na P2 (Saída de Rede)
      reception: {
        pedagogicalTip: 'R6 Recepção do Saque: O Levantador (P2) já se encontra na sua posição tática ideal (Saída de rede). Apenas P1, P2 e o Líbero (LIB na 1) passam! O Oposto (P5 no fundo) e o Central 2 (P4 na rede) NÃO passam: ficam focados no ataque e na cobertura.',
        players: [
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Passador / Substitui C1)', jerseyNumber: 10, rotationIndex: 1, x: 78, y: 78, isLibero: true, isFrontRow: false },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Passador Fundo)', jerseyNumber: 7, rotationIndex: 6, x: 50, y: 78, isFrontRow: false },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Não Passa / Escondido na 5)', jerseyNumber: 9, rotationIndex: 5, x: 22, y: 78, isFrontRow: false },
          { id: 'MB2', role: 'MB2', label: 'C2', roleName: 'Central 2 (Não Passa / Rede Pos 4)', jerseyNumber: 11, rotationIndex: 4, x: 20, y: 26, isFrontRow: true },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Passador / Rede Pos 3)', jerseyNumber: 14, rotationIndex: 3, x: 48, y: 26, isFrontRow: true },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Não Passa / Pronto na Pos 2)', jerseyNumber: 1, rotationIndex: 2, x: 76, y: 18, isFrontRow: true },
        ],
      },
      serve_hit: {
        pedagogicalTip: 'R6 Golpe do Saque: O Levantador já está pronto na Posição 2. O Ponteiro 2 desloca-se da 3 para a 4 (entrada) e o Central 2 assume a 3 (meio) para o ataque rápido.',
        players: [
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Passou / Defesa Fundo)', jerseyNumber: 10, rotationIndex: 1, x: 78, y: 72, isLibero: true, isFrontRow: false },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Passou / Fundo)', jerseyNumber: 7, rotationIndex: 6, x: 50, y: 74, isFrontRow: false },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Prepara Ataque Fundo Pos 1/5)', jerseyNumber: 9, rotationIndex: 5, x: 22, y: 70, isFrontRow: false },
          { id: 'MB2', role: 'MB2', label: 'C2', roleName: 'Central 2 (Desloca P4 -> P3 Meio)', jerseyNumber: 11, rotationIndex: 4, x: 50, y: 12, isFrontRow: true },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Desloca P3 -> P4 Entrada)', jerseyNumber: 14, rotationIndex: 3, x: 18, y: 14, isFrontRow: true },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Pronto na Pos 2)', jerseyNumber: 1, rotationIndex: 2, x: 74, y: 12, isFrontRow: true, highlighted: true },
        ],
      },
      transition: {
        pedagogicalTip: 'R6 Transição e Cobertura: Ataque potente pela 4 com Ponteiro 2, bola rápida com Central 2 e ataque de fundo (pipe) pelo Oposto. Central e Levantador realizam o primeiro escalão de cobertura do ataque.',
        players: [
          { id: 'LIB', role: 'L', label: 'LIB', roleName: 'Líbero (Defesa Fundo Direita)', jerseyNumber: 10, rotationIndex: 1, x: 78, y: 68, isLibero: true, isFrontRow: false },
          { id: 'OH1', role: 'OH1', label: 'P1', roleName: 'Ponteiro 1 (Ataque Fundo / Cobertura)', jerseyNumber: 7, rotationIndex: 6, x: 50, y: 70, isFrontRow: false },
          { id: 'OP', role: 'OP', label: 'OP', roleName: 'Oposto (Ataque Fundo Pos 5 / Trás)', jerseyNumber: 9, rotationIndex: 5, x: 22, y: 68, isFrontRow: false },
          { id: 'MB2', role: 'MB2', label: 'C2', roleName: 'Central 2 (Ataque Pos 3 / Cobertura Toco)', jerseyNumber: 11, rotationIndex: 4, x: 50, y: 12, isFrontRow: true },
          { id: 'OH2', role: 'OH2', label: 'P2', roleName: 'Ponteiro 2 (Ataque Pos 4)', jerseyNumber: 14, rotationIndex: 3, x: 18, y: 14, isFrontRow: true },
          { id: 'S', role: 'S', label: 'L', roleName: 'Levantador (Armação / Cobertura)', jerseyNumber: 1, rotationIndex: 2, x: 74, y: 12, isFrontRow: true },
        ],
      },
    },
  },

  // ==========================
  // SISTEMA 6x0 (Básico)
  // ==========================
  '6x0': generate6x0Formations(),

  // ==========================
  // SISTEMA 4x2 SIMPLES
  // ==========================
  '4x2_simple': generate4x2SimpleFormations(),

  // ==========================
  // SISTEMA 4x2 INVERTIDO
  // ==========================
  '4x2_inversion': generate4x2InversionFormations(),

  // ==========================
  // VÔLEI DE PRAIA (2x2)
  // ==========================
  'beach_2x2': generateBeachFormations(),
};

function generate6x0Formations(): Record<RotationIndex, Record<GamePhase, { players: PlayerPosition[]; pedagogicalTip: string }>> {
  const result: any = {};
  for (let r = 1; r <= 6; r++) {
    const rot = r as RotationIndex;
    result[rot] = {
      reception: {
        pedagogicalTip: `6x0 Rotação ${rot}: Todos passam em semicírculo ou W. O jogador da Posição 3 é o levantador da jogada nesta rotação.`,
        players: [
          { id: 'J1', role: 'OH1', label: 'J1', roleName: 'Jogador 1', jerseyNumber: 1, rotationIndex: (( (1 + r - 2) % 6) + 1) as RotationIndex, x: 80, y: 78, isFrontRow: false },
          { id: 'J6', role: 'OH1', label: 'J6', roleName: 'Jogador 6', jerseyNumber: 6, rotationIndex: (( (6 + r - 2) % 6) + 1) as RotationIndex, x: 50, y: 82, isFrontRow: false },
          { id: 'J5', role: 'OH1', label: 'J5', roleName: 'Jogador 5', jerseyNumber: 5, rotationIndex: (( (5 + r - 2) % 6) + 1) as RotationIndex, x: 20, y: 78, isFrontRow: false },
          { id: 'J4', role: 'OH1', label: 'J4', roleName: 'Jogador 4', jerseyNumber: 4, rotationIndex: (( (4 + r - 2) % 6) + 1) as RotationIndex, x: 20, y: 25, isFrontRow: true },
          { id: 'J3', role: 'S', label: 'L(3)', roleName: 'Jogador 3 (Levantador)', jerseyNumber: 3, rotationIndex: (( (3 + r - 2) % 6) + 1) as RotationIndex, x: 50, y: 18, isFrontRow: true },
          { id: 'J2', role: 'OH1', label: 'J2', roleName: 'Jogador 2', jerseyNumber: 2, rotationIndex: (( (2 + r - 2) % 6) + 1) as RotationIndex, x: 80, y: 25, isFrontRow: true },
        ],
      },
      serve_hit: {
        pedagogicalTip: `6x0 Rotação ${rot}: Jogador da Posição 3 aproxima-se da rede para receber o passe de manchete.`,
        players: [
          { id: 'J1', role: 'OH1', label: 'J1', roleName: 'Jogador 1', jerseyNumber: 1, rotationIndex: (( (1 + r - 2) % 6) + 1) as RotationIndex, x: 78, y: 74, isFrontRow: false },
          { id: 'J6', role: 'OH1', label: 'J6', roleName: 'Jogador 6', jerseyNumber: 6, rotationIndex: (( (6 + r - 2) % 6) + 1) as RotationIndex, x: 50, y: 76, isFrontRow: false },
          { id: 'J5', role: 'OH1', label: 'J5', roleName: 'Jogador 5', jerseyNumber: 5, rotationIndex: (( (5 + r - 2) % 6) + 1) as RotationIndex, x: 22, y: 74, isFrontRow: false },
          { id: 'J4', role: 'OH1', label: 'J4', roleName: 'Jogador 4', jerseyNumber: 4, rotationIndex: (( (4 + r - 2) % 6) + 1) as RotationIndex, x: 18, y: 16, isFrontRow: true },
          { id: 'J3', role: 'S', label: 'L(3)', roleName: 'Jogador 3 (Levantador)', jerseyNumber: 3, rotationIndex: (( (3 + r - 2) % 6) + 1) as RotationIndex, x: 50, y: 14, isFrontRow: true, highlighted: true },
          { id: 'J2', role: 'OH1', label: 'J2', roleName: 'Jogador 2', jerseyNumber: 2, rotationIndex: (( (2 + r - 2) % 6) + 1) as RotationIndex, x: 82, y: 16, isFrontRow: true },
        ],
      },
      transition: {
        pedagogicalTip: `6x0 Rotação ${rot}: Ataque com bola alta nas pontas (Posições 4 e 2) pelo levantador da Posição 3.`,
        players: [
          { id: 'J1', role: 'OH1', label: 'J1', roleName: 'Jogador 1', jerseyNumber: 1, rotationIndex: (( (1 + r - 2) % 6) + 1) as RotationIndex, x: 78, y: 70, isFrontRow: false },
          { id: 'J6', role: 'OH1', label: 'J6', roleName: 'Jogador 6', jerseyNumber: 6, rotationIndex: (( (6 + r - 2) % 6) + 1) as RotationIndex, x: 50, y: 70, isFrontRow: false },
          { id: 'J5', role: 'OH1', label: 'J5', roleName: 'Jogador 5', jerseyNumber: 5, rotationIndex: (( (5 + r - 2) % 6) + 1) as RotationIndex, x: 22, y: 70, isFrontRow: false },
          { id: 'J4', role: 'OH1', label: 'J4', roleName: 'Jogador 4', jerseyNumber: 4, rotationIndex: (( (4 + r - 2) % 6) + 1) as RotationIndex, x: 18, y: 14, isFrontRow: true },
          { id: 'J3', role: 'S', label: 'L(3)', roleName: 'Jogador 3 (Levantador)', jerseyNumber: 3, rotationIndex: (( (3 + r - 2) % 6) + 1) as RotationIndex, x: 50, y: 12, isFrontRow: true },
          { id: 'J2', role: 'OH1', label: 'J2', roleName: 'Jogador 2', jerseyNumber: 2, rotationIndex: (( (2 + r - 2) % 6) + 1) as RotationIndex, x: 82, y: 14, isFrontRow: true },
        ],
      },
    };
  }
  return result;
}

function generate4x2SimpleFormations(): Record<RotationIndex, Record<GamePhase, { players: PlayerPosition[]; pedagogicalTip: string }>> {
  const result: any = {};
  for (let r = 1; r <= 6; r++) {
    const rot = r as RotationIndex;
    const isL1InFront = r >= 4; // Quando R >= 4, o Levantador 1 está na rede
    result[rot] = {
      reception: {
        pedagogicalTip: `4x2 Simples Rotação ${rot}: Dois levantadores opostos em diagonal. O levantador que está na rede (${isL1InFront ? 'L1' : 'L2'}) fica posicionado na Posição 3/2 para levantar.`,
        players: [
          { id: 'L1', role: 'S', label: 'L1', roleName: 'Levantador 1', jerseyNumber: 1, rotationIndex: (( (1 + r - 2) % 6) + 1) as RotationIndex, x: isL1InFront ? 50 : 78, y: isL1InFront ? 20 : 78, isFrontRow: isL1InFront },
          { id: 'A1', role: 'OH1', label: 'A1', roleName: 'Atacante 1', jerseyNumber: 4, rotationIndex: (( (2 + r - 2) % 6) + 1) as RotationIndex, x: 80, y: isL1InFront ? 26 : 76, isFrontRow: isL1InFront },
          { id: 'A2', role: 'OH2', label: 'A2', roleName: 'Atacante 2', jerseyNumber: 7, rotationIndex: (( (3 + r - 2) % 6) + 1) as RotationIndex, x: 20, y: isL1InFront ? 26 : 78, isFrontRow: !isL1InFront },
          { id: 'L2', role: 'S2', label: 'L2', roleName: 'Levantador 2', jerseyNumber: 10, rotationIndex: (( (4 + r - 2) % 6) + 1) as RotationIndex, x: !isL1InFront ? 50 : 22, y: !isL1InFront ? 20 : 78, isFrontRow: !isL1InFront },
          { id: 'A3', role: 'MB1', label: 'A3', roleName: 'Atacante 3', jerseyNumber: 12, rotationIndex: (( (5 + r - 2) % 6) + 1) as RotationIndex, x: 50, y: 78, isFrontRow: false },
          { id: 'A4', role: 'MB2', label: 'A4', roleName: 'Atacante 4', jerseyNumber: 15, rotationIndex: (( (6 + r - 2) % 6) + 1) as RotationIndex, x: 22, y: 26, isFrontRow: isL1InFront },
        ],
      },
      serve_hit: {
        pedagogicalTip: `4x2 Simples Golpe do Saque: O Levantador da rede fixa na Posição 3 e distribui para os atacantes da Posição 4 e 2.`,
        players: [
          { id: 'L1', role: 'S', label: 'L1', roleName: 'Levantador 1', jerseyNumber: 1, rotationIndex: (( (1 + r - 2) % 6) + 1) as RotationIndex, x: isL1InFront ? 50 : 78, y: isL1InFront ? 14 : 72, isFrontRow: isL1InFront, highlighted: isL1InFront },
          { id: 'A1', role: 'OH1', label: 'A1', roleName: 'Atacante 1', jerseyNumber: 4, rotationIndex: (( (2 + r - 2) % 6) + 1) as RotationIndex, x: 82, y: isL1InFront ? 14 : 70, isFrontRow: isL1InFront },
          { id: 'A2', role: 'OH2', label: 'A2', roleName: 'Atacante 2', jerseyNumber: 7, rotationIndex: (( (3 + r - 2) % 6) + 1) as RotationIndex, x: 18, y: isL1InFront ? 14 : 72, isFrontRow: !isL1InFront },
          { id: 'L2', role: 'S2', label: 'L2', roleName: 'Levantador 2', jerseyNumber: 10, rotationIndex: (( (4 + r - 2) % 6) + 1) as RotationIndex, x: !isL1InFront ? 50 : 22, y: !isL1InFront ? 14 : 72, isFrontRow: !isL1InFront, highlighted: !isL1InFront },
          { id: 'A3', role: 'MB1', label: 'A3', roleName: 'Atacante 3', jerseyNumber: 12, rotationIndex: (( (5 + r - 2) % 6) + 1) as RotationIndex, x: 50, y: 74, isFrontRow: false },
          { id: 'A4', role: 'MB2', label: 'A4', roleName: 'Atacante 4', jerseyNumber: 15, rotationIndex: (( (6 + r - 2) % 6) + 1) as RotationIndex, x: 18, y: isL1InFront ? 14 : 70, isFrontRow: isL1InFront },
        ],
      },
      transition: {
        pedagogicalTip: `4x2 Simples Transição: Os 2 atacantes da rede atacam pelas extremidades com levantador distribuindo no meio.`,
        players: [
          { id: 'L1', role: 'S', label: 'L1', roleName: 'Levantador 1', jerseyNumber: 1, rotationIndex: (( (1 + r - 2) % 6) + 1) as RotationIndex, x: isL1InFront ? 50 : 78, y: isL1InFront ? 12 : 70, isFrontRow: isL1InFront },
          { id: 'A1', role: 'OH1', label: 'A1', roleName: 'Atacante 1', jerseyNumber: 4, rotationIndex: (( (2 + r - 2) % 6) + 1) as RotationIndex, x: 82, y: isL1InFront ? 14 : 68, isFrontRow: isL1InFront },
          { id: 'A2', role: 'OH2', label: 'A2', roleName: 'Atacante 2', jerseyNumber: 7, rotationIndex: (( (3 + r - 2) % 6) + 1) as RotationIndex, x: 18, y: isL1InFront ? 14 : 70, isFrontRow: !isL1InFront },
          { id: 'L2', role: 'S2', label: 'L2', roleName: 'Levantador 2', jerseyNumber: 10, rotationIndex: (( (4 + r - 2) % 6) + 1) as RotationIndex, x: !isL1InFront ? 50 : 22, y: !isL1InFront ? 12 : 70, isFrontRow: !isL1InFront },
          { id: 'A3', role: 'MB1', label: 'A3', roleName: 'Atacante 3', jerseyNumber: 12, rotationIndex: (( (5 + r - 2) % 6) + 1) as RotationIndex, x: 50, y: 70, isFrontRow: false },
          { id: 'A4', role: 'MB2', label: 'A4', roleName: 'Atacante 4', jerseyNumber: 15, rotationIndex: (( (6 + r - 2) % 6) + 1) as RotationIndex, x: 18, y: isL1InFront ? 14 : 68, isFrontRow: isL1InFront },
        ],
      },
    };
  }
  return result;
}

function generate4x2InversionFormations(): Record<RotationIndex, Record<GamePhase, { players: PlayerPosition[]; pedagogicalTip: string }>> {
  const result: any = {};
  for (let r = 1; r <= 6; r++) {
    const rot = r as RotationIndex;
    result[rot] = {
      reception: {
        pedagogicalTip: `4x2 Invertido Rotação ${rot}: O levantador do fundo prepara a infiltração. Os 3 jogadores da rede focam no ataque.`,
        players: [
          { id: 'L1', role: 'S', label: 'L1', roleName: 'Levantador Infiltrante', jerseyNumber: 1, rotationIndex: (( (1 + r - 2) % 6) + 1) as RotationIndex, x: 80, y: 78, isFrontRow: false },
          { id: 'A1', role: 'OH1', label: 'A1', roleName: 'Atacante 1', jerseyNumber: 4, rotationIndex: (( (2 + r - 2) % 6) + 1) as RotationIndex, x: 50, y: 80, isFrontRow: false },
          { id: 'A2', role: 'OH2', label: 'A2', roleName: 'Atacante 2', jerseyNumber: 7, rotationIndex: (( (3 + r - 2) % 6) + 1) as RotationIndex, x: 22, y: 78, isFrontRow: false },
          { id: 'A3', role: 'MB1', label: 'A3', roleName: 'Atacante 3', jerseyNumber: 10, rotationIndex: (( (4 + r - 2) % 6) + 1) as RotationIndex, x: 20, y: 25, isFrontRow: true },
          { id: 'A4', role: 'MB2', label: 'A4', roleName: 'Atacante 4', jerseyNumber: 12, rotationIndex: (( (5 + r - 2) % 6) + 1) as RotationIndex, x: 50, y: 22, isFrontRow: true },
          { id: 'L2', role: 'S2', label: 'L2', roleName: 'Levantador 2 (Atacando)', jerseyNumber: 15, rotationIndex: (( (6 + r - 2) % 6) + 1) as RotationIndex, x: 80, y: 25, isFrontRow: true },
        ],
      },
      serve_hit: {
        pedagogicalTip: `4x2 Invertido Golpe do Saque: O Levantador L1 infiltra em velocidade para a Posição 2/3 da rede.`,
        players: [
          { id: 'L1', role: 'S', label: 'L1', roleName: 'Levantador Infiltrante', jerseyNumber: 1, rotationIndex: (( (1 + r - 2) % 6) + 1) as RotationIndex, x: 74, y: 14, isFrontRow: false, highlighted: true },
          { id: 'A1', role: 'OH1', label: 'A1', roleName: 'Atacante 1', jerseyNumber: 4, rotationIndex: (( (2 + r - 2) % 6) + 1) as RotationIndex, x: 50, y: 74, isFrontRow: false },
          { id: 'A2', role: 'OH2', label: 'A2', roleName: 'Atacante 2', jerseyNumber: 7, rotationIndex: (( (3 + r - 2) % 6) + 1) as RotationIndex, x: 25, y: 74, isFrontRow: false },
          { id: 'A3', role: 'MB1', label: 'A3', roleName: 'Atacante 3', jerseyNumber: 10, rotationIndex: (( (4 + r - 2) % 6) + 1) as RotationIndex, x: 18, y: 15, isFrontRow: true },
          { id: 'A4', role: 'MB2', label: 'A4', roleName: 'Atacante 4', jerseyNumber: 12, rotationIndex: (( (5 + r - 2) % 6) + 1) as RotationIndex, x: 48, y: 14, isFrontRow: true },
          { id: 'L2', role: 'S2', label: 'L2', roleName: 'Levantador 2 (Atacando)', jerseyNumber: 15, rotationIndex: (( (6 + r - 2) % 6) + 1) as RotationIndex, x: 82, y: 15, isFrontRow: true },
        ],
      },
      transition: {
        pedagogicalTip: `4x2 Invertido Transição: 3 Atacantes disponíveis na rede (Ponta na 4, Central na 3 e Levantador 2 na 2 como oposto!).`,
        players: [
          { id: 'L1', role: 'S', label: 'L1', roleName: 'Levantador Infiltrante', jerseyNumber: 1, rotationIndex: (( (1 + r - 2) % 6) + 1) as RotationIndex, x: 74, y: 12, isFrontRow: false },
          { id: 'A1', role: 'OH1', label: 'A1', roleName: 'Atacante 1', jerseyNumber: 4, rotationIndex: (( (2 + r - 2) % 6) + 1) as RotationIndex, x: 50, y: 70, isFrontRow: false },
          { id: 'A2', role: 'OH2', label: 'A2', roleName: 'Atacante 2', jerseyNumber: 7, rotationIndex: (( (3 + r - 2) % 6) + 1) as RotationIndex, x: 22, y: 70, isFrontRow: false },
          { id: 'A3', role: 'MB1', label: 'A3', roleName: 'Atacante 3', jerseyNumber: 10, rotationIndex: (( (4 + r - 2) % 6) + 1) as RotationIndex, x: 18, y: 14, isFrontRow: true },
          { id: 'A4', role: 'MB2', label: 'A4', roleName: 'Atacante 4', jerseyNumber: 12, rotationIndex: (( (5 + r - 2) % 6) + 1) as RotationIndex, x: 50, y: 12, isFrontRow: true },
          { id: 'L2', role: 'S2', label: 'L2', roleName: 'Levantador 2 (Atacando)', jerseyNumber: 15, rotationIndex: (( (6 + r - 2) % 6) + 1) as RotationIndex, x: 82, y: 14, isFrontRow: true },
        ],
      },
    };
  }
  return result;
}

function generateBeachFormations(): Record<RotationIndex, Record<GamePhase, { players: PlayerPosition[]; pedagogicalTip: string }>> {
  const result: any = {};
  for (let r = 1; r <= 6; r++) {
    const isServer1 = r % 2 === 1;
    result[r] = {
      reception: {
        pedagogicalTip: `Vôlei de Praia: Formação em cunha com 2 jogadores dividindo a quadra. Sacador da vez: ${isServer1 ? 'Jogador 1' : 'Jogador 2'}.`,
        players: [
          { id: 'P1', role: 'P1', label: 'D1', roleName: 'Dupla 1 (Sacador/Defesa)', jerseyNumber: 1, rotationIndex: 1, x: 32, y: 68, isFrontRow: false },
          { id: 'P2', role: 'P2', label: 'P2', roleName: 'Dupla 2 (Recepção/Rede)', jerseyNumber: 2, rotationIndex: 2, x: 68, y: 68, isFrontRow: false },
        ],
      },
      serve_hit: {
        pedagogicalTip: `Vôlei de Praia Golpe do Saque: O bloqueador corre para a rede e sinaliza nas costas o esquema tático (Linha ou Diagonal). O defensor recua para cobrir a área livre.`,
        players: [
          { id: 'P1', role: 'P1', label: 'DEF', roleName: 'Defensor de Fundo', jerseyNumber: 1, rotationIndex: 1, x: 30, y: 78, isFrontRow: false, highlighted: true },
          { id: 'P2', role: 'P2', label: 'BLOQ', roleName: 'Bloqueador de Rede', jerseyNumber: 2, rotationIndex: 2, x: 50, y: 14, isFrontRow: true, highlighted: true },
        ],
      },
      transition: {
        pedagogicalTip: `Vôlei de Praia Transição: Bloqueador salta fechando o ângulo indicado no sinal (ex: Linha), enquanto o defensor busca o ataque na diagonal.`,
        players: [
          { id: 'P1', role: 'P1', label: 'DEF', roleName: 'Defensor Posicionado', jerseyNumber: 1, rotationIndex: 1, x: 72, y: 75, isFrontRow: false },
          { id: 'P2', role: 'P2', label: 'BLOQ', roleName: 'Bloqueio Montado', jerseyNumber: 2, rotationIndex: 2, x: 30, y: 12, isFrontRow: true },
        ],
      },
    };
  }
  return result;
}

export const BEACH_SIGNALS_GUIDE: Record<
  BeachSignal,
  {
    name: string;
    fingersCount: string;
    blockerAction: string;
    defenderPosition: string;
    description: string;
    tacticalRationale: string;
  }
> = {
  '1_finger': {
    name: '1 Dedo (Linha / Paralela)',
    fingersCount: '1 dedo indicador estendido',
    blockerAction: 'Salta fechando a passagem reta da bola na linha lateral.',
    defenderPosition: 'Posiciona-se no fundo da quadra na DIAGONAL para pegar a pancada ou largada cruzada.',
    description: 'O bloqueador sela a paralela, forçando o atacante adversário a bater cruzado onde o defensor já está esperando.',
    tacticalRationale: 'Ideal quando o atacante tem preferência por largadas na diagonal ou quando o vento empurra o ataque para dentro da quadra.',
  },
  '2_fingers': {
    name: '2 Dedos (Diagonal)',
    fingersCount: '2 dedos (indicador e médio em "V")',
    blockerAction: 'Salta fechando o ângulo diagonal da quadra adversária.',
    defenderPosition: 'Posiciona-se no corredor da PARALELA / LINHA para cobrir o ataque reto.',
    description: 'O bloqueador anula a bola mais forte do atacante (diagonal), deixando a linha para o defensor correr e defender.',
    tacticalRationale: 'Usado frequentemente contra atacantes canhotos na saída ou destros fortes na entrada.',
  },
  'open_hand': {
    name: 'Mão Aberta (Bola / Leitura)',
    fingersCount: 'Todos os dedos abertos',
    blockerAction: 'Não define lado prévio; salta no meio da bola acompanhando o braço do atacante.',
    defenderPosition: 'Fica solto no centro-fundo reagindo ao movimento do atacante (defesa de reação).',
    description: 'Bloqueio de leitura pura (Read Block). Exige reflexo rápido de ambos os jogadores.',
    tacticalRationale: 'Eficaz contra atacantes imprevisíveis ou em condições de vento instável.',
  },
  'closed_fist': {
    name: 'Punho Fechado (Não Bloqueia / Recuo / Pull)',
    fingersCount: 'Punho cerrado',
    blockerAction: 'Finge o bloqueio e recua rapidamente para a linha dos 3 metros para defender no chão.',
    defenderPosition: 'Ambos os jogadores defendem no fundo (sistema 2x0 de defesa).',
    description: 'Tática surpresa quando o levantamento adversário sai muito afastado da rede ou o atacante é baixo.',
    tacticalRationale: 'Garante duas defesas no chão contra ataques fracos de cheque ou de graça.',
  },
  'shade_cut': {
    name: 'Sinal de Largada (Shade / Cut)',
    fingersCount: 'Dedos flexionados / Sinal com polegar',
    blockerAction: 'Bloqueia focado em cobrir a largada curta na diagonal curta (cut shot).',
    defenderPosition: 'Defensor fica responsável pelo fundo longo da quadra.',
    description: 'Previne as "largadinhas" perigosas de dedos na diagonal curta.',
    tacticalRationale: 'Excelente contra duplas experientes em controle de bola e toques colocados.',
  },
};

// =========================================================================
// GUIA PEDAGÓGICO DE RECEPÇÃO DO SAQUE & COBERTURA DE ATAQUE NO SISTEMA 5x1
// =========================================================================
export interface RoleCoverageInfo {
  roleCode: string;
  roleName: string;
  isPasser: boolean;
  passRoleDescription: string;
  coverageRoleDescription: string;
  tacticalWhy: string;
  icon: string;
  colorClass: string;
}

export const SYSTEM_5X1_COVERAGE_GUIDE: {
  summary: string;
  goldenRule: string;
  roles: RoleCoverageInfo[];
} = {
  summary: 'No Sistema 5x1 de alto rendimento e escolar moderno, a recepção do saque é restrita a uma linha de 3 passadores especializados para garantir consistência e proteger os atacantes e o armador.',
  goldenRule: 'REGRA DE OURO DO 5x1: Apenas os 2 Ponteiros (P1, P2) e o Líbero (LIB) realizam o passe do saque. O Levantador, o Oposto e o Central da rede NUNCA passam o saque — eles focam na armação, no ataque terminal e na cobertura de bloqueio.',
  roles: [
    {
      roleCode: 'P1 / P2',
      roleName: 'Ponteiros (Passadores & Atacantes)',
      isPasser: true,
      passRoleDescription: '✅ REALIZA O PASSE: É a espinha dorsal da recepção. Formam a linha de passe em U/W com o Líbero.',
      coverageRoleDescription: 'Apoio Médio: Quando o outro ponteiro ou o oposto ataca, fecha o corredor para recuperar bolas desviadas.',
      tacticalWhy: 'Precisam dominar a manchete e o toque de recepção com máxima precisão para entregar a bola na mão do levantador.',
      icon: '📥',
      colorClass: 'bg-sky-50 text-sky-950 border-sky-300',
    },
    {
      roleCode: 'LIB',
      roleName: 'Líbero (Especialista em Passe e Defesa)',
      isPasser: true,
      passRoleDescription: '✅ REALIZA O PASSE: Comanda a linha de passe. Cobre a maior faixa do fundo de quadra.',
      coverageRoleDescription: 'Cobertura Global de Fundo: Posiciona-se no centro da quadra para resgatar tocos do bloqueio e defesas de contra-ataque.',
      tacticalWhy: 'Substitui o Central de fundo para manter a qualidade do passe sempre no nível mais alto sem gastar substituições.',
      icon: '🛡️',
      colorClass: 'bg-amber-50 text-amber-950 border-amber-400 ring-2 ring-amber-300',
    },
    {
      roleCode: 'S (Levantador)',
      roleName: 'Levantador (O Cérebro da Equipe)',
      isPasser: false,
      passRoleDescription: '🚫 NUNCA PASSA O SAQUE: Fica escondido atrás da linha de passe no fundo ou colado na rede para dar o 2º toque (levantamento).',
      coverageRoleDescription: 'Cobertura Primária (1º Escalão): Logo após levantar a bola, dá 2 passos em direção ao atacante com as mãos baixas para pegar o rebote do bloqueio.',
      tacticalWhy: 'Se o levantador tocasse na 1ª bola (saque), a equipe perderia seu melhor distribuidor para organizar a jogada.',
      icon: '🎯',
      colorClass: 'bg-emerald-50 text-emerald-950 border-emerald-300',
    },
    {
      roleCode: 'OP (Oposto)',
      roleName: 'Oposto (Atacante de Força Terminal)',
      isPasser: false,
      passRoleDescription: '🚫 NUNCA PASSA O SAQUE: É "escondido" da recepção (colado à rede na frente ou atrás dos passadores no fundo).',
      coverageRoleDescription: 'Cobertura de Raio Médio/Longo: Dá suporte aos ataques dos ponteiros e centrais.',
      tacticalWhy: 'Preservado 100% do desgaste do passe para focar toda sua energia em saltar e pontuar nas bolas difíceis de saída (Pos 2) e fundo (Pos 1/6).',
      icon: '💥',
      colorClass: 'bg-rose-50 text-rose-950 border-rose-300',
    },
    {
      roleCode: 'MB1 / MB2',
      roleName: 'Centrais (Meio de Rede)',
      isPasser: false,
      passRoleDescription: '🚫 NUNCA PASSA O SAQUE: Na rede, fica colado à fita ou fora da trajetória para não atrapalhar os passadores. No fundo, é substituído pelo Líbero.',
      coverageRoleDescription: 'Cobertura Curta de Toco: Fica a 1 metro do atacante da ponta com pernas flexionadas para salvar bolas "espetadas" no bloqueio.',
      tacticalWhy: 'Sua corrida de ataque de 1º tempo precisa ser explosiva e imediata no tempo da bola levantada.',
      icon: '⚡',
      colorClass: 'bg-purple-50 text-purple-950 border-purple-300',
    },
  ],
};

