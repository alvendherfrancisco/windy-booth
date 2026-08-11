import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Download, ImageUp, Instagram, Printer } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useBoothWizard } from "@/components/booth/BoothWizardContext";
import { filterCss } from "@/components/booth/filterPresets";
import { bakeFilter } from "@/components/booth/bakeFilter";
import TemplateCard from "@/components/booth/TemplateCard";
import TemplateFilters from "@/components/booth/TemplateFilters";
import StripPreview from "@/components/booth/StripPreview";
import StickyAction from "@/components/booth/StickyAction";
import FilterCard from "@/components/booth/FilterCard";
import BoothStepper from "@/components/booth/BoothStepper";
import CameraCapture from "@/components/booth/CameraCapture";
import { RAINBOW_DOTS_BG } from "@/lib/rainbowDotsBg";
import { downloadStrip } from "@/components/booth/downloadStrip";
import { downloadStripVideo } from "@/components/booth/downloadStripVideo";
import { shareToInstagram } from "@/components/booth/shareStrip";
import { Switch } from "@/components/ui/switch";
import PrintSimulation from "@/components/booth/PrintSimulation";
import DownloadFaceScatter from "@/components/booth/DownloadFaceScatter";
import PolkaDots from "@/components/PolkaDots";
import FaceDoodles from "@/components/FaceDoodles";
import UpgradeModal from "@/components/upgrade/UpgradeModal";
import { canUseTemplate, currentPeriod, isLifetime, sessionLimitReached } from "@/lib/plans";
import { useTemplates } from "@/hooks/useTemplates";

