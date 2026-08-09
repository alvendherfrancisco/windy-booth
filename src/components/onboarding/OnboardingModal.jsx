import React, { useState } from "react";
import { Camera, ImageUp, Printer, Sparkles, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Image } from "@/components/ui/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PRIVACY_POLICY, TERMS_AND_CONDITIONS } from "@/lib/legalContent";

const FLOWER_URL = "https://media.base44.com/images/public/6a60bb3456cf14775962b360/85fbbf227_flower.svg";
const GREETING_LOGO_URL = "https://media.base44.com/images/public/6a60bb3456cf14775962b360/1b90c0fb5_windylogo.svg";

const HOW_IT_WORKS = [
  { icon: Sparkles, title: "Pick a design", desc: "Choose from artist-designed collections to frame your strip." },
  { icon: Camera, title: "Strike a pose", desc: "Take photos with your camera or upload your favorites." },
  { icon: Printer, title: "Print & share", desc: "Watch your strip print, then download or share it instantly." },
];

// Shown once to new users: a short welcome, a quick tour, then required
// acceptance of the Terms & Conditions and Privacy Policy before they can
// use the app. Blocks interaction with the rest of the app until accepted.
export default function OnboardingModal() {
  const { updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [legalOpen, setLegalOpen] = useState(null);
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    if (!agreed || saving) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await base44.auth.updateMe({ terms_accepted_at: now });
      updateUser({ terms_accepted_at: now });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white p-6 text-center animate-modal-in">
        <Image src={FLOWER_URL} alt="" fittingType="fit" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 opacity-15" />
        <Image src={FLOWER_URL} alt="" fittingType="fit" className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rotate-180 opacity-15" />
        <div className="relative mb-5 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-[#5080da]" : "w-1.5 bg-[#e2e8f0]"}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="relative">
            <Image src={GREETING_LOGO_URL} alt="windy the pooh" fittingType="fit" className="mx-auto h-20 w-20" />
            <h2 className="mt-4 font-heading text-2xl font-extrabold text-[#1e1b4b]">Welcome to windy the pooh!</h2>
            <p className="mt-2 text-sm text-[#475569]">A photo booth in your pocket. Pick a frame, strike a pose, and take it with you — anytime, anywhere.</p>
            <button onClick={() => setStep(1)} className="mt-6 w-full rounded-full bg-[#5080da] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3a6cbf]">Get Started</button>
          </div>
        )}

        {step === 1 && (
          <>
            <h2 className="font-heading text-xl font-extrabold text-[#1e1b4b]">How it works</h2>
            <div className="mt-5 space-y-4 text-left">
              {HOW_IT_WORKS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf2fd] text-[#3a6cbf]"><Icon size={20} /></span>
                  <div>
                    <p className="text-sm font-bold text-[#1e1b4b]">{title}</p>
                    <p className="text-xs text-[#475569]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="mt-6 w-full rounded-full bg-[#5080da] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3a6cbf]">Next</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-heading text-xl font-extrabold text-[#1e1b4b]">Before you start</h2>
            <p className="mt-2 text-sm text-[#475569]">Please review and accept our policies to continue.</p>
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-[#e2e8f0] bg-[#FBFAF7] p-4 text-left">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${agreed ? "border-[#5080da] bg-[#5080da] text-white" : "border-[#cbd5e1] bg-white"}`}>
                {agreed && <Check size={13} strokeWidth={3} />}
              </span>
              <input type="checkbox" className="hidden" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span className="text-sm text-[#1e1b4b]">
                I agree to the{" "}
                <button type="button" onClick={(e) => { e.preventDefault(); setLegalOpen("terms"); }} className="font-bold text-[#3a6cbf] underline">Terms &amp; Conditions</button>
                {" "}and{" "}
                <button type="button" onClick={(e) => { e.preventDefault(); setLegalOpen("privacy"); }} className="font-bold text-[#3a6cbf] underline">Privacy Policy</button>.
              </span>
            </label>
            <button onClick={finish} disabled={!agreed || saving} className="mt-6 w-full rounded-full bg-[#5080da] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3a6cbf] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8]">
              {saving ? "Please wait…" : "Agree & Continue"}
            </button>
          </>
        )}
      </div>

      <Dialog open={legalOpen === "privacy"} onOpenChange={(v) => !v && setLegalOpen(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>How windy the pooh handles your data.</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-line text-sm leading-relaxed text-[#1e1b4b]">{PRIVACY_POLICY}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={legalOpen === "terms"} onOpenChange={(v) => !v && setLegalOpen(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms &amp; Conditions</DialogTitle>
            <DialogDescription>The rules for using windy the pooh.</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-line text-sm leading-relaxed text-[#1e1b4b]">{TERMS_AND_CONDITIONS}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}