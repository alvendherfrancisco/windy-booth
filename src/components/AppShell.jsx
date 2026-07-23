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
{ to: "/print-shop", label: "Print", outline: "print-outline", fill: "print" }];


function SideNavItem({ to, label, outline, fill, active, size, labelClass }) {
  const [hover, setHover] = useState(false);
  const on = active || hover;
  return (
    <Link
      to={to}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 font-bold transition ${labelClass} ${
      active ? "text-[#f06595]" : "text-[#5C5953] hover:text-[#f06595]"}`
      }>
      
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
        active ? "bg-[#ffdeeb]" : hover ? "bg-[#ffdeeb]" : ""}`
        }>
        
        <ion-icon name={on ? fill : outline} style={{ fontSize: size }} />
      </span>
      {label}
    </Link>);

}

function NotifButton({ open, unread, onClick, size }) {
  const [hover, setHover] = useState(false);
  const on = open || hover;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`group relative flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 font-bold transition ${
      open ? "text-[#f06595]" : "text-[#5C5953] hover:text-[#f06595]"}`
      }>
      
      <span
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
        open ? "bg-[#ffdeeb]" : hover ? "bg-[#ffdeeb]" : ""}`
        }>
        
        <ion-icon name={on ? "notifications" : "notifications-outline"} style={{ fontSize: size }} />
        {unread > 0 &&
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f06595] px-1 text-[9px] font-bold text-white ring-2 ring-[#F5F0EA]">
            {unread}
          </span>
        }
      </span>
      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#1A1A1A] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        Notifications
      </span>
    </button>);

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

  return (
    <div className="min-h-screen bg-[#FFFBF3] text-[#2D2D2D] pb-20 md:pb-0 md:pl-20">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-20 md:flex-col md:items-center md:border-r md:border-[#E8E2D8] md:bg-[#F5F0EA] md:py-5">
        <Link to="/dashboard" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f06595] text-white hidden">
          <Flower2 size={22} strokeWidth={1.7} className="shrink-0" />
        </Link>
        <nav className="notifications-scroll mt-8 flex min-h-0 flex-1 flex-col items-center gap-1.5 overflow-y-auto">
          {items.map(({ to, label, outline, fill }) =>
          <SideNavItem
            key={to}
            to={to}
            label={label}
            outline={outline}
            fill={fill}
            active={isActive(to)}
            size={26}
            labelClass="text-[13px]" />

          )}
          <NotifButton open={notifOpen} unread={unread} onClick={() => setNotifOpen((v) => !v)} size={26} />
        </nav>
        <Link
          to="/profile"
          title={user?.full_name || user?.email || "Profile"}
          className={`mt-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition ${
          isActive("/profile") ? "bg-[#ffdeeb]" : "hover:bg-[#ffdeeb]"}`
          }>
          
          <UserAvatar user={user} size="md" />
        </Link>
      </aside>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-[#E8E2D8] bg-white px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
        {items.map(({ to, label, outline, fill }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-bold ${
              active ? "text-[#f06595]" : "text-[#8A8580]"}`
              }>
              
              <ion-icon name={active ? fill : outline} style={{ fontSize: 22 }} />
              {label}
            </Link>);

        })}
        <button
          onClick={() => setNotifOpen(true)}
          className={`relative flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-bold ${
          notifOpen ? "text-[#f06595]" : "text-[#8A8580]"}`
          }>
          
          <ion-icon name={notifOpen ? "notifications" : "notifications-outline"} style={{ fontSize: 22 }} />
          {unread > 0 &&
          <span className="absolute right-1 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#f06595] px-1 text-[8px] font-bold text-white">
              {unread}
            </span>
          }
          Alerts
        </button>
        <Link
          to="/profile"
          className={`flex w-10 flex-col items-center gap-1 py-1 ${
          isActive("/profile") ? "text-[#f06595]" : "text-[#8A8580]"}`
          }>
          
          <UserAvatar user={user} size="sm" className="!h-7 !w-7" />
          <span className="text-[10px] font-bold">You</span>
        </Link>
      </nav>

      <NotificationsPopover
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifs={notifs}
        onToggleRead={toggleRead}
        onMarkAll={markAllRead}
        user={user} />
      
    </div>);

}