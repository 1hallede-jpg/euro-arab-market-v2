import { Link } from "react-router";
import {
  Sparkles,
  Home,
  MapPin,
  Mail,
  Globe,
  Heart,
} from "lucide-react";

const quickLinks = [
  { href: "/", label: "سندباد", icon: Sparkles },
  { href: "/search", label: "اسأل سندباد", icon: Home },
];

const categories = [
  "مطاعم عربية",
  "سوبرماركت حلال",
  "حلويات شرقية",
  "صالونات حلاقة",
  "جزار حلال",
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                <span className="font-bold text-lg">ي</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-white text-base">
                  يورو عرب ماركت
                </span>
                <span className="text-xs text-slate-400">
                  Euro Arab Market
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              محرك البحث الذكي للمحلات والخدمات العربية في أوروبا. نوصلك بكل ما
              تحتاجه من مطاعم ومتاجر ومهن عربية.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">
              روابط سريعة
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">التصنيفات</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/stores?category=${cat}`}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">
              تواصل معنا
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                باريس، فرنسا
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                <a
                  href="mailto:info@euroarabmarket.com"
                  className="hover:text-emerald-400 transition-colors"
                >
                  info@euroarabmarket.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Globe className="h-4 w-4 text-emerald-500 shrink-0" />
                <a
                  href="https://euroarabmarket.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  euroarabmarket.com
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2">
                تابعنا لمزيد من التحديثات
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  اشترك
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            يورو عرب ماركت &copy; {new Date().getFullYear()} - جميع الحقوق محفوظة
          </p>
          <p className="flex items-center gap-1 text-sm text-slate-500">
            صنع بـ <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> لخدمة العرب في أوروبا
          </p>
        </div>
      </div>
    </footer>
  );
}
