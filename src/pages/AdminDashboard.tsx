import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Building2, Wrench, CheckCircle, XCircle, Star, Trash2, Edit3,
  Search, Plus, TrendingUp, Store, Clock, LogOut, Bell, X, Save,
  AlertTriangle, Eye, MapPin, Phone, Mail, Globe, Shield,
} from "lucide-react";
import Logo from "@/components/Logo";

const API_URL = "/api/trpc";
const ADMIN_PASS = "Sindbad2024!Admin";

const statusNames: Record<string, { label: string; color: string }> = {
  active: { label: "نشط", color: "text-emerald-400" },
  pending: { label: "قيد المراجعة", color: "text-yellow-400" },
  suspended: { label: "موقوف", color: "text-red-400" },
  rejected: { label: "مرفوض", color: "text-gray-400" },
};

const skillCategories = [
  { value: "cooking", label: "طبخ" },
  { value: "driving", label: "سياقة" },
  { value: "photography", label: "تصوير" },
  { value: "painting", label: "دهان" },
  { value: "plumbing", label: "سباكة" },
  { value: "electrician", label: "كهرباء" },
  { value: "carpentry", label: "نجارة" },
  { value: "cleaning", label: "تنظيف" },
  { value: "it", label: "تقنية" },
  { value: "translation", label: "ترجمة" },
  { value: "accounting", label: "محاسبة" },
  { value: "medical", label: "طب/تمريض" },
  { value: "education", label: "تعليم" },
  { value: "construction", label: "بناء" },
  { value: "other", label: "أخرى" },
];

const merchantCategories = [
  { value: "restaurant", label: "مطعم" },
  { value: "supermarket", label: "سوبرماركت" },
  { value: "sweets", label: "حلويات" },
  { value: "barber", label: "صالون حلاقة" },
  { value: "butcher", label: "جزار" },
  { value: "bakery", label: "مخبز" },
  { value: "cafe", label: "مقهى" },
  { value: "clothing", label: "ملابس" },
  { value: "pharmacy", label: "صيدلية" },
  { value: "mosque", label: "مسجد" },
  { value: "other", label: "أخرى" },
];

// ─── NOTIFICATION SYSTEM ───
interface Notification {
  id: string;
  type: "merchant" | "skill" | "system";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("admin-notifications");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("admin-notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (n: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newN: Notification = {
      ...n,
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newN, ...prev].slice(0, 100));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAll = () => setNotifications([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, addNotification, markRead, clearAll, unreadCount };
}

