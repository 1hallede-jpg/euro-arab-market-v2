import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import {
  Search,
  Store,
  MapPin,
  Star,
  UtensilsCrossed,
  ShoppingCart,
  CakeSlice,
  Scissors,
  Beef,
  Coffee,
  Shirt,
  Smartphone,
  Pill,
  Sparkles,
  Briefcase,
  ChevronLeft,
  TrendingUp,
  Globe,
  Users,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const categories = [
  { id: "restaurant", name: "مطاعم عربية", icon: UtensilsCrossed, color: "bg-amber-50 text-amber-600" },
  { id: "supermarket", name: "سوبرماركت حلال", icon: ShoppingCart, color: "bg-emerald-50 text-emerald-600" },
  { id: "sweets", name: "حلويات شرقية", icon: CakeSlice, color: "bg-pink-50 text-pink-600" },
  { id: "barber", name: "صالونات حلاقة", icon: Scissors, color: "bg-blue-50 text-blue-600" },
  { id: "butcher", name: "جزار حلال", icon: Beef, color: "bg-red-50 text-red-600" },
  { id: "bakery", name: "مخابز", icon: Coffee, color: "bg-orange-50 text-orange-600" },
  { id: "cafe", name: "مقاهي", icon: Coffee, color: "bg-yellow-50 text-yellow-600" },
  { id: "clothing", name: "ملابس", icon: Shirt, color: "bg-purple-50 text-purple-600" },
  { id: "electronics", name: "إلكترونيات", icon: Smartphone, color: "bg-cyan-50 text-cyan-600" },
  { id: "pharmacy", name: "صيدليات", icon: Pill, color: "bg-green-50 text-green-600" },
];

const featuredCities = [
  { name: "باريس", country: "فرنسا", stores: 12, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop" },
  { name: "برلين", country: "ألمانيا", stores: 10, image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400&h=300&fit=crop" },
  { name: "لندن", country: "بريطانيا", stores: 8, image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop" },
  { name: "أمستردام", country: "هولندا", stores: 6, image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a2?w=400&h=300&fit=crop" },
  { name: "فيينا", country: "النمسا", stores: 5, image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&h=300&fit=crop" },
  { name: "بروكسل", country: "بلجيكا", stores: 4, image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop" },
];

const howItWorks = [
  { icon: Search, title: "ابحث", desc: "ابحث عن المتاجر والخدمات العربية في مدينتك" },
  { icon: MapPin, title: "اكتشف", desc: "تصفح التفاصيل والتقييمات والموقع على الخريطة" },
  { icon: Store, title: "تصفح", desc: "شاهد الصور وساعات العمل وطرق الدفع المتاحة" },
  { icon: Globe, title: "تواصل", desc: "اتصل مباشرة أو تواصل عبر واتساب" },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: featuredData } = trpc.merchant.list.useQuery({
    featured: true,
    limit: 8,
    offset: 0,
  });

  const { data: recentData } = trpc.merchant.list.useQuery({
    limit: 4,
    offset: 0,
  });

  const { data: jobData } = trpc.job.list.useQuery({
    limit: 4,
    offset: 0,
  });

  const featuredStores = featuredData?.items || [];
  const recentStores = recentData?.items || [];
  const jobs = jobData?.items || [];

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
  };

  return (
    <Layout>
      {/* ====== HERO SECTION ====== */}
      <section className="relative bg-emerald-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?w=1200&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-600/90 to-emerald-700/95"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-white/20 text-white border-0 mb-4 text-sm px-4 py-1.5 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              أكبر دليل عربي في أوروبا
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              اكتشف عالمك العربي في{" "}
              <span className="text-emerald-200">أوروبا</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-8 leading-relaxed max-w-2xl mx-auto">
              مطاعم، متاجر، حلاقين، جزارين حلال وكل ما يحتاجه العرب في أوروبا في
              مكان واحد
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن مطعم، متجر، خدمة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-12 pl-4 py-3.5 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                    dir="rtl"
                  />
                </div>
                <Link to={searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : "/search"} className="shrink-0">
                  <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 rounded-xl text-base font-semibold">
                    <Search className="h-5 w-5 ml-2" />
                    بحث
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              <div className="flex items-center gap-2 text-white">
                <Building2 className="h-5 w-5 text-emerald-300" />
                <span className="font-bold">50+</span>
                <span className="text-emerald-200 text-sm">متجر</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <MapPin className="h-5 w-5 text-emerald-300" />
                <span className="font-bold">15+</span>
                <span className="text-emerald-200 text-sm">مدينة</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-emerald-300" />
                <span className="font-bold">6</span>
                <span className="text-emerald-200 text-sm">دول أوروبية</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 80V40C240 80 480 0 720 0C960 0 1200 80 1440 40V80H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* ====== CATEGORIES BAR ====== */}
      <section className="bg-gray-50 py-8 -mt-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={`/stores?category=${cat.id}`}
                  className="flex flex-col items-center gap-2 min-w-[80px] group"
                >
                  <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== FEATURED STORES ====== */}
      {featuredStores.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">متاجر مميزة</h2>
                <p className="text-gray-500 mt-1">أفضل المتاجر العربية الموصى بها</p>
              </div>
              <Link to="/stores">
                <Button variant="outline" className="flex items-center gap-1">
                  عرض الكل
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredStores.map((store: any) => (
                <Link key={store.id} to={`/stores/${store.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-sm h-full">
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      {store.coverImage ? (
                        <img
                          src={store.coverImage}
                          alt={store.businessName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                          <Store className="h-12 w-12 text-white/50" />
                        </div>
                      )}
                      {store.isFeatured && (
                        <Badge className="absolute top-3 left-3 bg-emerald-500 text-white">
                          <Star className="h-3 w-3 mr-1 fill-white" />
                          مميز
                        </Badge>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 text-gray-700 text-xs backdrop-blur-sm">
                          {categoryNamesAr[store.category] || store.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                        {store.businessNameAr || store.businessName}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {store.descriptionAr || store.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {store.city}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">{store.rating}</span>
                          <span className="text-gray-400">({store.reviewCount})</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== RECENTLY ADDED ====== */}
      {recentStores.length > 0 && (
        <section className="py-12 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">إضافات حديثة</h2>
                <p className="text-gray-500 mt-1">أحدث المتاجر المضافة للدليل</p>
              </div>
              <Link to="/stores">
                <Button variant="outline" className="flex items-center gap-1">
                  عرض الكل
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentStores.map((store: any) => (
                <Link key={store.id} to={`/stores/${store.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-sm h-full">
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      {store.coverImage ? (
                        <img
                          src={store.coverImage}
                          alt={store.businessName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                          <Store className="h-12 w-12 text-white/50" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 text-gray-700 text-xs backdrop-blur-sm">
                          {categoryNamesAr[store.category] || store.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                        {store.businessNameAr || store.businessName}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {store.descriptionAr || store.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {store.city}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">{store.rating}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== CITIES GRID ====== */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              استكشف حسب المدينة
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              اعثر على المتاجر العربية في أكبر المدن الأوروبية
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredCities.map((city) => (
              <Link
                key={city.name}
                to={`/stores?city=${city.name}`}
                className="group relative h-48 rounded-2xl overflow-hidden"
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="text-xl font-bold mb-1">{city.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/80">{city.country}</span>
                    <span className="text-sm bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {city.stores} متجر
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              كيف يعمل يورو عرب ماركت؟
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              ثلاث خطوات بسيطة للعثور على كل ما تحتاجه
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="text-center group">
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== JOBS SECTION ====== */}
      {jobs.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">وظائف عربية</h2>
                <p className="text-gray-500 mt-1">فرص عمل للعرب في أوروبا</p>
              </div>
              <Link to="/jobs">
                <Button variant="outline" className="flex items-center gap-1">
                  عرض الكل
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {jobs.map((job: any) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="group">
                  <Card className="hover:shadow-lg transition-all border-0 shadow-sm h-full">
                    <CardContent className="p-5">
                      <Badge variant="outline" className="mb-3 text-xs">
                        {job.category}
                      </Badge>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                        {job.titleAr || job.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {job.descriptionAr || job.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.city}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {job.type === "full_time" ? "دوام كامل" :
                           job.type === "part_time" ? "دوام جزئي" :
                           job.type === "freelance" ? "حر" : "عقد"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== SINDBAD CTA ====== */}
      <section className="py-16 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
            🧞‍♂️
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            سندباد - مساعدك الذكي
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            اسأل سندباد عن أي شيء! هو يعرف كل المتاجر العربية في أوروبا ويساعدك
            في إيجاد ما تحتاجه بسرعة. لديك 3 أمنيات يومياً!
          </p>
          <Link to="/sindbad">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-emerald-500/30">
              <Sparkles className="h-5 w-5 ml-2" />
              تحدث مع سندباد
            </Button>
          </Link>
        </div>
      </section>

      {/* ====== SOCIAL PROOF / STATS ====== */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl bg-emerald-50">
              <Store className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">50+</div>
              <div className="text-sm text-gray-500">متجر عربي</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-blue-50">
              <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">15+</div>
              <div className="text-sm text-gray-500">مدينة أوروبية</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-amber-50">
              <TrendingUp className="h-8 w-8 text-amber-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">10+</div>
              <div className="text-sm text-gray-500">تصنيف مختلف</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-purple-50">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">6</div>
              <div className="text-sm text-gray-500">دول أوروبية</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
