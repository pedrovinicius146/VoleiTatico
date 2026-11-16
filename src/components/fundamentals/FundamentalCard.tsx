import React from 'react';
import { FundamentalData } from '../../types/fundamentals';
import { FundamentalIllustration } from './FundamentalIllustration';
import { ArrowRight, CheckCircle2, Heart } from 'lucide-react';

interface FundamentalCardProps {
  fundamental: FundamentalData;
  isCompleted: boolean;
  isFavorite: boolean;
  onSelect: (id: FundamentalData['id']) => void;
  onToggleFavorite: (id: FundamentalData['id']) => void;
}

export const FundamentalCard: React.FC<FundamentalCardProps> = ({
  fundamental,
  isCompleted,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  const difficultyTone =
    fundamental.difficulty === 'Iniciante'
      ? 'text-emerald-700'
      : fundamental.difficulty === 'Intermediário'
      ? 'text-blue-700'
      : 'text-amber-700';

  return (
    <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      {/* Visual Preview Header */}
      <div>
        <div className="relative bg-slate-950 overflow-hidden">
          <FundamentalIllustration
            id={fundamental.id}
            className="w-full h-44 object-cover block"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(fundamental.id);
            }}
            aria-label={
              isFavorite
                ? `Remover ${fundamental.title} dos favoritos`
                : `Favoritar ${fundamental.title}`
            }
            className={`absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center transition-colors border ${
              isFavorite
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-950/75 text-slate-200 hover:text-white border-white/15'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="p-5 pb-4">
          {/* Unboxed clean metadata line */}
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-500 mb-2">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="tabular-nums text-slate-400">
                0{fundamental.order}
              </span>
              <span aria-hidden="true">·</span>
              <span className={difficultyTone}>{fundamental.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{fundamental.categoryLabel}</span>
            </div>

            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Concluído
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
            {fundamental.title}
          </h3>

          <p className="text-sm text-slate-600 leading-relaxed mt-1.5 line-clamp-3">
            {fundamental.shortDescription}
          </p>

          {/* Compact sub-topics list */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-1.5">
              Técnicas abordadas ({fundamental.variants.length} animações 3D):
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              {fundamental.subTopics.join(' · ')}
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 pb-5 pt-1 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-500 tabular-nums">
          ~{fundamental.estimatedMinutes} min
        </span>
        <button
          type="button"
          onClick={() => onSelect(fundamental.id)}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Aprender fundamento</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};
