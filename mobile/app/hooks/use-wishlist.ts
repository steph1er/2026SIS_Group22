import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useAuth } from '../../src/auth/auth-provider';
import {
  addToWishlist,
  describeAddError,
  fetchRecommendations,
  fetchWishlist,
  removeFromWishlist,
} from '../services/wishlist/wishlist-service';
import type { CatalogueItem, WishlistEntry } from '../services/wishlist/wishlist-types';

type ListState<T> = {
  userId: string | null;
  data: T[];
  error: string | null;
  isLoading: boolean;
};

type UseWishlistOptions = {
  /** Also load items to recommend. Off by default so the collections page only loads the wishlist. */
  includeRecommendations?: boolean;
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/**
 * The signed-in user's wishlist (optionally with recommendations), with add/remove actions.
 *
 * Reloads whenever the screen gains focus or the signed-in user changes, and never
 * shows one account's wishlist to another (results are tagged with the user they belong to).
 */
export function useWishlist({ includeRecommendations = false }: UseWishlistOptions = {}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id ?? null;

  const [wishlist, setWishlist] = useState<ListState<WishlistEntry>>({
    userId: null,
    data: [],
    error: null,
    isLoading: true,
  });
  const [recommendations, setRecommendations] = useState<ListState<CatalogueItem>>({
    userId: null,
    data: [],
    error: null,
    isLoading: includeRecommendations,
  });
  /** catalogue item ids with an add/remove request in flight. */
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  // Lets async callbacks check they still belong to the signed-in user.
  const userIdRef = useRef<string | null>(userId);
  userIdRef.current = userId;

  const loadWishlist = useCallback(async (forUser: string) => {
    setWishlist((previous) => ({
      userId: forUser,
      data: previous.userId === forUser ? previous.data : [],
      error: null,
      isLoading: true,
    }));
    try {
      const data = await fetchWishlist();
      if (userIdRef.current === forUser) setWishlist({ userId: forUser, data, error: null, isLoading: false });
    } catch (error) {
      if (userIdRef.current !== forUser) return;
      setWishlist((previous) => ({
        userId: forUser,
        data: previous.userId === forUser ? previous.data : [],
        error: errorMessage(error, 'Unable to load your wishlist.'),
        isLoading: false,
      }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      void loadWishlist(userId);

      if (!includeRecommendations) return;
      setRecommendations((previous) => ({ ...previous, userId, error: null, isLoading: true }));
      fetchRecommendations()
        .then((items) => {
          if (userIdRef.current === userId) {
            setRecommendations({ userId, data: items, error: null, isLoading: false });
          }
        })
        .catch((error: unknown) => {
          if (userIdRef.current !== userId) return;
          setRecommendations((previous) => ({
            ...previous,
            userId,
            data: [],
            error: errorMessage(error, 'Unable to load recommendations.'),
            isLoading: false,
          }));
        });
      // reloadCount only exists to re-run this effect from refresh().
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, reloadCount, includeRecommendations, loadWishlist]),
  );

  const currentWishlist = wishlist.userId === userId ? wishlist.data : [];

  /** catalogue item id -> wishlist entry, to know whether an item is saved. */
  const entryByItemId = useMemo(() => {
    const map = new Map<string, WishlistEntry>();
    for (const entry of currentWishlist) map.set(entry.catalogueItemId, entry);
    return map;
  }, [currentWishlist]);

  const setPending = (itemId: string, isPending: boolean) =>
    setPendingIds((previous) => {
      const next = new Set(previous);
      if (isPending) next.add(itemId);
      else next.delete(itemId);
      return next;
    });

  const add = useCallback(
    async (item: CatalogueItem) => {
      if (!userId || pendingIds.has(item.id)) return;
      setActionError(null);
      setPending(item.id, true);
      try {
        await addToWishlist(item.id);
        await loadWishlist(userId);
      } catch (error) {
        setActionError(describeAddError(error));
      } finally {
        setPending(item.id, false);
      }
    },
    [userId, pendingIds, loadWishlist],
  );

  const remove = useCallback(
    async (entry: WishlistEntry) => {
      if (!userId || pendingIds.has(entry.catalogueItemId)) return;
      setActionError(null);
      setPending(entry.catalogueItemId, true);
      // Optimistically hide the item; restored by the reload if the request fails.
      setWishlist((previous) => ({ ...previous, data: previous.data.filter((e) => e.id !== entry.id) }));
      try {
        await removeFromWishlist(entry.id);
      } catch (error) {
        setActionError(errorMessage(error, 'Could not remove the item.'));
      } finally {
        await loadWishlist(userId);
        setPending(entry.catalogueItemId, false);
      }
    },
    [userId, pendingIds, loadWishlist],
  );

  /** Add the item if it is not saved, otherwise remove it. */
  const toggle = useCallback(
    (item: CatalogueItem) => {
      const existing = entryByItemId.get(item.id);
      return existing ? remove(existing) : add(item);
    },
    [entryByItemId, add, remove],
  );

  const isCurrentRecommendations = recommendations.userId === userId;

  return {
    wishlist: currentWishlist,
    // Signed out there is nothing to load, so don't spin forever.
    isWishlistLoading: userId
      ? wishlist.isLoading && (wishlist.userId === userId || wishlist.userId === null)
      : isAuthLoading,
    wishlistError: wishlist.userId === userId ? wishlist.error : null,
    recommendations: isCurrentRecommendations ? recommendations.data : [],
    isRecommendationsLoading: userId ? recommendations.isLoading : isAuthLoading && includeRecommendations,
    recommendationsError: isCurrentRecommendations ? recommendations.error : null,
    isSaved: (itemId: string) => entryByItemId.has(itemId),
    isPending: (itemId: string) => pendingIds.has(itemId),
    add,
    remove,
    toggle,
    actionError,
    dismissActionError: () => setActionError(null),
    refresh: () => setReloadCount((count) => count + 1),
  };
}
