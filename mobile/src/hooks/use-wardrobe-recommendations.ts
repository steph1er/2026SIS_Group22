import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { useAuth } from '../auth/auth-provider';
import { fetchRecommendations } from '../services/wishlist/wishlist-service';
import type { CatalogueItem } from '../services/wishlist/wishlist-types';
import type { FilterCategory } from '../services/create-outfit/create-outfit-service';

const ITEMS_PER_CATEGORY = 5;

const CATEGORIES: { key: FilterCategory; label: string }[] = [
  { key: 'tops', label: 'Tops' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'outerwear', label: 'Outerwear' },
  { key: 'dresses', label: 'Dresses' },
  { key: 'shoes', label: 'Shoes' },
  { key: 'other', label: 'Other' },
];

export type RecommendationSection = {
  key: FilterCategory;
  label: string;
  items: CatalogueItem[];
  error: string | null;
};

type RecommendationsState = {
  userId: string | null;
  sections: RecommendationSection[];
  isLoading: boolean;
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Up to 5 recommended catalogue items per canonical category (tops/bottoms/outerwear/
 * dresses/shoes/other), for the "Recommended for you" section on the Wardrobe tab.
 *
 * Each category is fetched independently so one category failing (or having nothing to
 * recommend yet) doesn't take down the others.
 */
export function useWardrobeRecommendations() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id ?? null;

  const [state, setState] = useState<RecommendationsState>({ userId: null, sections: [], isLoading: true });
  const [reloadCount, setReloadCount] = useState(0);

  // Lets async callbacks check they still belong to the signed-in user.
  const userIdRef = useRef<string | null>(userId);
  userIdRef.current = userId;

  const load = useCallback(async (forUser: string) => {
    setState((previous) => ({
      userId: forUser,
      sections: previous.userId === forUser ? previous.sections : [],
      isLoading: true,
    }));

    const sections = await Promise.all(
      CATEGORIES.map(async ({ key, label }): Promise<RecommendationSection> => {
        try {
          const items = await fetchRecommendations({ limit: ITEMS_PER_CATEGORY, category: key });
          return { key, label, items, error: null };
        } catch (error) {
          return { key, label, items: [], error: errorMessage(error, 'Unable to load recommendations.') };
        }
      }),
    );

    if (userIdRef.current === forUser) {
      setState({ userId: forUser, sections, isLoading: false });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) void load(userId);
      // reloadCount only exists to re-run this effect from refresh().
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, reloadCount, load]),
  );

  const isCurrent = state.userId === userId;

  return {
    sections: isCurrent ? state.sections : [],
    // Signed out there is nothing to load, so don't spin forever.
    isLoading: userId ? state.isLoading && (isCurrent || state.userId === null) : isAuthLoading,
    refresh: () => setReloadCount((count) => count + 1),
  };
}
