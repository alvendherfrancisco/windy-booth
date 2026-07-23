import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Bell, Camera, Crown, Images, ImageUp, LayoutGrid,
  LayoutList, Package, Printer, Search, SlidersHorizontal, UserRound, X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import StripPreview from "@/components/booth/StripPreview";

const ACTIONS = [
  { label: "New Booth", icon: Camera, to: "/booth", color: "#DC3522" },
  { label: "Templates", icon: LayoutGrid, to: "/booth", color: "#8B5CF6" },
  { label: "Print Shop", icon: Printer, to: "/print-shop", color: "#4F46E5" },
  { label: "My Booths", icon: Images, to: "/my-booths", color: "#0D9488" },
  { label: "Upload", icon: ImageUp, to: "/booth", color: "#F97316" },
  { label: "Orders", icon: Package, to: "/orders", color: "#22C55E" },
  { label: "Updates", icon: Bell, to: "/notifications", color: "#3B82F6" },
  { label: "Profile", icon: UserRound, to: "/profile", color: "#EAB308" },
];

const TYPE_OPTIONS = [
  { label: "All types", value: "all" },
  { label: "No filter", value: "none" },
  { label: "Sepia", value: "sepia" },
  { label: "B&W", value: "bw" },
  { label: "Vintage", value: "vintage" },
  { label: "Vivid", value: "vivid" },
  { label: "Cool", value: "cool" },
  { label: "Warm", value: "warm" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [strips, setStrips] = useState([]);
  const [order, setOrder] = useState(null);
  const [used, setUsed] = useState(0);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [newest, setNewest] = useState(true);
  const [asList, setAsList] = useState(false);

  const plan = user?.plan || "free";

  const load = async () => {
    if (!user) return;
    setStrips(await base44.entities.Strip.filter({ user_id: user.id, saved: true }, "-created_at"));
    const orders = await base44.entities.Order.filter({ user_id: user.id }, "-created_date", 1);
    setOrder(orders[0]);
    const me = await base44.auth.me();
    setUsed(me.sessions_used_this_month || 0);
  };
  useEffect(() => { load(); const off = base44.entities.Strip.subscribe(load); return off; }, [user?.id]);

  const orderStrip = strips.find(strip => order?.strip_ids?.includes(strip.id));

  const recents = useMemo(() => {
    let list = [...strips];
    if (typeFilter !== "all") list = list.filter(s => (s.filter_applied || "none") === typeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s => new Date(s.created_at).toLocaleDateString().toLowerCase().includes(q));
    }
    return list.sort((a, b) => newest
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at));
  }, [strips, typeFilter, query, newest]);

  const submitSearch = (e) => {
    e.preventDefault();
    nav("/booth");
  };

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#FDE8E4] via-[#F9F7F2] to-[#EEF2FF] px-5 py-8 md:px-10 md:py-10">
        {plan === "free" && (
          <Link
            to="/profile"
            className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#4F46E5] shadow-sm transition hover:shadow-md md:right-10 md:top-8"
          >
            <Crown size={14} className="text-[#EAB308]" />Upgrade your plan
          </Link>
        )}
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-heading text-3xl font-extrabold text-[#2D2D2D] md:text-4xl">
            What will you capture today?
          </h1>
          <div className="mt-5 flex justify-center gap-2">
            <span className="rounded-full bg-[#EEF2FF] px-4 py-1.5 text-sm font-bold text-[#4F46E5]">Home</span>
            <Link to="/booth" className="rounded-full px-4 py-1.5 text-sm font-bold text-[#8A8580] transition hover:text-[#4F46E5]">Templates</Link>
          </div>
          <form onSubmit={submitSearch} className="mt-5 flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-[#8A8580]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your booths…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#8A8580]"
            />
          </form>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section>
        <div className="flex gap-5 overflow-x-auto pb-2">
          {ACTIONS.map(({ label, icon: Icon, to, color }) => (
            <Link key={label} to={to} className="flex w-16 shrink-0 flex-col items-center gap-2 text-center">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-sm transition hover:scale-105"
                style={{ backgroundColor: color }}
              >
                <Icon size={24} strokeWidth={1.9} />
              </span>
              <span className="text-[11px] font-bold leading-tight text-[#5C5953]">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* RECENTS */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-heading text-2xl font-extrabold text-[#2D2D2D]">Recents</h2>
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-[#E8E2D8] bg-white px-3 py-1.5 text-xs font-bold text-[#5C5953] outline-none"
            >
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={() => setNewest(n => !n)}
              title="Sort by date"
              className="rounded-lg border border-[#E8E2D8] bg-white px-3 py-1.5 text-[#5C5953] transition hover:border-[#4F46E5]"
            >
              <SlidersHorizontal size={15} className={newest ? "rotate-180" : ""} />
            </button>
            <button
              onClick={() => setAsList(v => !v)}
              title="Toggle layout"
              className="rounded-lg border border-[#E8E2D8] bg-white px-3 py-1.5 text-[#5C5953] transition hover:border-[#4F46E5]"
            >
              {asList ? <LayoutGrid size={15} /> : <LayoutList size={15} />}
            </button>
            <Link to="/my-booths" className="ml-1 text-xs font-bold text-[#4F46E5]">See all</Link>
          </div>
        </div>

        {recents.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-[#AEB0B5] p-10 text-center text-sm text-[#8A8580]">
            No strips here yet — start your first booth.
          </div>
        ) : asList ? (
          <div className="space-y-3">
            {recents.map(strip => (
              <Link key={strip.id} to="/my-booths" className="flex items-center gap-4 rounded-[14px] border border-[#E8E2D8] bg-white p-3 transition hover:border-[#4F46E5]">
                <StripPreview template={{ name: "Vendi" }} photos={strip.photo_urls} className="w-16 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#2D2D2D]">Photo strip</p>
                  <p className="text-xs text-[#8A8580]">{new Date(strip.created_at).toLocaleDateString()} · {strip.filter_applied || "none"}</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-[#8A8580]" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recents.map(strip => (
              <Link key={strip.id} to="/my-booths" className="group rounded-[14px] border border-[#E8E2D8] bg-white p-2 transition hover:border-[#4F46E5]">
                <StripPreview template={{ name: "Vendi" }} photos={strip.photo_urls} />
                <p className="mt-2 truncate text-xs text-[#8A8580]">{new Date(strip.created_at).toLocaleDateString()}</p>
              </Link>
            ))}
            <Link to="/booth" className="flex flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-[#C7D2FE] bg-[#EEF2FF]/50 p-6 text-center transition hover:border-[#4F46E5]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#4F46E5]"><Camera size={20} /></span>
              <span className="text-xs font-bold text-[#4F46E5]">New booth</span>
            </Link>
          </div>
        )}
      </section>

      {/* USAGE + LATEST ORDER */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[18px] border border-[#E8E2D8] bg-white p-5">
          {plan === "free" ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#2D2D2D]">This month's sessions</p>
                  <p className="text-sm text-[#8A8580]">{Math.max(0, 10 - used)} remaining</p>
                </div>
                <b className="font-heading text-2xl text-[#2D2D2D]">{used}<span className="text-base text-[#8A8580]"> / 10</span></b>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F1F0EC]">
                <span className="block h-full bg-[#4F46E5]" style={{ width: `${Math.min(100, used * 10)}%` }} />
              </div>
              <Link to="/profile" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#4F46E5]">
                <Crown size={15} />Upgrade for unlimited booths
              </Link>
            </>
          ) : (
            <>
              <p className="font-bold text-[#2D2D2D]">This month's sessions</p>
              <p className="mt-5 font-heading text-3xl font-extrabold text-[#2D2D2D]">Unlimited</p>
              <p className="mt-1 text-sm text-[#8A8580]">Make as many memories as you like.</p>
            </>
          )}
        </div>

        <div className="rounded-[18px] border border-[#E8E2D8] bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-bold text-[#2D2D2D]">Latest order</p>
            <Link to="/orders" className="text-xs font-bold text-[#4F46E5]">See all</Link>
          </div>
          {order ? (
            <Link to="/orders" className="flex items-center gap-4">
              <StripPreview template={{ name: "Vendi" }} photos={orderStrip?.photo_urls || []} className="w-16 shrink-0" />
              <div>
                <p className="font-bold text-[#2D2D2D]">{order.bundle_type} Bundle</p>
                <p className="mt-1 inline-block rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-xs font-bold capitalize text-[#4F46E5]">{order.fulfillment_status}</p>
                <p className="mt-1 text-xs text-[#8A8580]">{new Date(order.created_date).toLocaleDateString()}</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3 text-sm text-[#8A8580]">
              <Package size={20} className="text-[#8A8580]" />No orders yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}