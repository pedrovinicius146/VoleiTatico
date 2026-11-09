import React, { useState } from 'react';
import { BeachSignal } from '../types';
import { Shield, Sparkles, AlertCircle, Info, ChevronRight, CheckCircle2 } from 'lucide-react';

interface BeachSignalsExplainerProps {
  activeSignal?: BeachSignal;
  onSelectSignal?: (signal: BeachSignal) => void;
}

interface SignalGuideItem {
  id: BeachSignal;
  name: string;
  fingerIcon: string;
  meaning: string;
  blockerDuty: string;
  defenderDuty: string;
  whenToUse: string;
  proTip: string;
  tagColor: string;
}

export const BEACH_SIGNALS_EXPLANATION: SignalGuideItem[] = [
  {
    id: '1_finger',
    name: '1 Dedo (Linha / Paralela)',
    fingerIcon: '👉',
    meaning: 'Bloqueio sela o corredor reto da fita lateral (Paralela).',
    blockerDuty:
      'Salta colado à antena com as duas mãos invadindo retas, fechando qualquer passagem de bola pela linha.',
    defenderDuty:
      'Posiciona-se na diagonal profunda para buscar a pancada cruzada do atacante, pois a linha já está protegida pelo paredão.',
    whenToUse:
      'Contra atacantes que adoram explorar a paralela ou quando o vento sopra empurrando a bola em direção à linha.',
    proTip:
      'Se o atacante insistir em bater na paralela contra o sinal de 1 dedo, ele tomará TOCO (Monster Block) direto na fita!',
    tagColor: 'bg-blue-100 text-blue-900 border-blue-300',
  },
  {
    id: '2_fingers',
    name: '2 Dedos (Diagonal Cruzada)',
    fingerIcon: '✌️',
    meaning: 'Bloqueio fecha o ângulo aberto da quadra (Diagonal).',
    blockerDuty:
      'Salta ligeiramente afastado da antena, inclinando os braços para dentro da quadra para cortar a trajetória da cortada cruzada.',
    defenderDuty:
      'Posiciona-se no corredor da linha paralela para absorver o ataque reto que o bloqueador deixou propositalmente aberto.',
    whenToUse:
      'Contra atacantes de grande potência física que buscam o fundo da diagonal com velocidade máxima.',
    proTip:
      'Se o atacante soltar o braço cruzado contra o sinal de 2 dedos, a bola explode nas mãos do bloqueador e volta cravada no chão dele!',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    id: 'open_hand',
    name: 'Mão Aberta (Bola / Leitura)',
    fingerIcon: '✋',
    meaning: 'Bloqueio de Leitura na Bola (sem pré-definir linha ou diagonal).',
    blockerDuty:
      'Não se compromete antecipadamente com um lado. Observa a aproximação e salta alinhado exatamente onde a bola foi levantada.',
    defenderDuty:
      'Fica em base média balanceada no centro da quadra, pronto para reagir a largadas, ataques empurrados ou resvalos no bloqueio.',
    whenToUse:
      'Contra atacantes imprevisíveis, levantamentos colados na rede ou para neutralizar o ataque de 2ª intenção do levantador (setter dump).',
    proTip:
      'O bloqueador tem total liberdade para ler o braço do adversário no ar e fechar a porta no último instante!',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    id: 'closed_fist',
    name: 'Punho Fechado (Recuo / Pull / Sem Bloqueio)',
    fingerIcon: '✊',
    meaning: 'Não há bloqueio na rede! Recuo imediato para defesa dupla.',
    blockerDuty:
      'Finge que vai bloquear, mas dá 2 a 3 passadas rápidas para trás antes do golpe, saindo da rede para cavar no chão.',
    defenderDuty:
      'Divide a quadra de fundo com o parceiro. Cada atleta passa a ser responsável por uma metade da quadra.',
    whenToUse:
      'Quando o levantamento do adversário sai afastado da rede (mais de 1,5m) ou quando o atacante está desequilibrado e não tem ângulo para bater forte.',
    proTip:
      'Subir no bloqueio contra bola afastada da rede é erro grave: o atacante bate por cima com facilidade. O recuo garante 2 defensores no fundo!',
    tagColor: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  {
    id: 'shade_cut',
    name: 'Cut Shot (Sombra na Largada Curta)',
    fingerIcon: '👌',
    meaning: 'Marcação especializada para anular largadas curtas na diagonal.',
    blockerDuty:
      'Salta posicionando o corpo na linha, mas invade agressivamente com o braço interno sobre a rede em direção à diagonal curta.',
    defenderDuty:
      'Adianta a sua base para a diagonal média/curta (em torno de 3m a 4m da rede) para cobrir qualquer largada que passe por cima da mão.',
    whenToUse:
      'Contra adversários habilidosos que usam e abusam de toques colocados curtos rente à fita (cut shots) em vez de cortadas fortes.',
    proTip:
      'A sombra do bloqueador retira o ângulo fácil da largadinha e força o adversário a tentar uma bola longa difícil no fundo.',
    tagColor: 'bg-rose-100 text-rose-900 border-rose-300',
  },
];

export const BeachSignalsExplainer: React.FC<BeachSignalsExplainerProps> = ({
  activeSignal = '1_finger',
  onSelectSignal,
}) => {
  const [selectedSignalId, setSelectedSignalId] = useState<BeachSignal>(activeSignal);

  const currentItem =
    BEACH_SIGNALS_EXPLANATION.find((item) => item.id === selectedSignalId) ||
    BEACH_SIGNALS_EXPLANATION[0];

  const handleChoose = (id: BeachSignal) => {
    setSelectedSignalId(id);
    if (onSelectSignal) {
      onSelectSignal(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col gap-4">
      {/* Cabeçalho do Segmento */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Manual Tático: O Que Cada Sinal de Bloqueio Faz na Areia
            </h3>
            <p className="text-xs text-slate-500">
              Aprenda a sincronia tática entre os dedos nas costas e a cobertura defensiva.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 self-start sm:self-auto">
          Código Oficial FIVB / CBV
        </span>
      </div>

      {/* Botões dos 5 Sinais */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {BEACH_SIGNALS_EXPLANATION.map((item) => {
          const isSelected = selectedSignalId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleChoose(item.id)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                isSelected
                  ? 'bg-slate-900 text-white border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{item.fingerIcon}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <strong className="text-xs font-black block leading-tight mt-0.5">
                {item.name.split(' (')[0]}
              </strong>
              <span
                className={`text-[10px] ${
                  isSelected ? 'text-amber-300 font-bold' : 'text-slate-500'
                }`}
              >
                {item.id === '1_finger'
                  ? 'Linha'
                  : item.id === '2_fingers'
                  ? 'Diagonal'
                  : item.id === 'open_hand'
                  ? 'Bola'
                  : item.id === 'closed_fist'
                  ? 'Recuo'
                  : 'Cut'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cartão de Detalhamento do Sinal Selecionado */}
      <div className="bg-slate-950 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col gap-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{currentItem.fingerIcon}</span>
            <div>
              <h4 className="font-black text-sm text-amber-400">{currentItem.name}</h4>
              <p className="text-xs text-slate-400">{currentItem.meaning}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            Sinal Ativo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Missão do Bloqueador */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>Função do Bloqueador (Na Rede)</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-medium">
              {currentItem.blockerDuty}
            </p>
          </div>

          {/* Missão do Defensor */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Função do Defensor (No Fundo)</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-medium">
              {currentItem.defenderDuty}
            </p>
          </div>
        </div>

        {/* Quando Usar e Dica Profissional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
            <strong className="text-white block mb-0.5">⏱️ Quando Usar:</strong>
            {currentItem.whenToUse}
          </div>
          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200">
            <strong className="text-amber-300 block mb-0.5">💡 Dica do Bloqueador (Toco):</strong>
            {currentItem.proTip}
          </div>
        </div>
      </div>
    </div>
  );
};
