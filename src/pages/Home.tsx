import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Search,
  MapPin,
  Store,
  Utensils,
  ShoppingBag,
  Scissors,
  Coffee,
  Star,
  TrendingUp,
  Building2,
  ArrowLeft,
  Sparkles,
  X,
  Send,
  User,
  Loader2,
  Globe,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Categories
const categories = [
  { id: "restaurant", label: "مطاعم عربية", icon: <Utensils className="h-5 w-5" /> },
  { id: "supermarket", label: "سوبرماركت حلال", icon: <ShoppingBag className="h-5 w-5" /> },
  { id: "barber", label: "صالونات حلاقة", icon: <Scissors className="h-5 w-5" /> },
  { id: "sweets", label: "حلويات شرقية", icon: <Coffee className="h-5 w-5" /> },
  { id: "butcher", label: "جزار حلال", icon: <Store className="h-5 w-5" /> },
  { id: "bakery", label: "مخابز", icon: <Store className="h-5 w-5" /> },
  { id: "cafe", label: "مقاهي", icon: <Coffee className="h-5 w-5" /> },
  { id: "mosque", label: "مساجد", icon: <Building2 className="h-5 w-5" /> },
];

const cities = [
  "باريس", "لندن", "برلين", "أمستردام", "بروكسل",
  "فيينا", "مدريد", "روما", "ستوكهولم", "كوبنهاغن",
];

