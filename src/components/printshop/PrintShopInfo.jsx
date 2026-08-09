import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Crown, Printer, Check, Truck } from "lucide-react";
import { formatPrice, FREE_SHIP_THRESHOLD } from "@/lib/printPricing";

const PLANS = [
{ icon: Sparkles, color: "#228be6", title: "Free", tag: "Try the product", desc: 'The "Rolling 10" model — perfect for trying windy the pooh\'s Booth.' },
{ icon: Crown, color: "#3a6cbf", title: "Single Collection", tag: "$1 one-time", desc: "Lifetime access to one exclusive artist-designed collection, plus unlimited booth sessions." },
{ icon: Printer, color: "#37b24d", title: "Lifetime Pass", tag: "$3.99 one-time", desc: "Unlimited booth sessions, every current and future collection, and unlimited saved strips." }];


const FREE_INCLUDES = [
"Access to 20–30 free templates",
"Up to 10 sessions per month",
"Strips saved to My Booths, capped at the 10 most recent",
"Taking a new strip once you have 10 auto-deletes the oldest — your library always reflects your latest sessions"];


const PREMIUM_INCLUDES = [
"Unlimited sessions and downloads",
"Access to all premium template collections",
"10 new exclusive templates every month",
"Strips saved to My Booths with no 10-strip cap",
"Retained for 1 year from creation, then auto-deleted"];


const CLUB_INCLUDES = [
"Choice of Matte or Glossy photo paper",
"1 exclusive sticker sheet",
"1 personalized letter card",
"Protective packaging"];


export default function PrintShopInfo() {
  return (
    <div className="space-y-6">
      {/* Monetization Plans */}
      <section>
        
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {PLANS.map((p) =>
          <div key={p.title} className="rounded-2xl border border-[#e2e8f0] bg-white p-4 hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: `${p.color}1a` }}>
                <p.icon size={18} style={{ color: p.color }} />
              </div>
              <p className="mt-3 font-heading text-base font-extrabold text-[#1e1b4b]">{p.title}</p>
              <p className="text-xs font-bold" style={{ color: p.color }}>{p.tag}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">{p.desc}</p>
            </div>
          )}
        </div>
      </section>

      {/* Free — Rolling 10 */}
      













      

      {/* Premium */}
      














      

      {/* Print Club */}
      

















      
    </div>);

}