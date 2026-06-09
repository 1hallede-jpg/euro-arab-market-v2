import { Link } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Store,
  Briefcase,
  MapPin,
  Star,
  Phone,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Users,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categoryIcons: Record<string, string> = {
  restaurant: "🍽️",
  supermarket: "🛒",
  sweets: "🧁",
  barber: "💈",
  butcher: "🥩",
  bakery: "🍞",
  cafe: "☕",
  clothing: "👕",
  electronics: "📱",
  pharmacy: "💊",
  other: "🏪",
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
  other: "أخرى",
};

const jobCategoryNamesAr: Record<string, string> = {
  construction: "بناء",
  driving: "قيادة",
  photography: "تصوير",
  painting: "دهان",
  plumbing: "سباكة",
  electrician: "كهرباء",
  carpentry: "نجارة",
  cleaning: "تنظيف",
  cooking: "طبخ",
  it: "تكنولوجيا",
  translation: "ترجمة",
  accounting: "محاسبة",
  medical: "طب",
  education: "تعليم",
  other: "أخرى",
};

export default function Home() {
  const { data: merchantCategories } = trpc.merchant.categories.useQuery();
  const { data: featuredMerchants } = trpc.merchant.featured.useQuery();
  const { data: recentJobs } = trpc.job.recent.useQuery({ limit: 4 });

  const stats = [
    { icon: Store, value: "500+", label: "متجر عربي" },
    { icon: Briefcase, value: "1,200+", label: "وظيفة متاحة" },
    { icon: Users, value: "10,000+", label: "مستخدم نشط" },
    { icon: Globe, value: "15+", label: "دولة أوروبية" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <Badge
              variant="secondary"
              className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-4 py-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 ml-1" />
              دليل المتاجر والمهن العربية في أوروبا
            </Badge>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              يورو عرب ماركت
              <span className="block text-emerald-200 text-2xl md:text-3xl mt-2 font-normal">
                Euro Arab Market
              </span>
            </h1>

            <p className="text-lg md:text-xl text-emerald-100 mb-8 leading-relaxed">
              محرك البحث الذكي للمحلات والخدمات العربية في أوروبا. نوصلك بكل ما
              تحتاجه من مطاعم ومتاجر ومهن عربية.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <Link
                to="/search"
                className="flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-5 py-4 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 hover:bg-white/20 transition-all cursor-pointer"
              >
                <Search className="h-5 w-5 text-white/70 shrink-0" />
                <span className="text-white/70">
                  ابحث عن مطاعم، متاجر، مهن، خدمات...
                </span>
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/stores">
                <Button
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-6"
                >
                  <Store className="h-5 w-5 ml-2" />
                  استكشف المتاجر
                </Button>
              </Link>
              <Link to="/jobs">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/15 font-semibold px-6"
                >
                  <Briefcase className="h-5 w-5 ml-2" />
                  فرص العمل
                </Button>
              </Link>
              <Link to="/sindbad">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/15 font-semibold px-6"
                >
                  <Sparkles className="h-5 w-5 ml-2" />
                  سندباد
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center text-center"
                  >
                    <Icon className="h-6 w-6 text-emerald-300 mb-2" />
                    <span className="text-2xl font-bold text-white">
                      {stat.value}
                    </span>
                    <span className="text-sm text-emerald-200">
                      {stat.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              تصفح حسب التصنيف
            </h2>
            <p className="text-gray-500">
              اختر التصنيف اللي تبيه واكتشف المحلات العربية
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {merchantCategories?.map((cat: any) => (
              <Link
                key={cat.id}
                to={`/stores?category=${cat.nameEn}`}
                className="group flex flex-col items-center p-5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all bg-white"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  {categoryIcons[cat.nameEn] || "🏪"}
                </div>
                <span className="text-sm font-medium text-gray-800 text-center group-hover:text-emerald-700 transition-colors">
                  {cat.name}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {cat.count} متجر
                </span>
              </Link>
            )) ||
              [1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl border border-gray-100 bg-gray-50 animate-pulse"
                />
              ))}
          </div>
        </div>
      </section>

      {/* Featured Merchants */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                متاجر مميزة
              </h2>
              <p className="text-gray-500 text-sm">
                أفضل المتاجر العربية الموصى بها
              </p>
            </div>
            <Link
              to="/stores"
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
            >
              عرض الكل
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMerchants?.slice(0, 6).map((merchant: any) => (
              <Link
                key={merchant.id}
                to={`/stores/${merchant.slug}`}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-sm">
                  <div className="relative h-44 bg-gray-200 overflow-hidden">
                    {merchant.coverImage ? (
                      <img
                        src={merchant.coverImage}
                        alt={merchant.businessName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <Store className="h-12 w-12 text-white/50" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-emerald-700 backdrop-blur-sm">
                        {categoryNamesAr[merchant.category] || merchant.category}
                      </Badge>
                    </div>
                    {merchant.isVerified && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-emerald-500 text-white">
                          <Star className="h-3 w-3 mr-1 fill-white" />
                          موثق
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                      {merchant.businessNameAr || merchant.businessName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {merchant.descriptionAr || merchant.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {merchant.city}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        {merchant.rating}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )) ||
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-72 rounded-xl bg-gray-200 animate-pulse"
                />
              ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                أحدث الوظائف
              </h2>
              <p className="text-gray-500 text-sm">
                فرص عمل للعرب في أوروبا
              </p>
            </div>
            <Link
              to="/jobs"
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
            >
              عرض الكل
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentJobs?.map((job: any) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="group">
                <Card className="hover:shadow-lg transition-all border-gray-100 group-hover:border-emerald-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            {job.titleAr || job.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-xs border-emerald-200 text-emerald-700"
                          >
                            {jobCategoryNamesAr[job.category] || job.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {job.descriptionAr || job.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.city}, {job.country}
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {job.salaryMin && job.salaryMax
                              ? `€${job.salaryMin} - €${job.salaryMax}`
                              : "راتب مجدي"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {job.type === "full_time"
                              ? "دوام كامل"
                              : job.type === "part_time"
                              ? "دوام جزئي"
                              : job.type === "contract"
                              ? "عقد"
                              : job.type === "freelance"
                              ? "عمل حر"
                              : "مؤقت"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )) ||
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl bg-gray-100 animate-pulse"
                />
              ))}
          </div>
        </div>
      </section>

      {/* Sindbad CTA Section */}
      <section className="py-16 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 text-center md:text-right">
              <Badge className="mb-4 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <Sparkles className="h-3 w-3 ml-1" />
                مساعدك الذكي
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                سندباد في خدمتك
              </h2>
              <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                اسأل سندباد عن أي شيء تحتاجه في أوروبا - مطاعم، متاجر، خدمات،
                وعناوين. عندك 3 أمنيات يومياً!
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link to="/sindbad">
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                  >
                    <Sparkles className="h-5 w-5 ml-2" />
                    تحدث مع سندباد
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <span className="text-6xl md:text-7xl">🧞‍♂️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              كيف يعمل الموقع؟
            </h2>
            <p className="text-gray-500">
              ثلاث خطوات بسيطة للوصول لكل ما تحتاجه
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "ابحث",
                description:
                  "استخدم محرك البحث الذكي أو تصفح التصنيفات للعثور على ما تحتاجه",
                icon: Search,
                color: "bg-blue-50 text-blue-600",
              },
              {
                step: "02",
                title: "اكتشف",
                description:
                  "تصفح التفاصيل والصور والتقييمات واختر الأنسب لك",
                icon: TrendingUp,
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                step: "03",
                title: "تواصل",
                description:
                  "اتصل مباشرة بالمتجر أوقدم على الوظيفة بكل سهولة",
                icon: Phone,
                color: "bg-purple-50 text-purple-600",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="text-center p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition-all"
                >
                  <div className="text-5xl font-bold text-gray-100 mb-4">
                    {item.step}
                  </div>
                  <div
                    className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
