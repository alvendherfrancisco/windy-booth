import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Camera, Crown, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import StripPreview from "@/components/booth/StripPreview";
import { RAINBOW_DOTS_BG } from "@/lib/rainbowDotsBg";
import HeroFaceScatter from "@/components/booth/HeroFaceScatter";

export default function Dashboard() {
  const { user } = useAuth();
  const [strips, setStrips] = useState([]);
  const [order, setOrder] = useState(null);
  const [used, setUsed] = useState(0);
  const plan = user?.plan || "free";
  const load = async () => {
    if (!user) return;
    setStrips(await base44.entities.Strip.filter({ user_id: user.id, saved: true }, "-created_at", 5));
    const orders = await base44.entities.Order.filter({ user_id: user.id }, "-created_date", 1);
    setOrder(orders[0]);
    const me = await base44.auth.me();
    setUsed(me.sessions_used_this_month || 0);
  };
  useEffect(() => {load();const off = base44.entities.Strip.subscribe(load);return off;}, [user?.id]);
  const orderStrip = strips.find((strip) => order?.strip_ids?.includes(strip.id));
  return <div className="space-y-7"><section><div className="mt-1 flex items-center gap-3"><h1 className="font-heading text-3xl font-extrabold">Your booth</h1><span className="rounded-full bg-[#fff3bf] px-3 py-1 text-xs font-bold capitalize text-[#e67700]">{plan}</span></div></section>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]"><Link to="/booth" className="relative isolate block overflow-hidden rounded-[18px] bg-[#f06595] p-6 text-white transition hover:bg-[#e64980]">Start a new booth

Pick a frame, strike a pose, take it with you.

Begin</Link>
      <section className="rounded-[18px] border border-[#D8D9DC] bg-white p-5" style={plan === "free" ? { backgroundImage: RAINBOW_DOTS_BG, backgroundRepeat: "no-repeat" } : undefined}>{plan === "free" ? <><div className="flex justify-between"><div><p className="font-bold">This month's sessions</p><p className="text-sm text-[#8B8D93]">{Math.max(0, 10 - used)} remaining</p></div><b className="text-2xl">{used}<span className="text-base text-[#8B8D93]"> / 10</span></b></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F1F0EC]"><span className="block h-full bg-[#fcc419]" style={{ width: `${Math.min(100, used * 10)}%` }} /></div><Link to="/profile" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#228be6]"><Crown size={15} />Upgrade for unlimited booths</Link></> : <><p className="font-bold">This month's sessions</p><p className="mt-5 font-heading text-3xl font-extrabold">Unlimited</p><p className="mt-1 text-sm text-[#8B8D93]">Make as many memories as you like.</p></>}</section></div>
    <section><div className="mb-4 flex items-end justify-between"><div><h2 className="font-heading text-xl font-extrabold">Recents</h2></div><Link to="/my-booths" className="text-sm font-bold text-[#228be6]">See all</Link></div>{strips.length ? <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-5">{strips.map((strip) => <Link key={strip.id} to="/my-booths" className="min-w-32"><StripPreview template={{ name: "Studio Mono" }} photos={strip.photo_urls} className="max-w-[100px]" /><p className="mt-2 text-center text-xs text-[#8B8D93]">{new Date(strip.created_at).toLocaleDateString()}</p></Link>)}</div> : <div className="rounded-[18px] border border-dashed border-[#AEB0B5] p-8 text-center text-sm text-[#8B8D93]">No strips yet — start your first booth.</div>}</section>
    <section><div className="mb-4 flex items-end justify-between"><div><h2 className="font-heading text-xl font-extrabold">My Orders</h2><p className="text-sm text-[#8B8D93]">Your latest print updates.</p></div><Link to="/orders" className="text-sm font-bold text-[#228be6]">See all</Link></div>{order ? <Link to="/orders" className="flex items-center gap-4 rounded-[18px] border border-[#D8D9DC] bg-white p-4"><StripPreview template={{ name: "Studio Mono" }} photos={orderStrip?.photo_urls || []} className="max-w-[74px]" /><div><p className="font-bold">{order.bundle_type} Bundle</p><p className="mt-1 inline-block rounded-full bg-[#d0ebff] px-2.5 py-0.5 text-xs font-bold capitalize text-[#228be6]">{order.fulfillment_status}</p><p className="mt-1 text-xs text-[#8B8D93]">{new Date(order.created_date).toLocaleDateString()}</p></div></Link> : <div className="rounded-[18px] border border-dashed border-[#AEB0B5] p-8 text-center text-sm text-[#8B8D93]"><Package className="mx-auto mb-3" size={20} />No orders yet.</div>}</section>
  </div>;}