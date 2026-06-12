import { useState } from "react";
import { Link } from "react-router";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Store, Eye, Phone, MapPin, Star, TrendingUp,
  Users, MessageSquare, Calendar, DollarSign,
  Edit, CheckCircle, AlertCircle, ChevronRight,
  Globe, Clock, Share2, BarChart3, Settings,
  Image, Mail, ExternalLink, ChevronLeft,
  Bookmark, Award, Zap, Shield,
} from "lucide-react";

// Mock data - will connect to API when user logs in
const mockStore = {
  id: 1,
  businessName: "مطعم الأعجمي",
  businessNameAr: "مطعم الأعجمي",
  category: "مطعم سوري",
  description: "مطعم سوري أصيل في قلب باريس يقدم أشهى المأكولات الشرقية",
  rating: "4.7",
  reviewCount: 156,
  status: "active",
  isVerified: true,
  claimedAt: "2024-01-15",
  plan: "premium",
  planExpiry: "2024-12-15",
  views: 2341,
  phoneViews: 189,
  messages: 45,
  bookmarks: 67,
  shareCount: 23,
  address: "3 Rue du Faubourg Montmartre, 75009 Paris",
  phone: "+33 1 42 46 04 38",
  email: "contact@alajami.fr",
  facebook: "https://facebook.com/alajamiparis",
  instagram: "https://instagram.com/alajami_paris",
  website: "",
  priceRange: "$$",
  openingHours: {
    saturday: "09:00 - 22:00",
    sunday: "09:00 - 22:00",
    monday: "09:00 - 22:00",
    tuesday: "09:00 - 22:00",
    wednesday: "09:00 - 22:00",
    thursday: "09:00 - 23:00",
    friday: "12:00 - 23:00",
  },
  images: ["", "", ""],
  tags: "مطعم سوري, باريس, حلال, مشاوي, شاورما",
};

