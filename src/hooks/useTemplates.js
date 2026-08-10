import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// Templates change rarely, so we cache them across the whole app instead of
// re-fetching on every page visit (Dashboard, Booth, MyBooths all need them).
// staleTime keeps the cached list fresh for a while; a manual refetch still
// happens on full reload.
export function useTemplates() {
  const { data, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.Template.list(),
    staleTime: 5 * 60 * 1000,
  });
  return { templates: data || [], isLoading };
}

export function useTemplatesMap() {
  const { templates, isLoading } = useTemplates();
  const map = {};
  templates.forEach((t) => (map[t.id] = t));
  return { templatesMap: map, isLoading };
}