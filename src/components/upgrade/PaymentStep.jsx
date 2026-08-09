import React, { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { LIFETIME_PRICE, COLLECTION_PRICE } from "@/lib/plans";
import { PAYMENT_METHODS } from "@/lib/paymentMethods";
import PaymentMethodPicker from "@/components/upgrade/PaymentMethodPicker";

// Manual payment flow: user scans a QR, pays outside the app, then uploads
// proof of payment here for admin review. No automatic unlock happens.
export default function PaymentStep({ type, collection, onSubmitted, onBack }) {
  const { user } = useAuth();
  const [method, setMethod] = useState(PAYMENT_METHODS[0].key);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const amount = type === "lifetime" ? LIFETIME_PRICE : COLLECTION_PRICE;
  const title = type === "lifetime" ? "Lifetime Pass" : `${collection || "Collection"}`;

  const submit = async () => {
    if (!file) { setErr("Please attach a screenshot or photo of your payment receipt."); return; }
    setBusy(true);
    setErr("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UnlockRequest.create({
        user_id: user.id,
        plan_type: type,
        collection: type === "collection" ? collection : undefined,
        payment_method: method,
        proof_url: file_url,
        amount,
        status: "pending",
      });
      onSubmitted();
    } catch (e) {
      setErr(e?.message || "Could not submit your payment. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2 className="text-center font-heading text-xl font-extrabold text-[#1e1b4b]">Pay for {title}</h2>
      <p className="mt-1 text-center text-sm text-[#475569]">Amount due: <b className="text-[#1e1b4b]">${amount.toFixed(2)}</b></p>

      <div className="mt-4">
        <PaymentMethodPicker method={method} onMethodChange={setMethod} />
      </div>

      <div className="mt-5">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Proof of payment</label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e2e8f0] bg-[#FBFAF7] px-4 py-4 text-sm font-bold text-[#475569] hover:border-[#3a6cbf]">
          <Upload size={16} />
          {file ? file.name : "Upload receipt screenshot"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
      </div>

      {err && <p className="mt-3 text-xs font-bold text-[#DC2626]">{err}</p>}

      <div className="mt-5 space-y-2.5">
        <button onClick={submit} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#5080da] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3a6cbf] disabled:bg-[#e2e8f0]">
          {busy ? <Loader2 size={16} className="animate-spin" /> : null} Submit for Review
        </button>
        <button onClick={onBack} disabled={busy} className="block w-full pt-1 text-xs font-bold text-[#94a3b8] hover:text-[#1e1b4b]">Back</button>
      </div>
    </div>
  );
}