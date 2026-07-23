import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Download, ImageUp, RotateCcw } from "lucide-react";
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

export default function Booth() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { step, setStep, goBack } = useBoothWizard();
  const fileInput = useRef();
  const captureRef = useRef();

  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [rawFiles, setRawFiles] = useState([]);
  const [filter, setFilter] = useState("none");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const plan = user?.plan || "free";
  const used = user?.sessions_used_this_month || 0;

  useEffect(() => {base44.entities.Template.filter({ active: true }).then(setTemplates);}, []);
  // Fresh entry always starts the wizard at Design.
  useEffect(() => {setStep(1); /* eslint-disable-next-line */}, []);

  const resetAll = () => {
    setStep(1);setSelected(null);setMode(null);setPhotos([]);setRawFiles([]);setFilter("none");
  };

  const filteredTemplates = templates.filter((t) =>
  (category === "all" || t.category === category) &&
  t.name.toLowerCase().includes(query.toLowerCase())
  );

  const choose = (t) => {
    if (t.tier === "premium" && plan === "free") return nav("/profile");
    setSelected(t);
  };

  // Upload mode: keep local object URLs for live display + raw Files to bake the filter at finish.
  const addFiles = (files) => {
    const remaining = 3 - photos.length;
    const picked = Array.from(files).slice(0, remaining);
    const urls = picked.map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...urls]);
    setRawFiles((r) => [...r, ...picked]);
  };

  const removePhoto = (i) => {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
    setRawFiles((r) => r.filter((_, idx) => idx !== i));
  };

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
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.92));
    const baked = new File([blob], `vendi-${Date.now()}.jpg`, { type: "image/jpeg" });
    const r = await base44.integrations.Core.UploadFile({ file: baked });
    return r.file_url;
  };

  const finish = async () => {
    if (photos.length !== 3 || !selected) return;
    setSaving(true);
    try {
      let finalUrls = photos;
      if (mode === "upload") {
        finalUrls = [];
        for (let i = 0; i < rawFiles.length; i++) finalUrls.push(await bakeFile(rawFiles[i]));
      }
      const now = new Date();
      const current = await base44.entities.Strip.filter({ user_id: user.id, saved: true }, "created_at");
      const expires = plan === "premium" ? new Date(Date.now() + 31536000000).toISOString() : null;
      await base44.entities.Strip.create({
        user_id: user.id, template_id: selected.id, photo_urls: finalUrls,
        created_at: now.toISOString(), expires_at: expires, saved: true, filter_applied: filter
      });
      if (plan === "free" && current.length >= 10) {
        await base44.entities.Strip.delete(current[0].id);
        await base44.entities.Notification.create({ user_id: user.id, type: "storage_eviction", message: "Your oldest strip was removed to make room for your new one.", link: "/my-booths", read: false, created_at: now.toISOString() });
      }
      const nextUsed = used + 1;
      await base44.auth.updateMe({ sessions_used_this_month: nextUsed });
      await base44.entities.Notification.create({ user_id: user.id, type: "booth_activity", message: "Your strip is ready!", link: "/my-booths", read: false, created_at: now.toISOString() });
      if (plan === "free" && (nextUsed === 8 || nextUsed === 10)) {
        await base44.entities.Notification.create({ user_id: user.id, type: "usage_limit", message: `You've used ${nextUsed} of 10 sessions this month.`, link: "/profile", read: false, created_at: now.toISOString() });
      }
      setPhotos(finalUrls);
      setStep(4);
    } finally {
      setSaving(false);
    }
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = photos[0];
    a.download = "vendi-strip";
    a.click();
  };

  // In upload mode the stored photos are raw, so the filter is applied via CSS for the live preview.
  const uploadFilterCss = mode === "upload" ? filterCss(filter) : "none";

  return (
    <div className="mx-auto max-w-4xl pb-32 md:pb-28">
      <div className="mb-6">
        {step > 1 &&
        <button onClick={goBack} className="mb-4 flex items-center gap-1.5 text-sm font-bold text-[#2D2D2D] hover:text-[#4F46E5]">
            <ArrowLeft size={16} />Back
          </button>
        }
        <BoothStepper step={step} />
      </div>
      {/* STEP 1 — Design */}
      {step === 1 &&
      <>
          <h1 className="font-heading text-3xl font-extrabold text-[#2D2D2D]">Choose your design</h1>
          
          {plan === "free" && used >= 10 ?
        <div className="mt-7 rounded-[18px] bg-[#FDE8E4] p-5">
              <b className="text-[#2D2D2D]">Your 10 sessions are used.</b>
              <Link to="/profile" className="mt-2 block text-sm font-bold text-[#4F46E5]">Upgrade to keep making memories →</Link>
            </div> :

        <>
              <TemplateFilters category={category} onCategoryChange={setCategory} query={query} onQueryChange={setQuery} />
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filteredTemplates.map((t) =>
            <TemplateCard key={t.id} template={t} selected={selected?.id === t.id} locked={t.tier === "premium" && plan === "free"} onSelect={choose} />
            )}
                {filteredTemplates.length === 0 &&
            <p className="col-span-4 py-10 text-center text-sm text-[#8A8580]">No templates found.</p>
            }
              </div>
            </>
        }
          <StickyAction>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[#8A8580]">{selected ? `${selected.name} selected` : "Choose a design"}</span>
              <button disabled={!selected || used >= 10} onClick={() => setStep(2)} className="rounded-full bg-[#DC3522] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B82E1F] disabled:bg-[#E8E2D8] disabled:text-[#8A8580]">Continue</button>
            </div>
          </StickyAction>
        </>
      }

      {/* STEP 2 — Mode */}
      {step === 2 &&
      <>
          <h1 className="font-heading text-2xl font-extrabold text-[#2D2D2D]">How would you like to add your photos?</h1>
          <div className="mt-7 grid grid-cols-2 gap-4">
            <button onClick={() => {setMode("camera");setStep(3);}} className="flex flex-col items-center gap-3 rounded-[18px] border border-[#E8E2D8] bg-white p-8 text-center transition hover:border-[#4F46E5] hover:bg-[#EEF2FF]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF]"><Camera size={22} className="text-[#4F46E5]" /></div>
              <div><b className="block text-sm text-[#2D2D2D]">Take Photos</b><small className="text-[#8A8580]">Use your camera</small></div>
            </button>
            <button onClick={() => {setMode("upload");setStep(3);}} className="flex flex-col items-center gap-3 rounded-[18px] border border-[#E8E2D8] bg-white p-8 text-center transition hover:border-[#4F46E5] hover:bg-[#EEF2FF]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF]"><ImageUp size={22} className="text-[#4F46E5]" /></div>
              <div><b className="block text-sm text-[#2D2D2D]">Upload Photos</b><small className="text-[#8A8580]">Choose from gallery</small></div>
            </button>
          </div>
        </>
      }

      {/* STEP 3 — Capture */}
      {step === 3 &&
      <>
          <h1 className="mb-5 font-heading text-2xl font-extrabold text-[#2D2D2D]">{mode === "camera" ? "Ready when you are" : "Pick three photos"}</h1>
          {mode === "camera" ?
        <CameraCapture ref={captureRef} selected={selected} photos={photos} onPhotosChange={setPhotos} filter={filter} onFilterChange={setFilter} /> :

        <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_170px]">
                <div className="rounded-2xl border border-[#E8E2D8] bg-white p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8A8580]">Live Preview</p>
                  <button
                type="button"
                onClick={() => {if (photos.length < 3) fileInput.current.click();}}
                className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C7D2FE] bg-[#EEF2FF] py-12 text-center transition hover:border-[#4F46E5]">
                
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#4F46E5]"><ImageUp size={24} /></span>
                    <span className="mt-4 block font-bold text-[#2D2D2D]">Tap to choose a photo</span>
                    <span className="mt-1 block text-sm text-[#8A8580]">or drag and drop here</span>
                    <span className="mt-3 block text-xs font-bold text-[#4F46E5]">{photos.length} / 3 uploaded</span>
                  </button>
                  <input ref={fileInput} className="hidden" type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} />
                  <div className="mt-4 flex gap-2">
                    {[0, 1, 2].map((i) =>
                <div key={i} className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${i < photos.length ? "border-[#4F46E5]" : "border-dashed border-[#E8E2D8]"} bg-[#F5F0EA]`}>
                        {photos[i] &&
                  <>
                            <img src={photos[i]} alt="" className="h-full w-full object-cover" style={{ filter: uploadFilterCss }} />
                            <button onClick={() => removePhoto(i)} className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[10px] font-bold text-white">×</button>
                          </>
                  }
                      </div>
                )}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#E8E2D8] bg-white p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8A8580]">Your Strip</p>
                  <StripPreview template={selected} photos={photos} imgFilter={uploadFilterCss} />
                </div>
              </div>
              <FilterCard filter={filter} onFilterChange={setFilter} />
            </div>
        }
          <StickyAction>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[#5C5953]">
                {mode === "camera" ?
              photos.length < 3 ? <>Ready to start — take <span className="font-bold text-[#4F46E5]">3 photos</span></> : "All 3 photos captured!" :
              photos.length < 3 ? <>Upload <span className="font-bold text-[#4F46E5]">3 photos</span> from your device</> : "All 3 photos ready!"}
              </span>
              {mode === "camera" ?
            photos.length < 3 ?
            <button disabled={saving} onClick={() => captureRef.current?.capture()} className="flex items-center gap-2 rounded-full bg-[#DC3522] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B82E1F] disabled:bg-[#E8E2D8] disabled:text-[#8A8580]">
                    <Camera size={16} />Start
                  </button> :

            <button onClick={finish} disabled={saving} className="rounded-full bg-[#DC3522] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B82E1F] disabled:bg-[#E8E2D8]">
                    {saving ? "Making your strip…" : "Reveal my strip →"}
                  </button> :


            <button disabled={photos.length !== 3 || saving} onClick={finish} className="rounded-full bg-[#DC3522] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B82E1F] disabled:bg-[#E8E2D8] disabled:text-[#8A8580]">
                  {saving ? "Making your strip…" : "Continue"}
                </button>}
            </div>
          </StickyAction>
        </>
      }

      {/* STEP 4 — Download */}
      {step === 4 &&
      <div className="mx-auto max-w-sm text-center">
          <div className="mt-4 rounded-[22px] border border-[#E8E2D8] bg-white p-6">
            <StripPreview template={selected} photos={photos} className="mx-auto max-w-[180px]" />
            <p className="mt-5 font-heading text-xl font-extrabold text-[#2D2D2D]">Your strip is ready!</p>
            {plan === "free" && used >= 10 &&
          <p className="mt-2 text-sm text-[#8A8580]">Your oldest strip was replaced — download it to keep it.</p>
          }
            <div className="mt-6 space-y-3">
              <button onClick={download} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#DC3522] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#B82E1F]">
                <Download size={16} />Download Strip
              </button>
              <button onClick={() => {setPhotos([]);setRawFiles([]);setStep(3);}} className="flex w-full items-center justify-center gap-2 rounded-full border border-[#4F46E5] px-5 py-3 text-sm font-bold text-[#4F46E5] transition hover:bg-[#EEF2FF]">
                <RotateCcw size={14} />Retake Photos
              </button>
              <button onClick={resetAll} className="block w-full text-sm font-bold text-[#4F46E5]">Start over with a new design →</button>
            </div>
          </div>
        </div>
      }
    </div>);

}