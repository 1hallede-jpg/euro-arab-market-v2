import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Store,
  MapPin,
  Star,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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
  shisha_lounge: "مقاهي شيشة",
  travel_agency: "وكالات سفر",
  money_transfer: "تحويل أموال",
  mosque: "مساجد",
  cultural_center: "مراكز ثقافية",
  car_dealer: "سيارات",
  repair_shop: "ورش إصلاح",
  other: "أخرى",
};

// Extract a short name from description
function getDisplayName(m: any): string {
  if (m.businessNameAr) return m.businessNameAr;
  if (m.businessName) return m.businessName;
  if (m.description) {
    const desc = m.description.replace(/^يقدم\s+/g, '');
    return desc.length > 40 ? desc.substring(0, 40) + '...' : desc;
  }
  return `${categoryNamesAr[m.category] || m.category || 'متجر'} - ${m.city || ''}`;
}

export default function Stores() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const selectedCategory = searchParams.get("category") || undefined;
  const selectedCity = searchParams.get("city") || undefined;

  const { data: merchantData, isLoading } = trpc.merchant.list.useQuery({
    category: selectedCategory,
    city: selectedCity,
    search: searchQuery || undefined,
    limit: 24,
    offset: 0,
  });

  const { data: categories } = trpc.merchant.categories.useQuery();
  const { data: cities } = trpc.merchant.cities.useQuery();

  const merchants = merchantData?.items || [];
  const total = merchantData?.total || 0;

  const updateFilter = (key: string, value: string | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="bg-emerald-600 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Store className="h-8 w-8 text-emerald-200" />
            <h1 className="text-3xl font-bold text-white">المتاجر العربية</h1>
          </div>
          <p className="text-emerald-100">
            اكتشف أفضل المتاجر والمحلات العربية في أوروبا
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="ابحث عن متجر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            تصفية
            {(selectedCategory || selectedCity) && (
              <Badge variant="secondary" className="mr-1 bg-emerald-100 text-emerald-700">
                {(selectedCategory ? 1 : 0) + (selectedCity ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">تصفية النتائج</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                  setSearchQuery("");
                }}
              >
                <X className="h-4 w-4 ml-1" />
                إعادة ضبط
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التصنيف
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!selectedCategory ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter("category", undefined)}
                    className={!selectedCategory ? "bg-emerald-500" : ""}
                  >
                    الكل
                  </Button>
                  {categories?.map((cat: any) => (
                    <Button
                      key={cat.id}
                      variant={
                        selectedCategory === cat.nameEn ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => updateFilter("category", cat.nameEn)}
                      className={
                        selectedCategory === cat.nameEn ? "bg-emerald-500" : ""
                      }
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدينة
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!selectedCity ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter("city", undefined)}
                    className={!selectedCity ? "bg-emerald-500" : ""}
                  >
                    الكل
                  </Button>
                  {cities?.slice(0, 10).map((city: any) => (
                    <Button
                      key={`${city.city}-${city.country}`}
                      variant={
                        selectedCity === city.city ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => updateFilter("city", city.city)}
                      className={
                        selectedCity === city.city ? "bg-emerald-500" : ""
                      }
                    >
                      {city.city}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            {isLoading ? "جاري التحميل..." : `${total} متجر`}
          </p>
        </div>

        {/* Merchants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {merchants.map((merchant: any) => (
            <Link
              key={merchant.id}
              to={`/stores/${merchant.slug}`}
              className="group"
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-sm h-full">
                <div className="relative h-40 bg-gray-200 overflow-hidden">
                  {merchant.coverImage ? (
                    <img
                      src={merchant.coverImage}
                      alt={merchant.businessName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <Store className="h-10 w-10 text-white/50" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-white/90 text-emerald-700 text-xs backdrop-blur-sm">
                      {categoryNamesAr[merchant.category] || merchant.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors text-base leading-snug line-clamp-2">
                    {getDisplayName(merchant)}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {merchant.city}{merchant.country ? `، ${merchant.country}` : ''} • ⭐{merchant.rating}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {merchant.city}{merchant.country ? `، ${merchant.country}` : ''}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      {merchant.rating}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {merchants.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              لا توجد متاجر
            </h3>
            <p className="text-gray-500">
              جرب تغيير معايير البحث أو التصفية
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
