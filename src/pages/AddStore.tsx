import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Store,
  ArrowLeft,
  CheckCircle,
  Send,
  Globe,
  MapPin,
  Phone,
  User,
  FileText,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  { value: "restaurant", label: "مطعم عربي" },
  { value: "supermarket", label: "سوبرماركت حلال" },
  { value: "barber", label: "صالون حلاقة" },
  { value: "butcher", label: "جزار حلال" },
  { value: "sweets", label: "حلويات شرقية" },
  { value: "bakery", label: "مخبز" },
  { value: "cafe", label: "مقهى" },
  { value: "shisha_lounge", label: "مقهى شيشة" },
  { value: "pharmacy", label: "صيدلية" },
  { value: "clothing", label: "ملابس" },
  { value: "mosque", label: "مسجد" },
  { value: "cultural_center", label: "مركز ثقافي" },
  { value: "travel_agency", label: "وكالة سفر" },
  { value: "money_transfer", label: "تحويل أموال" },
  { value: "other", label: "أخرى" },
];

export default function AddStore() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    businessNameAr: "",
    businessName: "",
    category: "restaurant",
    description: "",
    country: "",
    city: "",
    address: "",
    phone: "",
    whatsapp: "",
    email: "",
    contactName: "",
  });

  const submitRequest = trpc.merchant.submitRequest.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRequest.mutate(form);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <nav className="flex items-center px-6 py-4 border-b">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-emerald-600">
            <ArrowLeft className="h-4 w-4" />
            <Globe className="h-5 w-5 text-emerald-500" />
            <span className="font-bold">سندباد</span>
          </Link>
        </nav>

        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            تم استلام طلبك!
          </h2>
          <p className="text-gray-600 mb-2">
            فريقنا سيراجع معلومات متجرك ويضيفه خلال 24-48 ساعة
          </p>
          <p className="text-gray-500 text-sm mb-8">
            سنتواصل معك عبر الإيميل أو الهاتف للتأكيد
          </p>
          <Link to="/">
            <Button className="bg-emerald-500 hover:bg-emerald-600 rounded-full px-8">
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Top Bar */}
      <nav className="flex items-center px-6 py-4 border-b">
        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-emerald-600">
          <ArrowLeft className="h-4 w-4" />
          <Globe className="h-5 w-5 text-emerald-500" />
          <span className="font-bold">سندباد</span>
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Store className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            أضف متجرك
          </h1>
          <p className="text-gray-500">
            انضم لأكبر دليل عربي في أوروبا — مجاناً
          </p>
        </div>

        <Card>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Store Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Store className="h-4 w-4 text-emerald-500" />
                  اسم المتجر (عربي) *
                </label>
                <Input
                  required
                  value={form.businessNameAr}
                  onChange={(e) => setForm({ ...form, businessNameAr: e.target.value })}
                  placeholder="مثال: مطعم الشام"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  اسم المتجر (إنجليزي)
                </label>
                <Input
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="Al-Sham Restaurant"
                  dir="ltr"
                />
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Tag className="h-4 w-4 text-emerald-500" />
                  التصنيف *
                </label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 bg-white text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  وصف قصير *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="صف متجرك بجملتين..."
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    الدولة *
                  </label>
                  <Input
                    required
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="مثال: فرنسا"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    المدينة *
                  </label>
                  <Input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="مثال: باريس"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  العنوان
                </label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="العنوان الكامل"
                />
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Phone className="h-4 w-4 text-emerald-500" />
                    الهاتف
                  </label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+33 1 23 45 67 89"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    واتساب
                  </label>
                  <Input
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  البريد الإلكتروني *
                </label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="info@yourstore.com"
                  dir="ltr"
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <User className="h-4 w-4 text-emerald-500" />
                  اسم مقدم الطلب
                </label>
                <Input
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="اسمك"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-full py-6 text-lg"
                disabled={submitRequest.isPending}
              >
                <Send className="h-5 w-5 ml-2" />
                {submitRequest.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                بإرسال هذا النموذج، أؤكد أنني صاحب هذا المتجر أو مفوض منه
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <Store className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-sm">مجاني</p>
            <p className="text-xs text-gray-500">لا يوجد أي رسوم للإضافة</p>
          </div>
          <div className="text-center p-4">
            <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-sm">موثوق</p>
            <p className="text-xs text-gray-500">نتحقق من كل متجر قبل النشر</p>
          </div>
          <div className="text-center p-4">
            <Globe className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-sm">وصول عالمي</p>
            <p className="text-xs text-gray-500">وصل لملايين العرب في أوروبا</p>
          </div>
        </div>
      </div>
    </div>
  );
}
