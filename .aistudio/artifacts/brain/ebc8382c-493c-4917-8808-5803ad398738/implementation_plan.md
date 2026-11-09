# Simulador 3D de Ataques e Defesas Táticas no Vôlei de Praia

Simulação interativa em tempo real com animações 3D sincronizadas de cada tipo de ataque adversário no vôlei de praia, demonstrando a trajetória balística da bola, a atuação do bloqueador na rede e a resposta de corrida e manchete do defensor na areia.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões Confirmadas pelo Usuário (Fase 1):**
> - **Cenários de Ataque Incluídos**: 6 variações completas de ataque: (1) Paralela (Line Spike), (2) Diagonal Forte (Hard Cross), (3) Cut Shot (Largada Curta), (4) Largada no Fundo (Deep Pokey/Lob), (5) Ataque de 2ª Intenção e (6) Bola Empurrada no Fundo (Deep Push/Roll).
> - **Modo de Acionamento**: Reprodução automática da animação 3D ao selecionar o cenário tático, acompanhada de botões de Replay, Pausa e Seletor de Câmera de Imersão.

---

### 1. Overview & Core Concept

- **O que faz**: Adiciona um motor de animação tridimensional à arena de vôlei de praia (`BeachCourt3D`), onde cada golpe adversário ganha vida visual. O usuário vê o atacante adversário (silhueta/avatar 3D no outro lado da rede) golpeando a bola, a trajetória parabólica realista da bola cruzando a rede ou contornando o bloqueio, o bloqueador saltando para cobrir o corredor combinado pelo sinal de dedo, e o defensor correndo na areia para efetuar a manchete ou defesa peixinho.
- **Público-alvo**: Atletas, professores de educação física, treinadores e estudantes de voleibol que precisam compreender visualmente e espacialmente a relação causa-efeito entre o sinal nas costas, o bloqueio e a leitura defensiva.
- **Valor Didático**: Elimina o pensamento abstrato estático. O aluno compreende por que a paralela deve ser coberta quando o bloqueio é diagonal, ou por que o cut shot exige aproximação veloz do defensor antes da bola tocar o solo.

---

### 2. User Experience & Visual Design

#### Fluxo do Usuário
1. O usuário entra na aba **Vôlei de Praia (Duplas 2x2)** e visualiza a **Arena 3D Praia**.
2. No painel tático, há um seletor visual em carrossel/grid de **Tipos de Ataque Adversário**:
   - ⚡ *Ataque Forte na Paralela*: O atacante fura a linha lateral; bloqueio fecha a diagonal; defensor corre rente à linha.
   - 🔥 *Ataque Forte na Diagonal*: O atacante crava no fundo da quadra cruzada; bloqueio fecha a paralela; defensor espalma no centro-diagonal.
   - 🎯 *Cut Shot (Largada Curta na Diagonal)*: Toque sutil por cima da fita na diagonal curta; defensor acelera em pique rasante para a rede.
   - 🌈 *Largada no Fundo (Pokey / Rainbow Lob)*: Bola alta colocada de nós dos dedos sobre o bloqueio; defensor recua em arco para defender de toque/manchete alta.
   - 🦊 *Ataque de Segunda Intenção*: O levantador adversário surpreende no segundo toque; bloqueador e defensor reagem ao cheque rápido.
   - 💨 *Bola Empurrada no Fundo (Deep Roll/Push)*: Bola longa e flutuante explorando os cantos da quadra; compensação de posicionamento de acordo com o vento ativo.
3. Ao clicar em qualquer um dos 6 ataques, a animação inicia **imediatamente**:
   - A bola 3D surge na mão do atacante adversário com efeito de rotação e rastro de vento.
   - O Bloqueador salta com elevação vertical e braços em invasão sobre o bordo superior da rede.
   - O Defensor se desloca da posição de espera para o ponto exato de recuperação da bola.
   - Ao ocorrer a defesa, partículas de areia sobem do solo e um indicador visual de "Defesa Perfeita" / "Leitura Correta" surge suavemente sobre a jogada.
