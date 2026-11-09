import { BeachSignal } from '../types';

export interface BeachAttackScenario {
  id: string;
  name: string;
  shortName: string;
  category: 'potencia' | 'habilidade' | 'tatica';
  icon: string;
  tag: string;
  description: string;
  tacticalKey: string;
  attackerSide: 'left' | 'right'; // 'left' = Entrada de Rede (Pos 4); 'right' = Saída de Rede (Pos 2)
  blockDirectBlockSignal: BeachSignal; // Sinal que dá o TOCO / BLOQUEIO direto na bola
  recommendedDefenseSignal: BeachSignal; // Sinal que canaliza a bola para a defesa salvar
  flightDuration: number; // segundos
  ballApexY: number; // altura sobre a rede (metros 3D)
  attackerCoords: { x: number; y: number; z: number }; // Campo adversário (Z negativo)
  netCrossCoords: { x: number; y: number; z: number }; // Ponto sobre a rede (Z = 0)
  targetContactCoords: { x: number; y: number; z: number }; // Ponto de defesa no nosso campo (Z positivo)
  blockReboundCoords: { x: number; y: number; z: number }; // Ponto no chão adversário onde a bola cai no TOCO (Z negativo)
  defenderStart: { x: number; y: number }; // Posição de espera inicial 2D (0..100)
  defenderTarget: { x: number; y: number }; // Ponto final da manchete 2D (0..100)
  blockerJump: boolean;
  blockerPosition: { x: number; y: number }; // Posição 2D do bloqueador
  blockerActionText: string;
  defenderActionText: string;
  tocoExplanation: string; // O que acontece quando o bloqueador fecha a porta
  windTip: string;
}

/**
 * Calcula automaticamente o posicionamento do bloqueador e do defensor
 * de acordo com o sinal tático nas costas e o lado do atacante adversário.
 */
export function calculateBeachTacticalPositions(
  signal: BeachSignal,
  attackerSide: 'left' | 'right'
): {
  blocker: { x: number; y: number };
  defender: { x: number; y: number };
  description: string;
} {
  if (attackerSide === 'left') {
    // ATACANTE NA ENTRADA DE REDE (ESQUERDA / POSIÇÃO 4 ADVERSÁRIA)
    switch (signal) {
      case '1_finger':
        // 1 Dedo: Bloqueador fecha Linha (Paralela) -> Defensor cobre Diagonal profunda
        return {
          blocker: { x: 18, y: 12 },
          defender: { x: 74, y: 76 },
          description: 'Bloqueador sela a Linha na Entrada. Defensor cobre toda a Diagonal aberta no fundo.',
        };
      case '2_fingers':
        // 2 Dedos: Bloqueador fecha Diagonal -> Defensor cobre Linha (Paralela)
        return {
          blocker: { x: 30, y: 12 },
          defender: { x: 20, y: 78 },
          description: 'Bloqueador fecha a Diagonal cruzada. Defensor protege o corredor da Linha.',
        };
      case 'open_hand':
        // Mão Aberta: Leitura de Bola -> Defesa centralizada
        return {
          blocker: { x: 24, y: 12 },
          defender: { x: 50, y: 72 },
          description: 'Bloqueador salta alinhado na bola. Defensor em base equilibrada no meio de quadra.',
        };
      case 'closed_fist':
        // Punho Fechado: Recuo / Pull (Sem Bloqueio) -> Ambos defendem no fundo
        return {
          blocker: { x: 30, y: 56 },
          defender: { x: 72, y: 78 },
          description: 'Sem bloqueio! O bloqueador recua da rede e a dupla forma defesa dupla no fundo.',
        };
      case 'shade_cut':
        // Shade Cut: Bloqueador invade para a diagonal curta -> Defensor antecipa largada curta
        return {
          blocker: { x: 25, y: 12 },
          defender: { x: 62, y: 42 },
          description: 'Bloqueador invade com braço interno. Defensor arranca para buscar o cut shot curto.',
        };
      default:
        return {
          blocker: { x: 25, y: 12 },
          defender: { x: 70, y: 75 },
          description: 'Posicionamento padrão de marcação na Entrada de Rede.',
        };
    }
  } else {
    // ATACANTE NA SAÍDA DE REDE (DIREITA / POSIÇÃO 2 ADVERSÁRIA)
    switch (signal) {
      case '1_finger':
        // 1 Dedo: Bloqueador fecha Linha na Saída -> Defensor cobre Diagonal esquerda
        return {
          blocker: { x: 82, y: 12 },
          defender: { x: 26, y: 76 },
          description: 'Bloqueador sela a Linha na Saída. Defensor cobre a Diagonal profunda à esquerda.',
        };
      case '2_fingers':
        // 2 Dedos: Bloqueador fecha Diagonal -> Defensor cobre Linha direita
        return {
          blocker: { x: 70, y: 12 },
          defender: { x: 80, y: 78 },
          description: 'Bloqueador fecha a Diagonal cruzada. Defensor protege a Linha da Saída.',
        };
      case 'open_hand':
        // Mão Aberta: Leitura de Bola na Saída
        return {
          blocker: { x: 76, y: 12 },
          defender: { x: 50, y: 72 },
          description: 'Bloqueador sobe na bola na Saída. Defensor cobre o centro para largadas.',
        };
      case 'closed_fist':
        // Punho Fechado: Recuo na Saída
        return {
          blocker: { x: 70, y: 56 },
          defender: { x: 28, y: 78 },
          description: 'Recuo da Saída! Bloqueador sai da fita e ambos defendem o fundo da quadra.',
        };
      case 'shade_cut':
        // Shade Cut na Saída
        return {
          blocker: { x: 75, y: 12 },
          defender: { x: 38, y: 42 },
          description: 'Bloqueador marca a largada da Saída. Defensor adianta para a diagonal curta.',
        };
      default:
        return {
          blocker: { x: 75, y: 12 },
          defender: { x: 30, y: 75 },
          description: 'Posicionamento padrão de marcação na Saída de Rede.',
        };
    }
  }
}

