import { PlayerPosition, PositionalFault, BeachSignal, WindDirection } from '../types';

/**
 * Validador Oficial de Falta de Posição (Positional Fault)
 * 
 * Regra FIVB 7.4:
 * No momento em que a bola é golpeada pelo sacador, cada equipe deve estar posicionada
 * dentro de sua própria quadra na ordem de rotação (exceto o sacador).
 * 
 * Adjacências:
 * 1. Frente / Trás:
 *    - Pos 4 à frente de Pos 5 (Y_pos4 < Y_pos5, considerando Y=0 na rede e Y=100 no fundo)
 *    - Pos 3 à frente de Pos 6 (Y_pos3 < Y_pos6)
 *    - Pos 2 à frente de Pos 1 (Y_pos2 < Y_pos1)
 * 
 * 2. Lateralidade (Horizontal):
 *    - Linha de frente: Pos 4 à esquerda de Pos 3, e Pos 3 à esquerda de Pos 2 (X_pos4 < X_pos3 < X_pos2)
 *    - Linha de trás: Pos 5 à esquerda de Pos 6, e Pos 6 à esquerda de Pos 1 (X_pos5 < X_pos6 < X_pos1)
 */
export function validatePositionalFaults(players: PlayerPosition[]): {
  isValid: boolean;
  faults: PositionalFault[];
  playerFaultMap: Record<string, string>;
} {
  const faults: PositionalFault[] = [];
  const playerFaultMap: Record<string, string> = {};

  if (players.length !== 6) {
    return { isValid: true, faults: [], playerFaultMap: {} };
  }

  // Mapear jogadores pela posição formal de rodízio (1 a 6)
  const posMap = new Map<number, PlayerPosition>();
  players.forEach((p) => {
    posMap.set(p.rotationIndex, p);
  });

  const p1 = posMap.get(1);
  const p2 = posMap.get(2);
  const p3 = posMap.get(3);
  const p4 = posMap.get(4);
  const p5 = posMap.get(5);
  const p6 = posMap.get(6);

  if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) {
    return { isValid: true, faults: [], playerFaultMap: {} };
  }

  // Tolerância geométrica de 1.5% para evitar falsos positivos de toque sutil
  const tolerance = 1.5;

  // 1. Validação Frente vs Trás (Y_frente deve ser MENOR que Y_trás, pois 0 é rede e 100 é fundo)
  // Par 4 (frente-esquerda) e 5 (fundo-esquerda)
  if (p4.y > p5.y - tolerance) {
    const desc = `Falta Frente/Trás: O jogador da Posição 4 (${p4.roleName}) está mais atrás que o jogador da Posição 5 (${p5.roleName}). Posição 4 deve estar mais perto da rede.`;
    faults.push({
      player1Id: p4.id,
      player2Id: p5.id,
      player1Label: p4.label,
      player2Label: p5.label,
      type: 'front_back',
      description: desc,
    });
    playerFaultMap[p4.id] = desc;
    playerFaultMap[p5.id] = desc;
  }

  // Par 3 (frente-centro) e 6 (fundo-centro)
  if (p3.y > p6.y - tolerance) {
    const desc = `Falta Frente/Trás: O jogador da Posição 3 (${p3.roleName}) está mais atrás que o jogador da Posição 6 (${p6.roleName}). Posição 3 deve estar mais perto da rede.`;
    faults.push({
      player1Id: p3.id,
      player2Id: p6.id,
      player1Label: p3.label,
      player2Label: p6.label,
      type: 'front_back',
      description: desc,
    });
    playerFaultMap[p3.id] = desc;
    playerFaultMap[p6.id] = desc;
  }

  // Par 2 (frente-direita) e 1 (fundo-direita)
  if (p2.y > p1.y - tolerance) {
    const desc = `Falta Frente/Trás: O jogador da Posição 2 (${p2.roleName}) está mais atrás que o jogador da Posição 1 (${p1.roleName}). Posição 2 deve estar mais perto da rede.`;
    faults.push({
      player1Id: p2.id,
      player2Id: p1.id,
      player1Label: p2.label,
      player2Label: p1.label,
      type: 'front_back',
      description: desc,
    });
    playerFaultMap[p2.id] = desc;
    playerFaultMap[p1.id] = desc;
  }

  // 2. Validação Lateral - Linha da Frente (X_pos4 < X_pos3 < X_pos2)
  if (p4.x > p3.x - tolerance) {
    const desc = `Falta Lateral na Rede: O jogador da Posição 4 (${p4.roleName}) ultrapassou para a direita do jogador da Posição 3 (${p3.roleName}).`;
    faults.push({
      player1Id: p4.id,
      player2Id: p3.id,
      player1Label: p4.label,
      player2Label: p3.label,
      type: 'left_right',
      description: desc,
    });
    playerFaultMap[p4.id] = desc;
    playerFaultMap[p3.id] = desc;
  }

  if (p3.x > p2.x - tolerance) {
    const desc = `Falta Lateral na Rede: O jogador da Posição 3 (${p3.roleName}) ultrapassou para a direita do jogador da Posição 2 (${p2.roleName}).`;
    faults.push({
      player1Id: p3.id,
      player2Id: p2.id,
      player1Label: p3.label,
      player2Label: p2.label,
      type: 'left_right',
      description: desc,
    });
    playerFaultMap[p3.id] = desc;
    playerFaultMap[p2.id] = desc;
  }

  // 3. Validação Lateral - Linha de Trás (X_pos5 < X_pos6 < X_pos1)
  if (p5.x > p6.x - tolerance) {
    const desc = `Falta Lateral no Fundo: O jogador da Posição 5 (${p5.roleName}) ultrapassou para a direita do jogador da Posição 6 (${p6.roleName}).`;
    faults.push({
      player1Id: p5.id,
      player2Id: p6.id,
      player1Label: p5.label,
      player2Label: p6.label,
      type: 'left_right',
      description: desc,
    });
    playerFaultMap[p5.id] = desc;
    playerFaultMap[p6.id] = desc;
  }

  if (p6.x > p1.x - tolerance) {
    const desc = `Falta Lateral no Fundo: O jogador da Posição 6 (${p6.roleName}) ultrapassou para a direita do jogador da Posição 1 (${p1.roleName}).`;
    faults.push({
      player1Id: p6.id,
      player2Id: p1.id,
      player1Label: p6.label,
      player2Label: p1.label,
      type: 'left_right',
      description: desc,
    });
    playerFaultMap[p6.id] = desc;
    playerFaultMap[p1.id] = desc;
  }

  return {
    isValid: faults.length === 0,
    faults,
    playerFaultMap,
  };
}

