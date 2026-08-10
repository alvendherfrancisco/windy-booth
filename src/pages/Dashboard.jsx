import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Camera, Check, Crown, Package, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import StripPreview from "@/components/booth/StripPreview";
import { RAINBOW_DOTS_BG } from "@/lib/rainbowDotsBg";
import HeroFaceScatter from "@/components/booth/HeroFaceScatter";
import UpgradeModal from "@/components/upgrade/UpgradeModal";
import { isLifetime, planLabel } from "@/lib/plans";
import { useTemplatesMap } from "@/hooks/useTemplates";

export default function Dashboard() {
  const { user, printShopEnabled, updateUser } = useAuth();
  const [strips, setStrips] = useState([]);
  const [order, setOrder] = useState(null);
  const { templatesMap: templates } = useTemplatesMap();
  const plan = user?.plan || "free";
  const used = user?.sessions_used_this_month || 0;
  const lifetime = isLifetime(user);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [unlockResult, setUnlockResult] = useState(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("unlock") === "success") {
      base44.functions.invoke("confirmUnlock", {}).then((r) => {
        const d = r?.data ?? r;
        if (!d?.ok) return;
        if (d?.type === "lifetime") updateUser({ plan: "lifetime" });else
        if (d?.type === "collection" && d.category) updateUser({ owned_collections: [...(user?.owned_collections || []), d.category] });
        setUnlockResult({ type: d?.type, category: d?.category });
      }).catch(() => {}).finally(() => window.history.replaceState({}, "", "/dashboard"));
    } else if (p.get("unlock") === "canceled") {
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);
  const load = async () => {
    if (!user) return;
    setStrips(await base44.entities.Strip.filter({ user_id: user.id, saved: true }, "-created_at", 5));
    const orders = await base44.entities.Order.filter({ user_id: user.id }, "-created_date", 1);
    setOrder(orders[0]);
  };
  useEffect(() => {load();const off = base44.entities.Strip.subscribe(load);return off;}, [user?.id]);
  const orderStrip = strips.find((strip) => order?.strip_ids?.includes(strip.id));
  return <div className="space-y-7"><section><div className="mt-1 flex items-center gap-3"><h1 className="font-heading text-3xl font-extrabold">Your booth</h1><span className="rounded-full bg-[#fff3bf] px-3 py-1 text-xs font-bold text-[#e67700]">{planLabel(user)}</span></div></section>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]"><Link to="/booth" className="relative isolate block overflow-hidden rounded-[18px] bg-[#5080da] p-6 text-white transition hover:bg-[#3a6cbf]"><HeroFaceScatter /><Camera size={25} className="hidden" /><h2 className="mt-8 font-heading text-2xl font-extrabold">Start a new booth</h2><p className="mt-1 text-sm text-white/85">Pick a frame, strike a pose, take it with you.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">Begin <ArrowRight size={16} /></span></Link>
      <section className="rounded-[18px] border border-[#D8D9DC] bg-white p-5" style={{ backgroundImage: RAINBOW_DOTS_BG, backgroundRepeat: "no-repeat" }}>{plan === "free" ? <><div className="flex justify-between"><div><p className="font-bold">This day's sessions</p><p className="text-sm text-[#8B8D93]">{Math.max(0, 10 - used)} remaining</p></div><b className="text-2xl">{used}<span className="text-base text-[#8B8D93]"> / 10</span></b></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F1F0EC]"><span className="block h-full bg-[#fcc419]" style={{ width: `${Math.min(100, used * 10)}%` }} /></div><button onClick={() => setUpgradeOpen(true)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#228be6]"><Crown size={15} />Get Lifetime Pass</button></> : <><p className="font-bold">This month's sessions</p><p className="mt-5 font-heading text-3xl font-extrabold">Unlimited</p><p className="mt-1 text-sm text-[#8B8D93]">Make as many memories as you like.</p></>}</section></div>
    
    <section><div className="mb-4 flex items-end justify-between"><div><h2 className="font-heading text-xl font-extrabold">Recents</h2></div><Link to="/my-booths" className="text-sm font-bold text-[#228be6]">See all</Link></div>{strips.length ? <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-5">{strips.map((strip) => <Link key={strip.id} to="/my-booths" className="min-w-32"><StripPreview template={templates[strip.template_id] || { name: "Studio Mono" }} photos={strip.photo_urls} className="max-w-[100px]" /><p className="mt-2 text-center text-xs text-[#8B8D93]">{new Date(strip.created_at).toLocaleDateString()}</p></Link>)}</div> : <div className="rounded-[18px] border border-dashed border-[#AEB0B5] p-8 text-center text-sm text-[#8B8D93]">No strips yet — start your first booth.</div>}</section>
    {printShopEnabled && <section><div className="mb-4 flex items-end justify-between"><div><h2 className="font-heading text-xl font-extrabold">My Orders</h2><p className="text-sm text-[#8B8D93]">Your latest print updates.</p></div><Link to="/orders" className="text-sm font-bold text-[#228be6]">See all</Link></div>{order ? <Link to="/orders" className="flex items-center gap-4 rounded-[18px] border border-[#D8D9DC] bg-white p-4"><StripPreview template={templates[orderStrip?.template_id] || { name: "Studio Mono" }} photos={orderStrip?.photo_urls || []} className="max-w-[74px]" /><div><p className="font-bold">{order.bundle_type} Bundle</p><p className="mt-1 inline-block rounded-full bg-[#d0ebff] px-2.5 py-0.5 text-xs font-bold capitalize text-[#228be6]">{order.fulfillment_status}</p><p className="mt-1 text-xs text-[#8B8D93]">{new Date(order.created_date).toLocaleDateString()}</p></div></Link> : <div className="rounded-[18px] border border-dashed border-[#AEB0B5] p-8 text-center text-sm text-[#8B8D93]"><Package className="mx-auto mb-3" size={20} />No orders yet.</div>}</section>}
      {unlockResult &&
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative w-full max-w-sm overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-[#ebfbee] p-6 text-center animate-modal-in">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#37b24d]"><Check size={26} /></div>
          <h2 className="mt-3 font-heading text-2xl font-extrabold text-[#1e1b4b]">{unlockResult?.type === "lifetime" ? "Welcome to Lifetime Pass!" : "Collection unlocked!"}</h2>
          <p className="mt-2 text-sm text-[#475569]">{unlockResult?.type === "lifetime" ? "You now have unlimited booth sessions, every artist-designed collection, and unlimited saved strips." : `${unlockResult?.category} is now yours to use.`}</p>
          <button onClick={() => setUnlockResult(null)} className="mt-5 rounded-full bg-[#5080da] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3a6cbf]">Enjoy making memories</button>
        </div>
      </div>
    }
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
  </div>;
}