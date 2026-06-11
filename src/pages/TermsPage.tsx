import { Link } from "react-router";
import { Globe, Shield, Eye, Trash2, Cookie, Mail } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Top bar */}
      <nav className="flex items-center px-6 py-4 border-b">
        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-emerald-600">
          <Globe className="h-5 w-5 text-emerald-500" />
          <span className="font-bold">يورو عرب ماركت</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            الشروط وسياسة الخصوصية
          </h1>
          <p className="text-gray-500">
            Terms of Service & Privacy Policy — GDPR Compliant
          </p>
        </div>

        {/* Privacy Policy */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-emerald-500" />
            1. سياسة الخصوصية
          </h2>
          <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
            <p>
              نحن نلتزم باللائحة العامة لحماية البيانات (GDPR) في الاتحاد
              الأوروبي. لا نقوم بجمع أي بيانات شخصية دون موافقتك الصريحة.
            </p>
            <h3 className="font-bold text-gray-800 mt-4">
              ما الذي نجمعه:
            </h3>
            <ul className="list-disc list-inside space-y-1 mr-4">
              <li>استعلامات البحث (لتحسين تجربة المستخدم)</li>
              <li>الموقع الجغرافي التقريبي (لعرض نتائج قريبة)</li>
              <li>ملفات تعريف الارتباط (Cookies) الأساسية</li>
            </ul>
            <h3 className="font-bold text-gray-800 mt-4">
              ما الذي لا نجمعه:
            </h3>
            <ul className="list-disc list-inside space-y-1 mr-4">
              <li>لا نطلب تسجيل دخول</li>
              <li>لا نجمع أسماء أو إيميلات دون طلب</li>
              <li>لا نشارك بياناتك مع أطراف ثالثة</li>
            </ul>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Cookie className="h-5 w-5 text-emerald-500" />
            2. ملفات تعريف الارتباط (Cookies)
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            نستخدم ملفات تعريف الارتباط الضرورية فقط لتحسين الأداء وتذكر
            تفضيلاتك. يمكنك تعطيلها من إعدادات المتصفح في أي وقت.
          </p>
        </section>

        {/* User Rights */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-emerald-500" />
            3. حقوقك
          </h2>
          <div className="text-gray-600 text-sm leading-relaxed space-y-2">
            <p>بموجب قانون GDPR، لك الحق في:</p>
            <ul className="list-disc list-inside space-y-1 mr-4">
              <li>الوصول إلى بياناتك</li>
              <li>تصحيح بياناتك</li>
              <li>حذف بياناتك (الحق في النسيان)</li>
              <li>الاعتراض على المعالجة</li>
              <li>نقل بياناتك</li>
            </ul>
          </div>
        </section>

        {/* Terms of Service */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            4. شروط الاستخدام
          </h2>
          <div className="text-gray-600 text-sm leading-relaxed space-y-3">
            <p>
              يورو عرب ماركت هو دليل بحثي يربط المستخدمين بالمتاجر العربية في
              أوروبا. نحن لسنا مسؤولين عن جودة الخدمات المقدمة من التجار
              المدرجين.
            </p>
            <p>
              المعلومات المعروضة هي للإرشاد فقط. ننصحك دائماً بالتحقق من
              المعلومات مباشرة مع المتجر قبل الزيارة.
            </p>
            <p>
              المتاجر المدرجة قد تكون مدفوعة (مميزة) أو مجانية (عضوية). نحن
              نبذل جهدنا لعرض المعلومات الدقيقة لكن لا نضمن اكتمالها.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-emerald-500" />
            5. تواصل معنا
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            لأي استفسار حول الخصوصية أو بياناتك، تواصل معنا على:
            <br />
            <a
              href="mailto:privacy@euroarabmarket.com"
              className="text-emerald-600 hover:underline"
            >
              privacy@euroarabmarket.com
            </a>
          </p>
        </section>

        <div className="bg-gray-50 rounded-xl p-6 text-center mt-12">
          <p className="text-sm text-gray-500">
            آخر تحديث: يونيو 2026
            <br />
            يورو عرب ماركت — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}
