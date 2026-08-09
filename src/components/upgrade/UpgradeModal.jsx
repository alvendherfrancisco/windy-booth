import React, { useEffect, useState } from "react";
import { Check, CheckCircle2, X } from "lucide-react";
import { LIFETIME_PRICE, COLLECTION_PRICE } from "@/lib/plans";
import VendiLogo from "@/components/VendiLogo";
import PaymentStep from "@/components/upgrade/PaymentStep";

const INCLUDED = [
"Unlimited booth sessions",
"All current artist-designed collections",
"All future collections",
"Unlimited saved photo strips",
"Lifetime access"];


export default function UpgradeModal({ open, onClose, variant = "lifetime", collection }) {
  const [stage, setStage] = useState("plans");
  const [chosenType, setChosenType] = useState(null);

  useEffect(() => {if (open) {setStage("plans");setChosenType(null);}}, [open]);

  if (!open) return null;

  const choose = (type) => {setChosenType(type);setStage("payment");};
  const close = () => {onClose();};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={close}>
      <div className="relative w-full max-w-sm overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white p-6 text-center animate-modal-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[#94a3b8] hover:bg-[#f1f5fb]"><X size={18} /></button>

        {stage === "payment" && chosenType &&
        <PaymentStep
          type={chosenType}
          collection={variant === "collection" ? collection || "Collection" : undefined}
          onBack={() => setStage("plans")}
          onSubmitted={() => setStage("submitted")} />

        }

        {stage === "submitted" &&
        <div className="py-4 text-left">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ebfbee] text-[#37b24d]"><CheckCircle2 size={28} /></div>
            <h2 className="mt-3 text-center font-heading text-xl font-extrabold text-[#1e1b4b]">Payment submitted</h2>
            <p className="mt-2 text-center text-sm text-[#475569]">Thank you. Our team will verify your payment and activate your unlock shortly. You'll be notified once it's confirmed.</p>
            <button onClick={close} className="mt-5 block w-full rounded-full bg-[#5080da] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3a6cbf]">Done</button>
          </div>
        }

        {stage === "plans" && (
        variant === "collection" ?
        <>
              <VendiLogo size={56} className="mx-auto" />
              
              <p className="mt-2 text-sm text-[#475569]">Unlock this collection for life, plus unlimited booth sessions, for <b className="text-[#1e1b4b]">${COLLECTION_PRICE.toFixed(2)}</b> — a one-time payment.</p>
              <div className="my-4 flex items-center gap-3 text-xs text-[#94a3b8]"><span className="h-px flex-1 bg-[#e2e8f0]" />or<span className="h-px flex-1 bg-[#e2e8f0]" /></div>
              <p className="text-sm text-[#475569]">Prefer full access to every collection?</p>
              <p className="font-heading text-lg font-extrabold text-[#3a6cbf]">Lifetime Pass · ${LIFETIME_PRICE.toFixed(2)}</p>
              <div className="mt-5 space-y-2.5">
                <button onClick={() => choose("lifetime")} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#5080da] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3a6cbf]">Get Lifetime Pass</button>
                <button onClick={() => choose("collection")} className="flex w-full items-center justify-center gap-2 rounded-full border border-[#3a6cbf] px-5 py-3.5 text-sm font-bold text-[#3a6cbf] transition hover:bg-[#eaf2fd]">Buy This Collection · ${COLLECTION_PRICE.toFixed(2)}</button>
                <button onClick={close} className="block w-full pt-1 text-xs font-bold text-[#94a3b8] hover:text-[#1e1b4b]">Maybe later</button>
              </div>
            </> :

        <>
              <VendiLogo size={56} className="mx-auto" />
              <h2 className="mt-3 font-heading text-2xl font-extrabold text-[#1e1b4b]">Unlock Everything</h2>
              <p className="mt-1.5 text-sm text-[#475569]">Create without limits and access every artist-designed collection, forever.</p>
              <ul className="mt-4 space-y-2 text-left">
                {INCLUDED.map((t) =>
            <li key={t} className="flex items-center gap-2 text-sm text-[#1e1b4b]"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ebfbee] text-[#37b24d]"><Check size={12} /></span>{t}</li>
            )}
              </ul>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#94a3b8]">One-time payment</p>
              <p className="font-heading text-3xl font-extrabold text-[#3a6cbf]">${LIFETIME_PRICE.toFixed(2)}</p>
              <p className="text-xs text-[#94a3b8]">No monthly subscription. No renewals.</p>
              <div className="mt-5 space-y-2.5">
                <button onClick={() => choose("lifetime")} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#5080da] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3a6cbf]">Get Lifetime Pass</button>
                <button onClick={close} className="block w-full pt-1 text-sm font-bold text-[#94a3b8] hover:text-[#1e1b4b]">Maybe later</button>
              </div>
            </>)

        }
      </div>
    </div>);

}