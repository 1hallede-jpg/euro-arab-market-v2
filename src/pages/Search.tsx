import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import {
  Search, MapPin, Star, Phone, MessageCircle, Clock,
  BadgeCheck, Globe, ArrowLeft, X, Filter, Store, Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categoryNamesAr: Record<string, string> = {
  restaurant: "مطعم عربي",
  supermarket: "سوبرماركت حلال",
  sweets: "حلويات شرقية",
  barber: "صالون حلاقة",
  butcher: "جزار حلال",
  bakery: "مخبز عربي",
  cafe: "مقهى عربي",
  clothing: "ملابس",
  electronics: "إلكترونيات",
  pharmacy: "صيدلية",
  halal_grocery: "بقالة حلال",
  shisha_lounge: "مقهى شيشة",
  travel_agency: "وكالة سفر",
  money_transfer: "تحويل أموال",
  mosque: "مسجد",
  cultural_center: "مركز ثقافي",
  car_dealer: "سيارات",
  repair_shop: "إصلاح",
  other: "أخرى",
};

const cities = [
  "باريس", "لندن", "برلين", "مدريد", "برشلونة",
  "روما", "ميلان", "أمستردام", "بروكسل", "فيينا",
  "كوبنهاغن", "ستوكهولم", "أوسلو", "زيورخ", "بودابست",
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(initialQuery.length > 0);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: merchantsData, isLoading } = trpc.merchant.list.useQuery(
    {
      status: "active",
      city: selectedCity || undefined,
      category: selectedCategory || undefined,
      limit: 200,
    },
    { enabled: true }
  );

  const merchants = merchantsData?.items || [];

  const filteredMerchants = hasSearched && query
    ? merchants.filter((m: any) => {
        const text = `${m.businessNameAr || ''} ${m.businessName || ''} ${m.category || ''} ${m.city || ''} ${m.country || ''} ${m.tags || ''} ${m.descriptionAr || ''} ${m.description || ''} ${m.address || ''}`.toLowerCase();
        return query.toLowerCase().split(/\s+/).some((term) => text.includes(term));
      })
    : merchants;

  const sortedMerchants = [...filteredMerchants].sort((a: any, b: any) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
  });

  const handleSearch = () => { if (query.trim()) setHasSearched(true); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };
  const clearFilters = () => { setSelectedCity(""); setSelectedCategory(""); setQuery(""); setHasSearched(false); };

  useEffect(() => {
    if (initialQuery) { setQuery(initialQuery); setHasSearched(true); }
  }, [initialQuery]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] py-8">
          <div className="mx-auto max-w-5xl px-4">
            <Link to="/" className="text-amber-400 font-bold text-sm hover:text-amber-300 mb-4 inline-block">
              ← يورو عرب ماركت
            </Link>
            <h1 className="text-xl font-bold text-white mb-1">
              {hasSearched ? `${sortedMerchants.length} نتيجة لـ "${query}"` : `جميع المتاجر العربية (${merchants.length})`}
            </h1>
            <p className="text-gray-400 text-sm mb-5">
              دليل المتاجر العربية في أوروبا
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-2xl">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="ابحث عن مطعم، متجر، خدمة..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pr-12 py-6 text-right bg-white/10 border-white/10 text-white placeholder:text-gray-500 rounded-xl"
                  dir="rtl"
                />
              </div>
              <Button onClick={handleSearch} className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-bold px-6 rounded-xl">
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {/* Filters */}
            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1 text-amber-400 text-sm hover:text-amber-300">
                <Filter className="h-4 w-4" /> فلاتر
              </button>
              {selectedCity && <Badge className="bg-amber-500/20 text-amber-400 text-xs cursor-pointer" onClick={() => setSelectedCity("")}>{selectedCity} ✕</Badge>}
              {selectedCategory && <Badge className="bg-amber-500/20 text-amber-400 text-xs cursor-pointer" onClick={() => setSelectedCategory("")}>{categoryNamesAr[selectedCategory]} ✕</Badge>}
            </div>

            {showFilters && (
              <div className="mt-3 bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-gray-400 text-xs mb-2">المدينة</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {cities.map(c => (
                    <button key={c} onClick={() => setSelectedCity(selectedCity === c ? "" : c)}
                      className={`text-xs px-3 py-1.5 rounded-full transition ${selectedCity === c ? "bg-amber-500 text-black font-medium" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>{c}</button>
                  ))}
                </div>
                <p className="text-gray-400 text-xs mb-2">التصنيف</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(categoryNamesAr).slice(0, 10).map(([k, v]) => (
                    <button key={k} onClick={() => setSelectedCategory(selectedCategory === k ? "" : k)}
                      className={`text-xs px-3 py-1.5 rounded-full transition ${selectedCategory === k ? "bg-amber-500 text-black font-medium" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>{v}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mx-auto max-w-5xl px-4 py-6">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : sortedMerchants.length > 0 ? (
            <div className="space-y-3">
              {sortedMerchants.map((m: any) => (
                <MerchantCard key={m.id} merchant={m} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد نتائج</h3>
              <Button onClick={clearFilters} variant="outline" className="rounded-full"><X className="h-4 w-4 ml-2" />مسح</Button>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-10 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 text-center border border-amber-100">
            <Store className="h-10 w-10 text-amber-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">هل تملك متجر عربي؟</h3>
            <p className="text-gray-500 text-sm mb-4">انضم لأكبر دليل عربي في أوروبا</p>
            <Link to="/add-store">
              <Button className="bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-full px-8">أضف متجرك</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ─── Merchant Ad Card ─── */
function MerchantCard({ merchant: m }: { merchant: any }) {
  // Use ID-based URL - always works
  const detailUrl = `/stores/${m.id}`;
  const displayName = m.businessNameAr?.trim() || m.businessName?.trim() || `متجر #${m.id}`;
  const displayDesc = m.shortDescription?.trim() || m.descriptionAr?.trim() || m.description?.trim() || "";
  const displayAddress = [m.address, m.city, m.country].filter(Boolean).join(", ");

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all overflow-hidden group">
      {/* Featured Badge */}
      {m.isFeatured && (
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1.5 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-black" />
          <span className="text-black text-xs font-bold">إعلان مميز</span>
        </div>
      )}

      <div className="p-4 md:p-5">
        {/* Store Name - BIG and prominent */}
        <div className="mb-2">
          <Link to={detailUrl} className="group/name">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover/name:text-amber-600 transition-colors leading-tight">
              {displayName}
            </h2>
          </Link>
        </div>

        {/* Category + Verified + Rating row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs border-gray-200 text-gray-500">
            {categoryNamesAr[m.category] || m.category || "متجر"}
          </Badge>
          {m.isVerified && (
            <span className="flex items-center gap-0.5 text-emerald-500 text-xs">
              <BadgeCheck className="h-3.5 w-3.5" /> موثق
            </span>
          )}
          {m.rating && (
            <span className="flex items-center gap-0.5 text-yellow-500 text-sm">
              <Star className="h-4 w-4 fill-current" /> {m.rating}
              {m.reviewCount ? <span className="text-gray-400 text-xs">({m.reviewCount})</span> : null}
            </span>
          )}
          {m.isOpen24Hours && (
            <Badge className="bg-emerald-50 text-emerald-600 text-xs border-0">
              <Clock className="h-3 w-3 mr-0.5" />24h
            </Badge>
          )}
        </div>

        {/* Description */}
        {displayDesc && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{displayDesc}</p>
        )}

        {/* Address */}
        {displayAddress && (
          <div className="flex items-start gap-1.5 text-sm text-gray-400 mb-3">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{displayAddress}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {m.phone && (
            <a href={`tel:${m.phone}`} onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg transition border border-gray-100">
              <Phone className="h-4 w-4" />
              <span className="font-medium" dir="ltr">{m.phone}</span>
            </a>
          )}
          {m.whatsapp && (
            <a href={`https://wa.me/${m.whatsapp}?text=مرحباً، تواصلت معك من يورو عرب ماركت`}
              target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg transition border border-green-100">
              <MessageCircle className="h-4 w-4" /> واتساب
            </a>
          )}
          {m.website && (
            <a href={m.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition border border-blue-100">
              <Globe className="h-4 w-4" /> موقع
            </a>
          )}
          {displayAddress && (
            <a href={`https://www.google.com/maps/search/${encodeURIComponent(displayName + " " + displayAddress)}`}
              target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-2 rounded-lg transition border border-amber-100">
              <MapPin className="h-4 w-4" /> الخريطة
            </a>
          )}
          <Link to={detailUrl}
            className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 px-2 py-2 transition ml-auto font-medium">
            التفاصيل ←
          </Link>
        </div>
      </div>
    </div>
  );
}
