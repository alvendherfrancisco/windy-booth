import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// One shared cache entry per user, fetched once and reused across Dashboard,
// MyBooths, and PrintShop — no more re-fetching the full list on every page
// visit. A realtime subscription invalidates the cache when strips actually
// change (create/delete), so data still stays fresh without polling.
export function useStrips(userId) {
  const queryClient = useQueryClient();
  const queryKey = ["strips", userId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => base44.entities.Strip.filter({ user_id: userId, saved: true }, "-created_at"),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!userId) return;
    return base44.entities.Strip.subscribe(() => {
      queryClient.invalidateQueries({ queryKey });
    });
  }, [userId, queryClient]);

  return { strips: data || [], isLoading };
}