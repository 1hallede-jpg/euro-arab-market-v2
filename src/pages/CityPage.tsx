import { useParams, Link } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import {
  MapPin,
  Store,
  Utensils,
  ShoppingBag,
  Scissors,
  Coffee,
  TrendingUp,
  Users,
  Star,
  BadgeCheck,
} from "lucide-react";
import { useState, useEffect } from "react";

// ─── Prayer times by city (approximate) ───
const cityPrayerOffsets: Record<string, Record<string, string>> = {
  paris: { fajr: "04:30", dhuhr: "13:45", asr: "17:45", maghrib: "21:45", isha: "23:30" },
  london: { fajr: "04:00", dhuhr: "13:15", asr: "17:15", maghrib: "21:15", isha: "22:45" },
  berlin: { fajr: "04:15", dhuhr: "13:30", asr: "17:30", maghrib: "21:30", isha: "23:00" },
  madrid: { fajr: "05:00", dhuhr: "14:00", asr: "18:00", maghrib: "22:00", isha: "23:45" },
  rome: { fajr: "04:45", dhuhr: "13:45", asr: "17:45", maghrib: "21:45", isha: "23:30" },
  amsterdam: { fajr: "04:30", dhuhr: "13:45", asr: "17:45", maghrib: "21:45", isha: "23:30" },
  brussels: { fajr: "04:30", dhuhr: "13:45", asr: "17:45", maghrib: "21:45", isha: "23:30" },
  vienna: { fajr: "04:15", dhuhr: "13:15", asr: "17:15", maghrib: "21:15", isha: "22:45" },
  stockholm: { fajr: "03:30", dhuhr: "12:45", asr: "16:45", maghrib: "21:30", isha: "23:00" },
  oslo: { fajr: "03:15", dhuhr: "12:30", asr: "16:30", maghrib: "21:30", isha: "22:45" },
  copenhagen: { fajr: "03:45", dhuhr: "13:00", asr: "17:00", maghrib: "21:45", isha: "23:15" },
  athens: { fajr: "05:00", dhuhr: "13:45", asr: "17:45", maghrib: "21:15", isha: "22:45" },
  barcelona: { fajr: "05:15", dhuhr: "14:00", asr: "18:00", maghrib: "22:15", isha: "23:45" },
  milan: { fajr: "04:45", dhuhr: "13:30", asr: "17:30", maghrib: "21:45", isha: "23:15" },
  default: { fajr: "04:30", dhuhr: "13:30", asr: "17:30", maghrib: "21:30", isha: "23:00" },
};

const prayerNamesAr: Record<string, string> = {
  fajr: "الفجر", dhuhr: "الظهر", asr: "العصر", maghrib: "المغرب", isha: "العشاء",
};

function CityPrayerTimes({ citySlug }: { citySlug: string }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const times = cityPrayerOffsets[citySlug] || cityPrayerOffsets.default;
  const prayers = Object.entries(times).map(([key, time]) => {
    const [h, m] = time.split(":").map(Number);
    return { name: key, nameAr: prayerNamesAr[key], minutes: h * 60 + m };
  });

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let nextPrayer = prayers[0];
  let minDiff = Infinity;
  for (const p of prayers) {
    let diff = p.minutes - currentMinutes;
    if (diff < 0) diff += 24 * 60;
    if (diff < minDiff) {
      minDiff = diff;
      nextPrayer = p;
    }
  }

  const hoursLeft = Math.floor(minDiff / 60);
  const minsLeft = minDiff % 60;

  return (
    <div className="mt-3 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" opacity="0.8">
        <path d="M12 3v1m0 16v1m-9-9h1m16 0h1M5.6 5.6l.7.7m12.1 12.1l.7.7M3 12a9 9 0 1018 0 9 9 0 00-18 0z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <span className="text-white/90 text-sm">
        باقي على <span className="font-bold text-[#c9a227]">{nextPrayer.nameAr}</span>
        {" "}
        {hoursLeft > 0 ? `${hoursLeft} ساعة و ` : ""}
        {minsLeft} دقيقة
      </span>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Arabic city names
const cityNamesAr: Record<string, string> = {
  paris: "باريس",
  london: "لندن",
  berlin: "برلين",
  amsterdam: "أمستردام",
  brussels: "بروكسل",
  vienna: "فيينا",
  madrid: "مدريد",
  rome: "روما",
  stockholm: "ستوكهولم",
  oslo: "أوسلو",
  copenhagen: "كوبنهاغن",
  lisbon: "لشبونة",
  budapest: "بودابست",
  bucharest: "بوخارست",
  athens: "أثينا",
  milan: "ميلانو",
  barcelona: "برشلونة",
  birmingham: "برمنغهام",
  manchester: "مانشستر",
  stuttgart: "شتوتغارت",
  frankfurt: "فرانكفورت",
  munich: "ميونخ",
  lyon: "ليون",
  marseille: "مرسيليا",
  toulouse: "تولوز",
};

const categoryIcons: Record<string, React.ReactNode> = {
  restaurant: <Utensils className="h-4 w-4" />,
  supermarket: <ShoppingBag className="h-4 w-4" />,
  barber: <Scissors className="h-4 w-4" />,
  cafe: <Coffee className="h-4 w-4" />,
};

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

// Schema.org structured data for SEO
function generateSchemaOrg(cityEn: string, cityAr: string, merchants: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `أفضل المتاجر العربية في ${cityAr} | Euro Arab Market`,
    description: `اكتشف أفضل المطاعم الحلال، السوبرماركت العربية، صالونات الحلاقة، والمزيد في ${cityAr}. دليلك الشامل للأعمال العربية في ${cityAr}.`,
    url: `https://euroarabmarket.com/city/${cityEn}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: merchants.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "LocalBusiness",
          name: m.businessNameAr || m.businessName,
          description: m.shortDescription,
          address: {
            "@type": "PostalAddress",
            addressLocality: m.city,
            addressCountry: m.country,
            streetAddress: m.address,
          },
          telephone: m.phone,
          url: `https://euroarabmarket.com/stores/${m.slug}`,
          aggregateRating: m.rating
            ? {
                "@type": "AggregateRating",
                ratingValue: m.rating,
                reviewCount: m.reviewCount || 0,
              }
            : undefined,
        },
      })),
    },
  };
}

