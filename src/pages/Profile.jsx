import React, { useRef, useState } from "react";
import { Camera, Crown, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import UserAvatar from "@/components/UserAvatar";

export default function Profile() {
  const { user } = useAuth();
  const plan = user?.plan || "free";
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  const pickAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ avatar_url: file_url });
      window.location.reload();
    } catch (err) {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-3xl font-extrabold">Profile</h1>
      <section className="mt-7 flex items-center gap-5 rounded-[18px] border border-[#D8D9DC] bg-white p-5">
        <UserAvatar user={user} size="lg" />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8B8D93]">Account</p>
          <p className="mt-2 truncate font-heading text-xl font-extrabold text-[#2D2D2D]">
            {user?.full_name || "Your account"}
          </p>
          <p className="truncate text-sm text-[#8B8D93]">{user?.email}</p>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-full border border-[#4F46E5] px-3 py-1.5 text-xs font-bold text-[#4F46E5] transition hover:bg-[#EEF2FF] disabled:opacity-60"
            >
              <Camera size={13} />
              {uploading ? "Saving…" : "Change photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
          </div>
        </div>
      </section>
      <section className="mt-4 rounded-[18px] bg-[#15161A] p-6 text-white">
        <Crown size={22} className="text-[#C7D2FE]" />
        <p className="mt-6 text-sm text-[#D8D9DC]">Current plan</p>
        <h2 className="font-heading text-2xl font-extrabold capitalize">{plan}</h2>
        {plan === "free" ? (
          <>
            <p className="mt-2 text-sm text-[#D8D9DC]">Unlimited sessions, every template, one full year of saved strips.</p>
            <p className="mt-5 text-xs text-[#C7D2FE]">Premium checkout will be available with Stripe.</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-[#D8D9DC]">
            Your next renewal is{" "}
            {user?.plan_expires_at ? new Date(user.plan_expires_at).toLocaleDateString() : "coming up"}.
          </p>
        )}
      </section>
      <button onClick={() => base44.auth.logout("/login")} className="mt-7 flex items-center gap-2 text-sm font-bold text-[#55575E]">
        <LogOut size={17} />Log out
      </button>
    </div>
  );
}