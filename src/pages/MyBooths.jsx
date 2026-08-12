import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Printer, Share2, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import StripPreview from "@/components/booth/StripPreview";
import PolkaDots from "@/components/PolkaDots";
import FaceDoodles from "@/components/FaceDoodles";
import { downloadStrip } from "@/components/booth/downloadStrip";
import { downloadStripVideo } from "@/components/booth/downloadStripVideo";
import { shareToInstagram } from "@/components/booth/shareStrip";
import UpgradeModal from "@/components/upgrade/UpgradeModal";
import { useTemplatesMap } from "@/hooks/useTemplates";
import { useStrips } from "@/hooks/useStrips";
import { getGuestStrips, deleteGuestStrip } from "@/lib/guestStrips";

const dotted = (v) => { const d = new Date(v); return `${d.getMonth() + 1}.${d.getDate()}.${d.getFullYear()}`; };

export default function MyBooths() {
  const { user, printShopEnabled } = useAuth();
  const { strips: userStrips } = useStrips(user?.id);
  const [guestStrips, setGuestStrips] = useState([]);
  useEffect(() => { if (!user) setGuestStrips(getGuestStrips()); }, [user]);
  const strips = user ? userStrips : guestStrips;
  const queryClient = useQueryClient();
  const { templatesMap: templates } = useTemplatesMap();
  const plan = user?.plan || "free";
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [sharingId, setSharingId] = useState(null);

  const remove = async (id) => {
    if (!user) {
      deleteGuestStrip(id);
      setGuestStrips((prev) => prev.filter((s) => s.id !== id));
      try { await base44.entities.Strip.delete(id); } catch (e) {}
      return;
    }
    queryClient.setQueryData(["strips", user.id], (prev) => (prev || []).filter((s) => s.id !== id));
    try { await base44.entities.Strip.delete(id); } catch (e) {}
  };
  const download = (strip) => {
    if (strip.video_urls?.length) downloadStripVideo(templates[strip.template_id], strip.video_urls);
    else downloadStrip(templates[strip.template_id], strip.photo_urls, `windy-strip-${strip.id}.jpg`);
  };
  const share = async (strip) => {
    setSharingId(strip.id);
    try {
      await shareToInstagram(templates[strip.template_id], strip.photo_urls);
    } finally {
      setSharingId(null);
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-extrabold">Strips</h1>
        {!user && <p className="mt-1 text-sm text-[#8B8D93]">These strips are only saved on this device — sign up to keep them forever.</p>}
        {user && plan === "free" && <p className="mt-1 text-sm text-[#8B8D93]">Your 10 newest strips live here. New strips replace the oldest.</p>}
        {user && plan === "free" && <button onClick={() => setUpgradeOpen(true)} className="mt-4 inline-block rounded-full bg-[#fff3bf] px-4 py-2 text-sm font-bold text-[#e67700]">Get Lifetime Pass</button>}
      </header>
      {strips.length ? (
        <div className="flex flex-wrap justify-center gap-4">
          {strips.map((strip) => (
            <article key={strip.id} className="w-[150px] rounded-[14px] border border-[#D8D9DC] bg-white p-3">
              <p className="mb-2 text-center text-xs text-[#8B8D93]">{dotted(strip.created_at)}</p>
              <StripPreview template={templates[strip.template_id]} photos={strip.photo_urls} videos={strip.video_urls?.length ? strip.video_urls : []} className="mx-auto w-[124px]" />
              <div className="mt-3 flex justify-center gap-3">
                <button onClick={() => download(strip)} aria-label="Download strip" className="text-[#228be6]"><Download size={17} /></button>
                <button onClick={() => share(strip)} aria-label="Share strip" disabled={sharingId === strip.id} className="text-[#3a6cbf] disabled:opacity-50"><Share2 size={17} /></button>
                {printShopEnabled && <Link to="/print-shop" aria-label="Order prints" className="text-[#228be6]"><Printer size={17} /></Link>}
                <button onClick={() => remove(strip.id)} aria-label="Delete strip" className="text-[#DC2626]"><Trash2 size={17} /></button>
              </div>
              {strip.expires_at && <p className="mt-2 text-center text-xs text-[#8B8D93]">Expires {dotted(strip.expires_at)}</p>}
            </article>
          ))}
        </div>
      ) : (
        <div className="relative isolate overflow-hidden rounded-[18px] border border-dashed border-[#AEB0B5] bg-[#eaf2fd] px-6 py-16 text-center">
          <PolkaDots />
          <FaceDoodles variant="empty" />
          <p className="font-heading text-xl font-bold">Start your first booth</p>
          <p className="mt-1 text-sm text-[#8B8D93]">Your finished strips will collect here.</p>
          <Link to="/booth" className="mt-5 inline-block rounded-full bg-[#5080da] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3a6cbf]">Start a booth</Link>
        </div>
      )}
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}