import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Crown, Printer, Check, Truck } from "lucide-react";
import { formatPrice, FREE_SHIP_THRESHOLD } from "@/lib/printPricing";

const PLANS = [
  { icon: Sparkles, color: "#228be6", title: "Free", tag: "Try the product", desc: 'The "Rolling 10" model — perfect for trying Vendi\'s Booth.' },
  { icon: Crown, color: "#e64980", title: "Premium", tag: "₱99/month", desc: "Unlimited sessions & downloads + exclusive artist-designed template collections." },
  { icon: Printer, color: "#37b24d", title: "Print Store", tag: "Print Club", desc: "Choose how many strips you want, customize the order, and pay based on quantity." },
];

const FREE_INCLUDES = [
  "Access to 20–30 free templates",
  "Up to 10 sessions per month",
  "Strips saved to My Booths, capped at the 10 most recent",
  "Taking a new strip once you have 10 auto-deletes the oldest — your library always reflects your latest sessions",
];

const PREMIUM_INCLUDES = [
  "Unlimited sessions and downloads",
  "Access to all premium template collections",
  "10 new exclusive templates every month",
  "Strips saved to My Booths with no 10-strip cap",
  "Retained for 1 year from creation, then auto-deleted",
];

const CLUB_INCLUDES = [
  "Choice of Matte or Glossy photo paper",
  "1 exclusive sticker sheet",
  "1 personalized letter card",
  "Protective packaging",
];

export default function PrintShopInfo() {
  return (
    <div className="space-y-6">
      {/* Monetization Plans */}
      <section>
        <h2 className="font-heading text-xl font-extrabold text-[#2D2D2D]">Monetization Plans</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-[#E8E2D8] bg-white p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: `${p.color}1a` }}>
                <p.icon size={18} style={{ color: p.color }} />
              </div>
              <p className="mt-3 font-heading text-base font-extrabold text-[#2D2D2D]">{p.title}</p>
              <p className="text-xs font-bold" style={{ color: p.color }}>{p.tag}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#5C5953]">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Free — Rolling 10 */}
      <section className="rounded-2xl border border-[#E8E2D8] bg-[#e7f5ff] p-5">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#228be6]" />
          <h3 className="font-heading text-lg font-extrabold text-[#2D2D2D]">Free Plan — "Rolling 10" Model</h3>
        </div>
        <p className="mt-1 text-sm text-[#5C5953]">Perfect for trying Vendi's Booth.</p>
        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#8A8580]">Includes</p>
        <ul className="mt-2 space-y-1.5">
          {FREE_INCLUDES.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-[#2D2D2D]">
              <Check size={15} className="mt-0.5 shrink-0 text-[#228be6]" /> {t}
            </li>
          ))}
        </ul>
      </section>

      {/* Premium */}
      <section className="rounded-2xl border border-[#E8E2D8] bg-[#fff0f6] p-5">
        <div className="flex items-center gap-2">
          <Crown size={18} className="text-[#e64980]" />
          <h3 className="font-heading text-lg font-extrabold text-[#2D2D2D]">Premium — ₱99/month</h3>
        </div>
        <p className="mt-1 text-sm text-[#5C5953]">Perfect for frequent creators.</p>
        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#8A8580]">Includes</p>
        <ul className="mt-2 space-y-1.5">
          {PREMIUM_INCLUDES.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-[#2D2D2D]">
              <Check size={15} className="mt-0.5 shrink-0 text-[#e64980]" /> {t}
            </li>
          ))}
        </ul>
        <Link to="/profile" className="mt-4 inline-block rounded-full bg-[#e64980] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#d04072]">Go Premium</Link>
      </section>

      {/* Print Club */}
      <section className="rounded-2xl border border-[#E8E2D8] bg-white p-5">
        <div className="flex items-center gap-2">
          <Printer size={18} className="text-[#37b24d]" />
          <h3 className="font-heading text-lg font-extrabold text-[#2D2D2D]">Print Club</h3>
        </div>
        <p className="mt-1 text-sm text-[#5C5953]">Perfect for people who love collecting physical memories.</p>
        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#8A8580]">Every bundle includes</p>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {CLUB_INCLUDES.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-[#2D2D2D]">
              <Check size={15} className="mt-0.5 shrink-0 text-[#37b24d]" /> {t}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#F5F0EA] p-3 text-sm text-[#5C5953]">
          <Truck size={16} className="mt-0.5 shrink-0 text-[#8A8580]" />
          <p>Shipping is calculated at checkout based on your address. <b className="text-[#2D2D2D]">Free shipping on orders of {formatPrice(FREE_SHIP_THRESHOLD)} or more.</b></p>
        </div>
      </section>
    </div>
  );
}