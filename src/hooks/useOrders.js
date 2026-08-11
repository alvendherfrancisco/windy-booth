import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// Shared cache entry per user, reused across Dashboard and Orders — avoids
// re-fetching the full order list on every visit.
export function useOrders(userId) {
  const { data, isLoading } = useQuery({
    queryKey: ["orders", userId],
    queryFn: () => base44.entities.Order.filter({ user_id: userId }, "-created_date"),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
  return { orders: data || [], isLoading };
}