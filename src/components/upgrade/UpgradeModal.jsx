import React, { useState } from "react";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LIFETIME_PRICE, COLLECTION_PRICE } from "@/lib/plans";
import VendiLogo from "@/components/VendiLogo";

const INCLUDED = [
"Unlimited booth sessions",
"All current artist-designed collections",
"All future collections",
"Unlimited saved photo strips",
"Lifetime access"];


export default function UpgradeModal({ open, onClose, variant = "lifetime", collection }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (!open) return null;

  const start = async (type) => {
    if (window.self !== window.top) {alert("Checkout works only from the published app.");return;}
    setBusy(true);
    setErr("");
    try {
      const res = await base44.functions.invoke("createUnlockCheckout", {
        type,
        category: type === "collection" ? collection : undefined,
        origin: window.location.origin
      });
      const data = res?.data ?? res;
      if (data?.already) {onClose();return;}
      if (data?.url) window.location.href = data.url;else
      throw new Error("No checkout URL returned");
    } catch (e) {
      setErr(e?.message || "Checkout failed");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-sm overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white p-6 text-center animate-modal-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[#94a3b8] hover:bg-[#f1f5fb]"><X size={18} /></button>

        {variant === "collection" ?
        <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf2fd]"><VendiLogo size={28} color="#3a6cbf" /></div>
            <h2 className="mt-3 font-heading text-2xl font-extrabold text-[#1e1b4b]">{collection || "Collection"}</h2>
            <p className="mt-2 text-sm text-[#475569]">Unlock this collection for <b className="text-[#1e1b4b]">₱{COLLECTION_PRICE}</b></p>
            <div className="my-4 flex items-center gap-3 text-xs text-[#94a3b8]"><span className="h-px flex-1 bg-[#e2e8f0]" />or<span className="h-px flex-1 bg-[#e2e8f0]" /></div>
            <p className="text-sm text-[#475569]">Unlock every collection forever</p>
            <p className="font-heading text-lg font-extrabold text-[#3a6cbf]">Lifetime Pass · ₱{LIFETIME_PRICE}</p>
            <div className="mt-5 space-y-2.5">
              <button onClick={() => start("lifetime")} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#5080da] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3a6cbf] disabled:bg-[#e2e8f0]">
                {busy ? <Loader2 size={16} className="animate-spin" /> : null} Get Lifetime Pass
              </button>
              <button onClick={() => start("collection")} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full border border-[#3a6cbf] px-5 py-3.5 text-sm font-bold text-[#3a6cbf] transition hover:bg-[#eaf2fd] disabled:opacity-60">
                {busy ? <Loader2 size={16} className="animate-spin" /> : null} Buy This Collection · ₱{COLLECTION_PRICE}
              </button>
              <button onClick={onClose} className="block w-full pt-1 text-xs font-bold text-[#94a3b8] hover:text-[#1e1b4b]">Maybe later</button>
            </div>
          </> :

        <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf2fd]"><VendiLogo size={28} color="#3a6cbf" /></div>
            <h2 className="mt-3 font-heading text-2xl font-extrabold text-[#1e1b4b]">Unlock Everything</h2>
            <p className="mt-1.5 text-sm text-[#475569]">Create without limits and access every artist-designed collection.</p>
            <ul className="mt-4 space-y-2 text-left">
              {INCLUDED.map((t) =>
            <li key={t} className="flex items-center gap-2 text-sm text-[#1e1b4b]"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ebfbee] text-[#37b24d]"><Check size={12} /></span>{t}</li>
            )}
            </ul>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#94a3b8]">One-time payment</p>
            <p className="font-heading text-3xl font-extrabold text-[#3a6cbf]">₱{LIFETIME_PRICE}</p>
            <p className="text-xs text-[#94a3b8]">No monthly subscription.</p>
            <div className="mt-5 space-y-2.5">
              <button onClick={() => start("lifetime")} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#5080da] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3a6cbf] disabled:bg-[#e2e8f0]">
                {busy ? <Loader2 size={16} className="animate-spin" /> : null} Get Lifetime Pass
              </button>
              <button onClick={onClose} className="block w-full pt-1 text-sm font-bold text-[#94a3b8] hover:text-[#1e1b4b]">Maybe later</button>
            </div>
          </>
        }
        {err && <p className="mt-3 text-xs font-bold text-[#DC2626]">{err}</p>}
      </div>
    </div>);

}