import { UserProgress } from '../types';
import { FundamentalId } from '../types/fundamentals';

export interface FundamentalsProgressSummary {
  completedCount: number;
  totalCount: number;
  percentage: number;
  favoritesCount: number;
  completedIds: Set<string>;
  favoriteIds: Set<string>;
}

export function getFundamentalsProgressSummary(
  progress: UserProgress,
  totalFundamentals: number
): FundamentalsProgressSummary {
  const completedMap = progress.completedFundamentals || {};
  const favoritesArr = progress.favoriteFundamentals || [];
  const completedIds = new Set(Object.keys(completedMap));
  const favoriteIds = new Set(favoritesArr);
  const completedCount = completedIds.size;
  const percentage =
    totalFundamentals > 0
      ? Math.round((completedCount / totalFundamentals) * 100)
      : 0;

  return {
    completedCount,
    totalCount: totalFundamentals,
    percentage,
    favoritesCount: favoriteIds.size,
    completedIds,
    favoriteIds,
  };
}

export function isFundamentalCompleted(
  progress: UserProgress,
  id: FundamentalId
): boolean {
  return Boolean(progress.completedFundamentals?.[id]);
}

export function isFundamentalFavorite(
  progress: UserProgress,
  id: FundamentalId
): boolean {
  return Boolean(progress.favoriteFundamentals?.includes(id));
}

export function toggleFundamentalCompleted(
  progress: UserProgress,
  id: FundamentalId
): UserProgress {
  const currentMap = { ...(progress.completedFundamentals || {}) };
  if (currentMap[id]) {
    delete currentMap[id];
  } else {
    currentMap[id] = {
      completedAt: Date.now(),
      reviewCount: 1,
    };
  }

  return {
    ...progress,
    completedFundamentals: currentMap,
  };
}

export function recordFundamentalReview(
  progress: UserProgress,
  id: FundamentalId
): UserProgress {
  const currentMap = { ...(progress.completedFundamentals || {}) };
  const existing = currentMap[id];
  if (!existing) return progress;

  currentMap[id] = {
    ...existing,
    reviewCount: (existing.reviewCount || 1) + 1,
  };

  return {
    ...progress,
    completedFundamentals: currentMap,
  };
}

export function toggleFundamentalFavorite(
  progress: UserProgress,
  id: FundamentalId
): UserProgress {
  const currentFavs = new Set(progress.favoriteFundamentals || []);
  if (currentFavs.has(id)) {
    currentFavs.delete(id);
  } else {
    currentFavs.add(id);
  }

  return {
    ...progress,
    favoriteFundamentals: Array.from(currentFavs),
  };
}
