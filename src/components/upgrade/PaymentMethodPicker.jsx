import React from "react";
import { PAYMENT_METHODS } from "@/lib/paymentMethods";
import { Image } from "@/components/ui/image";

// Lets the user pick which payment method they'll use, then shows that
// method's QR code to scan. QR images are placeholders until real ones are supplied.
export default function PaymentMethodPicker({ method, onMethodChange }) {
  const selected = PAYMENT_METHODS.find((m) => m.key === method) || PAYMENT_METHODS[0];

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m.key}
            onClick={() => onMethodChange(m.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
              selected.key === m.key
                ? "border-[#3a6cbf] bg-[#eaf2fd] text-[#3a6cbf]"
                : "border-[#e2e8f0] bg-white text-[#475569] hover:border-[#3a6cbf]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="mx-auto mt-4 w-40">
        <Image src={selected.qr} alt={`${selected.label} QR code`} className="aspect-square w-full rounded-xl border border-[#e2e8f0]" fittingType="fit" />
        <p className="mt-2 text-center text-xs font-bold text-[#475569]">Scan with {selected.label}</p>
      </div>
    </div>
  );
}