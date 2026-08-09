import React, { useState } from "react";
import { FileText, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PRIVACY_POLICY, TERMS_AND_CONDITIONS } from "@/lib/legalContent";

export default function LegalLinks() {
  const [open, setOpen] = useState(null);

  return (
    <>
      <section className="mt-4 rounded-[18px] border border-[#D8D9DC] bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#8B8D93]">Legal</p>
        <div className="mt-3 space-y-2">
          <button
            onClick={() => setOpen("privacy")}
            className="flex w-full items-center justify-between rounded-xl border border-[#e2e8f0] px-4 py-3 text-left text-sm font-bold text-[#1e1b4b] transition hover:bg-[#f1f5fb]"
          >
            <span className="flex items-center gap-2"><Shield size={16} className="text-[#228be6]" />Privacy Policy</span>
            <span className="text-[#94a3b8]">›</span>
          </button>
          <button
            onClick={() => setOpen("terms")}
            className="flex w-full items-center justify-between rounded-xl border border-[#e2e8f0] px-4 py-3 text-left text-sm font-bold text-[#1e1b4b] transition hover:bg-[#f1f5fb]"
          >
            <span className="flex items-center gap-2"><FileText size={16} className="text-[#228be6]" />Terms &amp; Conditions</span>
            <span className="text-[#94a3b8]">›</span>
          </button>
        </div>
      </section>

      <Dialog open={open === "privacy"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>How windy the pooh handles your data.</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-line text-sm leading-relaxed text-[#1e1b4b]">{PRIVACY_POLICY}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={open === "terms"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms &amp; Conditions</DialogTitle>
            <DialogDescription>The rules for using windy the pooh.</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-line text-sm leading-relaxed text-[#1e1b4b]">{TERMS_AND_CONDITIONS}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}