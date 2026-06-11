import { useParams, Link } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import {
  MapPin, Phone, MessageCircle, Globe, Clock, Star,
  BadgeCheck, ArrowLeft, Store, Share2, Heart,
  ExternalLink, Navigation, Calendar, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewsSection from "@/components/ReviewsSection";

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

export default function StoreDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: merchant, isLoading } = trpc.merchant.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12" dir="rtl">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!merchant) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center" dir="rtl">
          <Store className="h-20 w-20 text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">المتجر غير موجود</h1>
          <p className="text-gray-400 mb-6">قد يكون الرابط غير صحيح أو تم حذف المتجر</p>
          <Link to="/stores">
            <Button className="bg-gradient-to-r from-amber-400 to-amber-600 text-black rounded-full px-8">العودة للمتاجر</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const name = merchant.businessNameAr || merchant.businessName;
  const description = merchant.shortDescription || merchant.descriptionAr || merchant.description;
  const mapsUrl = merchant.googleMapsUrl || (merchant.latitude && merchant.longitude
    ? `https://www.google.com/maps?q=${merchant.latitude},${merchant.longitude}`
    : null);

  // Schema.org
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: name,
    description: description,
    image: merchant.logo || merchant.coverImage,
    address: {
      "@type": "PostalAddress",
      streetAddress: merchant.address,
      addressLocality: merchant.city,
      addressCountry: merchant.country,
      postalCode: merchant.postalCode,
    },
    telephone: merchant.phone,
    url: `https://euroarabmarket.com/stores/${merchant.slug}`,
    ...(merchant.rating ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: merchant.rating,
        reviewCount: merchant.reviewCount || 0,
      }
    } : {}),
  };

  return (
    <Layout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Header Cover */}
        <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] py-8 md:py-12">
          <div className="max-w-4xl mx-auto px-4">
            <Link to="/stores" className="text-amber-400 text-sm flex items-center gap-1 mb-4 hover:text-amber-300">
              <ArrowLeft className="h-4 w-4" /> العودة للبحث
            </Link>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {name}
            </h1>

            {/* Category + Verified + Rating */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge variant="outline" className="border-amber-400/30 text-amber-400 text-xs">
                {categoryNamesAr[merchant.category] || merchant.category}
              </Badge>
              {merchant.isVerified && (
                <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                  <BadgeCheck className="h-3 w-3 mr-1" /> موثق
                </Badge>
              )}
              {merchant.isFeatured && (
                <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                  ⭐ مميز
                </Badge>
              )}
              {merchant.rating && (
                <span className="flex items-center gap-1 text-yellow-400 text-sm">
                  <Star className="h-4 w-4 fill-current" /> {merchant.rating}
                  {merchant.reviewCount && <span className="text-gray-400 text-xs">({merchant.reviewCount})</span>}
                </span>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{merchant.address ? `${merchant.address}, ` : ""}{merchant.city}{merchant.country ? `, ${merchant.country}` : ""}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {description && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-bold text-gray-900 mb-3 text-lg">نبذة عن المتجر</h2>
                    <p className="text-gray-600 leading-relaxed">{description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Details Grid */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-bold text-gray-900 mb-4 text-lg">معلومات التواصل</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {merchant.phone && (
                      <a href={`tel:${merchant.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition group">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200">
                          <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">الهاتف</p>
                          <p className="font-medium text-gray-900" dir="ltr">{merchant.phone}</p>
                        </div>
                      </a>
                    )}
                    {merchant.whatsapp && (
                      <a href={`https://wa.me/${merchant.whatsapp}?text=مرحباً، تواصلت معك من يورو عرب ماركت`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition group">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200">
                          <MessageCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">واتساب</p>
                          <p className="font-medium text-gray-900" dir="ltr">{merchant.whatsapp}</p>
                        </div>
                      </a>
                    )}
                    {merchant.email && (
                      <a href={`mailto:${merchant.email}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition group">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200">
                          <Globe className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">البريد الإلكتروني</p>
                          <p className="font-medium text-gray-900 text-sm">{merchant.email}</p>
                        </div>
                      </a>
                    )}
                    {mapsUrl && (
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-amber-50 transition group">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200">
                          <Navigation className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">الموقع على الخريطة</p>
                          <p className="font-medium text-gray-900 text-sm">Google Maps</p>
                        </div>
                      </a>
                    )}
                    {merchant.website && (
                      <a href={merchant.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition group">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200">
                          <ExternalLink className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">الموقع الإلكتروني</p>
                          <p className="font-medium text-gray-900 text-sm truncate">{merchant.website}</p>
                        </div>
                      </a>
                    )}
                    {merchant.isOpen24Hours && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Clock className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">ساعات العمل</p>
                          <p className="font-medium text-emerald-600">مفتوح 24 ساعة</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <ReviewsSection
                merchantId={merchant.id}
                merchantRating={merchant.rating}
                merchantReviewCount={merchant.reviewCount}
              />
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100">
                <CardContent className="p-5 text-center">
                  <h3 className="font-bold text-gray-900 mb-4">إجراءات سريعة</h3>
                  <div className="space-y-3">
                    {merchant.whatsapp && (
                      <a href={`https://wa.me/${merchant.whatsapp}?text=مرحباً، تواصلت معك من يورو عرب ماركت`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium transition">
                        <MessageCircle className="h-5 w-5" /> تواصل عبر واتساب
                      </a>
                    )}
                    {mapsUrl && (
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-medium transition">
                        <Navigation className="h-5 w-5" /> الاتجاهات
                      </a>
                    )}
                    {merchant.phone && (
                      <a href={`tel:${merchant.phone}`}
                        className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-medium transition">
                        <Phone className="h-5 w-5" /> اتصال مباشر
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Share */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">شارك المتجر</h3>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert("تم نسخ الرابط!");
                    }}
                    className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition text-sm"
                  >
                    <Share2 className="h-4 w-4" /> نسخ الرابط
                  </button>
                </CardContent>
              </Card>

              {/* CTA: Add Store */}
              <Link to="/add-store">
                <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white cursor-pointer hover:shadow-lg transition">
                  <CardContent className="p-5 text-center">
                    <Store className="h-8 w-8 mx-auto mb-2 text-amber-400" />
                    <p className="font-bold text-sm mb-1">هل تملك متجر عربي؟</p>
                    <p className="text-gray-400 text-xs mb-3">انضم لدليلنا مجاناً</p>
                    <span className="text-amber-400 text-xs font-medium">أضف متجرك ←</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
