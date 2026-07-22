import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Bell, Camera, Home, Images, Printer, UserRound } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const items = [{ to: "/dashboard", label: "Home", icon: Home }, { to: "/booth", label: "New Booth", icon: Camera }, { to: "/my-booths", label: "My Booths", icon: Images }, { to: "/print-shop", label: "Print", icon: Printer }, { to: "/profile", label: "Profile", icon: UserRound }];
export default function AppShell() {
  const { user } = useAuth(); const location = useLocation(); const [unread, setUnread] = useState(0);
  const loadUnread = async () => { if (user) setUnread((await base44.entities.Notification.filter({ user_id: user.id, read: false })).length); };
  useEffect(() => { loadUnread(); const off = base44.entities.Notification.subscribe(loadUnread); return off; }, [user?.id]);
  return <div className="min-h-screen bg-[#FAF9F6] text-[#15161A] pb-20 md:pb-0 md:pl-60">
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-60 md:flex-col md:border-r md:border-[#D8D9DC] md:bg-[#F1F0EC] md:p-6">
      <Link to="/dashboard" className="font-display text-3xl font-bold">Vendhee's<br />Booth</Link><nav className="mt-12 space-y-2">{items.map(({to,label,icon:Icon}) => <Link key={to} to={to} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${location.pathname === to ? "bg-[#15161A] text-white" : "text-[#55575E] hover:bg-white"}`}><Icon size={19}/>{label}</Link>)}</nav>
    </aside>
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#D8D9DC] bg-[#FAF9F6]/95 px-5 backdrop-blur md:px-10"><Link to="/dashboard" className="font-display text-2xl font-bold md:hidden">Vendhee's Booth</Link><span className="hidden text-sm text-[#8B8D93] md:block">Make a little memory.</span><Link to="/notifications" className="relative rounded-full p-2 hover:bg-[#EFF3F7]"><Bell size={21}/>{unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8AA3BE] px-1 text-[9px] font-bold text-white">{unread}</span>}</Link></header>
    <main className="mx-auto max-w-5xl px-4 py-6 md:px-10 md:py-10"><Outlet /></main>
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[#D8D9DC] bg-[#FAF9F6] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">{items.map(({to,label,icon:Icon}) => <Link key={to} to={to} className={`flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-bold ${location.pathname === to ? "text-[#3E5670]" : "text-[#8B8D93]"}`}><Icon size={19}/>{label}</Link>)}</nav>
  </div>;
}