4. Controles complementares: Botão de **Repetir Jogada (Replay)**, **Câmera Lenta (0.5x)** e troca de ângulo de câmera (Frente da Rede, Atrás da Defesa ou Ponto de Vista Aéreo).

#### Identidade Visual & Diretrizes Anti-Slop
- Cores de areia dourada texturizada (`#EAB308` / `#CA8A04`), fita azul oceano (`#0284C7`), uniforme atlético contrastante.
- Zero badges desnecessários, tipografia limpa em `Plus Jakarta Sans` / `Outfit`, separadores discretos com pontos médios (`·`).
- Nenhuma poluição de texto flutuante ou fake scoreboards: anotações contextuais claras de tempo de bola e trajetória.

---

### 3. Key Product Decisions & Trade-Offs

- **Trajetórias via Curvas de Bézier Tridimensionais (`THREE.CubicBezierCurve3D`)**:
  - *Abordagem*: Usar curvas matemáticas de Bézier com ponto de início (mão do atacante adversário em $Z < 0$), vértice superior sobre a rede ($Y \approx 2.8\text{m}$) e ponto de impacto no solo ou na manchete do defensor ($Z > 0$).
  - *Vantagem*: Garante física suave, previsibilidade de tempo de voo e interpolação contínua da bola e do defensor sem travamentos.
- **Sincronização Cinemática entre Bola e Jogador Defensor**:
  - *Abordagem*: O defensor calcula seu tempo de chegada para coincidir com $t = 0.85$ do ciclo da bola (instante do impacto da manchete), flexionando os joelhos e projetando o tronco para cima.
- **Integração sem Impacto em Telas Anteriores**:
  - A prancheta 2D continuará disponível sem quebrar o rodízio 5x1 ou as rotinas de duplo clique consolidadas.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BeachSimulator.tsx                              │
│  - attackType: 'line_spike' | 'cross_spike' | 'cut_shot' | ...        │
│  - isAnimating: boolean                                                │
│  - playbackSpeed: 1.0 | 0.5                                            │
│  - wind: WindDirection                                                 │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BeachCourt3D.tsx                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Three.js Scene                                                   │  │
│  │  - 3D Beach Volleyball (SphereMesh + FIVB color texture)         │  │
│  │  - Opponent Attacker Avatar (Jump & Spike Mesh)                  │  │
│  │  - Blocker 3D Mesh (Jump elevation & net reach)                  │  │
│  │  - Defender 3D Mesh (Sprint interpolation to contact point)      │  │
│  │  - Sand Impact Particle Emitter (InstancedMesh / Points)         │  │
│  │  - Attack Trajectory Arc Ribbon (Subtle dashed path)             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Tactical Overlay HUD                                             │  │
│  │  - Attack Title & Coach Rationale                                │  │
│  │  - Replay / Pause / Speed Switcher                               │  │
│  │  - Camera Viewport Presets                                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Estrutura de Dados dos 6 Ataques (`beachAttacksData.ts`)
```typescript
export interface BeachAttackScenario {
  id: string;
  name: string;
  tag: string;
  description: string;
  defenderAction: string;
  blockerAction: string;
  attackerPos: { x: number; y: number; z: number };
  netCrossPoint: { x: number; y: number; z: number };
  targetContactPoint: { x: number; y: number; z: number };
  ballSpeed: number; // segundos de voo
  ballArcHeight: number; // elevação máxima
  recommendedSignal: BeachSignal;
  windSensitivity: string;
}
```

---

### Verificação de Sucesso
1. **Zero Erros de Compilação e Linter**: Execução co-conjunta de `compile_applet` e `lint_applet`.
2. **Fluidez a 60 FPS**: Animação em Three.js usando `requestAnimationFrame` sem gargalos de recriação de geometrias no loop de render.
3. **Respeito aos Sinais e Regras FIVB**: A defesa responde com fidelidade técnica aos princípios de cobertura do vôlei de praia.