// ═══════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ═══════════════════════════════════════════
export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"merchants" | "skills" | "notifications">("merchants");
  const [subTab, setSubTab] = useState<"list" | "pending" | "add">("list");

  // Notifications
  const { notifications, addNotification, markRead, clearAll, unreadCount } = useNotifications();

  // Merchants state
  const [merchants, setMerchants] = useState<any[]>([]);
  const [pendingMerchants, setPendingMerchants] = useState<any[]>([]);
  const [mStats, setMStats] = useState({ total: 0, active: 0, pending: 0, featured: 0 });
  const [mSearch, setMSearch] = useState("");
  const [editingMerchant, setEditingMerchant] = useState<any>(null);
  const [showNotif, setShowNotif] = useState(false);

  // Skills state
  const [skills, setSkills] = useState<any[]>([]);
  const [pendingSkills, setPendingSkills] = useState<any[]>([]);
  const [sStats, setSStats] = useState({ total: 0, active: 0, pending: 0, featured: 0 });
  const [sSearch, setSSearch] = useState("");
  const [editingSkill, setEditingSkill] = useState<any>(null);

  // Form states
  const [mForm, setMForm] = useState({ businessName: "", businessNameAr: "", category: "restaurant", description: "", city: "Paris", country: "France", address: "", phone: "", email: "", website: "", isFeatured: false });
  const [sForm, setSForm] = useState({ fullName: "", fullNameAr: "", serviceType: "", serviceTypeAr: "", category: "cooking", description: "", city: "Paris", country: "France", phone: "", email: "", yearsOfExperience: 0, isFeatured: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ─── Load Data ───
  useEffect(() => {
    if (!isAuthenticated) return;
    loadMerchants();
    loadSkills();
  }, [isAuthenticated]);

  async function loadMerchants() {
    try {
      const [statsRes, listRes, pendingRes] = await Promise.all([
        fetch(`${API_URL}/merchant.adminStats`),
        fetch(`${API_URL}/merchant.adminList?input=${encodeURIComponent(JSON.stringify({ json: { limit: 100 } }))}`),
        fetch(`${API_URL}/pendingMerchant.list?input=${encodeURIComponent(JSON.stringify({ json: { status: "pending", limit: 50 } }))}`),
      ]);
      if (statsRes.ok) setMStats((await statsRes.json())?.result?.data?.json || { total: 0, active: 0, pending: 0, featured: 0 });
      if (listRes.ok) setMerchants((await listRes.json())?.result?.data?.json?.items || []);
      if (pendingRes.ok) setPendingMerchants((await pendingRes.json())?.result?.data?.json || []);
    } catch (e) { console.error("loadMerchants:", e); }
  }

  async function loadSkills() {
    try {
      const [statsRes, listRes] = await Promise.all([
        fetch(`${API_URL}/skills.adminStats`),
        fetch(`${API_URL}/skills.adminList?input=${encodeURIComponent(JSON.stringify({ json: { limit: 100 } }))}`),
      ]);
      if (statsRes.ok) setSStats((await statsRes.json())?.result?.data?.json || { total: 0, active: 0, pending: 0, featured: 0 });
      if (listRes.ok) {
        const allSkills = (await listRes.json())?.result?.data?.json || [];
        setSkills(allSkills.filter((s: any) => s.status === "active"));
        setPendingSkills(allSkills.filter((s: any) => s.status === "pending"));
      }
    } catch (e) { console.error("loadSkills:", e); }
  }

  // ─── Merchant Actions ───
  async function createMerchant(e: React.FormEvent) {
    e.preventDefault();
    if (!mForm.businessName || !mForm.businessNameAr) { setError("اسم المتجر مطلوب"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/merchant.create`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { ...mForm } }),
      });
      const data = await res.json();
      if (data?.result?.data?.json?.id) {
        setSuccess("تم إضافة المتجر بنجاح!");
        addNotification({ type: "merchant", title: "متجر جديد مضاف", message: `أضفت ${mForm.businessNameAr} يدوياً` });
        setMForm({ businessName: "", businessNameAr: "", category: "restaurant", description: "", city: "Paris", country: "France", address: "", phone: "", email: "", website: "", isFeatured: false });
        loadMerchants();
      } else {
        setError(data?.result?.data?.json?.error || "فشل الإضافة");
      }
    } catch { setError("خطأ في الاتصال"); }
    setLoading(false);
    setTimeout(() => { setError(""); setSuccess(""); }, 4000);
  }

  async function approveMerchant(id: number) {
    try {
      const res = await fetch(`${API_URL}/pendingMerchant.approve`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id } }),
      });
      const data = await res.json();
      if (data?.result?.data?.json?.success) {
        setSuccess("تمت الموافقة ونشر المتجر!");
        addNotification({ type: "merchant", title: "موافقة على متجر", message: `تمت الموافقة على متجر #${id}` });
        loadMerchants();
      } else { setError(data?.result?.data?.json?.error || "فشل"); }
    } catch { setError("خطأ"); }
    setTimeout(() => { setError(""); setSuccess(""); }, 4000);
  }

  async function updateMerchant() {
    if (!editingMerchant) return;
    try {
      const res = await fetch(`${API_URL}/merchant.adminUpdate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id: editingMerchant.id, ...editingMerchant } }),
      });
      if (res.ok) {
        setSuccess("تم التعديل بنجاح!");
        setEditingMerchant(null);
        loadMerchants();
      }
    } catch { setError("خطأ في التعديل"); }
    setTimeout(() => { setError(""); setSuccess(""); }, 4000);
  }

  async function deleteMerchant(id: number, name: string) {
    if (!window.confirm(`حذف ${name} نهائياً؟`)) return;
    try {
      await fetch(`${API_URL}/merchant.adminDelete`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id } }),
      });
      setSuccess("تم الحذف");
        addNotification({ type: "merchant", title: "متجر محذوف", message: `تم حذف ${name}` });
      loadMerchants();
    } catch { setError("خطأ في الحذف"); }
    setTimeout(() => { setError(""); setSuccess(""); }, 4000);
  }

  async function toggleFeatured(id: number, current: boolean) {
    try {
      await fetch(`${API_URL}/merchant.adminUpdate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id, isFeatured: !current } }),
      });
      setSuccess(current ? "تم إزالة التمييز" : "تم التمييز كمميز!");
      loadMerchants();
    } catch { setError("خطأ"); }
    setTimeout(() => { setError(""); setSuccess(""); }, 3000);
  }

  // ─── Skill Actions ───
  async function createSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!sForm.fullName || !sForm.serviceType) { setError("الاسم ونوع الخدمة مطلوبان"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/skills.adminCreate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { ...sForm } }),
      });
      const data = await res.json();
      if (data?.result?.data?.json?.id) {
        setSuccess("تم إضافة المهارة بنجاح!");
        addNotification({ type: "skill", title: "مهارة جديدة", message: `أضفت ${sForm.fullNameAr || sForm.fullName}` });
        setSForm({ fullName: "", fullNameAr: "", serviceType: "", serviceTypeAr: "", category: "cooking", description: "", city: "Paris", country: "France", phone: "", email: "", yearsOfExperience: 0, isFeatured: false });
        loadSkills();
      } else { setError("فشل الإضافة"); }
    } catch { setError("خطأ في الاتصال"); }
    setLoading(false);
    setTimeout(() => { setError(""); setSuccess(""); }, 4000);
  }

  async function approveSkill(id: number, name: string) {
    try {
      await fetch(`${API_URL}/skills.updateStatus`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id, status: "active" } }),
      });
      setSuccess("تمت الموافقة على المهارة!");
      addNotification({ type: "skill", title: "مهارة مقبولة", message: `تمت الموافقة على ${name}` });
      loadSkills();
    } catch { setError("خطأ"); }
    setTimeout(() => { setError(""); setSuccess(""); }, 4000);
  }

  async function updateSkill() {
    if (!editingSkill) return;
    try {
      const res = await fetch(`${API_URL}/skills.adminUpdate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id: editingSkill.id, ...editingSkill } }),
      });
      if (res.ok) {
        setSuccess("تم تعديل المهارة!");
        setEditingSkill(null);
        loadSkills();
      }
    } catch { setError("خطأ"); }
    setTimeout(() => { setError(""); setSuccess(""); }, 4000);
  }

  async function deleteSkill(id: number, name: string) {
    if (!window.confirm(`حذف ${name} نهائياً؟`)) return;
    try {
      await fetch(`${API_URL}/skills.adminDelete`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id } }),
      });
      setSuccess("تم الحذف");
      addNotification({ type: "skill", title: "مهارة محذوفة", message: `تم حذف ${name}` });
      loadSkills();
    } catch { setError("خطأ"); }
    setTimeout(() => { setError(""); setSuccess(""); }, 4000);
  }

  async function toggleSkillFeatured(id: number, current: boolean) {
    try {
      await fetch(`${API_URL}/skills.adminUpdate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id, isFeatured: !current } }),
      });
      setSuccess(current ? "تم إزالة التمييز" : "تم التمييز!");
      loadSkills();
    } catch { setError("خطأ"); }
    setTimeout(() => { setError(""); setSuccess(""); }, 3000);
  }

  // ─── Login Screen ───
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a1628" }}>
        <div className="text-center p-8 max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-[#c9a227]/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-[#c9a227]" />
          </div>
          <h2 className="text-white text-xl font-bold mb-4">لوحة الإدارة</h2>
          <p className="text-white/40 text-sm mb-6">Admin Panel</p>
          <input type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && password === ADMIN_PASS) setIsAuthenticated(true); }}
            placeholder="كلمة المرور..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white text-center placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none mb-4" />
          <button onClick={() => { if (password === ADMIN_PASS) setIsAuthenticated(true); }}
            className="w-full py-3 rounded-xl bg-[#c9a227] text-[#0a1628] font-bold hover:bg-[#e8b923] transition">
            دخول
          </button>
          <Link to="/" className="text-white/30 text-xs mt-4 inline-block hover:text-white/50">← رجوع</Link>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // MAIN DASHBOARD
  // ═══════════════════════════════════════════
  return (
    <div className="min-h-screen" style={{ background: "#0a1628" }} dir="rtl">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a1628]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-lg hover:bg-white/5 transition">
              <Bell className="h-5 w-5 text-white/60" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
              )}
            </button>
            <button onClick={() => setIsAuthenticated(false)} className="text-white/40 text-xs hover:text-white flex items-center gap-1">
              <LogOut className="h-3 w-3" /> خروج
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotif && (
        <div className="fixed top-16 left-4 z-50 w-80 bg-[#1a2744] border border-white/10 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <h3 className="text-white font-bold text-sm">الإشعارات ({unreadCount} جديد)</h3>
            <button onClick={clearAll} className="text-white/40 text-xs hover:text-red-400">مسح الكل</button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-white/30 text-center py-4 text-sm">لا توجد إشعارات</p>
          ) : (
            notifications.map((n) => (
              <button key={n.id} onClick={() => markRead(n.id)}
                className={`w-full text-right p-3 border-b border-white/5 hover:bg-white/5 transition ${!n.read ? "bg-[#c9a227]/5" : ""}`}>
                <p className={`text-xs font-bold ${!n.read ? "text-[#c9a227]" : "text-white/50"}`}>{n.title}</p>
                <p className="text-white/40 text-xs">{n.message}</p>
                <p className="text-white/20 text-[10px] mt-1">{new Date(n.createdAt).toLocaleTimeString("ar-SA")}</p>
              </button>
            ))
          )}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Alerts */}
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm"><AlertTriangle className="h-4 w-4 inline ml-2" />{error}</div>}
        {success && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4 text-emerald-400 text-sm"><CheckCircle className="h-4 w-4 inline ml-2" />{success}</div>}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><Store className="h-4 w-4 text-[#c9a227]" /><span className="text-white/40 text-xs">متاجر</span></div>
            <p className="text-xl font-bold text-white">{mStats.total} <span className="text-emerald-400 text-xs">({mStats.active} نشط)</span></p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><Wrench className="h-4 w-4 text-[#c9a227]" /><span className="text-white/40 text-xs">مهارات</span></div>
            <p className="text-xl font-bold text-white">{sStats.total} <span className="text-emerald-400 text-xs">({sStats.active} نشط)</span></p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-yellow-400" /><span className="text-yellow-400/60 text-xs">قيد المراجعة</span></div>
            <p className="text-xl font-bold text-yellow-400">{mStats.pending + sStats.pending}</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><Star className="h-4 w-4 text-purple-400" /><span className="text-purple-400/60 text-xs">مميز</span></div>
            <p className="text-xl font-bold text-purple-400">{mStats.featured + sStats.featured}</p>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-white/10">
          {[
            { key: "merchants", label: "المتاجر", icon: Store },
            { key: "skills", label: "المهارات", icon: Wrench },
            { key: "notifications", label: `الإشعارات ${unreadCount > 0 ? `(${unreadCount})` : ""}`, icon: Bell },
          ].map((t) => (
            <button key={t.key} onClick={() => { setActiveTab(t.key as any); setSubTab("list"); setEditingMerchant(null); setEditingSkill(null); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 ${activeTab === t.key ? "text-[#c9a227] border-[#c9a227]" : "text-white/40 border-transparent hover:text-white/70"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* ═══ MERCHANTS TAB ═══ */}
        {activeTab === "merchants" && !editingMerchant && (
          <>
            {/* Sub Tabs */}
            <div className="flex gap-2 mb-4">
              {[
                { key: "list", label: "المتاجر النشطة" },
                { key: "pending", label: `قيد المراجعة ${pendingMerchants.length > 0 ? `(${pendingMerchants.length})` : ""}` },
                { key: "add", label: "+ إضافة متجر" },
              ].map((t) => (
                <button key={t.key} onClick={() => setSubTab(t.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${subTab === t.key ? "bg-[#c9a227] text-[#0a1628] font-bold" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* LIST */}
            {subTab === "list" && (
              <>
                <div className="relative mb-4 max-w-md">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input type="text" value={mSearch} onChange={(e) => setMSearch(e.target.value)}
                    placeholder="بحث..." className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:border-[#c9a227] focus:outline-none" />
                </div>
                <div className="space-y-2">
                  {merchants.filter((m) => !mSearch || (m.businessNameAr || "").includes(mSearch) || (m.city || "").includes(mSearch)).map((m) => (
                    <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-bold">{m.businessNameAr || m.businessName}</h3>
                            {m.isFeatured && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">⭐ مميز</span>}
                            {m.isVerified && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">✓ موثق</span>}
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-white/50">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {m.city}</span>
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {m.phone}</span>
                            {m.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {m.email}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1 mr-2">
                          <button onClick={() => setEditingMerchant(m)} className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-white/30 hover:text-blue-400 transition" title="تعديل"><Edit3 className="h-4 w-4" /></button>
                          <button onClick={() => toggleFeatured(m.id, m.isFeatured)} className={`p-2 rounded-lg transition ${m.isFeatured ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-white/30 hover:text-purple-400"}`} title="تمييز"><Star className="h-4 w-4" /></button>
                          <button onClick={() => deleteMerchant(m.id, m.businessNameAr || m.businessName)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 transition" title="حذف"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {merchants.length === 0 && <div className="text-center py-16 text-white/20"><Store className="h-12 w-12 mx-auto mb-3" /><p>لا توجد متاجر</p></div>}
                </div>
              </>
            )}

            {/* PENDING */}
            {subTab === "pending" && (
              <div className="space-y-2">
                {pendingMerchants.map((m) => (
                  <div key={m.id} className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{m.businessNameAr || m.businessName}</h3>
                        <div className="flex flex-wrap gap-3 text-xs text-white/50 mt-1">
                          <span>{m.city} • {m.phone} • {m.email}</span>
                          {m.businessRegistrationPhoto && <span className="text-emerald-400">✓ سجل تجاري</span>}
                          {m.ownerIdPhoto && <span className="text-emerald-400">✓ هوية</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 mr-2">
                        <button onClick={() => approveMerchant(m.id)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition text-sm"><CheckCircle className="h-4 w-4" /> موافقة</button>
                        <button onClick={() => { /* reject */ }} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition text-sm"><XCircle className="h-4 w-4" /> رفض</button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingMerchants.length === 0 && <div className="text-center py-16 text-white/20"><Clock className="h-12 w-12 mx-auto mb-3" /><p>لا توجد طلبات</p></div>}
              </div>
            )}

            {/* ADD FORM */}
            {subTab === "add" && (
              <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-white font-bold text-lg mb-4">+ إضافة متجر جديد</h2>
                <form onSubmit={createMerchant} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-white text-sm mb-1 block">اسم المتجر (عربي) *</label><input value={mForm.businessNameAr} onChange={(e) => setMForm((p) => ({ ...p, businessNameAr: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" placeholder="مثال: سوبرماركت الأمل" required /></div>
                    <div><label className="text-white text-sm mb-1 block">Store Name (English) *</label><input value={mForm.businessName} onChange={(e) => setMForm((p) => ({ ...p, businessName: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" placeholder="e.g. Al-Amal" required dir="ltr" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-white text-sm mb-1 block">التصنيف</label><select value={mForm.category} onChange={(e) => setMForm((p) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none">{merchantCategories.map((c) => <option key={c.value} value={c.value} className="bg-[#1a2744]">{c.label}</option>)}</select></div>
                    <div><label className="text-white text-sm mb-1 block">المدينة *</label><input value={mForm.city} onChange={(e) => setMForm((p) => ({ ...p, city: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" placeholder="باريس" required /></div>
                  </div>
                  <div><label className="text-white text-sm mb-1 block">الهاتف</label><input value={mForm.phone} onChange={(e) => setMForm((p) => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" placeholder="+33 1 23 45 67 89" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-white text-sm mb-1 block">البريد (اختياري)</label><input value={mForm.email} onChange={(e) => setMForm((p) => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" placeholder="info@example.com" dir="ltr" /></div>
                    <div><label className="text-white text-sm mb-1 block">الموقع (اختياري)</label><input value={mForm.website} onChange={(e) => setMForm((p) => ({ ...p, website: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" placeholder="https://..." dir="ltr" /></div>
                  </div>
                  <div><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={mForm.isFeatured} onChange={(e) => setMForm((p) => ({ ...p, isFeatured: e.target.checked }))} className="accent-[#c9a227]" /><span className="text-white text-sm">متجر مميز ⭐</span></label></div>
                  <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e8b923] text-[#0a1628] font-bold hover:shadow-lg transition disabled:opacity-50">{loading ? "جاري..." : "+ إضافة المتجر"}</button>
                </form>
              </div>
            )}
          </>
        )}

        {/* ═══ EDIT MERCHANT ═══ */}
        {activeTab === "merchants" && editingMerchant && (
          <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">تعديل متجر</h2>
              <button onClick={() => setEditingMerchant(null)} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="text-white text-sm mb-1 block">الاسم (عربي)</label><input value={editingMerchant.businessNameAr || ""} onChange={(e) => setEditingMerchant((p: any) => ({ ...p, businessNameAr: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" /></div>
                <div><label className="text-white text-sm mb-1 block">الاسم (English)</label><input value={editingMerchant.businessName || ""} onChange={(e) => setEditingMerchant((p: any) => ({ ...p, businessName: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" dir="ltr" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="text-white text-sm mb-1 block">المدينة</label><input value={editingMerchant.city || ""} onChange={(e) => setEditingMerchant((p: any) => ({ ...p, city: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" /></div>
                <div><label className="text-white text-sm mb-1 block">الهاتف</label><input value={editingMerchant.phone || ""} onChange={(e) => setEditingMerchant((p: any) => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" /></div>
              </div>
              <div><label className="text-white text-sm mb-1 block">الوصف</label><textarea value={editingMerchant.description || ""} onChange={(e) => setEditingMerchant((p: any) => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm h-20 resize-none focus:border-[#c9a227] focus:outline-none" /></div>
              <button onClick={updateMerchant} className="w-full py-3 rounded-xl bg-[#c9a227] text-[#0a1628] font-bold hover:bg-[#e8b923] transition flex items-center justify-center gap-2"><Save className="h-4 w-4" /> حفظ التعديلات</button>
            </div>
          </div>
        )}

        {/* ═══ SKILLS TAB ═══ */}
        {activeTab === "skills" && !editingSkill && (
          <>
            <div className="flex gap-2 mb-4">
              {[
                { key: "list", label: "المهارات النشطة" },
                { key: "pending", label: `قيد المراجعة ${pendingSkills.length > 0 ? `(${pendingSkills.length})` : ""}` },
                { key: "add", label: "+ إضافة مهارة" },
              ].map((t) => (
                <button key={t.key} onClick={() => setSubTab(t.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${subTab === t.key ? "bg-[#c9a227] text-[#0a1628] font-bold" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {subTab === "list" && (
              <>
                <div className="relative mb-4 max-w-md">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input type="text" value={sSearch} onChange={(e) => setSSearch(e.target.value)} placeholder="بحث..." className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:border-[#c9a227] focus:outline-none" />
                </div>
                <div className="space-y-2">
                  {skills.filter((s) => !sSearch || (s.fullNameAr || s.fullName).includes(sSearch) || (s.city || "").includes(sSearch)).map((s) => (
                    <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-bold">{s.fullNameAr || s.fullName}</h3>
                            {s.isFeatured && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">⭐ مميز</span>}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{s.serviceTypeAr || s.serviceType}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-white/50">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.city}</span>
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {s.phone}</span>
                            <span>{s.category} • {s.yearsOfExperience || 0} سنوات خبرة</span>
                          </div>
                        </div>
                        <div className="flex gap-1 mr-2">
                          <button onClick={() => setEditingSkill(s)} className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-white/30 hover:text-blue-400 transition" title="تعديل"><Edit3 className="h-4 w-4" /></button>
                          <button onClick={() => toggleSkillFeatured(s.id, s.isFeatured)} className={`p-2 rounded-lg transition ${s.isFeatured ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-white/30 hover:text-purple-400"}`} title="تمييز"><Star className="h-4 w-4" /></button>
                          <button onClick={() => deleteSkill(s.id, s.fullNameAr || s.fullName)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 transition" title="حذف"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {skills.length === 0 && <div className="text-center py-16 text-white/20"><Wrench className="h-12 w-12 mx-auto mb-3" /><p>لا توجد مهارات</p></div>}
                </div>
              </>
            )}

            {subTab === "pending" && (
              <div className="space-y-2">
                {pendingSkills.map((s) => (
                  <div key={s.id} className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{s.fullNameAr || s.fullName}</h3>
                        <p className="text-white/50 text-xs">{s.serviceTypeAr || s.serviceType} • {s.city} • {s.phone}</p>
                      </div>
                      <button onClick={() => approveSkill(s.id, s.fullNameAr || s.fullName)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition text-sm"><CheckCircle className="h-4 w-4" /> موافقة</button>
                    </div>
                  </div>
                ))}
                {pendingSkills.length === 0 && <div className="text-center py-16 text-white/20"><Clock className="h-12 w-12 mx-auto mb-3" /><p>لا توجد طلبات</p></div>}
              </div>
            )}

            {subTab === "add" && (
              <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-white font-bold text-lg mb-4">+ إضافة مهارة جديدة</h2>
                <form onSubmit={createSkill} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-white text-sm mb-1 block">الاسم الكامل (عربي) *</label><input value={sForm.fullNameAr} onChange={(e) => setSForm((p) => ({ ...p, fullNameAr: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" placeholder="أحمد محمد" required /></div>
                    <div><label className="text-white text-sm mb-1 block">Full Name (English) *</label><input value={sForm.fullName} onChange={(e) => setSForm((p) => ({ ...p, fullName: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" placeholder="Ahmad Muhammad" required dir="ltr" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-white text-sm mb-1 block">نوع الخدمة (عربي) *</label><input value={sForm.serviceTypeAr} onChange={(e) => setSForm((p) => ({ ...p, serviceTypeAr: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" placeholder="شيف سوري" required /></div>
                    <div><label className="text-white text-sm mb-1 block">Service Type (English) *</label><input value={sForm.serviceType} onChange={(e) => setSForm((p) => ({ ...p, serviceType: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" placeholder="Syrian Chef" required dir="ltr" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-white text-sm mb-1 block">التصنيف</label><select value={sForm.category} onChange={(e) => setSForm((p) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none">{skillCategories.map((c) => <option key={c.value} value={c.value} className="bg-[#1a2744]">{c.label}</option>)}</select></div>
                    <div><label className="text-white text-sm mb-1 block">المدينة *</label><input value={sForm.city} onChange={(e) => setSForm((p) => ({ ...p, city: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" placeholder="باريس" required /></div>
                    <div><label className="text-white text-sm mb-1 block">الهاتف</label><input value={sForm.phone} onChange={(e) => setSForm((p) => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" placeholder="+33 6 12 34 56 78" /></div>
                  </div>
                  <div><label className="text-white text-sm mb-1 block">الوصف</label><textarea value={sForm.description} onChange={(e) => setSForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm h-20 resize-none focus:border-[#c9a227] focus:outline-none" placeholder="وصف الخدمة..." /></div>
                  <div><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={sForm.isFeatured} onChange={(e) => setSForm((p) => ({ ...p, isFeatured: e.target.checked }))} className="accent-[#c9a227]" /><span className="text-white text-sm">مهارة مميزة ⭐</span></label></div>
                  <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e8b923] text-[#0a1628] font-bold hover:shadow-lg transition disabled:opacity-50">{loading ? "جاري..." : "+ إضافة المهارة"}</button>
                </form>
              </div>
            )}
          </>
        )}

        {/* ═══ EDIT SKILL ═══ */}
        {activeTab === "skills" && editingSkill && (
          <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">تعديل مهارة</h2>
              <button onClick={() => setEditingSkill(null)} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="text-white text-sm mb-1 block">الاسم (عربي)</label><input value={editingSkill.fullNameAr || ""} onChange={(e) => setEditingSkill((p: any) => ({ ...p, fullNameAr: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" /></div>
                <div><label className="text-white text-sm mb-1 block">نوع الخدمة</label><input value={editingSkill.serviceTypeAr || editingSkill.serviceType || ""} onChange={(e) => setEditingSkill((p: any) => ({ ...p, serviceTypeAr: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="text-white text-sm mb-1 block">المدينة</label><input value={editingSkill.city || ""} onChange={(e) => setEditingSkill((p: any) => ({ ...p, city: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" /></div>
                <div><label className="text-white text-sm mb-1 block">الهاتف</label><input value={editingSkill.phone || ""} onChange={(e) => setEditingSkill((p: any) => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:border-[#c9a227] focus:outline-none" /></div>
              </div>
              <div><label className="text-white text-sm mb-1 block">الوصف</label><textarea value={editingSkill.description || ""} onChange={(e) => setEditingSkill((p: any) => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm h-20 resize-none focus:border-[#c9a227] focus:outline-none" /></div>
              <button onClick={updateSkill} className="w-full py-3 rounded-xl bg-[#c9a227] text-[#0a1628] font-bold hover:bg-[#e8b923] transition flex items-center justify-center gap-2"><Save className="h-4 w-4" /> حفظ التعديلات</button>
            </div>
          </div>
        )}

        {/* ═══ NOTIFICATIONS TAB ═══ */}
        {activeTab === "notifications" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold mb-4">سجل الإشعارات ({notifications.length})</h2>
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-white/20"><Bell className="h-12 w-12 mx-auto mb-3" /><p>لا توجد إشعارات</p></div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-4 rounded-xl border ${!n.read ? "bg-[#c9a227]/5 border-[#c9a227]/20" : "bg-white/5 border-white/10"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${!n.read ? "text-[#c9a227]" : "text-white/50"}`}>{n.title}</span>
                      <span className="text-[10px] text-white/30">{new Date(n.createdAt).toLocaleDateString("ar-SA")}</span>
                    </div>
                    <p className="text-white/60 text-sm">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
