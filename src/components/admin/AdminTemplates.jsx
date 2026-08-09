import React, { useMemo, useRef, useState } from "react";
import { Search, Plus, Trash2, Pencil, Upload, Star, CheckCircle2, Circle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StripPreview from "@/components/booth/StripPreview";

const EMPTY = { name: "", code: "", category: "", tier: "free", canvas_asset_url: "", thumbnail_url: "", active: true, released_at: "" };

export default function AdminTemplates({ templates, onChanged }) {
  const list = useMemo(() => Object.values(templates).sort((a, b) => (a.name || "").localeCompare(b.name || "")), [templates]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [delBusy, setDelBusy] = useState(null);
  const canvasRef = useRef();
  const thumbRef = useRef();

  const rows = useMemo(
    () => list.filter((t) =>
      (t.name || "").toLowerCase().includes(q.toLowerCase()) || (t.code || "").toLowerCase().includes(q.toLowerCase())
    ),
    [list, q]
  );

  const openNew = () => { setEditing(null); setForm({ ...EMPTY }); setOpen(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ ...EMPTY, ...t, released_at: t.released_at ? t.released_at.slice(0, 10) : "" });
    setOpen(true);
  };

  const doUpload = async (kind, file) => {
    if (!file) return;
    setUploading(kind);
    try {
      const r = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, [kind === "canvas" ? "canvas_asset_url" : "thumbnail_url"]: r.file_url }));
    } finally { setUploading(null); }
  };

  const save = async () => {
    if (!form.name.trim() || !form.code.trim() || !form.canvas_asset_url) return;
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        tier: form.tier,
        canvas_asset_url: form.canvas_asset_url,
        thumbnail_url: form.thumbnail_url || form.canvas_asset_url,
        active: form.active,
        released_at: form.released_at ? new Date(form.released_at).toISOString() : new Date().toISOString(),
      };
      if (editing) await base44.entities.Template.update(editing.id, payload);
      else await base44.entities.Template.create(payload);
      setOpen(false);
      await onChanged();
    } finally { setBusy(false); }
  };

  const toggleActive = async (t) => { await base44.entities.Template.update(t.id, { active: !t.active }); await onChanged(); };
  const toggleTier = async (t) => { await base44.entities.Template.update(t.id, { tier: t.tier === "premium" ? "free" : "premium" }); await onChanged(); };
  const del = async (t) => {
    if (!window.confirm(`Delete template "${t.name}"? This cannot be undone.`)) return;
    setDelBusy(t.id);
    try { await base44.entities.Template.delete(t.id); await onChanged(); }
    finally { setDelBusy(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-extrabold">Templates <span className="text-sm font-medium text-[#94a3b8]">({list.length})</span></h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or code" className="w-56 max-w-[50vw] rounded-full border border-[#e2e8f0] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#228be6]" />
          </div>
          <button onClick={openNew} className="inline-flex items-center gap-1.5 rounded-full bg-[#3a6cbf] px-4 py-2 text-sm font-bold text-white hover:bg-[#2f5fbf]">
            <Plus size={15} /> New template
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-[#e2e8f0] bg-white p-10 text-center text-sm text-[#94a3b8]">No templates found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {rows.map((t) => (
            <div key={t.id} className="flex flex-col rounded-2xl border border-[#e2e8f0] bg-white p-3">
              <div className="mx-auto w-full max-w-[120px]">
                <StripPreview template={t} photos={[]} />
              </div>
              <div className="mt-2 flex-1 text-xs">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate font-bold text-[#1e1b4b]">{t.name}</p>
                  <button onClick={() => toggleActive(t)} title={t.active ? "Active" : "Hidden"} className="shrink-0 text-[#37b24d]">
                    {t.active ? <CheckCircle2 size={15} /> : <Circle size={15} className="text-[#94a3b8]" />}
                  </button>
                </div>
                <p className="truncate text-[#94a3b8]">{t.code}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <button onClick={() => toggleTier(t)} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${t.tier === "premium" ? "bg-[#eaf2fd] text-[#3a6cbf]" : "bg-[#e7f5ff] text-[#228be6]"}`}>
                    <Star size={10} className="mr-0.5 inline" />{t.tier === "premium" ? "Lock" : "Free"}
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <button onClick={() => openEdit(t)} className="flex-1 rounded-full border border-[#e2e8f0] px-2 py-1.5 text-xs font-bold text-[#228be6] hover:bg-[#e7f5ff]"><Pencil size={12} className="mr-1 inline" />Edit</button>
                <button onClick={() => del(t)} disabled={delBusy === t.id} className="rounded-full bg-[#ffe3e3] p-1.5 text-[#DC2626] hover:bg-[#ffcccc] disabled:opacity-50"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit template" : "New template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Name">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Sunset Bloom" />
              </Field>
              <Field label="Code">
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input" placeholder="sunset-bloom" />
              </Field>
              <Field label="Tier">
                <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className="input">
                  <option value="free">Free</option>
                  <option value="premium">Lock</option>
                </select>
              </Field>
              <Field label="Released date">
                <input type="date" value={form.released_at} onChange={(e) => setForm({ ...form, released_at: e.target.value })} className="input" />
              </Field>
              <Field label="Active">
                <button type="button" onClick={() => setForm({ ...form, active: !form.active })} className={`input flex items-center justify-center font-bold ${form.active ? "text-[#37b24d]" : "text-[#94a3b8]"}`}>
                  {form.active ? "Active" : "Hidden"}
                </button>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <UploadBox label="Design image" hint="The template artwork (required)" url={form.canvas_asset_url} loading={uploading === "canvas"} onPick={() => canvasRef.current?.click()} />
              <UploadBox label="Thumbnail" hint="Optional — defaults to design" url={form.thumbnail_url} loading={uploading === "thumb"} onPick={() => thumbRef.current?.click()} />
            </div>
            <input ref={canvasRef} type="file" accept="image/*" className="hidden" onChange={(e) => doUpload("canvas", e.target.files?.[0])} />
            <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={(e) => doUpload("thumb", e.target.files?.[0])} />

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setOpen(false)} className="rounded-full border border-[#e2e8f0] px-4 py-2 text-sm font-bold text-[#475569] hover:bg-[#f1f5fb]">Cancel</button>
              <button onClick={save} disabled={busy || !form.name.trim() || !form.code.trim() || !form.canvas_asset_url} className="rounded-full bg-[#3a6cbf] px-5 py-2 text-sm font-bold text-white hover:bg-[#2f5fbf] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8]">
                {busy ? "Saving…" : editing ? "Save changes" : "Create template"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#94a3b8]">{label}</span>
      {children}
    </label>
  );
}

function UploadBox({ label, hint, url, loading, onPick }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#94a3b8]">{label}</span>
      <button type="button" onClick={onPick} className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e2e8f0] bg-[#FBFAF7] p-3 text-center hover:border-[#3a6cbf]">
        {loading ? (
          <span className="text-xs font-bold text-[#94a3b8]">Uploading…</span>
        ) : url ? (
          <span className="w-full">
            <StripPreview template={{ thumbnail_url: url }} photos={[]} />
            <span className="mt-1 block text-[10px] font-bold text-[#228be6]">Replace</span>
          </span>
        ) : (
          <>
            <Upload size={20} className="text-[#94a3b8]" />
            <span className="mt-1 text-xs font-bold text-[#475569]">Click to upload</span>
            <span className="text-[10px] text-[#94a3b8]">{hint}</span>
          </>
        )}
      </button>
    </div>
  );
}