import { useParams, Link } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import {
  Store,
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  Clock,
  ArrowLeft,
  BadgeCheck,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
  other: "أخرى",
};

export default function StoreDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: merchant, isLoading } = trpc.merchant.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="h-64 w-full rounded-xl mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Layout>
    );
  }

  if (!merchant) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            المتجر غير موجود
          </h2>
          <p className="text-gray-500 mb-6">
            المتجر اللي تبحث عنه غير موجود أو تم حذفه
          </p>
          <Link to="/stores">
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للمتاجر
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 bg-gray-200">
        {merchant.coverImage ? (
          <img
            src={merchant.coverImage}
            alt={merchant.businessName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <Store className="h-20 w-20 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="mx-auto max-w-4xl">
            <Link
              to="/stores"
              className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للمتاجر
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {merchant.businessNameAr || merchant.businessName}
                </h1>
                {merchant.isVerified && (
                  <Badge className="bg-emerald-500 text-white">
                    <BadgeCheck className="h-3.5 w-3.5 mr-1" />
                    موثق
                  </Badge>
                )}
              </div>
              <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                {categoryNamesAr[merchant.category] || merchant.category}
              </Badge>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {merchant.descriptionAr || merchant.description || "لا يوجد وصف"}
            </p>

            {/* Reviews Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  التقييمات
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-600">
                      {merchant.rating}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Number(merchant.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {merchant.reviewCount} تقييم
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-gray-900">معلومات التواصل</h3>

                {merchant.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">الهاتف</p>
                      <a
                        href={`tel:${merchant.phone}`}
                        className="text-sm text-gray-700 hover:text-emerald-600"
                      >
                        {merchant.phone}
                      </a>
                    </div>
                  </div>
                )}

                {merchant.whatsapp && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">واتساب</p>
                      <a
                        href={`https://wa.me/${merchant.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-700 hover:text-green-600"
                      >
                        {merchant.whatsapp}
                      </a>
                    </div>
                  </div>
                )}

                {merchant.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">البريد</p>
                      <a
                        href={`mailto:${merchant.email}`}
                        className="text-sm text-gray-700 hover:text-blue-600"
                      >
                        {merchant.email}
                      </a>
                    </div>
                  </div>
                )}

                {merchant.website && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                      <Globe className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">الموقع</p>
                      <a
                        href={merchant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-700 hover:text-purple-600"
                      >
                        زيارة الموقع
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">العنوان</p>
                    <p className="text-sm text-gray-700">
                      {merchant.city}, {merchant.country}
                    </p>
                    {merchant.address && (
                      <p className="text-xs text-gray-500">
                        {merchant.address}
                      </p>
                    )}
                  </div>
                </div>

                {!!merchant.openingHours && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">ساعات العمل</p>
                      <p className="text-sm text-gray-700">
                        متاح اليوم
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="overflow-hidden">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">الموقع على الخريطة</p>
                  <p className="text-xs text-gray-300">
                    {merchant.latitude && merchant.longitude
                      ? `${merchant.latitude}, ${merchant.longitude}`
                      : "غير متوفر"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
