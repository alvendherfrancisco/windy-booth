import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowLeft, Bell, Camera, Flower2, Home, Images, Printer, UserRound } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useBoothWizard } from "@/components/booth/BoothWizardContext";
import UserAvatar from "@/components/UserAvatar";

const items = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/booth", label: "Capture", icon: Camera },
  { to: "/my-booths", label: "Strips", icon: Images },
  { to: "/print-shop", label: "Print", icon: Printer },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export default function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const { step, goBack } = useBoothWizard();
  const [unread, setUnread] = useState(0);
  const isBooth = location.pathname === "/booth";

  const loadUnread = async () => {
    if (user) setUnread((await base44.entities.Notification.filter({ user_id: user.id, read: false })).length);
  };
  useEffect(() => {
    loadUnread();
    const off = base44.entities.Notification.subscribe(loadUnread);
    return off;
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#2D2D2D] pb-20 md:pb-0 md:pl-20">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-20 md:flex-col md:items-center md:border-r md:border-[#E8E2D8] md:bg-white md:py-5">
        <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DC3522] text-white">
          <Flower2 size={20} strokeWidth={1.7} />
        </Link>
        <nav className="mt-9 flex flex-1 flex-col items-center gap-1">
          {items.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold transition ${
                  active ? "text-[#DC3522]" : "text-[#5C5953] hover:text-[#4F46E5]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                    active ? "bg-[#FDE8E4]" : "hover:bg-[#EEF2FF]"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-2 flex w-full flex-col items-center gap-1 px-1">
          <UserAvatar user={user} size="sm" />
          <p className="max-w-[72px] truncate text-center text-[10px] font-bold text-[#2D2D2D]">
            {user?.full_name || user?.email || "You"}
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center border-b border-[#E8E2D8] bg-[#F9F7F2] px-4 md:px-8">
        {isBooth ? (
          step > 1 && (
            <button onClick={goBack} className="flex items-center gap-1.5 text-sm font-bold text-[#2D2D2D] hover:text-[#4F46E5]">
              <ArrowLeft size={16} />Back
            </button>
          )
        ) : (
          <Link to="/notifications" className="relative ml-auto rounded-full p-2 hover:bg-[#F5F0EA]">
            <Bell size={21} />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC3522] px-1 text-[9px] font-bold text-white">
                {unread}
              </span>
            )}
          </Link>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[#E8E2D8] bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-bold ${
              location.pathname === to ? "text-[#DC3522]" : "text-[#8A8580]"
            }`}
          >
            <Icon size={19} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}