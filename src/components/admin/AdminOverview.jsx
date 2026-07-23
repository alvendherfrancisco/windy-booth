import React, { useMemo } from "react";
import { Users, UserPlus, Image as ImageIcon, Activity, Crown, Sparkles } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const DAY = 86400000;
const fmt = (n) => n.toLocaleString();

export default function AdminOverview({ users, strips }) {
  const stats = useMemo(() => {
    const now = Date.now();
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const t = startToday.getTime();
    const w = now - 7 * DAY;
    const m = now - 30 * DAY;
    const uCreated = (from) => users.filter((u) => new Date(u.created_date).getTime() >= from).length;
    const sCreated = (from) => strips.filter((s) => new Date(s.created_at || s.created_date).getTime() >= from).length;
    const activeIds = (from) => {
      const ids = new Set();
      strips.forEach((s) => { if (new Date(s.created_at).getTime() >= from) ids.add(s.user_id); });
      users.forEach((u) => { if (new Date(u.created_date).getTime() >= from) ids.add(u.id); });
      return ids.size;
    };
    return {
      totalUsers: users.length,
      newToday: uCreated(t),
      newWeek: uCreated(w),
      newMonth: uCreated(m),
      totalStrips: strips.length,
      stripsWeek: sCreated(w),
      active7: activeIds(w),
      active30: activeIds(m),
      free: users.filter((u) => (u.plan || "free") === "free").length,
      premium: users.filter((u) => u.plan === "premium").length,
    };
  }, [users, strips]);

  const chartData = useMemo(() => {
    const now = Date.now();
    const out = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * DAY);
      const ds = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const de = ds + DAY;
      out.push({
        date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        signups: users.filter((u) => { const v = new Date(u.created_date).getTime(); return v >= ds && v < de; }).length,
        strips: strips.filter((s) => { const v = new Date(s.created_at || s.created_date).getTime(); return v >= ds && v < de; }).length,
      });
    }
    return out;
  }, [users, strips]);

  const cards = [
    { label: "Total users", value: stats.totalUsers, sub: `+${stats.newMonth} this month`, icon: Users, tone: "bg-[#e7f5ff] text-[#228be6]" },
    { label: "New signups", value: stats.newWeek, sub: `${stats.newToday} today · ${stats.newMonth} this month`, icon: UserPlus, tone: "bg-[#ebfbee] text-[#37b24d]" },
    { label: "Strips created", value: stats.totalStrips, sub: `${stats.stripsWeek} this week`, icon: ImageIcon, tone: "bg-[#fff0f6] text-[#e64980]" },
    { label: "Active users", value: stats.active7, sub: `${stats.active30} in last 30 days`, icon: Activity, tone: "bg-[#fff3bf] text-[#f59f00]" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl border border-[#E8E2D8] bg-white p-4">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full ${c.tone}`}><Icon size={18} /></div>
              <p className="font-heading text-2xl font-extrabold">{fmt(c.value)}</p>
              <p className="text-xs font-bold text-[#5C5953]">{c.label}</p>
              <p className="mt-1 text-xs text-[#8A8580]">{c.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E8E2D8] bg-white p-4">
          <h3 className="font-heading text-base font-extrabold">Signups over time</h3>
          <p className="mb-3 text-xs text-[#8A8580]">Last 30 days</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE2" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} stroke="#8A8580" />
                <YAxis allowDecimals tick={{ fontSize: 10 }} stroke="#8A8580" />
                <Tooltip />
                <Line type="monotone" dataKey="signups" stroke="#e64980" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E8E2D8] bg-white p-4">
          <h3 className="font-heading text-base font-extrabold">Strips created over time</h3>
          <p className="mb-3 text-xs text-[#8A8580]">Last 30 days</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE2" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} stroke="#8A8580" />
                <YAxis allowDecimals tick={{ fontSize: 10 }} stroke="#8A8580" />
                <Tooltip />
                <Bar dataKey="strips" fill="#228be6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#E8E2D8] bg-white p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#fff0f6] text-[#e64980]"><Crown size={16} /></div>
          <p className="font-heading text-xl font-extrabold">{fmt(stats.premium)}</p>
          <p className="text-xs font-bold text-[#5C5953]">Premium</p>
        </div>
        <div className="rounded-2xl border border-[#E8E2D8] bg-white p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#e7f5ff] text-[#228be6]"><Sparkles size={16} /></div>
          <p className="font-heading text-xl font-extrabold">{fmt(stats.free)}</p>
          <p className="text-xs font-bold text-[#5C5953]">Free</p>
        </div>
      </div>
    </div>
  );
}