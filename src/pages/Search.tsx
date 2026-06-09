import { useState } from "react";
import { Link } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Store,
  Briefcase,
  MapPin,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const jobTypeNamesAr: Record<string, string> = {
  full_time: "دوام كامل",
  part_time: "دوام جزئي",
  contract: "عقد",
  freelance: "عمل حر",
  temporary: "مؤقت",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [hasSearched, setHasSearched] = useState(false);

  const { data: searchResults, isLoading } = trpc.search.search.useQuery(
    {
      query,
      type: activeTab as "all" | "merchants" | "jobs",
      limit: 20,
    },
    { enabled: hasSearched && query.length > 0 }
  );

  const { data: popularSearches } = trpc.search.popularSearches.useQuery();

  const handleSearch = () => {
    if (query.trim()) {
      setHasSearched(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePopularClick = (searchQuery: string) => {
    setQuery(searchQuery);
    setHasSearched(true);
  };

  const merchants = searchResults?.merchants || [];
  const jobs = searchResults?.jobs || [];
  const total = searchResults?.total || 0;

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            محرك البحث الذكي
          </h1>
          <p className="text-emerald-100 mb-8">
            ابحث عن متاجر، وظائف، وخدمات عربية في أوروبا
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="ابحث عن مطعم، متجر، وظيفة..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pr-12 py-6 text-right bg-white border-0 shadow-xl text-lg"
                  dir="rtl"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-6"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Popular Searches */}
          {!hasSearched && (
            <div className="mt-8">
              <p className="text-emerald-200 text-sm mb-3">
                عمليات البحث الشائعة
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches?.slice(0, 8).map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handlePopularClick(item.query)}
                    className="bg-white/15 hover:bg-white/25 text-white text-sm px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm"
                  >
                    {item.query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-gray-100">
                <TabsTrigger value="all" className="data-[state=active]:bg-white">
                  الكل ({total})
                </TabsTrigger>
                <TabsTrigger value="merchants" className="data-[state=active]:bg-white">
                  المتاجر ({merchants.length})
                </TabsTrigger>
                <TabsTrigger value="jobs" className="data-[state=active]:bg-white">
                  الوظائف ({jobs.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="space-y-6">
              {merchants.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Store className="h-5 w-5 text-emerald-600" />
                    متاجر
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {merchants.map((merchant: any) => (
                      <Link
                        key={merchant.id}
                        to={`/stores/${merchant.slug}`}
                        className="group"
                      >
                        <Card className="hover:shadow-lg transition-all border-gray-100 h-full">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                {merchant.businessNameAr || merchant.businessName}
                              </h3>
                              <Badge
                                variant="outline"
                                className="border-emerald-200 text-emerald-700 text-xs shrink-0"
                              >
                                {categoryNamesAr[merchant.category] || merchant.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                              {merchant.descriptionAr || merchant.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {merchant.city}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                {merchant.rating}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {jobs.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    وظائف
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobs.map((job: any) => (
                      <Link
                        key={job.id}
                        to={`/jobs/${job.id}`}
                        className="group"
                      >
                        <Card className="hover:shadow-lg transition-all border-gray-100">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                {job.titleAr || job.title}
                              </h3>
                              <Badge
                                variant="outline"
                                className="border-blue-200 text-blue-700 text-xs shrink-0"
                              >
                                {jobCategoryNamesAr[job.category] || job.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                              {job.descriptionAr || job.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {job.city}
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {job.salaryMin && job.salaryMax
                                  ? `€${job.salaryMin} - €${job.salaryMax}`
                                  : "راتب مجدي"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {jobTypeNamesAr[job.type] || job.type}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {merchants.length === 0 && jobs.length === 0 && !isLoading && (
                <div className="text-center py-16">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    لا توجد نتائج
                  </h3>
                  <p className="text-gray-500">
                    جرب كلمات بحث مختلفة
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="merchants">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {merchants.map((merchant: any) => (
                  <Link
                    key={merchant.id}
                    to={`/stores/${merchant.slug}`}
                    className="group"
                  >
                    <Card className="hover:shadow-lg transition-all border-gray-100 h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            {merchant.businessNameAr || merchant.businessName}
                          </h3>
                          <Badge
                            variant="outline"
                            className="border-emerald-200 text-emerald-700 text-xs shrink-0"
                          >
                            {categoryNamesAr[merchant.category] || merchant.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {merchant.descriptionAr || merchant.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {merchant.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            {merchant.rating}
                          </span>
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
                </div>
              )}
            </TabsContent>

            <TabsContent value="jobs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job: any) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="group"
                  >
                    <Card className="hover:shadow-lg transition-all border-gray-100">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {job.titleAr || job.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className="border-blue-200 text-blue-700 text-xs shrink-0"
                          >
                            {jobCategoryNamesAr[job.category] || job.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {job.descriptionAr || job.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {job.salaryMin && job.salaryMax
                              ? `€${job.salaryMin} - €${job.salaryMax}`
                              : "راتب مجدي"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              {jobs.length === 0 && !isLoading && (
                <div className="text-center py-16">
                  <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    لا توجد وظائف
                  </h3>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Layout>
  );
}