export const BEACH_ATTACK_SCENARIOS: BeachAttackScenario[] = [
  // =========================================================================
  // ENTRADA DE REDE (ESQUERDA / POSIÇÃO 4 ADVERSÁRIA)
  // =========================================================================
  {
    id: 'entrada_line_spike',
    name: 'Paralela na Entrada (Line Spike)',
    shortName: 'Paralela (Entrada)',
    category: 'potencia',
    icon: '⚡',
    tag: 'Entrada • Força',
    description: 'O atacante adversário salta na entrada de rede e solta o braço rente à fita lateral em alta velocidade.',
    tacticalKey: 'Se o sinal for 1 dedo (Linha), o bloqueador CRAVA O TOCO! Se for 2 dedos (Diagonal), a bola passa e o defensor pega na paralela.',
    attackerSide: 'left',
    blockDirectBlockSignal: '1_finger', // Bloqueador na linha dá o TOCO!
    recommendedDefenseSignal: '2_fingers', // Bloqueador na diagonal canaliza para o defensor pegar
    flightDuration: 1.15,
    ballApexY: 2.75,
    attackerCoords: { x: -2.8, y: 2.7, z: -1.2 },
    netCrossCoords: { x: -2.8, y: 2.58, z: 0.0 },
    targetContactCoords: { x: -2.7, y: 0.45, z: 5.8 },
    blockReboundCoords: { x: -2.8, y: 0.04, z: -2.1 }, // Chão adversário no toco
    defenderStart: { x: 20, y: 78 },
    defenderTarget: { x: 18, y: 78 },
    blockerJump: true,
    blockerPosition: { x: 18, y: 12 },
    blockerActionText: 'Salto firme com mãos coladas na antena, fechando completamente a passagem da paralela.',
    defenderActionText: 'Posiciona-se com base baixa colado à linha lateral para absorver a pancada se a bola passar.',
    tocoExplanation: '🛑 TOCO NA LINHA! O bloqueador acertou a marcação de 1 dedo, selou a antena e a bola explodiu no chão adversário!',
    windTip: 'Vento a favor empurra a bola mais rápida para baixo. No bloqueio, invada a mão com firmeza!',
  },
  {
    id: 'entrada_cross_spike',
    name: 'Diagonal Forte da Entrada (Cross Spike)',
    shortName: 'Diagonal (Entrada)',
    category: 'potencia',
    icon: '🔥',
    tag: 'Entrada • Força',
    description: 'O atacante bate cruzado no ângulo aberto da quadra, buscando o fundo da diagonal com potência máxima.',
    tacticalKey: 'Com sinal de 2 dedos (Diagonal), o bloqueador intercepta a bola na rede e dá o TOCO! Com 1 dedo (Linha), a defesa salva no fundo.',
    attackerSide: 'left',
    blockDirectBlockSignal: '2_fingers', // Bloqueador na diagonal dá o TOCO!
    recommendedDefenseSignal: '1_finger', // Bloqueador fecha linha -> Defesa pega na diagonal profunda
    flightDuration: 1.25,
    ballApexY: 2.8,
    attackerCoords: { x: -2.8, y: 2.7, z: -1.2 },
    netCrossCoords: { x: -1.5, y: 2.6, z: 0.0 },
    targetContactCoords: { x: 2.2, y: 0.42, z: 6.2 },
    blockReboundCoords: { x: -1.6, y: 0.04, z: -2.0 },
    defenderStart: { x: 74, y: 76 },
    defenderTarget: { x: 76, y: 80 },
    blockerJump: true,
    blockerPosition: { x: 30, y: 12 },
    blockerActionText: 'Paredão angulado para a diagonal! As duas mãos fecham a trajetória cruzada.',
    defenderActionText: 'Desloca-se em passos laterais cruzados para a diagonal profunda, esperando a bola na cintura.',
    tocoExplanation: '🛑 MONSTER BLOCK NA DIAGONAL! O bloqueador leu o golpe cruzado (2 dedos), bloqueou a fita e cravou o ponto!',
    windTip: 'Vento lateral sopra a bola ainda mais para fora. O bloqueador deve manter as mãos rígidas sem abrir os braços.',
  },
  {
    id: 'entrada_cut_shot',
    name: 'Cut Shot da Entrada (Largada Curta)',
    shortName: 'Cut Shot (Entrada)',
    category: 'habilidade',
    icon: '🎯',
    tag: 'Entrada • Habilidade',
    description: 'Golpe clássico de alta perícia: o atacante simula cortada forte e toca a bola de lado na diagonal curta.',
    tacticalKey: 'Com Cut Shade ou mão aberta, o bloqueador invade e pode amortecer ou bloquear na fita; caso contrário, o defensor arranca em peixinho.',
    attackerSide: 'left',
    blockDirectBlockSignal: 'shade_cut',
    recommendedDefenseSignal: '1_finger',
    flightDuration: 1.65,
    ballApexY: 2.9,
    attackerCoords: { x: -2.8, y: 2.65, z: -1.0 },
    netCrossCoords: { x: -0.9, y: 2.65, z: 0.0 },
    targetContactCoords: { x: 1.2, y: 0.35, z: 2.5 },
    blockReboundCoords: { x: -1.2, y: 0.04, z: -1.6 },
    defenderStart: { x: 62, y: 42 },
    defenderTarget: { x: 62, y: 32 },
    blockerJump: true,
    blockerPosition: { x: 25, y: 12 },
    blockerActionText: 'Tenta "sombrear" o cut shot esticando o braço interno em invasão agressiva sobre a rede.',
    defenderActionText: 'Arrancada explosiva para a frente em direção à rede para salvar com peixinho ou rolamento.',
    tocoExplanation: '🛑 TOCO NO CUT SHOT! O bloqueador invadiu o braço interno sobre a fita e interceptou a largada do atacante!',
    windTip: 'Vento contra segura a bola no ar e faz o cut shot cair ainda mais curto.',
  },
  {
    id: 'entrada_deep_pokey',
    name: 'Largada no Fundo da Entrada (Pokey Lob)',
    shortName: 'Largada Fundo (Entrada)',
    category: 'habilidade',
    icon: '🌈',
    tag: 'Entrada • Parábola',
    description: 'Bola empurrada com os nós dos dedos rígidos em parábola alta por cima do bloqueio, caindo no fundo da quadra.',
    tacticalKey: 'Muito usada para superar o bloqueador alto. Exige recuo rápido do defensor com leitura visual do braço adversário.',
    attackerSide: 'left',
    blockDirectBlockSignal: 'open_hand', // Salto alto máximo na leitura
    recommendedDefenseSignal: '1_finger',
    flightDuration: 2.05,
    ballApexY: 3.4,
    attackerCoords: { x: -2.8, y: 2.7, z: -1.2 },
    netCrossCoords: { x: -1.8, y: 3.2, z: 0.0 },
    targetContactCoords: { x: 1.8, y: 0.5, z: 6.8 },
    blockReboundCoords: { x: -2.2, y: 0.04, z: -2.2 },
    defenderStart: { x: 60, y: 65 },
    defenderTarget: { x: 74, y: 88 },
    blockerJump: true,
    blockerPosition: { x: 22, y: 12 },
    blockerActionText: 'Salto vertical completo para tentar tocar na bola alta e avisa "FUNDO!" para o parceiro.',
    defenderActionText: 'Recuo em arco com passadas rápidas na areia, preparando toque alto aberto ou manchete defensiva.',
    tocoExplanation: '🛑 TOCO NO TOPO! O bloqueador esticou os dedos no ponto mais alto e interceptou o pokey lob no ar!',
    windTip: 'Vento a favor empurra a bola para fora; confira a trajetória antes de tocar.',
  },
  {
    id: 'entrada_deep_roll',
    name: 'Bola Empurrada na Paralela (Entrada)',
    shortName: 'Bola Empurrada (Entrada)',
    category: 'tatica',
    icon: '💨',
    tag: 'Entrada • Controle',
    description: 'Ataque rolado com giro para frente (topspin) colocado no fundo do corredor desprotegido da linha.',
    tacticalKey: 'A bola ganha aceleração ao tocar a areia. O defensor precisa acompanhar até a linha de fundo.',
    attackerSide: 'left',
    blockDirectBlockSignal: '1_finger',
    recommendedDefenseSignal: '2_fingers',
    flightDuration: 1.55,
    ballApexY: 3.0,
    attackerCoords: { x: -2.8, y: 2.65, z: -1.2 },
    netCrossCoords: { x: -2.4, y: 2.8, z: 0.0 },
    targetContactCoords: { x: -2.5, y: 0.4, z: 7.2 },
    blockReboundCoords: { x: -2.7, y: 0.04, z: -2.3 },
    defenderStart: { x: 20, y: 78 },
    defenderTarget: { x: 18, y: 90 },
    blockerJump: true,
    blockerPosition: { x: 18, y: 12 },
    blockerActionText: 'Marca a linha com salto alto para diminuir a profundidade da bola rolada.',
    defenderActionText: 'Faz leitura antecipada do pulso do atacante e recua até a linha dos 16m.',
    tocoExplanation: '🛑 TOCO NA LINHA! O bloqueador fechou a paralela e não deixou a bola empurrada passar!',
    windTip: 'Atenção à rajada de vento que pode empurrar a bola para fora da linha dos 16 metros.',
  },

  // =========================================================================
  // SAÍDA DE REDE (DIREITA / POSIÇÃO 2 ADVERSÁRIA)
  // =========================================================================
  {
    id: 'saida_line_spike',
    name: 'Paralela na Saída (Line Spike)',
    shortName: 'Paralela (Saída)',
    category: 'potencia',
    icon: '⚡',
    tag: 'Saída • Força',
    description: 'O atacante adversário salta na saída de rede e golpeia reto pela fita lateral direita com muita velocidade.',
    tacticalKey: 'Sinal de 1 dedo na Saída fecha a linha lateral direita. Se acertar o tempo, CRAVA O TOCO! Se marcar diagonal, a defesa pega.',
    attackerSide: 'right',
    blockDirectBlockSignal: '1_finger',
    recommendedDefenseSignal: '2_fingers',
    flightDuration: 1.15,
    ballApexY: 2.75,
    attackerCoords: { x: 2.8, y: 2.7, z: -1.2 },
    netCrossCoords: { x: 2.8, y: 2.58, z: 0.0 },
    targetContactCoords: { x: 2.7, y: 0.45, z: 5.8 },
    blockReboundCoords: { x: 2.8, y: 0.04, z: -2.1 },
    defenderStart: { x: 80, y: 78 },
    defenderTarget: { x: 82, y: 78 },
    blockerJump: true,
    blockerPosition: { x: 82, y: 12 },
    blockerActionText: 'Mãos seladas na antena direita, fechando qualquer corredor de paralela.',
    defenderActionText: 'Base baixa posicionada na linha lateral direita para recolher a batida.',
    tocoExplanation: '🛑 TOCO NA SAÍDA! O bloqueador fechou a antena direita com 1 dedo e afundou a bola no campo adversário!',
    windTip: 'Vento soprando da direita para a esquerda empurra a bola para dentro da quadra.',
  },
  {
    id: 'saida_cross_spike',
    name: 'Diagonal Forte da Saída (Cross Spike)',
    shortName: 'Diagonal (Saída)',
    category: 'potencia',
    icon: '🔥',
    tag: 'Saída • Força',
    description: 'O atacante da saída solta o braço cruzado em direção ao fundo esquerdo da nossa quadra.',
    tacticalKey: 'Com 2 dedos na Saída, o bloqueador fecha a diagonal e DÁ O TOCO! Com 1 dedo, a defesa busca a bola no fundo esquerdo.',
    attackerSide: 'right',
    blockDirectBlockSignal: '2_fingers',
    recommendedDefenseSignal: '1_finger',
    flightDuration: 1.25,
    ballApexY: 2.8,
    attackerCoords: { x: 2.8, y: 2.7, z: -1.2 },
    netCrossCoords: { x: 1.5, y: 2.6, z: 0.0 },
    targetContactCoords: { x: -2.2, y: 0.42, z: 6.2 },
    blockReboundCoords: { x: 1.6, y: 0.04, z: -2.0 },
    defenderStart: { x: 26, y: 76 },
    defenderTarget: { x: 24, y: 80 },
    blockerJump: true,
    blockerPosition: { x: 70, y: 12 },
    blockerActionText: 'Muralha inclinada para o centro, selando o ângulo da diagonal cruzada da saída.',
    defenderActionText: 'Desloca-se para a diagonal profunda esquerda, pronto para a manchete estável.',
    tocoExplanation: '🛑 TOCO SENSACIONAL! O bloqueador leu a diagonal da saída com 2 dedos e cravou a bola na areia!',
    windTip: 'Atenção com a rajada de vento lateral que pode tirar a bola da quadra.',
  },
  {
    id: 'saida_cut_shot',
    name: 'Cut Shot da Saída (Diagonal Curta)',
    shortName: 'Cut Shot (Saída)',
    category: 'habilidade',
    icon: '🎯',
    tag: 'Saída • Habilidade',
    description: 'Toque colocado com giro cortado saindo da rede em direção à diagonal curta esquerda.',
    tacticalKey: 'Com Cut Shade, o bloqueador penetra a mão e bloqueia a bola curta; a defesa precisa de arrancada rápida para a fita.',
    attackerSide: 'right',
    blockDirectBlockSignal: 'shade_cut',
    recommendedDefenseSignal: '1_finger',
    flightDuration: 1.65,
    ballApexY: 2.9,
    attackerCoords: { x: 2.8, y: 2.65, z: -1.0 },
    netCrossCoords: { x: 0.9, y: 2.65, z: 0.0 },
    targetContactCoords: { x: -1.2, y: 0.35, z: 2.5 },
    blockReboundCoords: { x: 1.2, y: 0.04, z: -1.6 },
    defenderStart: { x: 38, y: 42 },
    defenderTarget: { x: 38, y: 32 },
    blockerJump: true,
    blockerPosition: { x: 75, y: 12 },
    blockerActionText: 'Braço interno esticado em invasão sobre a rede para interceptar a trajetória curta.',
    defenderActionText: 'Arranca em velocidade máxima para a rede para erguer a bola antes de tocar o solo.',
    tocoExplanation: '🛑 TOCO NA FITA! O bloqueador esticou o braço em shade cut e bloqueou o toque colocado!',
    windTip: 'Vento contra segura a bola no ar e faz a largada morrer mais rápido.',
  },
  {
    id: 'saida_deep_pokey',
    name: 'Largada no Fundo da Saída (Pokey Lob)',
    shortName: 'Largada Fundo (Saída)',
    category: 'habilidade',
    icon: '🌈',
    tag: 'Saída • Parábola',
    description: 'Bola empurrada alta de nós de dedos por cima do bloqueio da saída, buscando o fundo oposto.',
    tacticalKey: 'Exige atenção para não morder a isca da rede. O defensor recua para o fundo esquerdo.',
    attackerSide: 'right',
    blockDirectBlockSignal: 'open_hand',
    recommendedDefenseSignal: '1_finger',
    flightDuration: 2.1,
    ballApexY: 3.4,
    attackerCoords: { x: 2.8, y: 2.7, z: -1.2 },
    netCrossCoords: { x: 1.8, y: 3.2, z: 0.0 },
    targetContactCoords: { x: -1.8, y: 0.5, z: 6.8 },
    blockReboundCoords: { x: 2.2, y: 0.04, z: -2.2 },
    defenderStart: { x: 35, y: 65 },
    defenderTarget: { x: 26, y: 88 },
    blockerJump: true,
    blockerPosition: { x: 78, y: 12 },
    blockerActionText: 'Salto vertical completo para tentar tocar a bola alta e grita "FUNDO!".',
    defenderActionText: 'Recuo em arco com passadas rápidas na areia para defender com manchete ou toque.',
    tocoExplanation: '🛑 TOCO NO ALTO! O bloqueador saltou no topo e tocou a bola alta de volta para o campo adversário!',
    windTip: 'Vento a favor empurra a bola para fora; observe a linha dos 16m.',
  },
  {
    id: 'saida_setter_dump',
    name: '2ª Intenção do Levantador (Setter Dump)',
    shortName: '2ª Intenção (Saída)',
    category: 'tatica',
    icon: '🦊',
    tag: 'Saída • Surpresa',
    description: 'O levantador na saída finge que vai armar o levantamento e golpeia de primeira com a mão esquerda no miolo da quadra.',
    tacticalKey: 'Com Mão Aberta (Leitura da Bola), o bloqueador não é enganado e CRAVA O TOCO na rede! Sem leitura, a defesa corre para fechar o centro.',
    attackerSide: 'right',
    blockDirectBlockSignal: 'open_hand', // Bloqueador lê a bola e dá o TOCO!
    recommendedDefenseSignal: 'open_hand',
    flightDuration: 1.15,
    ballApexY: 2.7,
    attackerCoords: { x: 1.2, y: 2.5, z: -0.8 },
    netCrossCoords: { x: 0.4, y: 2.55, z: 0.0 },
    targetContactCoords: { x: -0.6, y: 0.4, z: 3.8 },
    blockReboundCoords: { x: 0.6, y: 0.04, z: -1.5 },
    defenderStart: { x: 50, y: 72 },
    defenderTarget: { x: 42, y: 50 },
    blockerJump: true,
    blockerPosition: { x: 60, y: 12 },
    blockerActionText: 'Detecta a mão rápida do levantador e fecha o meio de rede imediatamente com salto curto.',
    defenderActionText: 'Dá dois passos rápidos para fechar o buraco no meio da quadra.',
    tocoExplanation: '🛑 TOCO DE LEITURA! O bloqueador não caiu na fita do levantador, subiu com as duas mãos e cravou a 2ª intenção!',
    windTip: 'A bola cai rápida no miolo da quadra. Se houver vento contra, fica mais fácil para a defesa.',
  },
  {
    id: 'saida_deep_roll',
    name: 'Bola Empurrada na Paralela (Saída)',
    shortName: 'Bola Empurrada (Saída)',
    category: 'tatica',
    icon: '💨',
    tag: 'Saída • Controle',
    description: 'Bola rolada longa com topspin no corredor fundo da linha lateral direita.',
    tacticalKey: 'Marcação de 1 dedo fecha a linha e impede a bola longa; na defesa, recuo até a linha de fundo.',
    attackerSide: 'right',
    blockDirectBlockSignal: '1_finger',
    recommendedDefenseSignal: '2_fingers',
    flightDuration: 1.55,
    ballApexY: 3.0,
    attackerCoords: { x: 2.8, y: 2.65, z: -1.2 },
    netCrossCoords: { x: 2.4, y: 2.8, z: 0.0 },
    targetContactCoords: { x: 2.5, y: 0.4, z: 7.2 },
    blockReboundCoords: { x: 2.6, y: 0.04, z: -2.3 },
    defenderStart: { x: 80, y: 78 },
    defenderTarget: { x: 82, y: 90 },
    blockerJump: true,
    blockerPosition: { x: 82, y: 12 },
    blockerActionText: 'Marca a linha na saída diminuindo o ângulo para a bola longa.',
    defenderActionText: 'Recua rapidamente para recolher a bola rolada no fundo da linha.',
    tocoExplanation: '🛑 TOCO NA LINHA DA SAÍDA! O bloqueador selou a paralela e bloqueou a bola empurrada!',
    windTip: 'Vento a favor empurra a bola rolada para fora. Fique atento!',
  },
];