/**
 * Validador de Posicionamento Tático no Vôlei de Praia
 * Baseado no sinal de bloqueio e na origem do ataque adversário
 */
export function validateBeachTactic(
  signal: BeachSignal,
  attackerSide: 'left' | 'right',
  defenderPos: { x: number; y: number },
  wind: WindDirection
): {
  isCorrect: boolean;
  score: number; // 0 a 100
  zoneExpected: 'line' | 'diagonal' | 'center_read' | 'back_double_pull';
  feedback: string;
  pedagogicalAdvice: string;
} {
  // Se o ataque vem da esquerda (Zona 4 adversária, que na nossa perspectiva fica no lado esquerdo da rede X: 15-35):
  // 1 Dedo (Linha) -> Bloqueio fecha a linha lateral esquerda -> Defesa deve ir para a DIAGONAL (X: 60-85, Y: 60-85)
  // 2 Dedos (Diagonal) -> Bloqueio fecha a diagonal -> Defesa deve ir para a PARALELA/LINHA (X: 15-35, Y: 60-85)
  // Mão Aberta -> Leitura/Read -> Defesa centralizada (X: 40-60, Y: 60-80)
  // Punho Fechado -> Pull/Recuo -> Bloqueador e defensor defendem fundo (X: 20-80, Y: 50-80)

  let zoneExpected: 'line' | 'diagonal' | 'center_read' | 'back_double_pull' = 'diagonal';
  let targetXMin = 0;
  let targetXMax = 100;
  let targetYMin = 50;
  let targetYMax = 90;

  if (signal === '1_finger') {
    // Bloqueador fecha a Linha -> Defensor fica na Diagonal
    zoneExpected = 'diagonal';
    if (attackerSide === 'left') {
      targetXMin = 55;
      targetXMax = 90;
    } else {
      targetXMin = 10;
      targetXMax = 45;
    }
  } else if (signal === '2_fingers') {
    // Bloqueador fecha Diagonal -> Defensor fica na Linha
    zoneExpected = 'line';
    if (attackerSide === 'left') {
      targetXMin = 10;
      targetXMax = 45;
    } else {
      targetXMin = 55;
      targetXMax = 90;
    }
  } else if (signal === 'open_hand') {
    zoneExpected = 'center_read';
    targetXMin = 35;
    targetXMax = 65;
  } else if (signal === 'closed_fist') {
    zoneExpected = 'back_double_pull';
    targetXMin = 20;
    targetXMax = 80;
    targetYMin = 55;
  } else if (signal === 'shade_cut') {
    zoneExpected = 'diagonal';
    targetXMin = 40;
    targetXMax = 80;
    targetYMin = 65;
  }

  const isXCorrect = defenderPos.x >= targetXMin && defenderPos.x <= targetXMax;
  const isYCorrect = defenderPos.y >= targetYMin && defenderPos.y <= targetYMax;
  const isCorrect = isXCorrect && isYCorrect;

  let feedback = '';
  let pedagogicalAdvice = '';

  if (isCorrect) {
    feedback = `Excelente posicionamento! O sinal foi "${signal === '1_finger' ? '1 Dedo (Linha)' : signal === '2_fingers' ? '2 Dedos (Diagonal)' : 'Leitura'}" no ataque da ${attackerSide === 'left' ? 'Entrada (Esquerda)' : 'Saída (Direita)'}, e você cobriu com perfeição a zona complementar.`;
    pedagogicalAdvice = 'Lembre-se: no vôlei de praia a sincronia entre a sombra do bloqueio e os olhos do defensor define o ponto.';
  } else {
    feedback = `Posicionamento incorreto. Com o bloqueador marcando ${signal === '1_finger' ? 'a LINHA' : 'a DIAGONAL'}, a defesa deveria estar na ${zoneExpected === 'diagonal' ? 'DIAGONAL CRUZADA' : 'PARALELA/LINHA'}.`;
    pedagogicalAdvice = `Se o bloqueador pula na ${signal === '1_finger' ? 'Linha' : 'Diagonal'}, o ataque direto passará na ${zoneExpected === 'diagonal' ? 'Diagonal' : 'Linha'}. Não deixe o mesmo espaço aberto!`;
  }

  // Ajuste com o vento
  if (wind === 'favor') {
    pedagogicalAdvice += ' Vento a favor: a bola do adversário viaja mais rápida e pode flutuar para fora no fundo.';
  } else if (wind === 'against') {
    pedagogicalAdvice += ' Vento contra: cuidado com as largadinhas curtas (cut shots) que caem rápido.';
  }

  return {
    isCorrect,
    score: isCorrect ? 100 : Math.max(20, 100 - Math.abs(defenderPos.x - (targetXMin + targetXMax) / 2) * 2),
    zoneExpected,
    feedback,
    pedagogicalAdvice,
  };
}