export default function CityPage() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const cityEn = citySlug || "";
  const cityAr = cityNamesAr[cityEn] || cityEn;

  // Fetch merchants for this city
  const { data: merchantsData, isLoading } = trpc.merchant.list.useQuery(
    { city: cityAr, status: "active", limit: 100 },
    { enabled: !!citySlug }
  );

  // Get category counts
  const categoryCounts: Record<string, number> = {};
  merchantsData?.items.forEach((m) => {
    categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
  });

  // Generate schema
  const schemaData = merchantsData
    ? generateSchemaOrg(cityEn, cityAr, merchantsData.items)
    : null;

  return (
    <Layout>
      {/* Schema.org JSON-LD */}
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}

      {/* SEO Meta */}
      <div className="sr-only">
        <h1>أفضل المتاجر العربية في {cityAr} | سندباد</h1>
        <p>
          اكتشف أفضل المطاعم الحلال، السوبرماركت العربية، صالونات الحلاقة،
          والمزيد في {cityAr}. دليلك الشامل للأعمال العربية في {cityAr}.
        </p>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-800 text-white py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            المتاجر العربية في {cityAr}
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 mb-2">
            Arab Businesses in {cityEn.charAt(0).toUpperCase() + cityEn.slice(1)}
          </p>
          <p className="text-emerald-200 max-w-2xl mx-auto">
            اكتشف أفضل المطاعم الحلال، السوبرماركت العربية، صالونات الحلاقة،
            والمزيد في {cityAr}
          </p>

          {/* Prayer Times - Next prayer only */}
          <CityPrayerTimes citySlug={cityEn} />

          {/* Stats */}
          {!isLoading && merchantsData && (
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">{merchantsData.total}</div>
                <div className="text-sm text-emerald-200">متجر عربي</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">
                  {Object.keys(categoryCounts).length}
                </div>
                <div className="text-sm text-emerald-200">تصنيف</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">
                  {merchantsData.items.filter((m) => m.rating && parseFloat(m.rating) >= 4.5).length}
                </div>
                <div className="text-sm text-emerald-200">ممتاز (4.5+)</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Categories */}
        {Object.keys(categoryCounts).length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
              تصفح حسب التصنيف
            </h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <Link
                  key={cat}
                  to={`/search?category=${cat}&city=${cityAr}`}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                >
                  {categoryIcons[cat] || <Store className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {categoryNamesAr[cat] || cat}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Merchants Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Store className="h-6 w-6 text-emerald-500" />
          جميع المتاجر في {cityAr}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : merchantsData?.items && merchantsData.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchantsData.items.map((merchant) => (
              <Link
                key={merchant.id}
                to={`/search?store=${merchant.slug}`}
                className="group"
              >
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow border-gray-200">
                  {/* Cover Image */}
                  <div className="relative h-40 bg-gray-100 overflow-hidden">
                    {merchant.coverImage ? (
                      <img
                        src={merchant.coverImage}
                        alt={merchant.businessNameAr || merchant.businessName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                        <Store className="h-12 w-12 text-white/60" />
                      </div>
                    )}
                    {merchant.isFeatured && (
                      <Badge className="absolute top-3 right-3 bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" /> مميز
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className="absolute bottom-3 right-3 bg-white/90"
                    >
                      {categoryNamesAr[merchant.category] || merchant.category}
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                      {merchant.businessNameAr || merchant.businessName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {merchant.shortDescription}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{merchant.city}</span>
                      </div>
                      {merchant.rating && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-medium">
                            {merchant.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    {merchant.isVerified && (
                      <div className="flex items-center gap-1 text-emerald-600 text-sm mt-2">
                        <BadgeCheck className="h-4 w-4" />
                        <span>متجر موثق</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              لا توجد متاجر في {cityAr} حالياً
            </h3>
            <p className="text-gray-500 mb-6">
              سيتم إضافة متاجر عربية في {cityAr} قريباً
            </p>
            <Link to="/search">
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                استكشف جميع المتاجر
              </Button>
            </Link>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-8 text-center border border-emerald-100">
          <Users className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            هل تملك متجر عربي في {cityAr}؟
          </h3>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            انضم لأكبر دليل عربي في أوروبا. سجّل متجرك مجاناً ووصل لآلاف
            العملاء العرب في {cityAr}
          </p>
          <Link to="/login">
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              سجّل متجرك مجاناً
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