const planDetails = {
  basic: {
    name: "أساسي",
    price: "€9",
    color: "bg-gray-100 text-gray-700",
    features: ["صفحة المتجر", "معلومات أساسية", "إحصائيات بسيطة"],
  },
  premium: {
    name: "مميز",
    price: "€19",
    color: "bg-emerald-100 text-emerald-700",
    features: ["كل شيء في الأساسي", "صور غير محدودة", "إحصائيات متقدمة", "أولوية في البحث"],
  },
  featured: {
    name: "VIP",
    price: "€39",
    color: "bg-amber-100 text-amber-700",
    features: ["كل شيء في المميز", "ظهور في الصفحة الرئيسية", "شعار VIP", "دعم مخصص"],
  },
};

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "edit" | "stats" | "settings">("overview");
  const [store, setStore] = useState(mockStore);
  const [editForm, setEditForm] = useState(mockStore);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setStore(editForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "overview" as const, label: "نظرة عامة", icon: BarChart3 },
    { id: "edit" as const, label: "تعديل المتجر", icon: Edit },
    { id: "stats" as const, label: "الإحصائيات", icon: TrendingUp },
    { id: "settings" as const, label: "الإعدادات", icon: Settings },
  ];

  const statsCards = [
    { label: "المشاهدات", value: store.views, icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "مشاهدات الهاتف", value: store.phoneViews, icon: Phone, color: "text-green-600", bg: "bg-green-50" },
    { label: "الرسائل", value: store.messages, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "الحفظ", value: store.bookmarks, icon: Bookmark, color: "text-pink-600", bg: "bg-pink-50" },
    { label: "المشاركات", value: store.shareCount, icon: Share2, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "التقييم", value: `${store.rating} ⭐`, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const plan = planDetails[store.plan as keyof typeof planDetails];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Store className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{store.businessNameAr}</h1>
                    {store.isVerified && (
                      <Badge className="bg-blue-500">
                        <Shield className="h-3 w-3 ml-1" />
                        موثق
                      </Badge>
                    )}
                  </div>
                  <p className="text-white/80 mt-1">{store.category} | {store.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/stores/${store.id}`}>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">
                    <ExternalLink className="h-4 w-4 ml-2" />
                    عرض الصفحة العامة
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Plan Banner */}
              <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-600">باقتك الحالية</p>
                        <div className="flex items-center gap-2">
                          <Badge className={plan.color}>
                            <Zap className="h-3 w-3 ml-1" />
                            {plan.name}
                          </Badge>
                          <span className="text-sm text-gray-500">{plan.price}/شهر</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">تنتهي في</p>
                      <p className="font-medium text-amber-700">{store.planExpiry}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statsCards.map((stat, i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Edit className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">تعديل المعلومات</p>
                      <p className="text-sm text-gray-500">تحديث بيانات المتجر</p>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-gray-400 mr-auto" />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Image className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">إضافة صور</p>
                      <p className="text-sm text-gray-500">رفع صور جديدة للمعرض</p>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-gray-400 mr-auto" />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">الإحصائيات</p>
                      <p className="text-sm text-gray-500">تحليل الأداء</p>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-gray-400 mr-auto" />
                  </CardContent>
                </Card>
              </div>

              {/* Store Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معاينة المتجر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {store.tags.split(",").map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed">{store.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-emerald-500" />
                      {store.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4 text-emerald-500" />
                      {store.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      {store.address}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="h-4 w-4 text-emerald-500" />
                      {store.facebook ? "متصل" : "غير متصل"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* EDIT TAB */}
          {activeTab === "edit" && (
            <div className="space-y-6">
              {saved && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  تم حفظ التغييرات بنجاح!
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>معلومات المتجر الأساسية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">اسم المتجر (عربي)</label>
                      <Input
                        value={editForm.businessNameAr}
                        onChange={(e) => setEditForm({ ...editForm, businessNameAr: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">اسم المتجر (إنجليزي)</label>
                      <Input
                        value={editForm.businessName}
                        onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">وصف المتجر</label>
                    <Textarea
                      rows={4}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">التصنيفات (مفصولة بفاصلة)</label>
                    <Input
                      value={editForm.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معلومات التواصل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">الهاتف</label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                      <Input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان</label>
                      <Input
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">الموقع الإلكتروني</label>
                      <Input
                        value={editForm.website}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        placeholder="https://"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>وسائل التواصل الاجتماعي</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">فيسبوك</label>
                      <Input
                        value={editForm.facebook}
                        onChange={(e) => setEditForm({ ...editForm, facebook: e.target.value })}
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">إنستغرام</label>
                      <Input
                        value={editForm.instagram}
                        onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 px-8">
                  <CheckCircle className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </Button>
                <Button variant="outline" onClick={() => setEditForm(store)}>
                  إلغاء
                </Button>
              </div>
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">المشاهدات الشهرية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 bg-gray-50 rounded-lg flex items-end justify-center gap-2 p-4">
                      {[35, 45, 30, 55, 65, 50, 70, 60, 80, 75, 85, 90].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                          style={{ height: `${h}%` }}
                          title={`${h * 20} مشاهدة`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>يناير</span><span>فبراير</span><span>مارس</span>
                      <span>أبريل</span><span>مايو</span><span>يونيو</span>
                      <span>يوليو</span><span>أغسطس</span><span>سبتمبر</span>
                      <span>أكتوبر</span><span>نوفمبر</span><span>ديسمبر</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">مصادر الزيارات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { source: "بحث Google", percent: 45, color: "bg-blue-500" },
                      { source: "موقع سندباد", percent: 30, color: "bg-emerald-500" },
                      { source: "فيسبوك", percent: 15, color: "bg-blue-700" },
                      { source: "إنستغرام", percent: 10, color: "bg-pink-500" },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.source}</span>
                          <span className="font-medium">{item.percent}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">أحدث النشاطات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { action: "مشاهدة الصفحة", detail: "من باريس", time: "منذ 5 دقائق", icon: Eye },
                      { action: "اتصال هاتفي", detail: "+33 6 XX XX XX", time: "منذ 15 دقيقة", icon: Phone },
                      { action: "حفظ في المفضلة", detail: "مستخدم جديد", time: "منذ ساعة", icon: Bookmark },
                      { action: "مشاركة الصفحة", detail: "عبر واتساب", time: "منذ 3 ساعات", icon: Share2 },
                      { action: "رسالة جديدة", detail: "استفسار عن أوقات العمل", time: "منذ 5 ساعات", icon: MessageSquare },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center gap-3 py-3 border-b last:border-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <activity.icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.detail}</p>
                        </div>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>الباقة والاشتراك</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(Object.keys(planDetails) as Array<keyof typeof planDetails>).map((key) => {
                      const p = planDetails[key];
                      const isCurrent = store.plan === key;
                      return (
                        <div
                          key={key}
                          className={`border-2 rounded-xl p-6 ${
                            isCurrent ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <Badge className={p.color}>{p.name}</Badge>
                            {isCurrent && (
                              <Badge className="bg-emerald-500">الحالية</Badge>
                            )}
                          </div>
                          <p className="text-3xl font-bold mb-4">
                            {p.price}<span className="text-sm font-normal text-gray-500">/شهر</span>
                          </p>
                          <ul className="space-y-2 text-sm">
                            {p.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          {!isCurrent && (
                            <Button className="w-full mt-4" variant="outline">
                              الترقية
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">منطقة الخطر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">نقل ملكية المتجر</p>
                      <p className="text-sm text-gray-500">نقل الملكية لمستخدم آخر</p>
                    </div>
                    <Button variant="outline">نقل</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                    <div>
                      <p className="font-medium text-red-600">حذف المتجر</p>
                      <p className="text-sm text-gray-500">هذا الإجراء لا يمكن التراجع عنه</p>
                    </div>
                    <Button variant="destructive">حذف</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
