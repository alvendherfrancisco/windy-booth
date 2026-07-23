import React, { useState } from "react";
import { FileText, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PRIVACY = `Last updated: July 2026

Vendhee's Booth ("we", "us") built this app as a photo booth service. This policy explains what we collect and how we use it.

What we collect
- Account details you provide, such as your name and email address.
- The photos you take or upload to create strips, and the finished strips you save.
- Shipping details you enter when placing a print order (full name, phone, address).
- Payment information is handled by our payment provider (Stripe); we do not store your card details.

How we use it
- To create and save your photo strips, and to deliver print orders you place.
- To send you updates about your orders and account, such as storage or usage reminders.
- To keep the service secure and prevent abuse.

Photo strips and storage
Free accounts keep up to 10 saved strips on a rolling basis. Lifetime Pass accounts have no storage limit. Strips you create are linked to your account until you delete them.

Sharing
We do not sell your data. We share details only with the services needed to run the app (for example, our payment and shipping partners) and when required by law.

Your choices
You can delete strips at any time from "My Booths". You can request account deletion by contacting us.

Contact
For privacy questions, reach us at the support contact provided in the app.`;

const TERMS = `Last updated: July 2026

By using Vendhee's Booth, you agree to these terms.

Your account
You are responsible for keeping your account secure and for the content you create. You must be old enough to use the service under the law of your country, or have a guardian's permission.

Your content
You own the photos and strips you create. You give us permission to process and display them only as needed to provide the service and deliver your print orders. You agree not to upload content that is unlawful or infringes someone else's rights.

Plans and purchases
- Free Plan: up to 10 booth sessions per month and up to 10 saved strips. Sessions reset each month.
- Single Collection (₱49): one-time payment that unlocks one artist-designed collection for life.
- Lifetime Pass (₱299): one-time payment that unlocks unlimited sessions, all collections, and unlimited saved strips.
All purchases are non-recurring. Unless required by law, one-time unlock purchases are non-refundable once access is granted.

Print orders
Print orders are fulfilled through a shipping partner. Delivery times and shipping fees shown at checkout are estimates. We are not liable for delays caused by the carrier.

Acceptable use
You agree not to misuse the service, disrupt it, or attempt to access data that isn't yours.

Changes
We may update the service and these terms. Continued use after changes means you accept them.

Liability
The service is provided "as is". To the extent permitted by law, we are not liable for indirect or accidental losses arising from your use of it.

Governing law
These terms are governed by the laws of the Republic of the Philippines.`;

export default function LegalLinks() {
  const [open, setOpen] = useState(null);

  return (
    <>
      <section className="mt-4 rounded-[18px] border border-[#D8D9DC] bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#8B8D93]">Legal</p>
        <div className="mt-3 space-y-2">
          <button
            onClick={() => setOpen("privacy")}
            className="flex w-full items-center justify-between rounded-xl border border-[#E8E2D8] px-4 py-3 text-left text-sm font-bold text-[#2D2D2D] transition hover:bg-[#F5F0EA]"
          >
            <span className="flex items-center gap-2"><Shield size={16} className="text-[#228be6]" />Privacy Policy</span>
            <span className="text-[#8A8580]">›</span>
          </button>
          <button
            onClick={() => setOpen("terms")}
            className="flex w-full items-center justify-between rounded-xl border border-[#E8E2D8] px-4 py-3 text-left text-sm font-bold text-[#2D2D2D] transition hover:bg-[#F5F0EA]"
          >
            <span className="flex items-center gap-2"><FileText size={16} className="text-[#228be6]" />Terms &amp; Conditions</span>
            <span className="text-[#8A8580]">›</span>
          </button>
        </div>
      </section>

      <Dialog open={open === "privacy"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>How Vendhee's Booth handles your data.</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-line text-sm leading-relaxed text-[#2D2D2D]">{PRIVACY}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={open === "terms"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms &amp; Conditions</DialogTitle>
            <DialogDescription>The rules for using Vendhee's Booth.</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-line text-sm leading-relaxed text-[#2D2D2D]">{TERMS}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}