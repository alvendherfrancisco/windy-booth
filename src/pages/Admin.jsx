import React, { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { LayoutDashboard, Users as UsersIcon, Images, ArrowLeft, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminStrips from "@/components/admin/AdminStrips";

// Hard-gated by exact email — no role flag, no link in the main nav.
const ADMIN_EMAIL = "alvendhrfrancisco01@gmail.com";

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: UsersIcon },
  { key: "strips", label: "Strips", icon: Images },
];

export default function Admin() {
  const { user } = useAuth();
  const [section, setSection] = useState("overview");
  const [users, setUsers] = useState([]);
  const [strips, setStrips] = useState([]);
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const [u, s, t] = await Promise.all([
        base44.entities.User.list("-created_date", 1000),
        base44.entities.Strip.list("-created_at", 1000),
        base44.entities.Template.list(),
      ]);
      setUsers(u);
      setStrips(s);
      const tm = {};
      t.forEach((x) => (tm[x.id] = x));
      setTemplates(tm);
      setError("");
    } catch (e) {
      setError("Unable to load admin data. Your account needs admin access to read users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Render-time access control — placed AFTER all hooks.
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      </div>
    );
  }
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-[#F7F5F1] text-[#2D2D2D]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E8E2D8] bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-heading text-lg font-extrabold text-[#e64980]">Vendi Admin</span>
          <span className="hidden text-xs text-[#8A8580] sm:inline">· Internal dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E2D8] px-3 py-1.5 text-xs font-bold text-[#2D2D2D] hover:bg-[#F5F0EA]">
            <ArrowLeft size={14} /> Back to app
          </Link>
          <button onClick={() => base44.auth.logout("/login")} className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E2D8] px-3 py-1.5 text-xs font-bold text-[#2D2D2D] hover:bg-[#F5F0EA]">
            <LogOut size={14} /> Log out
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4 md:flex-row">
        <nav className="md:w-52 md:shrink-0">
          <div className="flex gap-2 md:flex-col">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = section === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => setSection(n.key)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold md:flex-none md:justify-start ${active ? "bg-[#e64980] text-white" : "border border-[#E8E2D8] bg-white text-[#2D2D2D] hover:bg-[#F5F0EA]"}`}
                >
                  <Icon size={16} /> {n.label}
                </button>
              );
            })}
          </div>
        </nav>

        <main className="min-w-0 flex-1">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8E2D8] border-t-[#e64980]" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-[#E8E2D8] bg-white p-6 text-sm text-[#8A8580]">{error}</div>
          ) : section === "overview" ? (
            <AdminOverview users={users} strips={strips} />
          ) : section === "users" ? (
            <AdminUsers users={users} strips={strips} templates={templates} meId={user.id} onChanged={refresh} />
          ) : (
            <AdminStrips strips={strips} users={users} templates={templates} onChanged={refresh} />
          )}
        </main>
      </div>
    </div>
  );
}