import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Camera, Download, ImageUp, Instagram, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useBoothWizard } from "@/components/booth/BoothWizardContext";
import { filterCss } from "@/components/booth/filterPresets";
import TemplateCard from "@/components/booth/TemplateCard";
import TemplateFilters from "@/components/booth/TemplateFilters";
import StripPreview from "@/components/booth/StripPreview";
import StickyAction from "@/components/booth/StickyAction";
import FilterCard from "@/components/booth/FilterCard";
import BoothStepper from "@/components/booth/BoothStepper";
import CameraCapture from "@/components/booth/CameraCapture";
import ModeCardDecor from "@/components/booth/ModeCardDecor";
import { downloadStrip } from "@/components/booth/downloadStrip";
import { shareToInstagram } from "@/components/booth/shareStrip";
import PrintSimulation from "@/components/booth/PrintSimulation";
import HeroFaceScatter from "@/components/booth/HeroFaceScatter";
import PolkaDots from "@/components/PolkaDots";
import FaceDoodles from "@/components/FaceDoodles";
import UpgradeModal from "@/components/upgrade/UpgradeModal";
import { canUseTemplate, currentPeriod, hasAnyUnlock, isLifetime, sessionLimitReached } from "@/lib/plans";

export default function Booth() {
  const { user, updateUser } = useAuth();
  const { step, setStep, goBack } = useBoothWizard();
  const fileInput = useRef();
  const captureRef = useRef();

  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null);
  const [cameraPhotos, setCameraPhotos] = useState([]);
  const [cameraFiles, setCameraFiles] = useState([]);
  const [uploadPhotos, setUploadPhotos] = useState([]);
  const [rawFiles, setRawFiles] = useState([]);
  const [finalPhotos, setFinalPhotos] = useState([]);
  const [filter, setFilter] = useState("none");
  const [tier, setTier] = useState("all");
  const [collection, setCollection] = useState("all");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const used = user?.sessions_used_this_month || 0;
  const lifetime = isLifetime(user);
  const limitReached = sessionLimitReached(user);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [lockedTemplate, setLockedTemplate] = useState(null);
  const photos = mode === "camera" ? cameraPhotos : uploadPhotos;
  const photosComplete = photos.length === 3;

  useEffect(() => {base44.entities.Template.filter({ active: true }).then(setTemplates);}, []);
  // Fresh entry always starts the wizard at Design.
  useEffect(() => {setStep(1); /* eslint-disable-next-line */}, []);

  const resetAll = () => {
    setStep(1);setSelected(null);setMode(null);setCameraPhotos([]);setCameraFiles([]);setUploadPhotos([]);setRawFiles([]);setFinalPhotos([]);setFilter("none");
  };

  const retakePhotos = () => {
    if (mode === "camera") { setCameraPhotos([]); setCameraFiles([]); }
    else { setUploadPhotos([]); setRawFiles([]); }
    setFinalPhotos([]);setFilter("none");setStep(3);
  };

  const collections = useMemo(() => [...new Set(templates.map((t) => t.code).filter(Boolean))].sort(), [templates]);

  const filteredTemplates = templates.filter((t) => {
    if (tier === "free" && t.tier !== "free") return false;
    if (tier === "locked" && t.tier !== "premium") return false;
    if (collection !== "all" && t.code !== collection) return false;
    return t.name.toLowerCase().includes(query.toLowerCase());
  });

  const choose = (t) => {
    if (!canUseTemplate(user, t)) { setLockedTemplate(t); return; }
    setSelected(t);
  };

  // Upload mode: keep local object URLs for live display + raw Files to bake the filter at finish.
  const addFiles = (files) => {
    const remaining = 3 - uploadPhotos.length;
    const picked = Array.from(files).slice(0, remaining);
    const urls = picked.map((f) => URL.createObjectURL(f));
    setUploadPhotos((p) => [...p, ...urls]);
    setRawFiles((r) => [...r, ...picked]);
  };

  const removePhoto = (i) => {
    setUploadPhotos((p) => p.filter((_, idx) => idx !== i));
    setRawFiles((r) => r.filter((_, idx) => idx !== i));
  };

  // Bakes the currently selected filter into a local File and uploads it.
  // Used for both camera (raw captured frames) and upload (raw selected files).
  const bakeFile = async (file) => {
    const css = filterCss(filter);
    if (css === "none") {
      const r = await base44.integrations.Core.UploadFile({ file });
      return r.file_url;
    }
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((res, rej) => {img.onload = res;img.onerror = rej;});
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || 640;
    canvas.height = img.naturalHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.filter = css;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.95));
    const baked = new File([blob], `vendi-${Date.now()}.jpg`, { type: "image/jpeg" });
    const r = await base44.integrations.Core.UploadFile({ file: baked });
    return r.file_url;
  };

  const finish = async () => {
    const files = mode === "camera" ? cameraFiles : rawFiles;
    if (files.length !== 3 || !selected) return;
    setSaving(true);
    try {
      const finalUrls = [];
      for (let i = 0; i < files.length; i++) finalUrls.push(await bakeFile(files[i]));
      const now = new Date();
      const current = await base44.entities.Strip.filter({ user_id: user.id, saved: true }, "created_at");
      await base44.entities.Strip.create({
        user_id: user.id, template_id: selected.id, photo_urls: finalUrls,
        created_at: now.toISOString(), expires_at: null, saved: true, filter_applied: filter
      });
      if (!hasAnyUnlock(user) && current.length >= 10) {
        await base44.entities.Strip.delete(current[0].id);
        await base44.entities.Notification.create({ user_id: user.id, type: "storage_eviction", message: "Your oldest strip was removed to make room for your new one.", link: "/my-booths", read: false, created_at: now.toISOString() });
      }
      if (!lifetime) {
        const period = currentPeriod();
        const nextUsed = user.sessions_period === period ? used + 1 : 1;
        await base44.auth.updateMe({ sessions_used_this_month: nextUsed, sessions_period: period });
        updateUser({ sessions_used_this_month: nextUsed, sessions_period: period });
        if (nextUsed === 8 || nextUsed === 10) {
          await base44.entities.Notification.create({ user_id: user.id, type: "usage_limit", message: `You've used ${nextUsed} of 10 sessions this month.`, link: "/profile", read: false, created_at: now.toISOString() });
        }
      }
      await base44.entities.Notification.create({ user_id: user.id, type: "booth_activity", message: "Your strip is ready!", link: "/my-booths", read: false, created_at: now.toISOString() });
      setFinalPhotos(finalUrls);
      setStep(4);
    } finally {
      setSaving(false);
    }
  };

  const download = () => downloadStrip(selected, finalPhotos, "vendi-strip.png");
  const previewFilterCss = filterCss(filter);

  return (
    <div className="mx-auto max-w-4xl pb-32 md:pb-28">
      <div className="mb-6">
        {step > 1 && step < 4 &&
        <button onClick={goBack} className="mb-4 flex items-center gap-1.5 text-sm font-bold text-[#1e1b4b] hover:text-[#228be6]">
            <ArrowLeft size={16} />Back
          </button>
        }
        <div className="flex justify-center">
          <BoothStepper step={step} />
        </div>
      </div>
      {/* STEP 1 — Design */}
      {step === 1 &&
      <>
          <h1 className="font-heading text-3xl font-extrabold text-[#1e1b4b]">Choose your design</h1>
          
          {limitReached ?
        <div className="relative isolate mt-7 overflow-hidden rounded-[18px] border border-dashed border-[#AEB0B5] bg-[#eaf2fd] px-6 py-14 text-center">
              <PolkaDots />
              <FaceDoodles variant="empty" />
              <p className="relative font-heading text-xl font-bold">You've used all 10 booth sessions this month</p>
              <p className="relative mt-1 text-sm text-[#8B8D93]">Continue creating memories anytime with the Lifetime Pass.</p>
              <button onClick={() => setUpgradeOpen(true)} className="relative mt-5 inline-block rounded-full bg-[#5080da] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3a6cbf]">Get Lifetime Pass</button>
            </div> :

        <>
              <TemplateFilters tier={tier} onTierChange={setTier} collection={collection} onCollectionChange={setCollection} collections={collections} query={query} onQueryChange={setQuery} />
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filteredTemplates.map((t) =>
            <TemplateCard key={t.id} template={t} selected={selected?.id === t.id} locked={!canUseTemplate(user, t)} onSelect={choose} />
            )}
                {filteredTemplates.length === 0 &&
            <p className="col-span-4 py-10 text-center text-sm text-[#94a3b8]">No templates found.</p>
            }
              </div>
            </>
        }
          <StickyAction>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[#94a3b8]">{selected ? `${selected.name} selected` : "Choose a design"}</span>
              <button disabled={!selected || limitReached} onClick={() => setStep(2)} className="rounded-full bg-[#5080da] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3a6cbf] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8]">Continue</button>
            </div>
          </StickyAction>
        </>
      }

      {/* STEP 2 — Mode */}
      {step === 2 &&
      <>
          <h1 className="font-heading text-2xl font-extrabold text-[#1e1b4b]">How would you like to add your photos?</h1>
          <div className="mt-7 grid grid-cols-2 gap-4">
            <button onClick={() => {setMode("camera");setStep(3);}} className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-[18px] border border-[#e2e8f0] bg-white p-8 text-center transition hover:border-[#228be6] hover:bg-[#e7f5ff]">
              <ModeCardDecor variant="camera" />
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f5ff]"><Camera size={22} className="text-[#228be6]" /></div>
              <div className="relative z-10"><b className="block text-sm text-[#1e1b4b]">Take Photos</b><small className="text-[#94a3b8]">Use your camera</small></div>
            </button>
            <button onClick={() => {setMode("upload");setStep(3);}} className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-[18px] border border-[#e2e8f0] bg-white p-8 text-center transition hover:border-[#228be6] hover:bg-[#e7f5ff]">
              <ModeCardDecor variant="upload" />
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f5ff]"><ImageUp size={22} className="text-[#228be6]" /></div>
              <div className="relative z-10"><b className="block text-sm text-[#1e1b4b]">Upload Photos</b><small className="text-[#94a3b8]">Choose from gallery</small></div>
            </button>
          </div>
        </>
      }

      {/* STEP 3 — Capture, then Filter (filter phase appears once 3 photos are ready) */}
      {step === 3 &&
      (
        photosComplete ?
        <>
            <h1 className="mb-5 font-heading text-2xl font-extrabold text-[#1e1b4b]">Choose your filter</h1>
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <FilterCard filter={filter} onFilterChange={setFilter} />
              <div className="mx-auto w-full max-w-[180px] flex flex-col rounded-2xl border border-[#e2e8f0] bg-white p-4 lg:max-w-none">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Your Strip</p>
                <StripPreview template={selected} photos={photos} imgFilter={previewFilterCss} />
              </div>
            </div>
            <StickyAction>
              <div className="flex items-center justify-between gap-3">
                <button onClick={retakePhotos} className="text-xs font-bold text-[#94a3b8] hover:text-[#1e1b4b]">Retake photos</button>
                <button disabled={saving} onClick={finish} className="rounded-full bg-[#5080da] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3a6cbf] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8]">
                  {saving ? "Making your strip…" : "Continue"}
                </button>
              </div>
            </StickyAction>
          </> :

        <>
            <h1 className="mb-5 font-heading text-2xl font-extrabold text-[#1e1b4b]">{mode === "camera" ? "Ready when you are" : "Pick three photos"}</h1>
            {mode === "camera" ?
          <CameraCapture ref={captureRef} selected={selected} photos={cameraPhotos} onPhotosChange={setCameraPhotos} onComplete={setCameraFiles} onCapturingChange={setCapturing} /> :

          <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                  <div className="flex flex-col rounded-2xl border border-[#e2e8f0] bg-white p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Live Preview</p>
                    <button
                type="button"
                onClick={() => {if (uploadPhotos.length < 3) fileInput.current.click();}}
                className="flex w-full flex-1 min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#228be6] bg-[#e7f5ff] text-center transition hover:border-[#228be6]">
                
                     <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#228be6]"><ImageUp size={24} /></span>
                     <span className="mt-4 block font-bold text-[#1e1b4b]">Tap to choose a photo</span>
                     <span className="mt-1 block text-sm text-[#94a3b8]">or drag and drop here</span>
                     <span className="mt-3 block text-xs font-bold text-[#228be6]">{uploadPhotos.length} / 3 uploaded</span>
                   </button>
                   <input ref={fileInput} className="hidden" type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} />
                   <div className="mt-4 flex gap-2">
                     {[0, 1, 2].map((i) =>
                <div key={i} className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${i < uploadPhotos.length ? "border-[#228be6]" : "border-dashed border-[#e2e8f0]"} bg-[#f1f5fb]`}>
                    {uploadPhotos[i] &&
                  <>
                            <img src={photos[i]} alt="" className="h-full w-full object-cover" />
                            <button onClick={() => removePhoto(i)} className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white bg-[hsl(var(--sidebar-ring))]">×</button>
                          </>
                  }
                      </div>
                )}
                   </div>
                 </div>
                 <div className="mx-auto w-full max-w-[180px] flex flex-col rounded-2xl border border-[#e2e8f0] bg-white p-4 lg:max-w-none">
                   <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Your Strip</p>
                   <StripPreview template={selected} photos={uploadPhotos} />
                 </div>
               </div>
             </div>
        }
            <StickyAction>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[#475569]">
                  {mode === "camera" ?
                (capturing ? "Capturing your photos…" : <>Ready to start — take <span className="font-bold text-[#228be6]">3 photos</span></>) :
                (photos.length < 3 ? <>Upload <span className="font-bold text-[#228be6]">3 photos</span> from your device</> : "All 3 photos ready!")}
                </span>
                {mode === "camera" &&
              <button disabled={capturing} onClick={() => captureRef.current?.capture()} className="flex items-center gap-2 rounded-full bg-[#5080da] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3a6cbf] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8]">
                      <Camera size={16} />{capturing ? "Capturing…" : "Start"}
                    </button>
                }
              </div>
            </StickyAction>
          </>
      )}

      {/* STEP 4 — Print Simulation (auto-redirects to Download on completion) */}
      {step === 4 &&
        <PrintSimulation template={selected} photos={finalPhotos} onDone={() => setStep(5)} />
      }

      {/* STEP 5 — Download */}
      {step === 5 &&
      <div className="mx-auto max-w-sm text-center">
          <div className="animate-pop relative isolate mt-4 overflow-hidden rounded-[18px] bg-[#5080da] p-6 text-white">
            <HeroFaceScatter />
            <div className="mx-auto w-[180px]">
              <StripPreview template={selected} photos={finalPhotos} />
            </div>
            <p className="mt-5 font-heading text-xl font-extrabold text-white">Your strip is ready!</p>
            {!lifetime && used >= 10 &&
          <p className="mt-2 text-sm text-white/85">Your oldest strip was replaced — download it to keep it.</p>
          }
            <div className="mt-6 space-y-3">
              <button onClick={download} className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-4 text-sm font-bold text-[#3a6cbf] transition hover:bg-white/90">
                <Download size={16} />Download Strip
              </button>
              <button onClick={async () => { try { setSharing(true); await shareToInstagram(selected, finalPhotos); } finally { setSharing(false); } }} disabled={sharing} className="flex w-full items-center justify-center gap-2 rounded-full border border-white px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-60">
                <Instagram size={16} />{sharing ? "Opening share…" : "Share to Instagram"}
              </button>
              <button onClick={retakePhotos} className="flex w-full items-center justify-center gap-2 rounded-full border border-white px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                <RotateCcw size={14} />Retake Photos
              </button>
              <button onClick={resetAll} className="block w-full text-sm font-bold text-white/90 hover:text-white">Start over with a new design →</button>
            </div>
          </div>
        </div>
      }
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <UpgradeModal open={!!lockedTemplate} variant="collection" collection={lockedTemplate?.code} onClose={() => setLockedTemplate(null)} />
    </div>);

}