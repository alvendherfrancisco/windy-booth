import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Printer, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import StripPreview from "@/components/booth/StripPreview";
import PolkaDots from "@/components/PolkaDots";
import FaceDoodles from "@/components/FaceDoodles";
import { downloadStrip } from "@/components/booth/downloadStrip";
import UpgradeModal from "@/components/upgrade/UpgradeModal";

const dotted = (v) => { const d = new Date(v); return `${d.getMonth() + 1}.${d.getDate()}.${d.getFullYear()}`; };

export default function MyBooths() {
  const { user, printShopEnabled } = useAuth();
  const [strips, setStrips] = useState([]);
  const [templates, setTemplates] = useState({});
  const plan = user?.plan || "free";
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    setStrips(await base44.entities.Strip.filter({ user_id: user.id, saved: true }, "-created_at"));
  };
  useEffect(() => {
    load();
    const off = base44.entities.Strip.subscribe(load);
    return off;
  }, [user?.id]);
  useEffect(() => {
    base44.entities.Template.list().then((all) => {
      const map = {};
      all.forEach((t) => (map[t.id] = t));
      setTemplates(map);
    });
  }, []);

  const remove = async (id) => {
    setStrips((prev) => prev.filter((s) => s.id !== id));
    try { await base44.entities.Strip.delete(id); } catch (e) {}
    load();
  };
  const download = (strip) => {
    downloadStrip(templates[strip.template_id], strip.photo_urls, `vendi-strip-${strip.id}.png`);
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-extrabold">Strips</h1>
        <p className="mt-1 text-sm text-[#8B8D93]">{plan === "free" ? "Your 10 newest strips live here. New strips replace the oldest." : "Your strips are saved with no limit."}</p>
        {plan === "free" && <button onClick={() => setUpgradeOpen(true)} className="mt-4 inline-block rounded-full bg-[#fff3bf] px-4 py-2 text-sm font-bold text-[#e67700]">Get Lifetime Pass</button>}
      </header>
      {strips.length ? (
        <div className="flex flex-wrap justify-center gap-4">
          {strips.map((strip) => (
            <article key={strip.id} className="w-[150px] rounded-[14px] border border-[#D8D9DC] bg-white p-3">
              <p className="mb-2 text-center text-xs text-[#8B8D93]">{dotted(strip.created_at)}</p>
              <StripPreview template={templates[strip.template_id]} photos={strip.photo_urls} className="mx-auto w-[124px]" />
              <div className="mt-3 flex justify-center gap-3">
                <button onClick={() => download(strip)} aria-label="Download strip" className="text-[#228be6]"><Download size={17} /></button>
                {printShopEnabled && <Link to="/print-shop" aria-label="Order prints" className="text-[#228be6]"><Printer size={17} /></Link>}
                <button onClick={() => remove(strip.id)} aria-label="Delete strip" className="text-[#DC2626]"><Trash2 size={17} /></button>
              </div>
              {strip.expires_at && <p className="mt-2 text-center text-xs text-[#8B8D93]">Expires {dotted(strip.expires_at)}</p>}
            </article>
          ))}
        </div>
      ) : (
        <div className="relative isolate overflow-hidden rounded-[18px] border border-dashed border-[#AEB0B5] bg-[#fff0f6] px-6 py-16 text-center">
          <PolkaDots />
          <FaceDoodles variant="empty" />
          <p className="font-heading text-xl font-bold">Start your first booth</p>
          <p className="mt-1 text-sm text-[#8B8D93]">Your finished strips will collect here.</p>
          <Link to="/booth" className="mt-5 inline-block rounded-full bg-[#f06595] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e64980]">Start a booth</Link>
        </div>
      )}
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}