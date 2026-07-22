import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowLeft, Bell, Camera, Flower2, Home, Images, Printer, UserRound } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useBoothWizard } from "@/components/booth/BoothWizardContext";
import BoothStepper from "@/components/booth/BoothStepper";

const items = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/booth", label: "New Booth", icon: Camera },
  { to: "/my-booths", label: "My Booths", icon: Images },
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
    <div className="min-h-screen bg-[#F9F7F2] text-[#2D2D2D] pb-20 md:pb-0 md:pl-60">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-60 md:flex-col md:border-r md:border-[#E8E2D8] md:bg-white md:p-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-heading text-2xl font-extrabold tracking-tight">
          <Flower2 size={23} strokeWidth={1.7} className="text-[#DC3522]" />Vendi
        </Link>
        <nav className="mt-12 space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
                location.pathname === to ? "bg-[#FDE8E4] text-[#DC3522]" : "text-[#5C5953] hover:bg-[#F5F0EA]"
              }`}
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center border-b border-[#E8E2D8] bg-[#F9F7F2]/95 px-4 backdrop-blur md:px-10">
        {isBooth ? (
          <div className="flex w-full items-center">
            <div className="flex-1">
              {step > 1 && (
                <button onClick={goBack} className="flex items-center gap-1.5 text-sm font-bold text-[#2D2D2D] hover:text-[#DC3522]">
                  <ArrowLeft size={16} />Back
                </button>
              )}
            </div>
            <div className="flex flex-1 justify-center">
              <BoothStepper step={step} />
            </div>
            <div className="flex-1" />
          </div>
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

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-10 md:py-10">
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