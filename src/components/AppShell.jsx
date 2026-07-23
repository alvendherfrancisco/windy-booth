import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Bell, Camera, Flower2, Home, Images, Printer } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import UserAvatar from "@/components/UserAvatar";

const items = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/booth", label: "Capture", icon: Camera },
  { to: "/my-booths", label: "Strips", icon: Images },
  { to: "/print-shop", label: "Print", icon: Printer },
];

export default function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  const loadUnread = async () => {
    if (user) setUnread((await base44.entities.Notification.filter({ user_id: user.id, read: false })).length);
  };
  useEffect(() => {
    loadUnread();
    const off = base44.entities.Notification.subscribe(loadUnread);
    return off;
  }, [user?.id]);

  const isActive = (to) => location.pathname === to;
  const notifActive = isActive("/notifications");

  const navItemCls = (active) =>
    `flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold transition ${
      active ? "text-[#DC3522]" : "text-[#5C5953] hover:text-[#4F46E5]"
    }`;
  const iconWrapCls = (active) =>
    `relative flex h-9 w-9 items-center justify-center rounded-xl transition ${
      active ? "bg-[#FDE8E4]" : "hover:bg-[#EEF2FF]"
    }`;

  const mobileItems = [...items, { to: "/notifications", label: "Alerts", icon: Bell }];

  return (
    <div className="min-h-screen bg-white text-[#2D2D2D] pb-20 md:pb-0 md:pl-20">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-20 md:flex-col md:items-center md:border-r md:border-[#E8E2D8] md:bg-[#F5F0EA] md:py-5">
        <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DC3522] text-white">
          <Flower2 size={20} strokeWidth={1.7} />
        </Link>
        <nav className="mt-9 flex flex-1 flex-col items-center gap-1">
          {items.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link key={to} to={to} className={navItemCls(active)}>
                <span className={iconWrapCls(active)}>
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                </span>
                {label}
              </Link>
            );
          })}
          <Link to="/notifications" className={navItemCls(notifActive)}>
            <span className={iconWrapCls(notifActive)}>
              <Bell size={20} strokeWidth={notifActive ? 2.2 : 1.8} />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC3522] px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  {unread}
                </span>
              )}
            </span>
            Alerts
          </Link>
        </nav>
        <Link
          to="/profile"
          title={user?.full_name || user?.email || "Profile"}
          className={`mt-2 flex h-10 w-10 items-center justify-center rounded-full transition ${
            isActive("/profile") ? "bg-[#EEF2FF]" : "hover:bg-[#EEF2FF]"
          }`}
        >
          <UserAvatar user={user} size="sm" />
        </Link>
      </aside>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-[#E8E2D8] bg-white px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
        {mobileItems.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex flex-1 flex-col items-center gap-1 py-1 text-[9px] font-bold ${
                active ? "text-[#DC3522]" : "text-[#8A8580]"
              }`}
            >
              <Icon size={18} />
              {to === "/notifications" && unread > 0 && (
                <span className="absolute right-1 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#DC3522] px-1 text-[8px] font-bold text-white">
                  {unread}
                </span>
              )}
              {label}
            </Link>
          );
        })}
        <Link
          to="/profile"
          className={`flex w-10 flex-col items-center gap-1 py-1 ${
            isActive("/profile") ? "text-[#DC3522]" : "text-[#8A8580]"
          }`}
        >
          <UserAvatar user={user} size="sm" className="!h-7 !w-7" />
          <span className="text-[9px] font-bold">You</span>
        </Link>
      </nav>
    </div>
  );
}