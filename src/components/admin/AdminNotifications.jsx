import React, { useState } from "react";
import { Send, Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TYPES = ["order_update", "payment", "subscription", "usage_limit", "storage_expiry", "booth_activity"];

export default function AdminNotifications({ users, onChanged }) {
  const [type, setType] = useState("booth_activity");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const send = async () => {
    if (!message.trim() || users.length === 0) return;
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const records = users.map((u) => ({
        user_id: u.id, type, message: message.trim(), link: link.trim() || undefined,
        read: false, created_at: now,
      }));
      await base44.entities.Notification.bulkCreate(records);
      setResult({ count: records.length });
      setMessage(""); setLink("");
      await onChanged();
    } catch (e) {
      setResult({ error: e?.message || "Failed to send" });
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-extrabold">Broadcast <span className="text-sm font-medium text-[#94a3b8]">to {users.length} users</span></h2>
        <p className="text-sm text-[#94a3b8]">Send an in-app notification to every registered user.</p>
      </div>

      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Type</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input">
              {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.replace("_", " ")}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Link (optional)</span>
            <input value={link} onChange={(e) => setLink(e.target.value)} className="input" placeholder="/print-shop" />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Message</span>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="input resize-none" placeholder="A new seasonal collection just dropped — check it out!" />
        </label>
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-[#94a3b8]"><Bell size={13} /> Delivered instantly to all inboxes</span>
          <button onClick={send} disabled={busy || !message.trim()} className="inline-flex items-center gap-1.5 rounded-full bg-[#3a6cbf] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#d04072] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8]">
            {busy ? "Sending…" : <><Send size={15} /> Send broadcast</>}
          </button>
        </div>
        {result && (
          <div className={`mt-3 rounded-xl px-4 py-2.5 text-sm font-bold ${result.error ? "bg-[#ffe3e3] text-[#DC2626]" : "bg-[#ebfbee] text-[#37b24d]"}`}>
            {result.error ? result.error : `Notification sent to ${result.count} users.`}
          </div>
        )}
      </div>
    </div>
  );
}