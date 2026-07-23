import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Flower2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import UserAvatar from "@/components/UserAvatar";
import NotificationsPopover from "@/components/NotificationsPopover";

const items = [
  { to: "/dashboard", label: "Home", outline: "home-outline", fill: "home" },
  { to: "/booth", label: "Capture", outline: "camera-outline", fill: "camera" },
  { to: "/my-booths", label: "Strips", outline: "albums-outline", fill: "albums" },
  { to: "/print-shop", label: "Print", outline: "print-outline", fill: "print" },
];

function NavIcon({ outline, fill, active, size }) {
  if (active) return <ion-icon name={fill} style={{ fontSize: size }} />;
  return (
    <>
      <ion-icon name={outline} className="block group-hover:hidden" style={{ fontSize: size }} />
      <ion-icon name={fill} className="hidden group-hover:block" style={{ fontSize: size }} />
    </>
  );
}

export default function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const loadNotifs = async () => {
    if (!user) return;
    const list = await base44.entities.Notification.filter({ user_id: user.id }, "-created_at", 50);
    setNotifs(list);
    setUnread(list.filter((n) => !n.read).length);
  };
  useEffect(() => {
    loadNotifs();
    const off = base44.entities.Notification.subscribe(loadNotifs);
    return off;
  }, [user?.id]);

  const toggleRead = async (item) => {
    await base44.entities.Notification.update(item.id, { read: !item.read });
    loadNotifs();
  };
  const markAllRead = async () => {
    const unreadOnes = notifs.filter((n) => !n.read);
    if (unreadOnes.length) {
      await base44.entities.Notification.bulkUpdate(unreadOnes.map((n) => ({ id: n.id, read: true })));
      loadNotifs();
    }
  };

  const isActive = (to) => location.pathname === to;

  const navItemCls = (active) =>
    `group relative flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold transition ${
      active ? "text-[#DC3522]" : "text-[#5C5953] hover:text-[#4F46E5]"
    }`;
  const iconWrapCls = (active) =>
    `flex h-9 w-9 items-center justify-center rounded-xl transition ${
      active ? "bg-[#FDE8E4]" : "group-hover:bg-[#EEF2FF]"
    }`;

  return (
    <div className="min-h-screen bg-white text-[#2D2D2D] pb-20 md:pb-0 md:pl-20">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-20 md:flex-col md:items-center md:border-r md:border-[#E8E2D8] md:bg-[#F5F0EA] md:py-5">
        <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DC3522] text-white">
          <Flower2 size={20} strokeWidth={1.7} />
        </Link>
        <nav className="mt-9 flex flex-1 flex-col items-center gap-1">
          {items.map(({ to, label, outline, fill }) => {
            const active = isActive(to);
            return (
              <Link key={to} to={to} className={navItemCls(active)}>
                <span className={iconWrapCls(active)}>
                  <NavIcon outline={outline} fill={fill} active={active} size={20} />
                </span>
                {label}
              </Link>
            );
          })}
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className={`group relative flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 transition ${
              notifOpen ? "text-[#DC3522]" : "text-[#5C5953] hover:text-[#4F46E5]"
            }`}
          >
            <span
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition ${
                notifOpen ? "bg-[#FDE8E4]" : "group-hover:bg-[#EEF2FF]"
              }`}
            >
              <NavIcon outline="notifications-outline" fill="notifications" active={notifOpen} size={20} />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC3522] px-1 text-[9px] font-bold text-white ring-2 ring-[#F5F0EA]">
                  {unread}
                </span>
              )}
            </span>
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#1A1A1A] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
              Notifications
            </span>
          </button>
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
        {items.map(({ to, label, outline, fill }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-1 py-1 text-[9px] font-bold ${
                active ? "text-[#DC3522]" : "text-[#8A8580]"
              }`}
            >
              <NavIcon outline={outline} fill={fill} active={active} size={18} />
              {label}
            </Link>
          );
        })}
        <button
          onClick={() => setNotifOpen(true)}
          className={`relative flex flex-1 flex-col items-center gap-1 py-1 text-[9px] font-bold ${
            notifOpen ? "text-[#DC3522]" : "text-[#8A8580]"
          }`}
        >
          <NavIcon outline="notifications-outline" fill="notifications" active={notifOpen} size={18} />
          {unread > 0 && (
            <span className="absolute right-1 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#DC3522] px-1 text-[8px] font-bold text-white">
              {unread}
            </span>
          )}
          Alerts
        </button>
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

      <NotificationsPopover
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifs={notifs}
        onToggleRead={toggleRead}
        onMarkAll={markAllRead}
        user={user}
      />
    </div>
  );
}