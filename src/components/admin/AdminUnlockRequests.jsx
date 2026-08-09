import React, { useMemo, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image } from "@/components/ui/image";
import { generateReceiptPdf } from "@/components/admin/receiptPdf";

const fmtDate = (v) => (v ? new Date(v).toLocaleString() : "—");

export default function AdminUnlockRequests({ requests, users, onChanged }) {
  const [view, setView] = useState(null);
  const [busy, setBusy] = useState(null);

  const userMap = useMemo(() => { const m = {}; users.forEach((u) => (m[u.id] = u)); return m; }, [users]);
  const rows = useMemo(() => [...requests].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)), [requests]);

  const decide = async (req, status) => {
    setBusy(req.id);
    try {
      await base44.entities.UnlockRequest.update(req.id, { status, reviewed_at: new Date().toISOString() });
      if (status === "approved") {
        const u = userMap[req.user_id];
        if (u) {
          if (req.plan_type === "lifetime") {
            await base44.entities.User.update(u.id, { plan: "lifetime", plan_renewed_at: new Date().toISOString() });
          } else if (req.plan_type === "collection" && req.collection) {
            const owned = u.owned_collections || [];
            if (!owned.includes(req.collection)) {
              await base44.entities.User.update(u.id, { owned_collections: [...owned, req.collection] });
            }
          }
        }
        const billingRec = await base44.entities.BillingRecord.create({
          user_id: req.user_id,
          type: "unlock",
          amount: req.amount || 0,
          status: "paid",
          paymongo_transaction_id: `unlock-${req.id}`,
          created_at: new Date().toISOString(),
        });
        const planDesc = req.plan_type === "lifetime" ? "Lifetime Pass" : `Collection: ${req.collection}`;
        try {
          const doc = await generateReceiptPdf({ user: u, request: req, billingId: billingRec.id });
          const pdfBlob = doc.output("blob");
          const pdfFile = new File([pdfBlob], `receipt-${req.id}.pdf`, { type: "application/pdf" });
          const uploadRes = await base44.integrations.Core.UploadFile({ file: pdfFile });
          await base44.integrations.Core.SendEmail({
            to: u?.email,
            subject: "Your windy the pooh purchase is confirmed!",
            body: `Hi ${u?.full_name || u?.email || "there"},\n\nThank you for your purchase! Your ${planDesc} has been activated.\n\nAmount: $${(req.amount || 0).toFixed(2)}\nPayment Method: ${req.payment_method || "—"}\n\nDownload your receipt: ${uploadRes.file_url}\n\nEnjoy creating memories with windy the pooh!`,
          });
        } catch (_e) {
          // Receipt/email failure should not block the approval
        }
        await base44.entities.Notification.create({
          user_id: req.user_id,
          type: "payment",
          message: `Your ${planDesc} purchase is confirmed! A receipt was sent to your email.`,
          link: "/profile",
          read: false,
          created_at: new Date().toISOString(),
        });
      }
      setView(null);
      await onChanged();
    } finally {
      setBusy(null);
    }
  };

  const STATUS_TONE = { pending: "bg-[#fff3bf] text-[#f59f00]", approved: "bg-[#ebfbee] text-[#37b24d]", rejected: "bg-[#ffe3e3] text-[#DC2626]" };

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-extrabold">Unlock Requests <span className="text-sm font-medium text-[#94a3b8]">({rows.length})</span></h2>
      <div className="overflow-x-auto rounded-2xl border border-[#e2e8f0] bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e2e8f0] bg-[#FBFAF7] text-left text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Method</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Submitted</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const u = userMap[r.user_id];
              return (
                <tr key={r.id} className="cursor-pointer border-b border-[#F0EBE2] last:border-0 hover:bg-[#FBFAF7]" onClick={() => setView(r)}>
                  <td className="px-3 py-2.5"><p className="font-medium">{u?.full_name || "—"}</p><p className="text-xs text-[#94a3b8]">{u?.email || "—"}</p></td>
                  <td className="px-3 py-2.5">{r.plan_type === "lifetime" ? "Lifetime Pass" : `Collection: ${r.collection || "—"}`}</td>
                  <td className="px-3 py-2.5 font-bold">${(r.amount || 0).toFixed(2)}</td>
                  <td className="px-3 py-2.5 capitalize text-[#475569]">{r.payment_method || "—"}</td>
                  <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${STATUS_TONE[r.status]}`}>{r.status}</span></td>
                  <td className="px-3 py-2.5 text-[#475569]">{fmtDate(r.created_date)}</td>
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    {r.status === "pending" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => decide(r, "approved")} disabled={busy === r.id} className="rounded-full bg-[#ebfbee] p-1.5 text-[#37b24d] hover:bg-[#d3f9d8] disabled:opacity-50">{busy === r.id ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}</button>
                        <button onClick={() => decide(r, "rejected")} disabled={busy === r.id} className="rounded-full bg-[#ffe3e3] p-1.5 text-[#DC2626] hover:bg-[#ffcccc] disabled:opacity-50"><X size={15} /></button>
                      </div>
                    ) : <span className="text-xs text-[#94a3b8]">Reviewed</span>}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-[#94a3b8]">No unlock requests yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
          <DialogHeader><DialogTitle>Payment proof</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-3 text-sm">
              <p><b>User:</b> {userMap[view.user_id]?.full_name || "—"} ({userMap[view.user_id]?.email || "—"})</p>
              <p><b>Plan:</b> {view.plan_type === "lifetime" ? "Lifetime Pass" : `Collection: ${view.collection}`}</p>
              <p><b>Amount:</b> ${(view.amount || 0).toFixed(2)}</p>
              <p><b>Method:</b> {view.payment_method}</p>
              <Image src={view.proof_url} alt="Proof of payment" className="w-full rounded-xl border border-[#e2e8f0]" fittingType="fit" />
              {view.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <button onClick={() => decide(view, "approved")} disabled={busy === view.id} className="flex-1 rounded-full bg-[#37b24d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#2f9e44] disabled:opacity-50">Approve</button>
                  <button onClick={() => decide(view, "rejected")} disabled={busy === view.id} className="flex-1 rounded-full bg-[#ffe3e3] px-4 py-2.5 text-sm font-bold text-[#DC2626] hover:bg-[#ffcccc] disabled:opacity-50">Reject</button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}