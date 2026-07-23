import React, { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import StripPreview from "@/components/booth/StripPreview";

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");

export default function AdminStrips({ strips, users, templates, onChanged }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(null);

  const userMap = useMemo(() => {
    const m = {};
    users.forEach((u) => (m[u.id] = u));
    return m;
  }, [users]);

  const rows = useMemo(
    () => strips.filter((s) => {
      const u = userMap[s.user_id];
      const name = (u?.full_name || u?.email || s.user_id || "").toLowerCase();
      const tpl = (templates[s.template_id]?.name || "").toLowerCase();
      return name.includes(q.toLowerCase()) || tpl.includes(q.toLowerCase());
    }),
    [strips, userMap, templates, q]
  );

  const del = async (s) => {
    if (!window.confirm("Delete this strip? This cannot be undone.")) return;
    setBusy(s.id);
    try { await base44.entities.Strip.delete(s.id); await onChanged(); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-extrabold">Strips <span className="text-sm font-medium text-[#8A8580]">({strips.length})</span></h2>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8580]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search uploader or template" className="w-64 max-w-[60vw] rounded-full border border-[#E8E2D8] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#228be6]" />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-[#E8E2D8] bg-white p-10 text-center text-sm text-[#8A8580]">No strips found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {rows.map((s) => (
            <div key={s.id} className="rounded-2xl border border-[#E8E2D8] bg-white p-3">
              <StripPreview template={templates[s.template_id]} photos={s.photo_urls} className="mx-auto w-full max-w-[120px]" />
              <div className="mt-2 text-xs">
                <p className="truncate font-bold text-[#2D2D2D]">{userMap[s.user_id]?.full_name || userMap[s.user_id]?.email || "Unknown"}</p>
                <p className="text-[#8A8580]">{fmtDate(s.created_at)}</p>
                <p className="truncate text-[#8A8580]">{templates[s.template_id]?.name || "—"}</p>
              </div>
              <button onClick={() => del(s)} disabled={busy === s.id} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#ffe3e3] px-3 py-1.5 text-xs font-bold text-[#DC2626] hover:bg-[#ffcccc]">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}