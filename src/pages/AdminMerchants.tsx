import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Building2, CheckCircle, XCircle, Star, Trash2, Edit3,
  Search, Plus, TrendingUp, Store, Clock, LogOut,
  ChevronDown, ChevronUp, Eye, MapPin, Phone, Mail, Globe,
  Save, X, AlertCircle,
} from "lucide-react";
import Logo from "@/components/Logo";

const API_URL = "/api/trpc";
const ADMIN_PASS = "Sindbad2024!Admin";

const statusNames: Record<string, { label: string; color: string; bg: string }> = {
  active:  { label: "نشط", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  pending: { label: "قيد المراجعة", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  suspended: { label: "موقوف", color: "text-red-400", bg: "bg-red-500/20" },
  rejected: { label: "مرفوض", color: "text-gray-400", bg: "bg-gray-500/20" },
  claimed: { label: "مطالب", color: "text-blue-400", bg: "bg-blue-500/20" },
};

const categories = [
  { value: "restaurant", label: "مطعم" },
  { value: "supermarket", label: "سوبرماركت" },
  { value: "sweets", label: "حلويات" },
  { value: "barber", label: "صالون حلاقة" },
  { value: "butcher", label: "جزار" },
  { value: "bakery", label: "مخبز" },
  { value: "cafe", label: "مقهى" },
  { value: "clothing", label: "ملابس" },
  { value: "electronics", label: "إلكترونيات" },
  { value: "pharmacy", label: "صيدلية" },
  { value: "halal_grocery", label: "بقالة حلال" },
  { value: "shisha_lounge", label: "مقهى شيشة" },
  { value: "travel_agency", label: "وكالة سفر" },
  { value: "money_transfer", label: "تحويل أموال" },
  { value: "mosque", label: "مسجد" },
  { value: "cultural_center", label: "مركز ثقافي" },
  { value: "car_dealer", label: "وكالة سيارات" },
  { value: "repair_shop", label: "ورشة إصلاح" },
  { value: "other", label: "أخرى" },
];

export default function AdminMerchants() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "pending" | "add">("active");
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, featured: 0 });
  const [merchants, setMerchants] = useState<any[]>([]);
  const [pendingMerchants, setPendingMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingMerchant, setEditingMerchant] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "", businessNameAr: "", category: "restaurant",
    description: "", city: "Paris", country: "France",
    address: "", phone: "", email: "", website: "",
    isFeatured: false, isVerified: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load stats
  useEffect(() => {
    if (!isAuthenticated) return;
    loadStats();
    if (activeTab === "active") loadActiveMerchants();
    else if (activeTab === "pending") loadPendingMerchants();
  }, [isAuthenticated, activeTab]);

  async function loadStats() {
    try {
      const res = await fetch(`${API_URL}/merchant.adminStats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data?.result?.data?.json || { total: 0, active: 0, pending: 0, featured: 0 });
      }
    } catch (e) { console.error("Stats error:", e); }
  }

  async function loadActiveMerchants() {
    setLoading(true);
    try {
      const params = { json: { status: "active", limit: 100 } };
      const inp = encodeURIComponent(JSON.stringify(params));
      const res = await fetch(`${API_URL}/merchant.adminList?input=${inp}`);
      if (res.ok) {
        const data = await res.json();
        const result = data?.result?.data?.json || { items: [] };
        setMerchants(result.items || []);
      }
    } catch (e) { console.error("Load active error:", e); }
    setLoading(false);
  }

  async function loadPendingMerchants() {
    setLoading(true);
    try {
      const params = { json: { status: "pending", limit: 100 } };
      const inp = encodeURIComponent(JSON.stringify(params));
      const res = await fetch(`${API_URL}/pendingMerchant.list?input=${inp}`);
      if (res.ok) {
        const data = await res.json();
        setPendingMerchants(data?.result?.data?.json || []);
      }
    } catch (e) { console.error("Load pending error:", e); }
    setLoading(false);
  }

  // Apve pending merchant → copy to merchants table
  async function approvePending(id: number) {
    try {
      const res = await fetch(`${API_URL}/pendingMerchant.approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id } }),
      });
      const result = await res.json();
      if (result?.result?.data?.json?.success) {
        setSuccess("تمت الموافقة وتم إضافة المتجر للموقع!");
        loadPendingMerchants();
        loadStats();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result?.result?.data?.json?.error || "فشلت الموافقة");
        setTimeout(() => setError(""), 3000);
      }
    } catch (e) { setError("خطأ في الاتصال"); setTimeout(() => setError(""), 3000); }
  }

  // Reject pending merchant
  async function rejectPending(id: number) {
    try {
      const res = await fetch(`${API_URL}/pendingMerchant.updateStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id, status: "rejected" } }),
      });
      if (res.ok) {
        setSuccess("تم الرفض");
        loadPendingMerchants();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (e) { setError("خطأ"); setTimeout(() => setError(""), 3000); }
  }

  // Delete merchant
  async function deleteMerchant(id: number) {
    if (!window.confirm("هل أنت متأكد من حذف هذا المتجر؟ لا يمكن التراجع!")) return;
    try {
      const res = await fetch(`${API_URL}/merchant.adminDelete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id } }),
      });
      if (res.ok) {
        setSuccess("تم الحذف");
        loadActiveMerchants();
        loadStats();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (e) { setError("خطأ في الحذف"); setTimeout(() => setError(""), 3000); }
  }

  // Toggle featured
  async function toggleFeatured(id: number, current: boolean) {
    try {
      const res = await fetch(`${API_URL}/merchant.adminUpdate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id, isFeatured: !current } }),
      });
      if (res.ok) {
        setSuccess(current ? "تم إزالة التمييز" : "تم التمييز كمميز!");
        loadActiveMerchants();
        loadStats();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (e) { setError("خطأ"); setTimeout(() => setError(""), 3000); }
  }

  // Create merchant directly
  async function createMerchant(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.businessName || !formData.businessNameAr) {
      setError("اسم المتجر مطلوب");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/merchant.create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { ...formData } }),
      });
      const result = await res.json();
      if (result?.result?.data?.json?.id) {
        setSuccess("تم إضافة المتجر بنجاح! سيظهر في الموقع مباشرة.");
        setFormData({
          businessName: "", businessNameAr: "", category: "restaurant",
          description: "", city: "Paris", country: "France",
          address: "", phone: "", email: "", website: "",
          isFeatured: false, isVerified: true,
        });
        loadStats();
        setTimeout(() => {
          setSuccess("");
          setActiveTab("active");
        }, 2000);
      } else {
        setError(result?.result?.data?.json?.error || "فشل الإضافة");
      }
    } catch (e) { setError("خطأ في الاتصال"); }
    setTimeout(() => setError(""), 5000);
  }

  // Password screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a1628" }}>
        <div className="text-center p-8 max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-[#c9a227]/20 flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-8 w-8 text-[#c9a227]" />
          </div>
          <h2 className="text-white text-xl font-bold mb-4">لوحة إدارة المتاجر</h2>
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

  // ─── MAIN ADMIN PANEL ───
  return (
    <div className="min-h-screen" style={{ background: "#0a1628" }} dir="rtl">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a1628]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-xs hidden sm:inline">لوحة الإدارة</span>
            <button onClick={() => setIsAuthenticated(false)}
              className="text-white/40 text-xs hover:text-white flex items-center gap-1">
              <LogOut className="h-3 w-3" /> خروج
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Alerts */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" /> {success}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Store className="h-5 w-5 text-[#c9a227]" />
              <span className="text-white/40 text-xs">إجمالي المتاجر</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-emerald-400/60 text-xs">نشطة</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400/60 text-xs">قيد المراجعة</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-purple-400" />
              <span className="text-purple-400/60 text-xs">مميزة</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.featured}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-1">
          {[
            { key: "active", label: "المتاجر النشطة", icon: Store },
            { key: "pending", label: "قيد المراجعة", icon: Clock },
            { key: "add", label: "+ إضافة متجر جديد", icon: Plus },
          ].map((tab) => (
            <button key={tab.key}
              onClick={() => { setActiveTab(tab.key as any); setShowForm(false); setEditingMerchant(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? "text-[#c9a227] border-b-2 border-[#c9a227] bg-[#c9a227]/5"
                  : "text-white/40 hover:text-white/70"
              }`}>
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TAB: Active Merchants ─── */}
        {activeTab === "active" && (
          <div>
            {/* Search */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث في المتاجر..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:border-[#c9a227] focus:outline-none" />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-white/30">جاري التحميل...</div>
            ) : (
              <div className="space-y-2">
                {merchants
                  .filter((m) => {
                    if (!search) return true;
                    const q = search.toLowerCase();
                    return (m.businessNameAr || "").toLowerCase().includes(q) ||
                           (m.businessName || "").toLowerCase().includes(q) ||
                           (m.city || "").toLowerCase().includes(q) ||
                           (m.phone || "").includes(q);
                  })
                  .map((m) => {
                    const st = statusNames[m.status || "active"] || statusNames.active;
                    return (
                      <div key={m.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-bold">{m.businessNameAr || m.businessName}</h3>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                              {m.isFeatured && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1"><Star className="h-3 w-3" /> مميز</span>}
                              {m.isVerified && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">✓ موثق</span>}
                            </div>
                            <p className="text-white/40 text-xs mb-2">{m.businessName}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
                              {m.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {m.city}</span>}
                              {m.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {m.phone}</span>}
                              {m.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {m.email}</span>}
                              {m.rating && <span className="flex items-center gap-1 text-yellow-400"><Star className="h-3 w-3 fill-current" /> {m.rating}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mr-2">
                            <button onClick={() => toggleFeatured(m.id, m.isFeatured)}
                              className={`p-2 rounded-lg transition ${m.isFeatured ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-white/30 hover:text-purple-400"}`}
                              title={m.isFeatured ? "إزالة التمييز" : "تمييز كمميز"}>
                              <Star className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteMerchant(m.id)}
                              className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-red-400 transition" title="حذف">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {merchants.filter((m) => {
                  if (!search) return true;
                  const q = search.toLowerCase();
                  return (m.businessNameAr || "").toLowerCase().includes(q) || (m.businessName || "").toLowerCase().includes(q) || (m.city || "").toLowerCase().includes(q);
                }).length === 0 && (
                  <div className="text-center py-16 text-white/20">
                    <Store className="h-12 w-12 mx-auto mb-3" />
                    <p>لا توجد متاجر نشطة</p>
                    <button onClick={() => setActiveTab("add")}
                      className="mt-3 text-[#c9a227] text-sm hover:text-[#e8b923]">+ أضف متجر جديد</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: Pending Merchants ─── */}
        {activeTab === "pending" && (
          <div>
            {loading ? (
              <div className="text-center py-20 text-white/30">جاري التحميل...</div>
            ) : (
              <div className="space-y-2">
                {pendingMerchants.map((m) => (
                  <div key={m.id} className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold">{m.businessNameAr || m.businessName}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">قيد المراجعة</span>
                        </div>
                        <p className="text-white/40 text-xs mb-2">{m.businessName}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {m.city}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {m.phone}</span>
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {m.email}</span>
                          {m.businessRegistrationPhoto && <span className="text-emerald-400">✓ سجل تجاري مرفق</span>}
                          {m.ownerIdPhoto && <span className="text-emerald-400">✓ هوية مرفقة</span>}
                          {m.logo && <span className="text-emerald-400">✓ شعار مرفق</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mr-2">
                        <button onClick={() => approvePending(m.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition text-sm">
                          <CheckCircle className="h-4 w-4" /> موافقة
                        </button>
                        <button onClick={() => rejectPending(m.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition text-sm">
                          <XCircle className="h-4 w-4" /> رفض
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingMerchants.length === 0 && (
                  <div className="text-center py-16 text-white/20">
                    <Clock className="h-12 w-12 mx-auto mb-3" />
                    <p>لا توجد طلبات قيد المراجعة</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: Add New Merchant ─── */}
        {activeTab === "add" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-1">إضافة متجر جديد</h2>
              <p className="text-white/40 text-sm mb-6">سيتم إضافة المتجر مباشرة للموقع</p>

              <form onSubmit={createMerchant} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm mb-2">اسم المتجر (عربي) *</label>
                    <input type="text" value={formData.businessNameAr}
                      onChange={(e) => setFormData((p) => ({ ...p, businessNameAr: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:border-[#c9a227] focus:outline-none"
                      placeholder="مثال: سوبرماركت الأمل" required />
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">Store Name (English) *</label>
                    <input type="text" value={formData.businessName}
                      onChange={(e) => setFormData((p) => ({ ...p, businessName: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:border-[#c9a227] focus:outline-none"
                      placeholder="e.g. Al-Amal Supermarket" required dir="ltr" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm mb-2">التصنيف *</label>
                    <select value={formData.category}
                      onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-[#c9a227] focus:outline-none">
                      {categories.map((c) => (<option key={c.value} value={c.value} className="bg-[#1a2744]">{c.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">المدينة *</label>
                    <input type="text" value={formData.city}
                      onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:border-[#c9a227] focus:outline-none"
                      placeholder="مثال: باريس" required />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm mb-2">الوصف</label>
                  <textarea value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:border-[#c9a227] focus:outline-none h-20 resize-none"
                    placeholder="وصف قصير للمتجر..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm mb-2">الهاتف *</label>
                    <input type="tel" value={formData.phone}
                      onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:border-[#c9a227] focus:outline-none"
                      placeholder="+33 1 23 45 67 89" required />
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">العنوان</label>
                    <input type="text" value={formData.address}
                      onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:border-[#c9a227] focus:outline-none"
                      placeholder="الشارع، المدينة" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm mb-2">البريد الإلكتروني</label>
                    <input type="email" value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:border-[#c9a227] focus:outline-none"
                      placeholder="info@example.com" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">الموقع الإلكتروني</label>
                    <input type="url" value={formData.website}
                      onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:border-[#c9a227] focus:outline-none"
                      placeholder="https://example.com" dir="ltr" />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isFeatured}
                      onChange={(e) => setFormData((p) => ({ ...p, isFeatured: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#c9a227]" />
                    <span className="text-white text-sm">متجر مميز ⭐</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isVerified}
                      onChange={(e) => setFormData((p) => ({ ...p, isVerified: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#c9a227]" />
                    <span className="text-white text-sm">متجر موثق ✓</span>
                  </label>
                </div>

                <button type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e8b923] text-[#0a1628] font-bold hover:shadow-lg hover:shadow-[#c9a227]/30 transition flex items-center justify-center gap-2">
                  <Plus className="h-5 w-5" /> إضافة المتجر للموقع
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
