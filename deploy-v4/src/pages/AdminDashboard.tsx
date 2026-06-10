import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  LayoutDashboard, Store, Briefcase, Users, LogOut, Plus, Search,
  Edit, Trash2, Save, X, Star, MapPin, Phone, Globe,
  CheckCircle, Menu, CreditCard, Image, Facebook, Instagram,
  BadgeCheck, XCircle, Hand, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ==================== CATEGORY LABELS ====================
const categoryNamesAr: Record<string, string> = {
  restaurant: "مطاعم عربية", supermarket: "سوبرماركت حلال",
  sweets: "حلويات شرقية", barber: "صالونات حلاقة",
  butcher: "جزار حلال", bakery: "مخابز",
  cafe: "مقاهي", clothing: "ملابس",
  electronics: "إلكترونيات", pharmacy: "صيدليات",
  halal_grocery: "بقالة حلال", shisha_lounge: "مقهى شيشة",
  travel_agency: "وكالة سفر", money_transfer: "تحويل أموال",
  mosque: "مسجد", cultural_center: "مركز ثقافي",
  car_dealer: "تاجر سيارات", repair_shop: "محل إصلاح",
  other: "أخرى",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
  claimed: "bg-purple-100 text-purple-700",
};

type Section = "dashboard" | "stores" | "jobs" | "claims" | "subscriptions" | "users";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) navigate("/admin");
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  };

  // Queries
  const { data: stats } = trpc.admin.stats.useQuery(undefined, { retry: false });
  const { data: merchantData, refetch: refetchMerchants } = trpc.admin.merchants.useQuery(
    { search: search || undefined, limit: 100 }, { retry: false });
  const { data: jobData, refetch: refetchJobs } = trpc.admin.jobs.useQuery(
    { search: search || undefined, limit: 100 }, { retry: false });
  const { data: claimsData } = trpc.claim.list.useQuery(
    { status: "pending" }, { retry: false });
  const { data: subscriptionsData } = trpc.subscription.list.useQuery(
    undefined, { retry: false });
  const { data: userData } = trpc.admin.users.useQuery(
    { limit: 100 }, { retry: false });

  // Mutations
  const deleteMerchant = trpc.admin.deleteMerchant.useMutation({ onSuccess: () => refetchMerchants() });
  const deleteJob = trpc.admin.deleteJob.useMutation({ onSuccess: () => refetchJobs() });
  const approveClaim = trpc.claim.approve.useMutation({});
  const rejectClaim = trpc.claim.reject.useMutation({});
  const cancelSubscription = trpc.subscription.cancel.useMutation({});

  const sidebarItems = [
    { id: "dashboard" as Section, label: "لوحة المعلومات", icon: LayoutDashboard },
    { id: "stores" as Section, label: "المتاجر", icon: Store, badge: stats?.pendingMerchants },
    { id: "jobs" as Section, label: "الوظائف", icon: Briefcase },
    { id: "claims" as Section, label: "طلبات المطالبة", icon: Hand, badge: claimsData?.length },
    { id: "subscriptions" as Section, label: "الاشتراكات", icon: CreditCard },
    { id: "users" as Section, label: "المستخدمين", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-72" : "w-16"} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-lg text-emerald-400">يورو عرب ماركت</h1>
              <p className="text-xs text-slate-400">لوحة التحكم</p>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  section === item.id ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}>
                <Icon className="h-5 w-5" />
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-medium flex-1 text-right">{item.label}</span>
                    {item.badge ? (
                      <Badge className="bg-red-500 text-white text-xs px-1.5">{item.badge}</Badge>
                    ) : null}
                  </>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-slate-800 transition-colors">
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="text-sm font-medium">تسجيل الخروج</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {sidebarItems.find((i) => i.id === section)?.label}
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pr-10 w-64" />
            </div>
            {section === "stores" && (
              <Button onClick={() => { setEditingItem(null); setShowForm(true); }}
                className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 ml-1" />إضافة متجر
              </Button>
            )}
          </div>
        </header>

        <div className="p-6">
          {/* ============ DASHBOARD ============ */}
          {section === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "المستخدمين", value: stats?.users || 0, icon: Users, color: "bg-blue-500", sub: "مستخدم نشط" },
                  { label: "المتاجر", value: stats?.merchants || 0, icon: Store, color: "bg-emerald-500", sub: `${stats?.pendingMerchants || 0} معلق` },
                  { label: "الوظائف", value: stats?.jobs || 0, icon: Briefcase, color: "bg-purple-500", sub: `${stats?.openJobs || 0} مفتوحة` },
                  { label: "طلبات المطالبة", value: claimsData?.length || 0, icon: Hand, color: "bg-amber-500", sub: "بانتظار الموافقة" },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.label} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-500">{stat.label}</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                            <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                          </div>
                          <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ STORES ============ */}
          {section === "stores" && (
            <div className="space-y-4">
              {showForm && (
                <MerchantForm onClose={() => { setShowForm(false); setEditingItem(null); }}
                  editingItem={editingItem} onSuccess={() => { refetchMerchants(); setShowForm(false); }} />
              )}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">المتجر</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">التصنيف</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">المدينة</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">الحالة</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600 w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {merchantData?.items.map((m: any) => (
                      <>
                        <tr key={m.id} className="hover:bg-slate-50 cursor-pointer"
                          onClick={() => setExpandedRow(expandedRow === m.id ? null : m.id)}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{m.businessNameAr || m.businessName}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="border-emerald-200 text-emerald-700 text-xs">
                              {categoryNamesAr[m.category] || m.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{m.city}</td>
                          <td className="px-4 py-3">
                            <Badge className={`${statusColors[m.status]} text-xs`}>
                              {m.status === "active" ? "نشط" : m.status === "pending" ? "معلق" : m.status === "claimed" ? "مطالب" : "موقوف"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600"
                                onClick={() => { setEditingItem(m); setShowForm(true); }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"
                                onClick={() => { if (confirm("هل أنت متأكد من الحذف؟")) deleteMerchant.mutate({ id: m.id }); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expandedRow === m.id && (
                          <tr className="bg-slate-50">
                            <td colSpan={5} className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                {m.description && <div><span className="text-slate-500">الوصف:</span> <span className="text-slate-800">{m.description}</span></div>}
                                {m.phone && <div className="flex items-center gap-1"><Phone className="h-4 w-4 text-slate-400" /><span>{m.phone}</span></div>}
                                {m.email && <div className="flex items-center gap-1"><Globe className="h-4 w-4 text-slate-400" /><span>{m.email}</span></div>}
                                {m.address && <div className="flex items-center gap-1"><MapPin className="h-4 w-4 text-slate-400" /><span>{m.address}</span></div>}
                                {m.website && <div className="flex items-center gap-1"><Globe className="h-4 w-4 text-blue-500" /><a href={m.website} target="_blank" rel="noopener noreferrer" className="text-blue-600">{m.website}</a></div>}
                                {m.facebookUrl && <div className="flex items-center gap-1"><Facebook className="h-4 w-4 text-blue-600" /><span>فيسبوك</span></div>}
                                {m.instagramUrl && <div className="flex items-center gap-1"><Instagram className="h-4 w-4 text-pink-500" /><span>انستغرام</span></div>}
                                {m.isFeatured && <Badge className="bg-yellow-100 text-yellow-700 w-fit"><Star className="h-3 w-3 mr-1" />مميز</Badge>}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
                {(!merchantData?.items || merchantData.items.length === 0) && (
                  <div className="text-center py-16 text-slate-400">
                    <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد متاجر حالياً</p>
                    <Button onClick={() => setShowForm(true)} variant="outline" className="mt-3">
                      <Plus className="h-4 w-4 ml-1" />أضف أول متجر
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ CLAIMS ============ */}
          {section === "claims" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">صاحب الطلب</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">رقم المتجر</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">الحالة</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">التاريخ</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600 w-32">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {claimsData?.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{c.fullName}</div>
                          <div className="text-xs text-slate-500">{c.email}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">#{c.merchantId}</td>
                        <td className="px-4 py-3">
                          <Badge className={c.status === "pending" ? "bg-amber-100 text-amber-700" :
                            c.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                            {c.status === "pending" ? "معلق" : c.status === "approved" ? "موافق" : "مرفوض"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("ar-SA") : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {c.status === "pending" && (
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="text-emerald-600 h-8"
                                onClick={() => approveClaim.mutate({ id: c.id, reviewedBy: 1 })}>
                                <CheckCircle className="h-4 w-4 ml-1" />موافقة
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 h-8"
                                onClick={() => {
                                  const reason = prompt("سبب الرفض:");
                                  if (reason) rejectClaim.mutate({ id: c.id, reviewedBy: 1, rejectionReason: reason });
                                }}>
                                <XCircle className="h-4 w-4 ml-1" />رفض
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!claimsData || claimsData.length === 0) && (
                  <div className="text-center py-16 text-slate-400">
                    <Hand className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد طلبات مطالبة</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ JOBS ============ */}
          {section === "jobs" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">الوظيفة</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">التصنيف</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">المدينة</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">الحالة</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600 w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobData?.items.map((j: any) => (
                      <tr key={j.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{j.titleAr || j.title}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">{j.category}</Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{j.city}</td>
                        <td className="px-4 py-3">
                          <Badge className={j.status === "open" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}>
                            {j.status === "open" ? "مفتوح" : "مغلق"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"
                            onClick={() => { if (confirm("هل أنت متأكد؟")) deleteJob.mutate({ id: j.id }); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!jobData?.items || jobData.items.length === 0) && (
                  <div className="text-center py-16 text-slate-400">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد وظائف</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ SUBSCRIPTIONS ============ */}
          {section === "subscriptions" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">رقم</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">الخطة</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">الحالة</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">السعر</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">ينتهي</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600 w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscriptionsData?.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">#{s.id}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={s.plan === "premium" ? "border-purple-200 text-purple-700" : s.plan === "featured" ? "border-yellow-200 text-yellow-700" : "border-blue-200 text-blue-700"}>
                            {s.plan === "basic" ? "أساسي" : s.plan === "premium" ? "مميز" : "VIP"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={s.status === "active" ? "bg-emerald-100 text-emerald-700" : s.status === "expired" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}>
                            {s.status === "active" ? "نشط" : s.status === "expired" ? "منتهي" : s.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">€{s.price}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString("ar-SA") : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {s.status === "active" && (
                            <Button variant="ghost" size="sm" className="text-red-600 h-8"
                              onClick={() => { if (confirm("إلغاء الاشتراك؟")) cancelSubscription.mutate({ id: s.id }); }}>
                              إلغاء
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!subscriptionsData || subscriptionsData.length === 0) && (
                  <div className="text-center py-16 text-slate-400">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد اشتراكات</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ USERS ============ */}
          {section === "users" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">المستخدم</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">الإيميل</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">الدور</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">التسجيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userData?.items.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 flex items-center gap-2">
                        {u.avatar ? <img src={u.avatar} alt="" className="w-8 h-8 rounded-full" /> :
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center"><Users className="h-4 w-4 text-slate-500" /></div>}
                        <span className="font-medium">{u.name || "بدون اسم"}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.email || "-"}</td>
                      <td className="px-4 py-3">
                        <Badge className={u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}>
                          {u.role === "admin" ? "أدمن" : "مستخدم"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("ar-SA") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== MERCHANT FORM (COMPLETE) ====================
function MerchantForm({ onClose, editingItem, onSuccess }: { onClose: () => void; editingItem: any; onSuccess: () => void }) {
  const [form, setForm] = useState({
    businessName: editingItem?.businessName || "",
    businessNameAr: editingItem?.businessNameAr || "",
    shortDescription: editingItem?.shortDescription || "",
    description: editingItem?.description || "",
    descriptionAr: editingItem?.descriptionAr || "",
    category: editingItem?.category || "restaurant",
    subcategory: editingItem?.subcategory || "",
    country: editingItem?.country || "",
    city: editingItem?.city || "",
    address: editingItem?.address || "",
    addressAr: editingItem?.addressAr || "",
    neighborhood: editingItem?.neighborhood || "",
    postalCode: editingItem?.postalCode || "",
    phone: editingItem?.phone || "",
    whatsapp: editingItem?.whatsapp || "",
    email: editingItem?.email || "",
    website: editingItem?.website || "",
    facebookUrl: editingItem?.facebookUrl || "",
    instagramUrl: editingItem?.instagramUrl || "",
    youtubeUrl: editingItem?.youtubeUrl || "",
    latitude: editingItem?.latitude || "",
    longitude: editingItem?.longitude || "",
    googleMapsUrl: editingItem?.googleMapsUrl || "",
    priceRange: editingItem?.priceRange || "$$",
    isFeatured: editingItem?.isFeatured || false,
    acceptsCash: editingItem?.acceptsCash ?? true,
    acceptsCard: editingItem?.acceptsCard || false,
    isOpen24Hours: editingItem?.isOpen24Hours || false,
    openingHours: editingItem?.openingHours || {},
    logo: editingItem?.logo || "",
    coverImage: editingItem?.coverImage || "",
    galleryImages: editingItem?.galleryImages || [],
    amenities: editingItem?.amenities || [],
    features: editingItem?.features || [],
    tags: editingItem?.tags || "",
    metaTitle: editingItem?.metaTitle || "",
    metaDescription: editingItem?.metaDescription || "",
  });

  const createMerchant = trpc.merchant.create.useMutation({ onSuccess });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMerchant.mutate(form);
  };

  const handleAmenityToggle = (amenity: string) => {
    const current = form.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a: string) => a !== amenity)
      : [...current, amenity];
    setForm({ ...form, amenities: updated });
  };

  const handleFeatureToggle = (feature: string) => {
    const current = form.features || [];
    const updated = current.includes(feature)
      ? current.filter((f: string) => f !== feature)
      : [...current, feature];
    setForm({ ...form, features: updated });
  };

  return (
    <Card className="border-emerald-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-emerald-50 rounded-t-lg">
        <CardTitle className="text-lg text-emerald-800">
          {editingItem ? "تعديل متجر" : "إضافة متجر جديد"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Basic Info */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />معلومات أساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم (عربي) *</label>
                <Input value={form.businessNameAr} onChange={(e) => setForm({ ...form, businessNameAr: e.target.value })} required
                  placeholder="مثال: مطعم الشام" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الاسم (إنجليزي)</label>
                <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="Al-Sham Restaurant" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">وصف مختصر</label>
                <Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="وصف قصير يظهر في نتائج البحث" maxLength={160} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف (عربي)</label>
                <textarea value={form.descriptionAr || ""} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-24 text-sm" placeholder="وصف تفصيلي بالعربية" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف (إنجليزي)</label>
                <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-24 text-sm" placeholder="Detailed description in English" />
              </div>
            </div>
          </div>

          {/* Section: Category & Pricing */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b flex items-center gap-2">
              <Store className="h-4 w-4 text-blue-500" />التصنيف والتسعير
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">التصنيف الرئيسي *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  {Object.entries(categoryNamesAr).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">التصنيف الفرعي</label>
                <Input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  placeholder="مثال: مطاعم سورية" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نطاق السعر</label>
                <select value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="$">$ - رخيص</option>
                  <option value="$$">$$ - متوسط</option>
                  <option value="$$$">$$$ - مرتفع</option>
                  <option value="$$$$">$$$$ - فاخر</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-500" />الموقع
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">الدولة *</label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required
                  placeholder="مثال: فرنسا" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">المدينة *</label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required
                  placeholder="مثال: باريس" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الحي</label>
                <Input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                  placeholder="مثال: الدائرة 10" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">العنوان (عربي)</label>
                <Input value={form.addressAr} onChange={(e) => setForm({ ...form, addressAr: e.target.value })}
                  placeholder="العنوان بالعربية" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">العنوان (إنجليزي)</label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Address in English" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الرمز البريدي</label>
                <Input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  placeholder="75001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">خط العرض (Latitude)</label>
                <Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  placeholder="48.8566" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">خط الطول (Longitude)</label>
                <Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  placeholder="2.3522" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">رابط Google Maps</label>
                <Input value={form.googleMapsUrl} onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/..." />
              </div>
            </div>
          </div>

          {/* Section: Contact & Social */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-500" />التواصل
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">الهاتف</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+33 1 23 45 67 89" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">واتساب</label>
                <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+33 6 12 34 56 78" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="info@restaurant.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الموقع الإلكتروني</label>
                <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://www.restaurant.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">فيسبوك</label>
                <Input value={form.facebookUrl} onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">انستغرام</label>
                <Input value={form.instagramUrl} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/..." />
              </div>
            </div>
          </div>

          {/* Section: Images */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b flex items-center gap-2">
              <Image className="h-4 w-4 text-purple-500" />الصور
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">رابط الشعار (Logo)</label>
                <Input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  placeholder="https://.../logo.png" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رابط صورة الغلاف (Cover)</label>
                <Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  placeholder="https://.../cover.jpg" />
              </div>
            </div>
          </div>

          {/* Section: Amenities */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b flex items-center gap-2">
              <Settings className="h-4 w-4 text-slate-500" />المرافق والخدمات
            </h3>
            <div className="flex flex-wrap gap-2">
              {["توصيل", "حجز طاولات", "دفع إلكتروني", "واي فاي", "موقف سيارات", "مكيف",
                "منطقة عائلات", "موسيقى حية", "تراس خارجي", "wheelchair accessible", "Halal certified",
                "Prayer room", "Private rooms", "Delivery apps"].map((amenity) => (
                <button key={amenity} type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    (form.amenities || []).includes(amenity)
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Features */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />المميزات
            </h3>
            <div className="flex flex-wrap gap-2">
              {["مسجل في Google Maps", "موثق", "مميز", "متجر شهير", "أفضل تقييمات",
                "عروض خاصة", "جديد", "مفتوح 24 ساعة"].map((feature) => (
                <button key={feature} type="button"
                  onClick={() => handleFeatureToggle(feature)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    (form.features || []).includes(feature)
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>
                  {feature}
                </button>
              ))}
            </div>
          </div>

          {/* Section: SEO */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-500" />SEO (تحسين محركات البحث)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">عنوان الصفحة (Meta Title)</label>
                <Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                  placeholder="مطعم الشام - أفضل مطعم سوري في باريس" maxLength={60} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">وصف الصفحة (Meta Description)</label>
                <Input value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  placeholder="وصف قصير يظهر في نتائج جوجل" maxLength={160} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">الكلمات المفتاحية (Tags)</label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="مطعم عربي, باريس, حلال, سوري, شاورما" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} size="lg">إلغاء</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" size="lg"
              disabled={createMerchant.isPending}>
              <Save className="h-5 w-5 ml-2" />
              {createMerchant.isPending ? "جاري الحفظ..." : (editingItem ? "حفظ التعديلات" : "إضافة المتجر")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
