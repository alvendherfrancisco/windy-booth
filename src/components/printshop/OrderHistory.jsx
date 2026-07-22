import React, { useState } from "react";
import { ChevronRight, Download } from "lucide-react";

const STAGES = ["processing", "printed", "shipped", "delivered"];

export default function OrderHistory({ orders }) {
  const [open, setOpen] = useState(null);
  if (!orders.length)
    return (
      <div className="rounded-[18px] border border-dashed border-[#AEB0B5] p-8 text-center text-sm text-[#8A8580]">
        No print orders yet.
      </div>
    );
  return (
    <div className="space-y-3">
    {orders.map((o) => {
      const stageIdx = STAGES.indexOf(o.fulfillment_status);
      const isOpen = open === o.id;
      return (
        <div key={o.id} className="rounded-[18px] border border-[#E8E2D8] bg-white p-4">
          <button onClick={() => setOpen(isOpen ? null : o.id)} className="flex w-full items-center justify-between text-left">
            <div>
              <p className="font-bold text-[#2D2D2D]">{o.bundle_type} Bundle</p>
              <p className="text-xs text-[#8A8580]">{new Date(o.created_date).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${o.payment_status === "paid" ? "bg-[#EEF2FF] text-[#4F46E5]" : "bg-[#FDE8E4] text-[#DC3522]"}`}>
                {o.fulfillment_status}
              </span>
              <ChevronRight size={16} className={`text-[#8A8580] transition ${isOpen ? "rotate-90" : ""}`} />
            </div>
          </button>
          {isOpen && (
            <div className="mt-3 border-t border-[#E8E2D8] pt-3 text-sm">
              <div className="flex items-center">
                {STAGES.map((s, i) => (
                  <React.Fragment key={s}>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${i <= stageIdx ? "bg-[#4F46E5] text-white" : "bg-[#E8E2D8] text-[#8A8580]"}`}>
                      {i + 1}
                    </span>
                    {i < STAGES.length - 1 && <span className={`h-px flex-1 ${i < stageIdx ? "bg-[#4F46E5]" : "bg-[#E8E2D8]"}`} />}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-[#5C5953]">
                <span>Processing</span><span>Printed</span><span>Shipped</span><span>Delivered</span>
              </div>
              <p className="mt-3 text-xs text-[#8A8580]">
                {o.jt_tracking_number ? `Tracking: ${o.jt_tracking_number}` : "Tracking number available once shipped."}
              </p>
              <button onClick={() => downloadReceipt(o)} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#4F46E5]">
                <Download size={15} />Download receipt
              </button>
            </div>
          )}
        </div>
      );
    })}
  </div>
  );
}

function downloadReceipt(o) {
  const lines = [
    "Vendi Print Order",
    "",
    `Bundle: ${o.bundle_type}`,
    `Paper: ${o.paper_type}`,
    `Strips: ${o.quantity_selected}/${o.quantity_required}`,
    `Subtotal: ₱${o.subtotal}`,
    `Shipping: ${o.shipping_cost ? `₱${o.shipping_cost}` : "Free"}`,
    `Total: ₱${o.total}`,
    `Status: ${o.fulfillment_status}`,
    `Date: ${new Date(o.created_date).toLocaleString()}`,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `vendi-receipt-${(o.id || "").slice(-6)}.txt`;
  a.click();
}