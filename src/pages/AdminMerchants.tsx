import { useState, useEffect } from "react";
import { Link } from "react-router";
import Logo from "@/components/Logo";
import { CheckCircle, XCircle, Building2, Phone, Mail, MapPin, Calendar, MessageSquare } from "lucide-react";

const API_URL = "/api/trpc";
const ADMIN_PASS = "admin123";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "قيد المراجعة" },
  approved: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "تمت الموافقة" },
  rejected: { bg: "bg-red-500/20", text: "text-red-400", label: "مرفوض" },
  more_info: { bg: "bg-blue-500/20", text: "text-blue-400", label: "يحتاج معلومات" },
};

export default function AdminMerchants() {
  const [filter, setFilter] = useState("pending");
  const [merchants, setMerchants] = useState<any[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load merchants
  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      setLoading(true);
      try {
        const params = { json: { status: filter, limit: 50 } };
        const inp = encodeURIComponent(JSON.stringify(params));
        const res = await fetch(`${API_URL}/pendingMerchant.list?input=${inp}`);
        if (res.ok) {
          const data = await res.json();
          const items = data?.result?.data?.json || [];
          setMerchants(items);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [isAuthenticated, filter]);

  const updateStatus = async (id: number, status: string) => {
    try {
      const body = JSON.stringify({ json: { id, status, adminNotes } });
      await fetch(`${API_URL}/pendingMerchant.updateStatus`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body
      });
      setMerchants(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      setSelectedMerchant(null);
    } catch (e) { console.error(e); }
  };

  // Password protection
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a1628" }}>
        <div className="text-center p-8 max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-[#c9a227]/20 flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-8 w-8 text-[#c9a227]" />
          </div>
          <h2 className="text-white text-xl font-bold mb-4">لوحة إدارة التجار</h2>
          <p className="text-white/40 text-sm mb-6">Merchant Admin Panel</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && password === ADMIN_PASS) setIsAuthenticated(true); }}
            placeholder="كلمة المرور..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white text-center placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none mb-4"
          />
          {password && password !== ADMIN_PASS && <p className="text-red-400 text-xs mb-2">غير صحيحة</p>}
          <button onClick={() => { if (password === ADMIN_PASS) setIsAuthenticated(true); }}
            className="w-full py-3 rounded-xl bg-[#c9a227] text-[#0a1628] font-bold hover:bg-[#e8b923] transition">
            دخول
          </button>
          <Link to="/" className="text-white/30 text-xs mt-4 inline-block hover:text-white/50">← رجوع</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a1628" }} dir="rtl">
      <div className="border-b border-white/10 bg-[#0a1628]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            {["pending", "approved", "rejected"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs transition ${filter === s ? "bg-[#c9a227] text-[#0a1628]" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                {statusColors[s].label}
              </button>
            ))}
            <button onClick={() => setIsAuthenticated(false)} className="text-white/40 text-xs hover:text-white mr-2">خروج</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {loading ? (
          <div className="text-center py-20 text-white/30">جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-1 space-y-2">
              <h2 className="text-white font-bold mb-3">الطلبات ({merchants.length})</h2>
              {merchants.map(m => (
                <button key={m.id} onClick={() => { setSelectedMerchant(m); setAdminNotes(m.adminNotes || ""); }}
                  className={`w-full text-right p-3 rounded-xl border transition ${selectedMerchant?.id === m.id ? "border-[#c9a227] bg-[#c9a227]/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-sm">{m.businessNameAr}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[m.status]?.bg} ${statusColors[m.status]?.text}`}>
                      {statusColors[m.status]?.label}
                    </span>
                  </div>
                  <p className="text-white/30 text-xs">{m.city} • {m.category}</p>
                </button>
              ))}
              {merchants.length === 0 && <p className="text-white/20 text-center py-8">لا توجد طلبات</p>}
            </div>

            {/* Detail */}
            <div className="lg:col-span-2">
              {selectedMerchant ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-white text-xl font-bold">{selectedMerchant.businessNameAr}</h2>
                      <p className="text-white/40">{selectedMerchant.businessName}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${statusColors[selectedMerchant.status]?.bg} ${statusColors[selectedMerchant.status]?.text}`}>
                      {statusColors[selectedMerchant.status]?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="flex items-center gap-2 text-white/60"><Phone className="h-4 w-4 text-[#c9a227]" />{selectedMerchant.phone}</div>
                    <div className="flex items-center gap-2 text-white/60"><Mail className="h-4 w-4 text-[#c9a227]" />{selectedMerchant.email}</div>
                    <div className="flex items-center gap-2 text-white/60"><MapPin className="h-4 w-4 text-[#c9a227]" />{selectedMerchant.address || "—"}، {selectedMerchant.city}</div>
                    <div className="flex items-center gap-2 text-white/60"><Calendar className="h-4 w-4 text-[#c9a227]" />{new Date(selectedMerchant.createdAt).toLocaleDateString("ar-SA")}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    {[
                      { label: "السجل التجاري", key: "businessRegistrationPhoto" },
                      { label: "هوية المالك", key: "ownerIdPhoto" },
                      { label: "شهادة الحلال", key: "halalCertificate" },
                      { label: "الشعار", key: "logo" },
                    ].map(doc => (
                      <div key={doc.key} className={`border rounded p-2 text-center ${selectedMerchant[doc.key] ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
                        <p className="text-white text-xs">{doc.label}</p>
                        <p className="text-white/30 text-[10px]">{selectedMerchant[doc.key] ? "✅ موجود" : "❌ غير مرفق"}</p>
                      </div>
                    ))}
                  </div>

                  <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white text-sm h-16 resize-none mb-4"
                    placeholder="ملاحظات..." />

                  {selectedMerchant.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(selectedMerchant.id, "approved")} className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition flex items-center justify-center gap-1">
                        <CheckCircle className="h-4 w-4" /> ✅ موافقة
                      </button>
                      <button onClick={() => updateStatus(selectedMerchant.id, "rejected")} className="flex-1 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition">
                        ❌ رفض
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[300px] text-white/20">
                  <Building2 className="h-12 w-12 mb-2" />
                  <p>اختر تاجراً</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
