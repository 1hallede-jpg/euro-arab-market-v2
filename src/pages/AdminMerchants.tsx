import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Logo from "@/components/Logo";
import { CheckCircle, XCircle, MessageSquare, Building2, Phone, Mail, MapPin, Calendar } from "lucide-react";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "قيد المراجعة" },
  approved: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "تمت الموافقة" },
  rejected: { bg: "bg-red-500/20", text: "text-red-400", label: "مرفوض" },
  more_info: { bg: "bg-blue-500/20", text: "text-blue-400", label: "يحتاج معلومات" },
};

export default function AdminMerchants() {
  const [filter, setFilter] = useState<string>("pending");
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: merchants, refetch } = trpc.pendingMerchant.list.useQuery({ status: filter, limit: 50 });
  const updateMutation = trpc.pendingMerchant.updateStatus.useMutation({ onSuccess: () => { refetch(); setSelectedMerchant(null); } });

  // Simple password protection
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a1628" }}>
        <div className="text-center p-8 max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-[#c9a227]/20 flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-8 w-8 text-[#c9a227]" />
          </div>
          <h2 className="text-white text-xl font-bold mb-4">لوحة إدارة التجار</h2>
          <p className="text-gray-400 text-sm mb-6">Merchant Admin Panel</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && password === "admin123") setIsAuthenticated(true); }}
            placeholder="أدخل كلمة المرور..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white text-center placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none"
            autoFocus
          />
          {password && password !== "admin123" && (
            <p className="text-red-400 text-xs mt-2">كلمة المرور غير صحيحة</p>
          )}
          <p className="text-white/20 text-xs mt-4">كلمة المرور: admin123</p>
          <Link to="/" className="text-white/30 text-xs mt-4 inline-block hover:text-white/50">← العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  const handleAction = (id: number, status: "approved" | "rejected" | "more_info") => {
    updateMutation.mutate({ id, status, adminNotes });
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a1628" }} dir="rtl">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a1628]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 rounded-lg overflow-hidden">
              {["pending", "approved", "rejected", "more_info"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 text-xs transition ${
                    filter === s ? "bg-[#c9a227] text-[#0a1628] font-bold" : "text-white/60 hover:text-white"
                  }`}
                >
                  {statusColors[s].label}
                </button>
              ))}
            </div>
            <Link to="/" className="text-white/60 hover:text-white text-sm">خروج</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Merchant List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-white font-bold text-lg mb-4">
              الطلبات ({merchants?.length || 0})
            </h2>
            {merchants?.map((m: any) => (
              <button
                key={m.id}
                onClick={() => { setSelectedMerchant(m); setAdminNotes(m.adminNotes || ""); }}
                className={`w-full text-right p-4 rounded-xl border transition ${
                  selectedMerchant?.id === m.id
                    ? "border-[#c9a227] bg-[#c9a227]/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-white font-bold text-sm">{m.businessNameAr}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[m.status]?.bg} ${statusColors[m.status]?.text}`}>
                    {statusColors[m.status]?.label}
                  </span>
                </div>
                <p className="text-white/40 text-xs mt-1">{m.businessName}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                  <span>{m.city}</span>
                  <span>•</span>
                  <span>{m.category}</span>
                </div>
              </button>
            ))}
            {(!merchants || merchants.length === 0) && (
              <div className="text-center py-12 text-white/30">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد طلبات</p>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2">
            {selectedMerchant ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-white text-2xl font-bold">{selectedMerchant.businessNameAr}</h2>
                    <p className="text-white/50">{selectedMerchant.businessName}</p>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full ${statusColors[selectedMerchant.status]?.bg} ${statusColors[selectedMerchant.status]?.text}`}>
                    {statusColors[selectedMerchant.status]?.label}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-[#c9a227]" />
                    <span className="text-white">{selectedMerchant.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-[#c9a227]" />
                    <span className="text-white">{selectedMerchant.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-[#c9a227]" />
                    <span className="text-white">{selectedMerchant.address || "—"}، {selectedMerchant.city}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-[#c9a227]" />
                    <span className="text-white">{new Date(selectedMerchant.createdAt).toLocaleDateString("ar-SA")}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/30 text-xs mb-1">الوصف العربي</p>
                    <p className="text-white text-sm">{selectedMerchant.descriptionAr || "—"}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/30 text-xs mb-1">Description</p>
                    <p className="text-white text-sm">{selectedMerchant.description || "—"}</p>
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-6">
                  <h4 className="text-white/50 text-sm mb-3">📎 المستندات</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "السجل التجاري", key: "businessRegistrationPhoto" },
                      { label: "هوية المالك", key: "ownerIdPhoto" },
                      { label: "شهادة الحلال", key: "halalCertificate" },
                      { label: "الشعار", key: "logo" },
                    ].map((doc) => (
                      <div key={doc.key} className={`border rounded-lg p-3 text-center ${selectedMerchant[doc.key] ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
                        <p className="text-white text-xs">{doc.label}</p>
                        <p className="text-white/30 text-[10px] mt-1">{selectedMerchant[doc.key] ? "✅ موجود" : "❌ غير مرفق"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-white/50 text-sm mb-2">
                    <MessageSquare className="h-4 w-4" />
                    ملاحظات الإدارة
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white text-sm placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none h-20 resize-none"
                    placeholder="أضف ملاحظات..."
                  />
                </div>

                {/* Actions */}
                {selectedMerchant.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(selectedMerchant.id, "approved")}
                      disabled={updateMutation.isPending}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      ✅ موافقة + إرسال بريد
                    </button>
                    <button
                      onClick={() => handleAction(selectedMerchant.id, "rejected")}
                      disabled={updateMutation.isPending}
                      className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-5 w-5" />
                      ❌ رفض
                    </button>
                    <button
                      onClick={() => handleAction(selectedMerchant.id, "more_info")}
                      disabled={updateMutation.isPending}
                      className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition disabled:opacity-50"
                    >
                      📝 طلب معلومات
                    </button>
                  </div>
                )}

                {selectedMerchant.status !== "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(selectedMerchant.id, "pending")}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition"
                    >
                      ↩️ إعادة للمراجعة
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center text-white/30">
                  <Building2 className="h-16 w-16 mx-auto mb-4" />
                  <p>اختر تاجراً من القائمة لعرض التفاصيل</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