// Sindbad Chat Component
function SindbadChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "مرحباً! أنا سندباد، دليلك الذكي لعالم العرب في أوروبا.\n\nاسألني عن أي شيء:\n• وين ألقى مطعم سوري في باريس؟\n• جزار حلال قريب مني\n• أفضل مقهى عربي في برلين\n• محلات تمور في لندن",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: merchantData } = trpc.merchant.list.useQuery(
    { status: "active", limit: 100 },
    { enabled: isOpen }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Simple local search in merchants
    const searchTerms = userMessage.toLowerCase();
    const matches =
      merchantData?.items.filter((m) => {
        const text = `${m.businessNameAr} ${m.businessName} ${m.category} ${m.city} ${m.country} ${m.tags}`.toLowerCase();
        return searchTerms.split(" ").some((term) => text.includes(term));
      }) || [];

    setTimeout(() => {
      let response = "";

      if (matches.length > 0) {
        response = `وجدت ${matches.length} نتيجة:\n\n`;
        matches.slice(0, 5).forEach((m, i) => {
          response += `${i + 1}. **${m.businessNameAr || m.businessName}** - ${m.city}`;
          if (m.rating) response += ` ⭐${m.rating}`;
          if (m.address) response += `\n   📍 ${m.address}`;
          if (m.phone) response += `\n   📞 ${m.phone}`;
          response += "\n\n";
        });
      } else {
        response =
          "عذراً، لم أجد نتائج مباشرة.\n\nجرب البحث عن:\n• مطاعم عربية في [مدينتك]\n• جزار حلال\n• صالون حلاقة\n• سوبرماركت عربي\n\nأو تصفح جميع المتاجر من القائمة الرئيسية.";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsLoading(false);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">سندباد</h3>
              <p className="text-xs text-emerald-100">دليلك الذكي للعالم العربي</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "assistant"
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500"
                    : "bg-gray-200"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Sparkles className="h-4 w-4 text-white" />
                ) : (
                  <User className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "assistant"
                    ? "bg-white shadow-sm text-gray-800 border border-gray-100"
                    : "bg-emerald-500 text-white"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
          <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اسأل سندباد عن أي متجر عربي..."
              className="border-0 bg-transparent focus-visible:ring-0 text-right"
              dir="rtl"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Home Page
export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSindbad, setShowSindbad] = useState(false);

  const { data: featuredData } = trpc.merchant.list.useQuery({
    status: "active",
    featured: true,
    limit: 6,
  });

  const { data: recentData } = trpc.merchant.list.useQuery({
    status: "active",
    limit: 8,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Simple Top Bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-emerald-500" />
          <span className="font-bold text-gray-800 hidden sm:inline">يورو عرب ماركت</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/stores" className="text-gray-600 hover:text-emerald-600 transition-colors">
            المتاجر
          </Link>
          <Link to="/jobs" className="text-gray-600 hover:text-emerald-600 transition-colors">
            المهن
          </Link>
          <Link
            to="#"
            onClick={(e) => { e.preventDefault(); setShowSindbad(true); }}
            className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors flex items-center gap-1"
          >
            <Sparkles className="h-4 w-4" />
            سندباد
          </Link>
          <Link to="/admin" className="text-gray-400 hover:text-gray-600 transition-colors text-xs">
            إدارة
          </Link>
        </div>
      </nav>

      {/* Hero - Google Style */}
      <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4">
        {/* Sindbad Logo */}
        <div className="mb-6">
          <img
            src="/sindbad-logo.png"
            alt="سندباد"
            className="h-32 w-auto mx-auto"
            onError={(e) => {
              // Fallback if image doesn't exist
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="h-32 w-32 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                    <span class="text-5xl">🧞‍♂️</span>
                  </div>
                `;
              }
            }}
          />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">
          يورو عرب ماركت
        </h1>
        <p className="text-gray-500 text-lg mb-8 text-center">
          محرك البحث للعالم العربي في أوروبا
        </p>

        {/* Search Box - Google Style */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl mb-4">
          <div className="relative flex items-center bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow px-6 py-3">
            <Search className="h-5 w-5 text-gray-400 ml-3 shrink-0" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مطاعم، متاجر، خدمات عربية..."
              className="border-0 bg-transparent focus-visible:ring-0 text-right text-lg"
              dir="rtl"
            />
            <button
              type="button"
              onClick={() => setShowSindbad(true)}
              className="mr-2 p-2 text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors"
              title="اسأل سندباد"
            >
              <Sparkles className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 rounded-full px-8"
            >
              بحث
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSindbad(true)}
              className="rounded-full px-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <Sparkles className="h-4 w-4 ml-2" />
              اسأل سندباد
            </Button>
          </div>
        </form>

        {/* Stats Bar */}
        <div className="flex items-center gap-8 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Store className="h-4 w-4 text-emerald-500" />
            58+ متجر عربي
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-emerald-500" />
            15+ دولة أوروبية
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-emerald-500" />
            10+ تصنيفات
          </span>
        </div>
      </div>

      {/* Quick Categories */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/stores?category=${cat.id}`}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-sm"
            >
              {cat.icon}
              <span>{cat.label}</span>
            </Link>
          ))}
        </div>

        {/* Popular Cities */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {cities.map((city) => (
            <Link
              key={city}
              to={`/city/${city}`}
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline px-2"
            >
              {city}
            </Link>
          ))}
          <Link to="/stores" className="text-sm text-gray-400 hover:text-gray-600 px-2 flex items-center gap-1">
            عرض الكل <ArrowLeft className="h-3 w-3" />
          </Link>
        </div>

        {/* Featured Merchants - Magazine Style */}
        {featuredData?.items && featuredData.items.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
                المتاجر المميزة
              </h2>
              <Link to="/stores" className="text-emerald-600 text-sm hover:underline">
                عرض الكل
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredData.items.map((merchant) => (
                <MerchantCard key={merchant.id} merchant={merchant} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Added - Magazine Style */}
        {recentData?.items && recentData.items.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Store className="h-6 w-6 text-emerald-500" />
              أحدث المتاجر
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentData.items.slice(0, 8).map((merchant) => (
                <MerchantCardCompact key={merchant.id} merchant={merchant} />
              ))}
            </div>
          </div>
        )}

        {/* Add Store CTA */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 text-center border border-emerald-100 mb-12">
          <Store className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            هل تملك متجر عربي في أوروبا؟
          </h3>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            انضم لأكبر دليل عربي في أوروبا. سجّل متجرك الآن ووصل لآلاف العملاء العرب
          </p>
          <Link to="/add-store">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 rounded-full px-8">
              <Plus className="h-5 w-5 ml-2" />
              أضف متجرك
            </Button>
          </Link>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="border-t bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>يورو عرب ماركت © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/stores" className="hover:text-gray-700">المتاجر</Link>
            <Link to="/jobs" className="hover:text-gray-700">المهن</Link>
            <Link to="/add-store" className="hover:text-gray-700">أضف متجرك</Link>
            <a href="mailto:info@euroarabmarket.com" className="hover:text-gray-700">تواصل معنا</a>
          </div>
        </div>
      </footer>

      {/* Sindbad Chat Modal */}
      <SindbadChat isOpen={showSindbad} onClose={() => setShowSindbad(false)} />
    </div>
  );
}

// Merchant Card (Magazine Style)
function MerchantCard({ merchant }: { merchant: any }) {
  return (
    <Link to={`/stores/${merchant.slug}`} className="group">
      <Card className="overflow-hidden hover:shadow-lg transition-all border-gray-200 h-full">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {merchant.coverImage ? (
            <img
              src={merchant.coverImage}
              alt={merchant.businessNameAr || merchant.businessName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Store className="h-16 w-16 text-white/40" />
            </div>
          )}
          {merchant.isFeatured && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              ⭐ مميز
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-emerald-600 transition-colors mb-1">
            {merchant.businessNameAr || merchant.businessName}
          </h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {merchant.shortDescription || merchant.description?.slice(0, 100) || ""}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              {merchant.city}
            </span>
            {merchant.rating && (
              <span className="flex items-center gap-1 text-yellow-600">
                <Star className="h-4 w-4 fill-current" />
                {merchant.rating}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Compact Merchant Card
function MerchantCardCompact({ merchant }: { merchant: any }) {
  return (
    <Link to={`/stores/${merchant.slug}`} className="group">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all">
        <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
          {merchant.logo ? (
            <img src={merchant.logo} alt="" className="h-16 w-16 object-contain" />
          ) : (
            <Store className="h-10 w-10 text-gray-400" />
          )}
          <div className="absolute top-2 right-2">
            <span className="text-[10px] bg-white/90 px-2 py-0.5 rounded-full text-gray-600">
              {merchant.city}
            </span>
          </div>
        </div>
        <div className="p-3">
          <h4 className="font-bold text-sm text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
            {merchant.businessNameAr || merchant.businessName}
          </h4>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {merchant.shortDescription || ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
