# 🏐 REDE VÔLEI — Plataforma & Simulador Tático de Voleibol

> **Plataforma interativa, pedagógica e gamificada para ensino, visualização e treinamento tático de Voleibol de Quadra (6x0, 4x2, 5x1) e Vôlei de Praia (com sinais de bloqueio).**  
> Desenvolvida com foco em Educação Física Escolar, categorias de base, treinadores e estudantes do esporte.

---

## 📋 Sumário

1. [Visão Geral](#-visão-geral)
2. [Funcionalidades Principais](#-funcionalidades-principais)
3. [Stack Tecnológica e Versões](#-stack-tecnológica-e-versões)
4. [Arquitetura de Software](#-arquitetura-de-software)
5. [Estrutura de Diretórios](#-estrutura-de-diretórios)
6. [Regras Táticas e Algoritmos Implementados](#-regras-táticas-e-algoritmos-implementados)
7. [Pré-requisitos](#-pré-requisitos)
8. [Como Executar o Projeto Localmente](#-como-executar-o-projeto-localmente)
9. [Variáveis de Ambiente](#-variáveis-de-ambiente)
10. [Scripts Disponíveis](#-scripts-disponíveis)
11. [Preparação para Ecossistema Mobile (App Híbrido / Nativo)](#-preparação-para-ecossistema-mobile-app-híbrido--nativo)
12. [Acessibilidade & Boas Práticas (WCAG)](#-acessibilidade--boas-práticas-wcag)
13. [Licença e Créditos](#-licença-e-créditos)

---

## 🎯 Visão Geral

O **REDE VÔLEI** é uma aplicação web progressiva (PWA Ready) projetada para superar o desafio do ensino dos sistemas táticos do voleibol. Tradicionalmente explicado de forma abstrata em quadros brancos, o posicionamento de atletas e as regras de rodízio da FIVB ganham vida através de uma interface interativa com movimentação livre, animação de fases de jogo (Recepção do Saque vs. Ataque/Transição), validação automática de faltas de posicionamento e um simulador dedicado ao vôlei de praia com os sinais manuais codificados de bloqueio.

O projeto atende tanto o aluno em processo de aprendizagem individual quanto o professor em sala de aula ou quadra por meio de relatórios pedagógicos e controle de turmas.

---

## 🚀 Funcionalidades Principais

### 1. Prancheta Tática Interativa (Vôlei Indoor)
- **Sistemas Suportados**:
  - **Sistema 6x0 (Iniciação)**: Todos passam, todos levantam e atacam. Ideal para o ensino fundamental.
  - **Sistema 4x2 Simples (Básico)**: Dois levantadores opostos nas posições da rede, 4 atacantes/passadores.
  - **Sistema 4x2 Invertido com Infiltração**: Levantador da zona de defesa infiltra para levantar na rede, mantendo 3 atacantes de rede ativos.
  - **Sistema 5x1 Moderno**: 1 Levantador especialista, 1 Oposto de alta potência, 2 Ponteiros/Passadores, 2 Centrais e 1 Líbero.
- **Rotações Oficiais de R1 a R6**:
  - Navegação passo a passo entre todas as 6 rotações regulamentares.
  - Alternância imediata entre fases: **Recepção do Saque (Pass / Build-up)** e **Ataque / Transição / Defesa**.
  - Simulação animada do movimento de transição dos atletas com trajetórias curvas vetoriais.
- **Interatividade Total**:
  - Atletas arrastáveis diretamente pela tela (touch & mouse) para testar formações customizadas.
  - Botão de reset tático para restaurar a formação padrão da rotação selecionada.
  - Inspetor detalhado do atleta: camisa, função motora, responsabilidade principal e posicionamento na rotação.

### 2. Validador Algorítmico de Faltas de Posição (Regras FIVB 7.4 / 7.5)
- Validação em tempo real baseada na geometria de coordenadas cartesianas:
  - **Adjacência Lateral**: O jogador da esquerda deve ter ao menos parte de seu pé mais próximo da linha lateral esquerda do que o jogador do centro, e este em relação ao da direita (ex: P4 à esquerda de P3; P3 à esquerda de P2; P5 à esquerda de P6; P6 à esquerda de P1).
  - **Adjacência Anteroposterior**: Cada jogador da zona de ataque deve estar mais próximo da linha central do que seu respectivo correspondente da zona de defesa (P4 à frente de P5; P3 à frente de P6; P2 à frente de P1).
  - **Tolerância Geométrica de 5%**: Evita falsos positivos em pequenas sobreposições de toque táctil.
  - Alertas visuais e sonoros com indicação dos pares em infração.

### 3. Simulador de Vôlei de Praia & Sinais Manuais de Bloqueio
- Quadra em formato 8m x 8m com textura de areia e física de vento ajustável (fraco, moderado, forte).
- **Mapeamento Oficial de Sinais de Bloqueio (Esquerda & Direita)**:
  - `1 Dedo`: Bloqueio na Linha (Paralela) — o defensor protege a diagonal.
  - `2 Dedos`: Bloqueio na Diagonal — o defensor protege o corredor.
  - `Punho Fechado`: Sem Bloqueio (Bloqueio Zero / Falso Bloqueio) — recuo para defesa de fundo.
  - `Mão Aberta`: Bloqueio na Bola / Leitura de Ataque.
- Movimentação sincronizada do parceiro defensor de acordo com o sinal acordado.

### 4. Sistema de Gamificação & Quests Didáticas
- **4 Trilhas de Conhecimento Estruturadas**:
  1. *Fundamentos Básicos & 6x0*: Regras de toque, rotação no sentido horário e posições 1 a 6.
  2. *Especialização 4x2*: Compreensão de levantadores em diagonal e trocas na rede.
  3. *Mestrado no 5x1*: Infiltrações profundas de P1/P6/P5 sem cometer falta de sobreposição.
  4. *Táticas de Areia*: Antecipação de jogadas e comunicação tátil nas costas.
- **12 Desafios Práticos Interativos**: com premiação de XP, cálculo de estrelas (1 a 3 estrelas), cálculo de precisão e insígnias colecionáveis.

### 5. Modo Professor & Relatório de Desempenho
- Configuração de código de turma (ex: `TURMA-2026`), nome da escola e professor responsável.
- Tabela de acompanhamento de estudantes com status de conclusão, XP acumulado e nível.
- Geração de relatório formatado para avaliação contínua em Educação Física.

### 6. Contas de Usuário & Sessão Local
- Autenticação e troca de perfis (Aluno vs. Professor).
- Escolha de avatares com temática de voleibol.
- Persistência desacoplada que mantém histórico de progresso e preferências de interface.

---

## 🛠 Stack Tecnológica e Versões

A aplicação foi construída com tecnologias modernas de ponta no ecossistema JavaScript/TypeScript:

| Tecnologia | Versão | Finalidade |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` (Recomendado `20.x` ou `22.x`) | Ambiente de execução |
| **React** | `^19.0.1` | Biblioteca de interface reativa e componentes funcionais |
| **React DOM** | `^19.0.1` | Renderizador DOM do React 19 |
| **TypeScript** | `~5.8.2` | Tipagem estática rigorosa e segurança em tempo de compilação |
| **Vite** | `^6.2.3` | Bundler ultra-rápido com compilação ESM nativa |
| **Tailwind CSS** | `^4.1.14` | Engine de estilos utilitários via plugin `@tailwindcss/vite` |
| **Motion** | `^12.23.24` | Biblioteca de animações e transições declarativas (`motion/react`) |
| **Lucide React** | `^0.546.0` | Conjunto consistente de ícones vetoriais acessíveis |
| **Canvas Confetti** | `^1.9.4` | Feedback comemorativo ao concluir desafios e subir de nível |
| **Express** | `^4.21.2` | Servidor backend opcional para proxy seguro e rotas de API |
| **@google/genai** | `^2.4.0` | Integração server-side com a API Gemini |

---

## 🏛 Arquitetura de Software

O projeto segue princípios de **Clean Architecture**, **Separação de Preocupações (SoC)** e **Design Patterns** consagrados:

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                   │
│        React 19 Components + Tailwind CSS v4 + Motion       │
│  (TacticalBoard, Court2D, BeachSimulator, QuestSystem, ...) │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    CAMADA DE APLICAÇÃO                      │
│      Hooks Customizados (useBreakpoint) + AppNavigation      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                      MOTORES DE DOMÍNIO                     │
│  • rulesValidator: Geometria de quadra e regras FIVB 7.4/7.5 │
│  • gamificationEngine: Cálculo de XP, níveis e badges       │
│  • authEngine: Sessão, papéis (aluno/prof) e perfis         │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    CAMADA DE REPOSITÓRIOS                   │
│  • tacticsRepository: Presets de sistemas e rotações        │
│  • progressRepository: Gestão de conquistas e XP            │
│  • userRepository: Gestão de contas e perfis                │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                   INFRAESTRUTURA & SERVIÇOS                 │
│  • storageAdapter (IStorageAdapter): Web LocalStorage /     │
│    substituível por AsyncStorage / SQLite em mobile         │
│  • apiClient: Cliente HTTP padronizado e agnóstico          │
└─────────────────────────────────────────────────────────────┘
```

### Padrões de Projeto Destacados:
1. **Repository Pattern**: A interface não acessa dados brutos diretamente. Todas as leituras e gravações ocorrem através de classes de repositório (`tacticsRepository`, `progressRepository`, `userRepository`), permitindo futura troca para bancos em nuvem (como Firestore ou Cloud SQL) com zero impacto nos componentes visuais.
2. **Adapter Pattern (`IStorageAdapter`)**: Garante que o mecanismo de armazenamento de dados possa ser alternado conforme o ambiente (`WebLocalStorageAdapter` na Web, `AsyncStorageAdapter` em React Native, ou em memória em testes unitários).
3. **Pure Function Domain Engines**: Regras de validação de faltas de posição e progressão de XP são implementadas como funções puras sem dependência de estado de UI, facilitando testes e portabilidade.

---

## 📁 Estrutura de Diretórios

```bash
rede-volei/
├── .env.example              # Documentação das variáveis de ambiente necessárias
├── .gitignore                # Arquivos ignorados pelo controle de versão
├── index.html                # Entrypoint HTML com fontes do Google e meta tags
├── metadata.json             # Metadados e permissões da aplicação no AI Studio
├── package.json              # Dependências e scripts de automação
├── tsconfig.json             # Configurações do compilador TypeScript
├── vite.config.ts            # Configuração do Vite com suporte ao Tailwind v4
├── public/
│   ├── logo.svg              # Logotipo vetorial oficial do REDE VÔLEI
│   └── database_diagram.pdf  # Diagrama conceitual da arquitetura
└── src/
    ├── main.tsx              # Ponto de montagem da raiz React (createRoot)
    ├── App.tsx               # Componente central orquestrador das abas
    ├── index.css             # Folha de estilo global com design tokens e @import "tailwindcss"
    ├── types.ts              # Tipos TypeScript, interfaces e uniões de domínio
    ├── components/           # Componentes de interface do usuário
    │   ├── A11yAndSettingsModal.tsx # Modal de configurações de acessibilidade e temas
    │   ├── AppLogo.tsx              # Componente do brasão oficial em SVG
    │   ├── AppNavigation.tsx        # Navegação responsiva (Desktop / Mobile Drawer / Bottom Bar)
    │   ├── BeachSimulator.tsx       # Simulador tático de vôlei de praia (2x2)
    │   ├── Court2D.tsx              # Renderizador vetorial interativo da quadra
    │   ├── CourtPlayerCharacter.tsx # Boneco atleta estilizado com número e função
    │   ├── HandSignalsView.tsx      # Ilustrador vetorial dos sinais de mão para bloqueio
    │   ├── LoginScreen.tsx          # Tela de autenticação e seleção de papéis
    │   ├── QuestSystem.tsx          # Sistema de missões, desafios e feedback de XP
    │   ├── TacticalBoard.tsx        # Prancheta principal de voleibol indoor
    │   └── TeacherDashboard.tsx     # Painel de controle e relatórios para professores
    ├── constants/
    │   └── tacticsData.ts    # Coordenadas oficiais de todas as rotações (6x0, 4x2, 5x1)
    ├── engine/
    │   ├── authEngine.ts     # Lógica de controle de sessão e gerenciamento de perfis
    │   ├── gamificationEngine.ts # Regras de cálculo de XP, níveis e desbloqueio de badges
    │   └── rulesValidator.ts # Algoritmo de validação geométrica de faltas da FIVB
    ├── hooks/
    │   └── useBreakpoint.ts  # Hook responsivo dinâmico para detecção de viewport
    ├── repositories/
    │   ├── progressRepository.ts # Repositório de dados de progresso e preferências
    │   ├── tacticsRepository.ts  # Repositório de táticas e formações pré-definidas
    │   └── userRepository.ts      # Repositório de usuários cadastrados e sessão ativa
    └── services/
        ├── apiClient.ts      # Cliente HTTP padronizado com timeout e headers
        └── storageAdapter.ts # Interface abstrata de armazenamento (Web & Mobile)
```

---

## 📐 Regras Táticas e Algoritmos Implementados

### 1. Sistema de Coordenadas Normalizadas
A quadra é modelada em uma escala percentual normalizada de `0%` a `100%`:
- **Eixo X (Largura)**: `0%` (Linha lateral esquerda) até `100%` (Linha lateral direita).
- **Eixo Y (Profundidade)**: `0%` (Linha de fundo de defesa) até `100%` (Rede / Linha central).
- **Linha de Ataque (3 metros)**: Localizada geometricamente a `66.6%` da profundidade do semi-campo.

### 2. Zonas Oficiais da FIVB
```
                    REDE (Y = 100%)
   -------------------------------------------------
   |      P4 (Entrada)  |  P3 (Meio)   |  P2 (Saída)   |  -> ZONA DE ATAQUE
   -------------------------------------------------
   |              LINHA DOS 3 METROS (66.6%)        |
   -------------------------------------------------
   |      P5 (Fundo Esq)|  P6 (Fundo Cx)|  P1 (Saque)   |  -> ZONA DE DEFESA
   -------------------------------------------------
                  FUNDO (Y = 0%)
```

### 3. Validação de Sobreposição (FIVB 7.4 / 7.5)
O motor `rulesValidator.ts` executa a seguinte rotina de checagem a cada alteração de coordenadas:

```typescript
// 1. Verificação Anteroposterior (Ataque vs. Fundo)
P4.y > P5.y - tolerance; // P4 deve estar mais à frente que P5
P3.y > P6.y - tolerance; // P3 deve estar mais à frente que P6
P2.y > P1.y - tolerance; // P2 deve estar mais à frente que P1

// 2. Verificação Lateral na Rede
P4.x < P3.x + tolerance; // P4 deve estar mais à esquerda que P3
P3.x < P2.x + tolerance; // P3 deve estar mais à esquerda que P2

// 3. Verificação Lateral no Fundo
P5.x < P6.x + tolerance; // P5 deve estar mais à esquerda que P6
P6.x < P1.x + tolerance; // P6 deve estar mais à esquerda que P1
```

---

## 💻 Pré-requisitos

Antes de iniciar, certifique-se de possuir em seu computador:
1. **Node.js**: Versão `18.0.0` ou superior (recomendado utilizar a versão LTS `20.x` ou `22.x`).
   - Verifique sua versão com: `node -v`
2. **Gerenciador de Pacotes**: `npm` (já incluso no Node), `yarn`, `pnpm` ou `bun`.
3. **Git**: Para clonar o repositório.
4. **Navegador Web Atualizado**: Google Chrome, Mozilla Firefox, Microsoft Edge ou Safari.

---

## ⚡ Como Executar o Projeto Localmente

Siga o passo a passo abaixo para rodar o projeto na sua máquina:

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/rede-volei.git
cd rede-volei
```

### Passo 2: Instalar as Dependências
Execute o instalador padrão do seu gerenciador preferido:
```bash
# Utilizando npm:
npm install

# Ou utilizando pnpm:
pnpm install

# Ou utilizando yarn:
yarn install

# Ou utilizando bun:
bun install
```

### Passo 3: Configurar o Arquivo de Variáveis de Ambiente
Copie o arquivo de exemplo `.env.example` para `.env`:
```bash
cp .env.example .env
```
*(Nota: O simulador tático, a validação de regras e a gamificação funcionam 100% offline em modo cliente sem necessidade de preencher chaves de API imediatas).*

### Passo 4: Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

O terminal exibirá uma saída similar a:
```text
  VITE v6.2.3  ready in 240 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

Abra o seu navegador e acesse **`http://localhost:3000`**.

---

## 🔑 Variáveis de Ambiente

As configurações de ambiente são declaradas no arquivo `.env.example`:

| Variável | Obrigatória? | Descrição |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | Opcional | Chave da API do Google Gemini para recursos assistivos baseados em IA. |
| `APP_URL` | Opcional | URL base de hospedagem da aplicação para redirecionamentos e assets. |
| `VITE_API_BASE_URL` | Opcional | URL base do backend REST se for conectado a um servidor remoto. Padrão: `/api`. |

---

## 📜 Scripts Disponíveis

No arquivo `package.json` estão configurados os seguintes comandos:

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite ouvindo em `0.0.0.0:3000`. |
| `npm run build` | Compila o bundle TypeScript e minifica assets em formato de produção na pasta `dist/`. |
| `npm run preview` | Executa um servidor estático local para inspecionar os arquivos gerados em `dist/`. |
| `npm run lint` | Valida todos os tipos TypeScript do projeto sem emitir arquivos (`tsc --noEmit`). |
| `npm run clean` | Remove as pastas e artefatos de compilação temporários (`dist`). |

---

## 📱 Preparação para Ecossistema Mobile (App Híbrido / Nativo)

A arquitetura do REDE VÔLEI foi intencionalmente projetada para permitir transição simplificada para aplicativo móvel:

1. **Persistência Agnóstica**:
   O arquivo `src/services/storageAdapter.ts` define a interface `IStorageAdapter`. Para criar um app em **React Native**, basta instanciar um adaptador que utilize `@react-native-async-storage/async-storage`:
   ```typescript
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { IStorageAdapter } from './storageAdapter';

   export class NativeStorageAdapter implements IStorageAdapter {
     // Implementa getItem, setItem, removeItem usando AsyncStorage
   }
   ```
2. **Empacotamento com Capacitor / Ionic**:
   Como a aplicação é um SPA baseado em Vite + Tailwind CSS v4, você pode convertê-la diretamente em APK (Android) e IPA (iOS) via Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
   npx cap init "RedeVolei" "br.com.redevolei.app" --web-dir dist
   npm run build
   npx cap add android
   npx cap sync
   npx cap open android
   ```
3. **Navegação com Toque e Resolução Adaptativa**:
   - Touch targets mínimos de 44px (padrão Apple Human Interface / Material Design).
   - Barra de navegação inferior estilo nativo para uso com o polegar.
   - Prevenção de gestos conflitantes com a quadra (`touch-action: none` nos atletas arrastáveis).

---

## ♿ Acessibilidade & Boas Práticas (WCAG)

O REDE VÔLEI segue diretrizes internacionais de acessibilidade (WCAG 2.1 nível AA):
- **Modo Alto Contraste**: Fundo escuro profundo (`#000000`) com marcações e atletas em amarelo e branco fluorescente de alta luminância.
- **Temas de Piso da Quadra**: Escolha entre Taraflex Azul Clássico, Madeira de Ginásio, Laranja e Areia de Praia.
- **Tipografia Escalar**: Fontes *Plus Jakarta Sans* e *Outfit* configuradas com proporções óticas legíveis em qualquer tamanho de display.
- **IDs e Semântica**: Estrutura de botões com atributos de acessibilidade (`aria-label`), contraste verificado e indicação textual para elementos com significado por cor.

---

## 📄 Licença e Créditos

- **Projeto**: REDE VÔLEI
- **Finalidade**: Educacional, Esportiva e Pedagógica
- **Regras de Referência**: Regulamento Oficial de Voleibol e Vôlei de Praia da Federação Internacional de Voleibol (FIVB) e Confederação Brasileira de Voleibol (CBV).

---

*Feito com dedicação ao voleibol brasileiro e à Educação Física de qualidade!* 🏐🇧🇷
