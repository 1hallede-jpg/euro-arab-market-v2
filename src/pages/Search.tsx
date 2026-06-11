import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Store,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  Clock,
  BadgeCheck,
  Filter,
  X,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categoryNamesAr: Record<string, string> = {
  restaurant: "مطاعم عربية",
  supermarket: "سوبرماركت حلال",
  sweets: "حلويات شرقية",
  barber: "صالونات حلاقة",
  butcher: "جزار حلال",
  bakery: "مخابز",
  cafe: "مقاهي",
  clothing: "ملابس",
  electronics: "إلكترونيات",
  pharmacy: "صيدليات",
  halal_grocery: "بقالة حلال",
  shisha_lounge: "مقهى شيشة",
  travel_agency: "وكالة سفر",
  money_transfer: "تحويل أموال",
  mosque: "مسجد",
  cultural_center: "مركز ثقافي",
  car_dealer: "تاجر سيارات",
  repair_shop: "محل إصلاح",
  other: "أخرى",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
};

// Cities for filter
const cities = [
  "باريس", "لندن", "برلين", "أمستردام", "بروكسل",
  "فيينا", "مدريد", "روما", "ستوكهولم", "أوسلو",
  "كوبنهاغن", "لشبونة", "بودابست", "بوخارست", "أثينا",
  "ميلانو", "برشلونة", "برمنغهام", "مانشستر", "شتوتغارت",
  "فرانكفورت", "ميونخ", "ليون", "مرسيليا", "تولوز",
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(initialQuery.length > 0);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Search using merchant.list directly from DB
  const { data: merchantsData, isLoading } = trpc.merchant.list.useQuery(
    {
      search: hasSearched ? query : undefined,
      status: "active",
      city: selectedCity || undefined,
      category: selectedCategory || undefined,
      limit: 50,
    },
    { enabled: true } // Always load merchants
  );

  // Filter merchants client-side if we have initial query
  const merchants = merchantsData?.items || [];

  const filteredMerchants = hasSearched && query
    ? merchants.filter((m: any) => {
        const text = `${m.businessNameAr} ${m.businessName} ${m.category} ${m.city} ${m.country} ${m.tags} ${m.descriptionAr} ${m.description}`.toLowerCase();
        return query.toLowerCase().split(/\s+/).some((term) => text.includes(term));
      })
    : merchants;

  const handleSearch = () => {
    if (query.trim()) {
      setHasSearched(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearFilters = () => {
    setSelectedCity("");
    setSelectedCategory("");
    setQuery("");
    setHasSearched(false);
  };

  // Auto-search on initial load with query param
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setHasSearched(true);
    }
  }, [initialQuery]);

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] py-10">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-1">
            {hasSearched ? `نتائج البحث: "${query}"` : "البحث في المتاجر"}
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            {filteredMerchants.length} متجر عربي في أوروبا
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="ابحث عن مطعم، متجر، خدمة عربية..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pr-12 py-6 text-right bg-white/10 border-white/10 text-white placeholder:text-gray-500 text-lg rounded-xl"
                  dir="rtl"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-bold px-6 py-6 rounded-xl"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 text-amber-400 text-sm hover:text-amber-300 transition"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "إخفاء الفلاتر" : "فلاتر البحث"}
            </button>
            {(selectedCity || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-gray-400 text-sm hover:text-white transition"
              >
                <X className="h-3 w-3" />
                مسح
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10 max-w-2xl mx-auto">
              {/* City Filter */}
              <div className="mb-3">
                <p className="text-gray-400 text-xs mb-2">المدينة</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {cities.slice(0, 15).map((city) => (
                    <button
                      key={city}
                      onClick={() =>
                        setSelectedCity(selectedCity === city ? "" : city)
                      }
                      className={`text-xs px-3 py-1.5 rounded-full transition ${
                        selectedCity === city
                          ? "bg-amber-500 text-black font-medium"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <p className="text-gray-400 text-xs mb-2">التصنيف</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(categoryNamesAr).slice(0, 10).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === key ? "" : key
                        )
                      }
                      className={`text-xs px-3 py-1.5 rounded-full transition ${
                        selectedCategory === key
                          ? "bg-amber-500 text-black font-medium"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-400 mt-3">جاري البحث...</p>
          </div>
        ) : filteredMerchants.length > 0 ? (
          <div className="space-y-4">
            {filteredMerchants.map((m: any) => (
              <Link
                key={m.id}
                to={`/stores/${m.slug || m.id}`}
                className="group block"
              >
                <Card className="hover:shadow-lg transition-all border-gray-200 hover:border-amber-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Name + Featured Badge */}
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-amber-600 transition-colors">
                            {m.businessNameAr || m.businessName}
                          </h3>
                          {m.isFeatured && (
                            <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[10px]">
                              ⭐ مميز
                            </Badge>
                          )}
                          {m.isVerified && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                              <BadgeCheck className="h-3 w-3 mr-0.5" />
                              موثق
                            </Badge>
                          )}
                        </div>

                        {/* Description */}
                        {m.shortDescription && (
                          <p className="text-sm text-gray-500 mb-2">
                            {m.shortDescription}
                          </p>
                        )}

                        {/* Details Row */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {m.city}
                            {m.country && `, ${m.country}`}
                          </span>

                          <Badge variant="outline" className="text-[10px]">
                            {categoryNamesAr[m.category] || m.category}
                          </Badge>

                          {m.rating && (
                            <span className="flex items-center gap-1 text-yellow-500">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              {m.rating}
                              {m.reviewCount && ` (${m.reviewCount})`}
                            </span>
                          )}

                          {m.isOpen24Hours && (
                            <span className="flex items-center gap-1 text-emerald-500">
                              <Clock className="h-3.5 w-3.5" />
                              24 ساعة
                            </span>
                          )}
                        </div>

                        {/* Contact Buttons (inline, no click-through) */}
                        <div className="flex items-center gap-2 mt-3">
                          {m.phone && (
                            <a
                              href={`tel:${m.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full transition"
                            >
                              <Phone className="h-3 w-3" />
                              اتصال
                            </a>
                          )}
                          {m.whatsapp && (
                            <a
                              href={`https://wa.me/${m.whatsapp}?text=مرحباً، تواصلت معك من يورو عرب ماركت`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1.5 rounded-full transition"
                            >
                              <MessageCircle className="h-3 w-3" />
                              واتساب
                            </a>
                          )}
                          {m.address && (
                            <a
                              href={`https://www.google.com/maps/search/${encodeURIComponent(m.address + " " + m.city)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full transition"
                            >
                              <MapPin className="h-3 w-3" />
                              الخريطة
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-amber-500 transition-colors mr-2 self-center" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              لا توجد نتائج
            </h3>
            <p className="text-gray-400 mb-6">
              جرب بحث مختلف أو مسح الفلاتر
            </p>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="rounded-full"
            >
              <X className="h-4 w-4 ml-2" />
              مسح البحث
            </Button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 text-center border border-amber-100">
          <Store className="h-10 w-10 text-amber-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">
            هل تملك متجر عربي؟
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            انضم لأكبر دليل عربي في أوروبا — مجاناً
          </p>
          <Link to="/add-store">
            <Button className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-bold rounded-full px-8">
              أضف متجرك
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
