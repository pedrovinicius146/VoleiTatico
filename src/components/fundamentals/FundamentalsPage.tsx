import React, { useState, useMemo } from 'react';
import { CourtTheme, UserProgress } from '../../types';
import {
  FundamentalCategory,
  FundamentalDifficulty,
  FundamentalId,
} from '../../types/fundamentals';
import { FUNDAMENTALS_DATA } from '../../constants/fundamentalsData';
import {
  getFundamentalsProgressSummary,
  isFundamentalCompleted,
  isFundamentalFavorite,
  recordFundamentalReview,
  toggleFundamentalCompleted,
  toggleFundamentalFavorite,
} from '../../engine/fundamentalsProgressEngine';
import { FundamentalCard } from './FundamentalCard';
import { FundamentalDetailView } from './FundamentalDetailView';
import { CheckCircle2, Heart, Filter } from 'lucide-react';

interface FundamentalsPageProps {
  userProgress: UserProgress;
  onProgressUpdate: (updated: UserProgress) => void;
  theme: CourtTheme;
}

type CategoryFilter =
  | 'all'
  | FundamentalCategory
  | 'favorites'
  | 'completed';

type DifficultyFilter = 'all' | FundamentalDifficulty;

const CATEGORY_FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'inicio_bola', label: 'Saque' },
  { id: 'controle_passe', label: 'Recepção & Levantamento' },
  { id: 'rede_ofensiva', label: 'Ataque' },
  { id: 'rede_defensiva', label: 'Bloqueio' },
  { id: 'base_quadra', label: 'Defesa & Movimentação' },
  { id: 'favorites', label: 'Favoritos' },
  { id: 'completed', label: 'Concluídos' },
];

const DIFFICULTY_FILTERS: { id: DifficultyFilter; label: string }[] = [
  { id: 'all', label: 'Todos os níveis' },
  { id: 'Iniciante', label: 'Iniciante' },
  { id: 'Intermediário', label: 'Intermediário' },
  { id: 'Avançado', label: 'Avançado' },
];

export const FundamentalsPage: React.FC<FundamentalsPageProps> = ({
  userProgress,
  onProgressUpdate,
  theme,
}) => {
  const [selectedFundamentalId, setSelectedFundamentalId] =
    useState<FundamentalId | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>('all');

  const progressSummary = useMemo(
    () =>
      getFundamentalsProgressSummary(userProgress, FUNDAMENTALS_DATA.length),
    [userProgress]
  );

  const filteredFundamentals = useMemo(() => {
    return FUNDAMENTALS_DATA.filter((item) => {
      if (difficultyFilter !== 'all' && item.difficulty !== difficultyFilter) {
        return false;
      }
      if (categoryFilter === 'favorites') {
        return progressSummary.favoriteIds.has(item.id);
      }
      if (categoryFilter === 'completed') {
        return progressSummary.completedIds.has(item.id);
      }
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [categoryFilter, difficultyFilter, progressSummary]);

  const selectedFundamental = useMemo(
    () =>
      FUNDAMENTALS_DATA.find((f) => f.id === selectedFundamentalId) || null,
    [selectedFundamentalId]
  );

  const handleOpenFundamental = (id: FundamentalId) => {
    setSelectedFundamentalId(id);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleCompleted = (id: FundamentalId) => {
    onProgressUpdate(toggleFundamentalCompleted(userProgress, id));
  };

  const handleToggleFavorite = (id: FundamentalId) => {
    onProgressUpdate(toggleFundamentalFavorite(userProgress, id));
  };

  const handleRepeatLesson = (id: FundamentalId) => {
    onProgressUpdate(recordFundamentalReview(userProgress, id));
  };

  // Lesson Detail View
  if (selectedFundamental) {
    return (
      <FundamentalDetailView
        fundamental={selectedFundamental}
        allFundamentals={FUNDAMENTALS_DATA}
        theme={theme}
        isCompleted={isFundamentalCompleted(userProgress, selectedFundamental.id)}
        isFavorite={isFundamentalFavorite(userProgress, selectedFundamental.id)}
        onBackToList={() => setSelectedFundamentalId(null)}
        onSelectFundamental={handleOpenFundamental}
        onToggleCompleted={handleToggleCompleted}
        onToggleFavorite={handleToggleFavorite}
        onRepeatLesson={handleRepeatLesson}
      />
    );
  }

  // Overview Catalog View
  return (
    <div className="space-y-6">
      {/* Header Hero + Progress Overview */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Fundamentos do Vôlei
            </h1>
            <p className="text-base sm:text-lg font-semibold text-blue-700">
              Aprenda, visualize e aperfeiçoe suas técnicas.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-1">
              Os fundamentos formam a base técnica de toda ação em quadra.
              Explore cada movimento em um palco 3D interativo — gire a câmera,
              use a câmera lenta, isole etapas do gesto e corrija erros comuns
              antes de ir para o jogo.
            </p>
          </div>

          {/* Real Progress Panel */}
          <div className="w-full lg:w-80 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Progresso de estudo
              </span>
              <span className="tabular-nums text-slate-900">
                {progressSummary.completedCount} / {progressSummary.totalCount}{' '}
                concluídos
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressSummary.percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="tabular-nums font-semibold">
                {progressSummary.percentage}% concluído
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                {progressSummary.favoritesCount} favoritos
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Category & Difficulty Filter Bar */}
      <section
        aria-label="Filtros de fundamentos"
        className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 inline-flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Categoria:
            </span>
            {CATEGORY_FILTERS.map((cat) => {
              const active = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Difficulty Filter */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {DIFFICULTY_FILTERS.map((diff) => {
              const active = difficultyFilter === diff.id;
              return (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setDifficultyFilter(diff.id)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {diff.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cards Grid */}
      {filteredFundamentals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFundamentals.map((item) => (
            <FundamentalCard
              key={item.id}
              fundamental={item}
              isCompleted={isFundamentalCompleted(userProgress, item.id)}
              isFavorite={isFundamentalFavorite(userProgress, item.id)}
              onSelect={handleOpenFundamental}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <p className="text-base font-bold text-slate-900">
            Nenhum fundamento encontrado para esse filtro.
          </p>
          <p className="text-sm text-slate-500">
            Altere a categoria ou o nível de dificuldade selecionado para ver os
            7 fundamentos disponíveis.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              setDifficultyFilter('all');
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold cursor-pointer"
          >
            Mostrar todos os fundamentos
          </button>
        </div>
      )}
    </div>
  );
};
