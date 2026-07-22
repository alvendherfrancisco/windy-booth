import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Download, ImageUp, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import BoothStepper from "@/components/booth/BoothStepper";
import TemplateCard from "@/components/booth/TemplateCard";
import TemplateFilters from "@/components/booth/TemplateFilters";
import StripPreview from "@/components/booth/StripPreview";
import StickyAction from "@/components/booth/StickyAction";
import CameraCapture from "@/components/booth/CameraCapture";


export default function Booth() {
  const { user } = useAuth();
  const nav = useNavigate();
  const fileInput = useRef();
  const captureRef = useRef();

  const [templates, setTemplates] = useState([]);
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [filter, setFilter] = useState("none");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const plan = user?.plan || "free";
  const used = user?.sessions_used_this_month || 0;

  useEffect(() => { base44.entities.Template.filter({ active: true }).then(setTemplates); }, []);

  const filteredTemplates = templates.filter(t =>
    (category === "all" || t.category === category) &&
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  const choose = t => {
    if (t.tier === "premium" && plan === "free") return nav("/profile");
    setSelected(t);
  };

  const addFiles = async files => {
    const additions = [];
    for (const file of Array.from(files).slice(0, 3 - photos.length)) {
      const result = await base44.integrations.Core.UploadFile({ file });
      additions.push(result.file_url);
    }
    setPhotos(p => [...p, ...additions]);
  };

  const finish = async () => {
    if (photos.length !== 3 || !selected) return;
    setSaving(true);
    const now = new Date();
    const current = await base44.entities.Strip.filter({ user_id: user.id, saved: true }, "created_at");
    const expires = plan === "premium" ? new Date(Date.now() + 31536000000).toISOString() : null;
    const created = await base44.entities.Strip.create({
      user_id: user.id, template_id: selected.id, photo_urls: photos,
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
    setStep(4);
    setSaving(false);
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = photos[0];
    a.download = "vendi-strip";
    a.click();
  };

  const backBtn = step > 1 && step < 4 ? (
    <button onClick={() => setStep(step - 1)} className="flex items-center gap-1.5 text-sm font-bold text-[#55575E] hover:text-[#15161A]">
      <ArrowLeft size={16} />Back
    </button>
  ) : step === 4 ? (
    <Link to="/booth" className="flex items-center gap-1.5 text-sm font-bold text-[#55575E] hover:text-[#15161A]">
      <ArrowLeft size={16} />Retake
    </Link>
  ) : null;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back button in top bar area */}
      {backBtn && <div className="mb-4">{backBtn}</div>}

      <BoothStepper step={step} />

      {/* STEP 1 — Design */}
      {step === 1 && (
        <>
          <h1 className="font-heading text-3xl font-extrabold">Choose your design</h1>
          <p className="mt-1 text-sm text-[#8B8D93]">Every booth starts with a good frame.</p>
          {plan === "free" && used >= 10 ? (
            <div className="mt-7 rounded-[18px] bg-[#EFF3F7] p-5">
              <b>Your 10 sessions are used.</b>
              <Link to="/profile" className="mt-2 block text-sm font-bold text-[#3E5670]">Upgrade to keep making memories →</Link>
            </div>
          ) : (
            <>
              <TemplateFilters category={category} onCategoryChange={setCategory} query={query} onQueryChange={setQuery} />
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filteredTemplates.map(t => (
                  <TemplateCard key={t.id} template={t} selected={selected?.id === t.id} locked={t.tier === "premium" && plan === "free"} onSelect={choose} />
                ))}
                {filteredTemplates.length === 0 && (
                  <p className="col-span-4 py-10 text-center text-sm text-[#8B8D93]">No templates found.</p>
                )}
              </div>
            </>
          )}
          <StickyAction>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[#8B8D93]">{selected ? `${selected.name} selected` : "Choose a design"}</span>
              <button disabled={!selected || used >= 10} onClick={() => setStep(2)} className="rounded-full bg-[#15161A] px-5 py-3 text-sm font-bold text-white disabled:bg-[#D8D9DC]">
                Continue
              </button>
            </div>
          </StickyAction>
        </>
      )}

      {/* STEP 2 — Mode */}
      {step === 2 && (
        <>
          <h1 className="font-heading text-2xl font-extrabold">How would you like to add your photos?</h1>
          <div className="mt-7 grid grid-cols-2 gap-4">
            <button onClick={() => { setMode("camera"); setStep(3); }}
              className="flex flex-col items-center gap-3 rounded-[18px] border border-[#D8D9DC] bg-white p-8 text-center hover:border-[#8AA3BE] hover:bg-[#EFF3F7] transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF3F7]">
                <Camera size={22} className="text-[#3E5670]" />
              </div>
              <div>
                <b className="block text-sm">Take Photos</b>
                <small className="text-[#8B8D93]">Use your camera</small>
              </div>
            </button>
            <button onClick={() => { setMode("upload"); setStep(3); }}
              className="flex flex-col items-center gap-3 rounded-[18px] border border-[#D8D9DC] bg-white p-8 text-center hover:border-[#8AA3BE] hover:bg-[#EFF3F7] transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF3F7]">
                <ImageUp size={22} className="text-[#3E5670]" />
              </div>
              <div>
                <b className="block text-sm">Upload Photos</b>
                <small className="text-[#8B8D93]">Choose from gallery</small>
              </div>
            </button>
          </div>
        </>
      )}

      {/* STEP 3 — Capture */}
      {step === 3 && (
        <>
          <h1 className="font-heading text-2xl font-extrabold mb-5">
            {mode === "camera" ? "Ready when you are" : "Pick three photos"}
          </h1>

          {mode === "camera" ? (
            <CameraCapture
              ref={captureRef}
              selected={selected}
              photos={photos}
              onPhotosChange={setPhotos}
              filter={filter}
              onFilterChange={setFilter}
            />
          ) : (
            /* Upload mode */
            <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
              <div className="rounded-2xl border border-[#D8D9DC] bg-white p-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8B8D93]">Live Preview</p>
                {photos.length < 3 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#AEB0B5] bg-[#F5F6F8] py-12 text-center">
                    <ImageUp className="mx-auto text-[#3E5670]" size={28} />
                    <p className="mt-3 font-bold">{photos.length} of 3 photos added</p>
                    <button onClick={() => fileInput.current.click()} className="mt-4 rounded-full bg-[#15161A] px-5 py-3 text-sm font-bold text-white">
                      Choose photos
                    </button>
                    <input ref={fileInput} className="hidden" type="file" accept="image/*" multiple onChange={e => addFiles(e.target.files)} />
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#D8D9DC] bg-[#F5F6F8] p-6 text-center">
                    <p className="font-bold text-[#3E5670]">All 3 photos uploaded!</p>
                    <p className="mt-1 text-sm text-[#8B8D93]">3 / 3 uploaded</p>
                  </div>
                )}
                {/* Thumbnails */}
                <div className="mt-4 flex gap-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`h-14 w-14 overflow-hidden rounded-lg border-2 ${i < photos.length ? "border-[#8AA3BE]" : "border-dashed border-[#D8D9DC]"} bg-[#F5F6F8]`}>
                      {photos[i] && <img src={photos[i]} alt="" className="h-full w-full object-cover" />}
                    </div>
                  ))}
                </div>
                {/* Filter row */}
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold text-[#55575E]">Filter</p>
                  <div className="flex gap-2 flex-wrap">
                    {["none","bw","sepia","vintage","vivid","cool","warm"].map(f => (
                      <button key={f} onClick={() => setFilter(f)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${filter === f ? "bg-[#8AA3BE] text-white" : "bg-[#F5F6F8] text-[#55575E]"}`}>
                        {f === "bw" ? "B&W" : f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-[#D8D9DC] bg-white p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8B8D93]">✦ Your Strip</p>
                <StripPreview template={selected} photos={photos} />
              </div>
            </div>
          )}

          <StickyAction>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[#8B8D93]">
                {mode === "camera"
                  ? photos.length < 3 ? `Ready to start — take 3 photos` : "All 3 photos captured!"
                  : photos.length < 3 ? `${photos.length} / 3 photos added` : "All 3 photos ready!"}
              </span>
              {mode === "camera" ? (
                photos.length < 3 ? (
                  <button disabled={saving} onClick={() => captureRef.current?.capture()}
                    className="flex items-center gap-2 rounded-full bg-[#8AA3BE] px-5 py-3 text-sm font-bold text-white disabled:bg-[#D8D9DC]">
                    <Camera size={16} />Start
                  </button>
                ) : (
                  <button onClick={finish} disabled={saving}
                    className="rounded-full bg-[#15161A] px-5 py-3 text-sm font-bold text-white disabled:bg-[#D8D9DC]">
                    {saving ? "Making your strip…" : "Reveal my strip →"}
                  </button>
                )
              ) : (
                <button disabled={photos.length !== 3 || saving} onClick={finish}
                  className="rounded-full bg-[#15161A] px-5 py-4 text-sm font-bold text-white disabled:bg-[#D8D9DC]">
                  {saving ? "Making your strip…" : photos.length === 3 ? "Continue →" : "Add 3 photos to continue"}
                </button>
              )}
            </div>
          </StickyAction>
        </>
      )}

      {/* STEP 4 — Download */}
      {step === 4 && (
        <div className="mx-auto max-w-sm text-center">
          <div className="mt-4 rounded-[22px] border border-[#D8D9DC] bg-white p-6">
            <StripPreview template={selected} photos={photos} className="mx-auto max-w-[240px]" />
            <p className="mt-5 font-heading text-xl font-extrabold">Your strip is ready!</p>
            {plan === "free" && used >= 10 && (
              <p className="mt-2 text-sm text-[#8B8D93]">Your oldest strip was replaced — download it to keep it.</p>
            )}
            <div className="mt-6 space-y-3">
              <button onClick={download} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8AA3BE] px-5 py-4 text-sm font-bold text-white">
                <Download size={16} />Download Strip
              </button>
              <button onClick={() => { setPhotos([]); setStep(3); }} className="flex w-full items-center justify-center gap-2 rounded-full border border-[#D8D9DC] px-5 py-3 text-sm font-bold text-[#55575E]">
                <RotateCcw size={14} />Retake Photos
              </button>
              <Link to="/booth" className="block text-sm font-bold text-[#3E5670]">Start over with a new design →</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}