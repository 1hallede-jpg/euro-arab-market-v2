import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Logo from "@/components/Logo";
import { Upload, Send, CheckCircle, AlertCircle, Building2, Phone, Mail, Globe, MapPin, FileText, Camera } from "lucide-react";

const categories = [
  "restaurant", "supermarket", "sweets", "barber", "butcher",
  "bakery", "cafe", "clothing", "electronics", "pharmacy",
  "halal_grocery", "shisha_lounge", "travel_agency", "money_transfer",
  "mosque", "cultural_center", "car_dealer", "repair_shop", "other",
];

const categoryNamesAr: Record<string, string> = {
  restaurant: "مطعم عربية", supermarket: "سوبرماركت حلال", sweets: "حلويات شرقية",
  barber: "صالون حلاقة", butcher: "جزار حلال", bakery: "مخبز عربي",
  cafe: "مقهى عربي", clothing: "ملابس عربية", electronics: "إلكترونيات",
  pharmacy: "صيدلية", halal_grocery: "بقالة حلال", shisha_lounge: "مقهى شيشة",
  travel_agency: "وكالة سفر", money_transfer: "تحويل أموال", mosque: "مسجد",
  cultural_center: "مركز ثقافي", car_dealer: "وكالة سيارات", repair_shop: "ورشة إصلاح", other: "أخرى",
};

const cities = [
  { en: "Paris", ar: "باريس" }, { en: "London", ar: "لندن" },
  { en: "Berlin", ar: "برلين" }, { en: "Madrid", ar: "مدريد" },
  { en: "Rome", ar: "روما" }, { en: "Barcelona", ar: "برشلونة" },
  { en: "Milan", ar: "ميلان" }, { en: "Amsterdam", ar: "أمستردام" },
  { en: "Brussels", ar: "بروكسل" }, { en: "Vienna", ar: "فيينا" },
  { en: "Zurich", ar: "زيورخ" }, { en: "Copenhagen", ar: "كوبنهاغن" },
  { en: "Stockholm", ar: "ستوكهولم" }, { en: "Athens", ar: "أثينا" },
  { en: "Budapest", ar: "بودابست" }, { en: "Oslo", ar: "أوسلو" },
  { en: "Lisbon", ar: "لشبونة" }, { en: "Dublin", ar: "دبلن" },
  { en: "Prague", ar: "براغ" }, { en: "Helsinki", ar: "هلسنكي" },
];

const countries: Record<string, string> = {
  Paris: "France", London: "UK", Berlin: "Germany", Madrid: "Spain",
  Rome: "Italy", Barcelona: "Spain", Milan: "Italy", Amsterdam: "Netherlands",
  Brussels: "Belgium", Vienna: "Austria", Zurich: "Switzerland",
  Copenhagen: "Denmark", Stockholm: "Sweden", Athens: "Greece",
  Budapest: "Hungary", Oslo: "Norway", Lisbon: "Portugal",
  Dublin: "Ireland", Prague: "Czech Republic", Helsinki: "Finland",
};

// Convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MerchantRegister() {
  const [form, setForm] = useState({
    businessName: "", businessNameAr: "", category: "restaurant",
    subcategory: "", description: "", descriptionAr: "",
    phone: "", email: "", website: "", city: "Paris", address: "",
    businessRegistrationPhoto: "", ownerIdPhoto: "",
    halalCertificate: "", logo: "",
  });
  const [files, setFiles] = useState({
    businessReg: null as File | null,
    ownerId: null as File | null,
    halalCert: null as File | null,
    logo: null as File | null,
  });
  const [filePreview, setFilePreview] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.pendingMerchant.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setFiles((prev) => ({ ...prev, [field]: file }));
    // Convert to base64 preview
    try {
      const base64 = await fileToBase64(file);
      setFilePreview((prev) => ({ ...prev, [field]: base64 }));
      setForm((prev) => ({ ...prev, [field === "businessReg" ? "businessRegistrationPhoto" : field === "ownerId" ? "ownerIdPhoto" : field === "halalCert" ? "halalCertificate" : "logo"]: base64 }));
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName || !form.phone || !form.email) return;
    submitMutation.mutate({
      ...form,
      country: countries[form.city] || "",
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ background: "#0a1628" }} dir="rtl">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center p-8 max-w-lg w-full">
            <CheckCircle className="h-20 w-20 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">تم إرسال طلبك بنجاح!</h2>
            <p className="text-gray-300 mb-2">Your store registration has been submitted!</p>

            {/* Payment Section */}
            <div className="bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 border border-[#c9a227]/40 rounded-2xl p-6 mt-6 mb-6 text-right">
              <div className="text-center mb-4">
                <h3 className="text-[#c9a227] font-bold text-lg mb-1">✨ اشترك الآن وظهر للجميع</h3>
                <p className="text-white/60 text-sm">اشتراك شهري بـ <strong className="text-[#c9a227]">5 يورو فقط</strong></p>
              </div>
              <div className="bg-[#0a1628]/50 rounded-xl p-4 mb-4 text-right">
                <h4 className="text-white font-bold text-sm mb-3">📋 مميزات الاشتراك:</h4>
                <ul className="space-y-2 text-white/70 text-xs">
                  <li className="flex items-start gap-2"><span className="text-[#c9a227] shrink-0">⭐</span><span>ضمان ظهور متجرك في <strong className="text-white">بداية نتائج البحث</strong></span></li>
                  <li className="flex items-start gap-2"><span className="text-[#c9a227] shrink-0">🔗</span><span>حصل على <strong className="text-white">رابط خاص بمتجرك</strong></span></li>
                  <li className="flex items-start gap-2"><span className="text-[#c9a227] shrink-0">📞</span><span>عرض <strong className="text-white">رقم الهاتف والبريد</strong> بشكل واضح</span></li>
                  <li className="flex items-start gap-2"><span className="text-[#c9a227] shrink-0">🏆</span><span>شارة <strong className="text-white">"موثق"</strong></span></li>
                  <li className="flex items-start gap-2"><span className="text-[#c9a227] shrink-0">🌐</span><span>الظهور في <strong className="text-white">نتائج Google</strong></span></li>
                  <li className="flex items-start gap-2"><span className="text-[#c9a227] shrink-0">📊</span><span>إحصائيات <strong className="text-white">المشاهدات والاتصالات</strong></span></li>
                </ul>
              </div>
              <a href="https://buy.stripe.com/aFa14n4hw9DbboY1pW6EU01" target="_blank" rel="noopener noreferrer"
                className="block w-full py-4 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e8b923] text-[#0a1628] font-bold text-lg hover:shadow-lg hover:shadow-[#c9a227]/30 transition text-center mb-3">
                💳 ادفع الاشتراك الآن — 5€/شهر
              </a>
              <p className="text-white/40 text-xs text-center">يتم تجديد الاشتراك تلقائياً شهرياً • يمكنك الإلغاء في أي وقت</p>
            </div>

            <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">سيتم مراجعة طلبك من قبل فريق الإدارة خلال 24-48 ساعة.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/" className="px-6 py-3 rounded-full bg-[#c9a227] text-[#0a1628] font-bold hover:bg-[#e8b923] transition">العودة للرئيسية</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2744 100%)" }} dir="rtl">
      <div className="border-b border-white/10 bg-[#0a1628]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <Link to="/" className="text-sm text-white/60 hover:text-white transition">← العودة</Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#c9a227]/20 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-[#c9a227]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">سجّل متجرك</h1>
          <p className="text-gray-400">Register Your Store</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-full px-4 py-1.5">
            <span className="text-[#c9a227] text-sm font-medium">5 يورو/شهر — اشتراك مميز</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-2">اسم المتجر (عربي) *</label>
              <input type="text" value={form.businessNameAr} onChange={(e) => handleChange("businessNameAr", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                placeholder="مثال: سوبرماركت الأمل" required />
            </div>
            <div>
              <label className="block text-white text-sm mb-2">Store Name (English) *</label>
              <input type="text" value={form.businessName} onChange={(e) => handleChange("businessName", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                placeholder="e.g. Al-Amal Supermarket" required />
            </div>
          </div>

          {/* Category + City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-2">التصنيف *</label>
              <select value={form.category} onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-[#c9a227] focus:outline-none transition">
                {categories.map((c) => (<option key={c} value={c} className="bg-[#1a2744]">{categoryNamesAr[c]}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-white text-sm mb-2">المدينة *</label>
              <select value={form.city} onChange={(e) => handleChange("city", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-[#c9a227] focus:outline-none transition">
                {cities.map((c) => (<option key={c.en} value={c.en} className="bg-[#1a2744]">{c.ar} ({c.en})</option>))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-white text-sm mb-2"><MapPin className="h-4 w-4 inline ml-1" /> العنوان الكامل</label>
            <input type="text" value={form.address} onChange={(e) => handleChange("address", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
              placeholder="الشارع، الرمز البريدي، المدينة" />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-2"><Phone className="h-4 w-4 inline ml-1" /> الهاتف *</label>
              <input type="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                placeholder="+33 1 23 45 67 89" required />
            </div>
            <div>
              <label className="block text-white text-sm mb-2"><Mail className="h-4 w-4 inline ml-1" /> البريد الإلكتروني *</label>
              <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                placeholder="info@example.com" required />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-white text-sm mb-2"><Globe className="h-4 w-4 inline ml-1" /> الموقع الإلكتروني (اختياري)</label>
            <input type="url" value={form.website} onChange={(e) => handleChange("website", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
              placeholder="https://example.com" />
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-2"><FileText className="h-4 w-4 inline ml-1" /> الوصف (عربي)</label>
              <textarea value={form.descriptionAr} onChange={(e) => handleChange("descriptionAr", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition h-24 resize-none"
                placeholder="وصف قصير للمتجر..." />
            </div>
            <div>
              <label className="block text-white text-sm mb-2">Description (English)</label>
              <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition h-24 resize-none"
                placeholder="Short description..." />
            </div>
          </div>

          {/* ─── WORKING Document Uploads ─── */}
          <div className="border border-[#c9a227]/30 rounded-xl p-5 bg-[#c9a227]/5">
            <h3 className="text-[#c9a227] font-bold text-sm mb-4 flex items-center gap-2"><Upload className="h-4 w-4" /> 📎 المستندات المطلوبة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Registration */}
              <label className="relative border border-dashed border-white/20 rounded-lg p-4 text-center hover:border-[#c9a227]/50 transition cursor-pointer block overflow-hidden">
                <input type="file" accept="image/*,.pdf" className="sr-only"
                  onChange={(e) => handleFileSelect("businessReg", e)} />
                {filePreview.businessReg ? (
                  <div className="relative">
                    <img src={filePreview.businessReg} alt="Business Reg" className="w-full h-24 object-contain rounded" />
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center rounded">
                      <CheckCircle className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-emerald-400 text-xs mt-1">{files.businessReg?.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera className="h-6 w-6 text-white/40 mb-2" />
                    <p className="text-white text-xs font-medium">صورة السجل التجاري</p>
                    <p className="text-white/40 text-[10px]">Business Registration</p>
                    <span className="mt-2 text-[#c9a227] text-[10px] border border-[#c9a227]/30 rounded-full px-3 py-0.5">اضغط لاختيار الملف</span>
                  </div>
                )}
              </label>
              {/* Owner ID */}
              <label className="relative border border-dashed border-white/20 rounded-lg p-4 text-center hover:border-[#c9a227]/50 transition cursor-pointer block overflow-hidden">
                <input type="file" accept="image/*,.pdf" className="sr-only"
                  onChange={(e) => handleFileSelect("ownerId", e)} />
                {filePreview.ownerId ? (
                  <div className="relative">
                    <img src={filePreview.ownerId} alt="Owner ID" className="w-full h-24 object-contain rounded" />
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center rounded">
                      <CheckCircle className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-emerald-400 text-xs mt-1">{files.ownerId?.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera className="h-6 w-6 text-white/40 mb-2" />
                    <p className="text-white text-xs font-medium">صورة هوية المالك</p>
                    <p className="text-white/40 text-[10px]">Owner ID</p>
                    <span className="mt-2 text-[#c9a227] text-[10px] border border-[#c9a227]/30 rounded-full px-3 py-0.5">اضغط لاختيار الملف</span>
                  </div>
                )}
              </label>
              {/* Halal Certificate */}
              <label className="relative border border-dashed border-white/20 rounded-lg p-4 text-center hover:border-[#c9a227]/50 transition cursor-pointer block overflow-hidden">
                <input type="file" accept="image/*,.pdf" className="sr-only"
                  onChange={(e) => handleFileSelect("halalCert", e)} />
                {filePreview.halalCert ? (
                  <div className="relative">
                    <img src={filePreview.halalCert} alt="Halal" className="w-full h-24 object-contain rounded" />
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center rounded">
                      <CheckCircle className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-emerald-400 text-xs mt-1">{files.halalCert?.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera className="h-6 w-6 text-white/40 mb-2" />
                    <p className="text-white text-xs font-medium">شهادة الحلال (اختياري)</p>
                    <p className="text-white/40 text-[10px]">Halal Certificate</p>
                    <span className="mt-2 text-[#c9a227] text-[10px] border border-[#c9a227]/30 rounded-full px-3 py-0.5">اضغط لاختيار الملف</span>
                  </div>
                )}
              </label>
              {/* Logo */}
              <label className="relative border border-dashed border-white/20 rounded-lg p-4 text-center hover:border-[#c9a227]/50 transition cursor-pointer block overflow-hidden">
                <input type="file" accept="image/*" className="sr-only"
                  onChange={(e) => handleFileSelect("logo", e)} />
                {filePreview.logo ? (
                  <div className="relative">
                    <img src={filePreview.logo} alt="Logo" className="w-full h-24 object-contain rounded" />
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center rounded">
                      <CheckCircle className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-emerald-400 text-xs mt-1">{files.logo?.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera className="h-6 w-6 text-white/40 mb-2" />
                    <p className="text-white text-xs font-medium">شعار المتجر</p>
                    <p className="text-white/40 text-[10px]">Store Logo</p>
                    <span className="mt-2 text-[#c9a227] text-[10px] border border-[#c9a227]/30 rounded-full px-3 py-0.5">اضغط لاختيار الملف</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitMutation.isPending}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e8b923] text-[#0a1628] font-bold text-lg hover:shadow-lg hover:shadow-[#c9a227]/30 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {submitMutation.isPending ? (
              <><div className="animate-spin h-5 w-5 border-2 border-[#0a1628] border-t-transparent rounded-full" />جاري الإرسال...</>
            ) : (<><Send className="h-5 w-5" />تقديم الطلب</>)}
          </button>

          {submitMutation.isError && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-xl p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />حدث خطأ. يرجى المحاولة مرة أخرى.
            </div>
          )}
        </form>

        <p className="text-center text-white/30 text-xs mt-6 mb-12">بعد الموافقة، سيتم إرسال رابط الدفع إلى بريدك الإلكتروني<br/>After approval, a payment link will be sent to your email</p>
      </div>
    </div>
  );
}