export default function Booth() {
  const { user, updateUser, printShopEnabled } = useAuth();
  const { step, setStep, goBack } = useBoothWizard();
  const fileInput = useRef();
  const captureRef = useRef();

  const { templates: allTemplates } = useTemplates();
  const templates = useMemo(() => allTemplates.filter((t) => t.active), [allTemplates]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null);
  const [cameraPhotos, setCameraPhotos] = useState([]);
  const [cameraFiles, setCameraFiles] = useState([]);
  const [cameraVideoFiles, setCameraVideoFiles] = useState([]);
  const [liveMode, setLiveMode] = useState(false);
  const [uploadPhotos, setUploadPhotos] = useState([]);
  const [rawFiles, setRawFiles] = useState([]);
  const [finalPhotos, setFinalPhotos] = useState([]);
  const [finalVideos, setFinalVideos] = useState([]);
  const [isVideoStrip, setIsVideoStrip] = useState(false);
  const [filter, setFilter] = useState("none");
  const [tier, setTier] = useState("all");
  const [collection, setCollection] = useState("all");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const used = user?.sessions_period === currentPeriod() ? (user?.sessions_used_this_month || 0) : 0;
  const lifetime = isLifetime(user);
  const limitReached = sessionLimitReached(user);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [lockedTemplate, setLockedTemplate] = useState(null);
  const photos = mode === "camera" ? cameraPhotos : uploadPhotos;
  const photosComplete = photos.length === 3;

  // Fresh entry always starts the wizard at Design.
  useEffect(() => {setStep(1); /* eslint-disable-next-line */}, []);

  const resetAll = () => {
    setStep(1);setSelected(null);setMode(null);setCameraPhotos([]);setCameraFiles([]);setCameraVideoFiles([]);setLiveMode(false);setUploadPhotos([]);setRawFiles([]);setFinalPhotos([]);setFinalVideos([]);setIsVideoStrip(false);setFilter("none");
  };

  const retakePhotos = () => {
    if (mode === "camera") { setCameraPhotos([]); setCameraFiles([]); setCameraVideoFiles([]); }
    else { setUploadPhotos([]); setRawFiles([]); }
    setFinalPhotos([]);setFilter("none");setStep(3);
  };

  const collections = useMemo(() => [...new Set(templates.map((t) => t.code).filter(Boolean))].sort(), [templates]);

  const filteredTemplates = templates.filter((t) => {
    if (tier === "free" && t.tier !== "free") return false;
    if (tier === "locked" && t.tier !== "premium") return false;
    if (collection !== "all" && t.code !== collection) return false;
    const q = query.toLowerCase();
    return t.name.toLowerCase().includes(q) || (t.code || "").toLowerCase().includes(q);
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

  const finish = async () => {
    const files = mode === "camera" ? cameraFiles : rawFiles;
    if (files.length !== 3 || !selected) return;
    const asVideo = mode === "camera" && liveMode;
    setSaving(true);
    try {
      // Live Mode: upload the raw poster frames + recorded clips as-is (no
      // filter baking — that's pixel-level canvas work meant for stills).
      // Otherwise bake + upload all 3 photos concurrently.
      let finalUrls, finalVideoUrls = [];
      if (asVideo) {
        [finalUrls, finalVideoUrls] = await Promise.all([
          Promise.all(files.map((f) => base44.integrations.Core.UploadFile({ file: f }).then((r) => r.file_url))),
          Promise.all(cameraVideoFiles.map((f) => base44.integrations.Core.UploadFile({ file: f }).then((r) => r.file_url))),
        ]);
      } else {
        finalUrls = await Promise.all(
          files.map((f) =>
            bakeFilter(f, filter).then((baked) => base44.integrations.Core.UploadFile({ file: baked })).then((r) => r.file_url)
          )
        );
      }
      const now = new Date();
      const [, current] = await Promise.all([
        base44.entities.Strip.create({
          user_id: user.id, template_id: selected.id, photo_urls: finalUrls, video_urls: finalVideoUrls, is_video: asVideo,
          created_at: now.toISOString(), expires_at: null, saved: true, filter_applied: asVideo ? "none" : filter
        }),
        base44.entities.Strip.filter({ user_id: user.id, saved: true }, "created_at"),
      ]);

      const tasks = [
        base44.entities.Notification.create({ user_id: user.id, type: "booth_activity", message: "Your strip is ready!", link: "/my-booths", read: false, created_at: now.toISOString() }),
      ];
      if (!lifetime && current.length >= 10) {
        tasks.push(base44.entities.Strip.delete(current[0].id));
        tasks.push(base44.entities.Notification.create({ user_id: user.id, type: "storage_eviction", message: "Your oldest strip was removed to make room for your new one.", link: "/my-booths", read: false, created_at: now.toISOString() }));
      }
      if (!lifetime) {
        const period = currentPeriod();
        const nextUsed = user.sessions_period === period ? used + 1 : 1;
        tasks.push(base44.auth.updateMe({ sessions_used_this_month: nextUsed, sessions_period: period }).then(() => updateUser({ sessions_used_this_month: nextUsed, sessions_period: period })));
        if (nextUsed === 8 || nextUsed === 10) {
          tasks.push(base44.entities.Notification.create({ user_id: user.id, type: "usage_limit", message: `You've used ${nextUsed} of 10 sessions today.`, link: "/profile", read: false, created_at: now.toISOString() }));
        }
      }
      await Promise.all(tasks);
      setFinalPhotos(finalUrls);
      setFinalVideos(finalVideoUrls);
      setIsVideoStrip(asVideo);
      setStep(4);
    } finally {
      setSaving(false);
    }
  };

  const download = () => isVideoStrip ? downloadStripVideo(selected, finalVideos) : downloadStrip(selected, finalPhotos, "windy-strip.jpg");
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
              <p className="relative font-heading text-xl font-bold">You've used all 10 booth sessions today</p>
              <p className="relative mt-1 text-sm text-[#8B8D93]">Continue creating memories anytime with the Lifetime Pass.</p>
              <button onClick={() => setUpgradeOpen(true)} className="relative mt-5 inline-block rounded-full bg-[#5080da] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3a6cbf]">Get Lifetime Pass</button>
            </div> :

        <>
              <TemplateFilters tier={tier} onTierChange={setTier} collection={collection} onCollectionChange={setCollection} collections={collections} query={query} onQueryChange={setQuery} hideTiers={lifetime} />
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
            <button onClick={() => {setMode("camera");setStep(3);}} className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-[18px] border border-[#D8D9DC] bg-white p-8 text-center transition hover:border-[#228be6]" style={{ backgroundImage: RAINBOW_DOTS_BG, backgroundRepeat: "no-repeat" }}>
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f5ff]"><Camera size={22} className="text-[#228be6]" /></div>
              <div className="relative z-10"><b className="block text-sm text-[#1e1b4b]">Take Photos</b><small className="text-[#94a3b8]">Use your camera</small></div>
            </button>
            <button onClick={() => {setMode("upload");setStep(3);}} className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-[18px] border border-[#D8D9DC] bg-white p-8 text-center transition hover:border-[#228be6]" style={{ backgroundImage: RAINBOW_DOTS_BG, backgroundRepeat: "no-repeat" }}>
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f5ff]"><ImageUp size={22} className="text-[#228be6]" /></div>
              <div className="relative z-10"><b className="block text-sm text-[#1e1b4b]">Upload Photos</b><small className="text-[#94a3b8]">Choose from gallery</small></div>
            </button>
          </div>
        </>
      }

      {/* STEP 3 — Capture/Upload + Filter on the same page */}
      {step === 3 && (
        <>
          <h1 className="mb-5 font-heading text-2xl font-extrabold text-[#1e1b4b]">{mode === "camera" ? "Ready when you are" : "Pick three photos"}</h1>
          {mode === "camera" ? (
            <>
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#e2e8f0] bg-white p-4">
                <div>
                  <p className="text-sm font-bold text-[#1e1b4b]">Live Mode</p>
                  <p className="text-xs text-[#94a3b8]">Capture short video clips instead of photos</p>
                </div>
                <Switch checked={liveMode} onCheckedChange={setLiveMode} disabled={capturing || cameraPhotos.length > 0} />
              </div>
              <CameraCapture ref={captureRef} selected={selected} photos={cameraPhotos} onPhotosChange={setCameraPhotos} onComplete={setCameraFiles} onVideoComplete={setCameraVideoFiles} onCapturingChange={setCapturing} imgFilter={previewFilterCss} live={liveMode}>
                {!liveMode && <FilterCard filter={filter} onFilterChange={setFilter} disabled={capturing} />}
              </CameraCapture>
            </>
          ) : (
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_220px] lg:gap-4">
              {/* Upload card — mobile: first, desktop: col 1 row 1 */}
              <div className="order-1 lg:col-start-1 lg:row-start-1 flex flex-col rounded-2xl border border-[#e2e8f0] bg-white p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Live Preview</p>
                <button
                  type="button"
                  onClick={() => { if (uploadPhotos.length < 3) fileInput.current.click(); }}
                  className="flex w-full flex-1 min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#228be6] bg-[#e7f5ff] text-center transition hover:border-[#228be6]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#228be6]"><ImageUp size={24} /></span>
                  <span className="mt-4 block font-bold text-[#1e1b4b]">Tap to choose a photo</span>
                  <span className="mt-1 block text-sm text-[#94a3b8]">or drag and drop here</span>
                  <span className="mt-3 block text-xs font-bold text-[#228be6]">{uploadPhotos.length} / 3 uploaded</span>
                </button>
                <input ref={fileInput} className="hidden" type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} />
                <div className="mt-4 flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${i < uploadPhotos.length ? "border-[#228be6]" : "border-dashed border-[#e2e8f0]"} bg-[#f1f5fb]`}>
                      {uploadPhotos[i] && (
                        <>
                          <img src={photos[i]} alt="" className="h-full w-full object-cover" style={{ filter: previewFilterCss }} />
                          <button onClick={() => removePhoto(i)} className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white bg-[hsl(var(--sidebar-ring))]">×</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Filter — mobile: below upload area, desktop: col 1 row 2 */}
              <div className="order-2 lg:col-start-1 lg:row-start-2">
                <FilterCard filter={filter} onFilterChange={setFilter} disabled={capturing} />
              </div>
              {/* Your Strip — mobile: last, desktop: col 2 spanning all rows */}
              <div className="order-3 lg:col-start-2 lg:row-start-1 lg:row-span-2 mx-auto w-full max-w-[180px] flex flex-col self-start rounded-2xl border border-[#e2e8f0] bg-white p-4 lg:max-w-none">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Your Strip</p>
                <StripPreview template={selected} photos={uploadPhotos} imgFilter={previewFilterCss} />
              </div>
            </div>
          )}

          {/* Dynamic bottom navigation */}
          <StickyAction>
            {photosComplete ? (
              <div className="flex items-center justify-between gap-3">
                <button onClick={retakePhotos} className="text-xs font-bold text-[#94a3b8] hover:text-[#1e1b4b]">Retake photos</button>
                <button disabled={saving} onClick={finish} className="rounded-full bg-[#5080da] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3a6cbf] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8]">
                  {saving ? "Making your strip…" : "Continue"}
                </button>
              </div>
            ) : mode === "camera" ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[#475569]">
                  {capturing ? "Capturing your photos…" : <>Ready to start — take <span className="font-bold text-[#228be6]">3 photos</span></>}
                </span>
                <button disabled={capturing} onClick={() => captureRef.current?.capture()} className="flex items-center gap-2 rounded-full bg-[#5080da] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3a6cbf] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8]">
                  <Camera size={16} />{capturing ? "Capturing…" : "Start"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[#475569]">
                  {photos.length < 3 ? <>Upload <span className="font-bold text-[#228be6]">3 photos</span> from your device</> : "All 3 photos ready!"}
                </span>
              </div>
            )}
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
          <DownloadFaceScatter />
            <div className="mx-auto w-[180px]">
              <StripPreview template={selected} photos={finalPhotos} videos={isVideoStrip ? finalVideos : []} />
            </div>
            <p className="mt-5 font-heading text-xl font-extrabold text-white">Your strip is ready!</p>
            {!lifetime && used >= 10 &&
          <p className="mt-2 text-sm text-white/85">Your oldest strip was replaced — download it to keep it.</p>
          }
            <div className="mt-6 space-y-3">
              <button onClick={download} className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-4 text-sm font-bold text-[#3a6cbf] transition hover:bg-white/90">
                <Download size={16} />{isVideoStrip ? "Download Video" : "Download Strip"}
              </button>
              <button onClick={async () => { try { setSharing(true); await shareToInstagram(selected, finalPhotos); } finally { setSharing(false); } }} disabled={sharing} className="flex w-full items-center justify-center gap-2 rounded-full border border-white px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-60">
                <Instagram size={16} />{sharing ? "Opening share…" : "Share to Instagram"}
              </button>
              {printShopEnabled &&
          <Link to="/print-shop" className="flex w-full items-center justify-center gap-2 rounded-full border border-white px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                  <Printer size={16} />Order a Physical Print
                </Link>
          }
              <button onClick={resetAll} className="block w-full text-sm font-bold text-white/90 hover:text-white">Start over with a new design →</button>
            </div>
          </div>
        </div>
      }
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <UpgradeModal open={!!lockedTemplate} variant="collection" collection={lockedTemplate?.code} onClose={() => setLockedTemplate(null)} />
    </div>);

}