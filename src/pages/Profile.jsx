import React, { useRef, useState } from "react";
import { Camera, Crown, LogOut, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import UserAvatar from "@/components/UserAvatar";
import PolkaDots from "@/components/PolkaDots";
import UpgradeModal from "@/components/upgrade/UpgradeModal";
import { isLifetime, LIFETIME_PRICE, planLabel } from "@/lib/plans";
import LegalLinks from "@/components/profile/LegalLinks";
import ContactSuggestForm from "@/components/profile/ContactSuggestForm";
import VendiLogo from "@/components/VendiLogo";

export default function Profile() {
  const { user } = useAuth();
  const plan = user?.plan || "free";
  const lifetime = isLifetime(user);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  const pickAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ avatar_url: file_url, avatar_source: "custom" });
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
          <p className="mt-2 break-words font-heading text-xl font-extrabold text-[#1e1b4b]">
            {user?.full_name || "Your account"}
          </p>
          <p className="break-all text-sm text-[#8B8D93]">{user?.email}</p>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-full border border-[#228be6] px-3 py-1.5 text-xs font-bold text-[#228be6] transition hover:bg-[#e7f5ff] disabled:opacity-60">
              
              <Camera size={13} />
              {uploading ? "Saving…" : "Change photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
          </div>
        </div>
      </section>
      <section className="relative mt-4 overflow-hidden rounded-[18px] bg-[#eaf2fd] p-6 text-[#1e1b4b]">
        <PolkaDots />
        <VendiLogo size={36} color="#f59f00" />
        <p className="mt-6 text-sm text-[#475569]">Status</p>
        <h2 className="font-heading text-2xl font-extrabold">{lifetime ? "Lifetime Pass Owner 🌼" : planLabel(user)}</h2>
        {lifetime ?
        <p className="mt-2 text-sm text-[#475569]">Unlimited booth sessions, every artist-designed collection, and unlimited saved strips — for life.</p> :

        <>
            <p className="mt-2 text-sm text-[#475569]">10 booth sessions per day and up to 10 saved strips. Upgrade anytime.</p>
            <button onClick={() => setUpgradeOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#5080da] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#3a6cbf]">Get Lifetime Pass</button>
          </>
        }
      </section>
      <ContactSuggestForm />
      <LegalLinks />
      {user?.email === "alvendherfrancisco01@gmail.com" &&
      <Link to="/admin" className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#3a6cbf] px-4 py-2 text-sm font-bold text-[#3a6cbf] transition hover:bg-[#eaf2fd]">
          <Shield size={15} /> Admin dashboard
        </Link>
      }
      <button onClick={() => base44.auth.logout("/login")} className="mt-7 flex items-center gap-2 text-sm font-bold text-[#55575E]">
        <LogOut size={17} />Log out
      </button>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>);

}