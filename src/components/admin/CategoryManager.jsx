import React, { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Admin category manager: add, rename, and delete category names.
// Renaming a category re-tags every template using the old name; deleting a
// category moves its templates to the first remaining category so nothing
// falls out of the user-facing filter.
export default function CategoryManager({ categories, onChanged, onTemplatesChanged }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(null);

  const exists = (name) => categories.some((c) => c.name.toLowerCase() === name.toLowerCase());

  const add = async () => {
    const name = draft.trim();
    if (!name || exists(name)) return;
    setBusy("new");
    try {
      await base44.entities.Category.create({ name, order: categories.length + 1 });
      setDraft("");
      setAdding(false);
      onChanged();
    } finally { setBusy(null); }
  };

  const saveEdit = async (c) => {
    const name = editName.trim();
    if (!name || name === c.name) { setEditingId(null); return; }
    if (exists(name)) { setEditingId(null); return; }
    setBusy(c.id);
    try {
      await base44.entities.Category.update(c.id, { name });
      await base44.entities.Template.updateMany({ category: c.name }, { $set: { category: name } });
      setEditingId(null);
      onChanged();
      onTemplatesChanged();
    } finally { setBusy(null); }
  };

  const del = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"? Templates using it will be moved to the first remaining category.`)) return;
    setBusy(c.id);
    try {
      const remaining = categories.filter((x) => x.id !== c.id).sort((a, b) => (a.order || 0) - (b.order || 0));
      const target = remaining[0]?.name || "Vendi";
      await base44.entities.Template.updateMany({ category: c.name }, { $set: { category: target } });
      await base44.entities.Category.delete(c.id);
      onChanged();
      onTemplatesChanged();
    } finally { setBusy(null); }
  };

  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Categories</p>
        {!adding && (
          <button onClick={() => { setAdding(true); setDraft(""); }} className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#228be6] px-2.5 py-1 text-xs font-bold text-[#228be6] hover:bg-[#e7f5ff]">
            <Plus size={13} /> Add
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) =>
          editingId === c.id ? (
            <div key={c.id} className="flex items-center gap-1 rounded-full border border-[#228be6] bg-[#e7f5ff] px-2 py-1">
              <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveEdit(c)} className="w-24 bg-transparent text-xs font-bold outline-none" />
              <button onClick={() => saveEdit(c)} disabled={busy === c.id} className="text-[#37b24d]"><Check size={14} /></button>
              <button onClick={() => setEditingId(null)} className="text-[#94a3b8]"><X size={14} /></button>
            </div>
          ) : (
            <div key={c.id} className="group flex items-center gap-1 rounded-full border border-[#e2e8f0] bg-[#FBFAF7] px-3 py-1.5 text-xs font-bold capitalize text-[#475569]">
              <span>{c.name}</span>
              <button onClick={() => { setEditingId(c.id); setEditName(c.name); }} className="text-[#94a3b8] opacity-0 transition group-hover:opacity-100 hover:text-[#228be6]"><Pencil size={12} /></button>
              <button onClick={() => del(c)} disabled={busy === c.id} className="text-[#94a3b8] opacity-0 transition group-hover:opacity-100 hover:text-[#DC2626]"><Trash2 size={12} /></button>
            </div>
          )
        )}
        {categories.length === 0 && !adding && <p className="text-xs text-[#94a3b8]">No categories yet.</p>}
      </div>

      {adding && (
        <div className="mt-3 flex items-center gap-2">
          <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="New category name" className="input" />
          <button onClick={add} disabled={busy === "new" || !draft.trim()} className="rounded-full bg-[#228be6] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">Add</button>
          <button onClick={() => setAdding(false)} className="rounded-full border border-[#e2e8f0] px-3 py-1.5 text-xs font-bold text-[#475569]">Cancel</button>
        </div>
      )}
    </div>
  );
}