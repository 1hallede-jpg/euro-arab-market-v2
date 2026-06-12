import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Logo from "@/components/Logo";
import {
  Upload, Send, CheckCircle, AlertCircle, Wrench, Phone, Mail, MapPin,
  FileText, Briefcase, Star, Euro, Clock, Globe, Award, Camera,
} from "lucide-react";

const categories = [
  "cooking", "driving", "photography", "painting", "plumbing",
  "electrician", "carpentry", "cleaning", "it", "translation",
  "accounting", "medical", "education", "construction", "other",
];

const categoryNamesAr: Record<string, string> = {
  cooking: "طبخ", driving: "سياقة", photography: "تصوير", painting: "دهان",
  plumbing: "سباكة", electrician: "كهرباء", carpentry: "نجارة",
  cleaning: "تنظيف", it: "تقنية معلومات", translation: "ترجمة",
  accounting: "محاسبة", medical: "تمريض/طب", education: "تعليم",
  construction: "بناء", other: "أخرى",
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

export default function SkillRegister() {
  const [form, setForm] = useState({
    fullName: "", fullNameAr: "", serviceType: "", serviceTypeAr: "",
    category: "cooking", subcategory: "", description: "", descriptionAr: "",
    yearsOfExperience: 0, phone: "", email: "", whatsapp: "",
    city: "Paris", address: "", hourlyRate: 0, fixedPrice: 0,
    businessRegistrationPhoto: "", experienceCertificate: "",
  });
  const [files, setFiles] = useState({
    businessReg: null as File | null,
    experienceCert: null as File | null,
    portfolio: [] as File[],
    profilePhoto: null as File | null,
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.skills.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.serviceType || !form.phone || !form.email) return;

    // Convert files to base64 for sending
    const submitData = {
      ...form,
      country: countries[form.city] || "",
      businessRegistrationPhoto: files.businessReg ? `[FILE: ${files.businessReg.name}]` : undefined,
      experienceCertificate: files.experienceCert ? `[FILE: ${files.experienceCert.name}]` : undefined,
    };

    submitMutation.mutate(submitData);
  };

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ background: "#0a1628" }} dir="rtl">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 max-w-md">
            <CheckCircle className="h-20 w-20 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">تم إرسال طلبك بنجاح!</h2>
            <p className="text-gray-300 mb-2">Your skill registration has been submitted!</p>
            <div className="bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-xl p-4 mt-6 mb-6">
              <h3 className="text-[#c9a227] font-bold mb-2">💳 الاشتراك</h3>
              <p className="text-white/70 text-sm">
                رسوم الاشتراك <strong className="text-[#c9a227]">5 يورو/شهر</strong><br/>
                سيتم إرسال رابط الدفع بعد مراجعة طلبك
              </p>
            </div>
            <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
              سيتم مراجعة طلبك من قبل فريق الإدارة خلال 24-48 ساعة. ستتلقى إشعاراً بالبريد الإلكتروني بمجرد الموافقة.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/" className="px-6 py-3 rounded-full bg-[#c9a227] text-[#0a1628] font-bold hover:bg-[#e8b923] transition">
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2744 100%)" }} dir="rtl">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a1628]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <Link to="/" className="text-sm text-white/60 hover:text-white transition">← العودة</Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#c9a227]/20 flex items-center justify-center mx-auto mb-4">
            <Wrench className="h-8 w-8 text-[#c9a227]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">أضف مهارتك</h1>
          <p className="text-gray-400">Register Your Skill / Service</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-full px-4 py-1.5">
            <Euro className="h-4 w-4 text-[#c9a227]" />
            <span className="text-[#c9a227] text-sm font-medium">5 يورو/شهر فقط</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-[#c9a227] font-bold text-sm mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> المعلومات الشخصية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm mb-2">الاسم الكامل (عربي) *</label>
                <input type="text" value={form.fullNameAr}
                  onChange={(e) => handleChange("fullNameAr", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                  placeholder="مثال: أحمد محمد" required />
              </div>
              <div>
                <label className="block text-white text-sm mb-2">Full Name (English) *</label>
                <input type="text" value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                  placeholder="e.g. Ahmad Muhammad" required />
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-[#c9a227] font-bold text-sm mb-4 flex items-center gap-2">
              <Wrench className="h-4 w-4" /> معلومات الخدمة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-white text-sm mb-2">نوع الخدمة (عربي) *</label>
                <input type="text" value={form.serviceTypeAr}
                  onChange={(e) => handleChange("serviceTypeAr", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                  placeholder="مثال: شيف سوري" required />
              </div>
              <div>
                <label className="block text-white text-sm mb-2">Service Type (English) *</label>
                <input type="text" value={form.serviceType}
                  onChange={(e) => handleChange("serviceType", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                  placeholder="e.g. Syrian Chef" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white text-sm mb-2">التصنيف *</label>
                <select value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-[#c9a227] focus:outline-none transition">
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[#1a2744]">{categoryNamesAr[c]} ({c})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white text-sm mb-2">التخصص الفرعي</label>
                <input type="text" value={form.subcategory}
                  onChange={(e) => handleChange("subcategory", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                  placeholder="مثال: طبخ شرقي" />
              </div>
              <div>
                <label className="block text-white text-sm mb-2">
                  <Clock className="h-4 w-4 inline ml-1" />
                  سنوات الخبرة
                </label>
                <input type="number" min={0} max={50} value={form.yearsOfExperience}
                  onChange={(e) => handleChange("yearsOfExperience", parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                  placeholder="0" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-2">
                <MapPin className="h-4 w-4 inline ml-1" />
                المدينة *
              </label>
              <select value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-[#c9a227] focus:outline-none transition">
                {cities.map((c) => (
                  <option key={c.en} value={c.en} className="bg-[#1a2744]">{c.ar} ({c.en})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white text-sm mb-2">العنوان</label>
              <input type="text" value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                placeholder="الشارع، الحي" />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-[#c9a227] font-bold text-sm mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4" /> معلومات التواصل
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white text-sm mb-2">الهاتف *</label>
                <input type="tel" value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                  placeholder="+33 6 12 34 56 78" required />
              </div>
              <div>
                <label className="block text-white text-sm mb-2">
                  <Mail className="h-4 w-4 inline ml-1" />
                  البريد الإلكتروني *
                </label>
                <input type="email" value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                  placeholder="info@example.com" required />
              </div>
              <div>
                <label className="block text-white text-sm mb-2">واتساب</label>
                <input type="tel" value={form.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                  placeholder="+33 6 12 34 56 78" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#c9a227]/5 border border-[#c9a227]/20 rounded-xl p-5">
            <h3 className="text-[#c9a227] font-bold text-sm mb-4 flex items-center gap-2">
              <Euro className="h-4 w-4" /> التسعير (اختياري)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">السعر بالساعة (€)</label>
                <input type="number" min={0} step={0.5}
                  value={form.hourlyRate || ""}
                  onChange={(e) => handleChange("hourlyRate", parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                  placeholder="25" />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">سعر ثابت للخدمة (€)</label>
                <input type="number" min={0} step={0.5}
                  value={form.fixedPrice || ""}
                  onChange={(e) => handleChange("fixedPrice", parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition"
                  placeholder="100" />
              </div>
            </div>
            <p className="text-[#c9a227]/60 text-xs mt-3">
              ⭐ بمجرد الاشتراك (5€/شهر)، سيظهر إعلانك مميزاً في المدينة التي اخترتها
            </p>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-2">
                <FileText className="h-4 w-4 inline ml-1" />
                وصف الخدمة (عربي)
              </label>
              <textarea value={form.descriptionAr}
                onChange={(e) => handleChange("descriptionAr", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition h-28 resize-none"
                placeholder="اشرح خدمتك بالتفصيل..." />
            </div>
            <div>
              <label className="block text-white text-sm mb-2">Service Description (English)</label>
              <textarea value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a227] focus:outline-none transition h-28 resize-none"
                placeholder="Describe your service in detail..." />
            </div>
          </div>

          {/* Document Uploads */}
          <div className="border border-[#c9a227]/30 rounded-xl p-5 bg-[#c9a227]/5">
            <h3 className="text-[#c9a227] font-bold text-sm mb-4 flex items-center gap-2">
              <Upload className="h-4 w-4" /> 📎 المستندات المطلوبة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Registration */}
              <label className="border border-dashed border-white/20 rounded-lg p-4 text-center hover:border-[#c9a227]/50 transition cursor-pointer block">
                <input type="file" accept="image/*,.pdf" className="hidden"
                  onChange={(e) => handleFileChange("businessReg", e)} />
                {files.businessReg ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-400 text-xs">{files.businessReg.name}</p>
                  </>
                ) : (
                  <>
                    <Camera className="h-6 w-6 text-white/40 mx-auto mb-2" />
                    <p className="text-white text-xs">صورة السجل التجاري</p>
                    <p className="text-white/40 text-[10px]">Business Registration Photo</p>
                  </>
                )}
              </label>
              {/* Experience Certificate */}
              <label className="border border-dashed border-white/20 rounded-lg p-4 text-center hover:border-[#c9a227]/50 transition cursor-pointer block">
                <input type="file" accept="image/*,.pdf" className="hidden"
                  onChange={(e) => handleFileChange("experienceCert", e)} />
                {files.experienceCert ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-400 text-xs">{files.experienceCert.name}</p>
                  </>
                ) : (
                  <>
                    <Award className="h-6 w-6 text-white/40 mx-auto mb-2" />
                    <p className="text-white text-xs">شهادة ممارسة الخبرة</p>
                    <p className="text-white/40 text-[10px]">Experience Certificate</p>
                  </>
                )}
              </label>
              {/* Portfolio Photos */}
              <label className="border border-dashed border-white/20 rounded-lg p-4 text-center hover:border-[#c9a227]/50 transition cursor-pointer block md:col-span-2">
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    setFiles((prev) => ({ ...prev, portfolio: [...prev.portfolio, ...newFiles] }));
                  }} />
                {files.portfolio.length > 0 ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-400 text-xs">{files.portfolio.length} صورة محفظة</p>
                  </>
                ) : (
                  <>
                    <Camera className="h-6 w-6 text-white/40 mx-auto mb-2" />
                    <p className="text-white text-xs">صور من أعمالك (اختياري)</p>
                    <p className="text-white/40 text-[10px]">Portfolio Photos</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Star className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-emerald-400 font-bold text-sm mb-2">✨ مميزات الاشتراك (5€/شهر)</h3>
                <ul className="text-white/60 text-xs space-y-1">
                  <li>• ظهور مميز في نتائج البحث حسب المدينة</li>
                  <li>• عرض رقم الهاتف والبريد الإلكتروني بشكل واضح</li>
                  <li>• شارة "موثق" على إعلانك</li>
                  <li>• صفحة خاصة بخدمتك مع كل التفاصيل</li>
                  <li>• إحصائيات المشاهدات والاتصالات</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitMutation.isPending}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e8b923] text-[#0a1628] font-bold text-lg hover:shadow-lg hover:shadow-[#c9a227]/30 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {submitMutation.isPending ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-[#0a1628] border-t-transparent rounded-full" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                تقديم الطلب — سيتم إرسال رابط الدفع بعد المراجعة
              </>
            )}
          </button>

          {submitMutation.isError && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-xl p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              حدث خطأ. يرجى المحاولة مرة أخرى.
            </div>
          )}
        </form>

        <p className="text-center text-white/30 text-xs mt-6 mb-12">
          بعد الموافقة على طلبك، سيتم إرسال رابط دفع الاشتراك (5€/شهر) إلى بريدك الإلكتروني
          <br />
          After approval, a payment link for the subscription (€5/month) will be sent to your email
        </p>
      </div>
    </div>
  );
}
