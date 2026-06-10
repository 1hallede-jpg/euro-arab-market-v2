import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Briefcase,
  MapPin,
  TrendingUp,
  Clock,
  SlidersHorizontal,
  X,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const selectedCategory = searchParams.get("category") || undefined;
  const selectedType = searchParams.get("type") || undefined;

  const { data: jobData, isLoading } = trpc.job.list.useQuery({
    category: selectedCategory,
    type: selectedType,
    search: searchQuery || undefined,
    limit: 24,
    offset: 0,
  });

  const { data: categories } = trpc.job.categories.useQuery();

  const jobs = jobData?.items || [];
  const total = jobData?.total || 0;

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
      <div className="bg-blue-600 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="h-8 w-8 text-blue-200" />
            <h1 className="text-3xl font-bold text-white">المهن العربية</h1>
          </div>
          <p className="text-blue-100">
            فرص عمل للعرب في مختلف المجالات في أوروبا
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="ابحث عن وظيفة..."
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
            {(selectedCategory || selectedType) && (
              <Badge
                variant="secondary"
                className="mr-1 bg-blue-100 text-blue-700"
              >
                {(selectedCategory ? 1 : 0) + (selectedType ? 1 : 0)}
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
                    className={!selectedCategory ? "bg-blue-500" : ""}
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
                        selectedCategory === cat.nameEn ? "bg-blue-500" : ""
                      }
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع العمل
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!selectedType ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter("type", undefined)}
                    className={!selectedType ? "bg-blue-500" : ""}
                  >
                    الكل
                  </Button>
                  {Object.entries(jobTypeNamesAr).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedType === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilter("type", key)}
                      className={selectedType === key ? "bg-blue-500" : ""}
                    >
                      {label}
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
            {isLoading ? "جاري التحميل..." : `${total} وظيفة`}
          </p>
        </div>

        {/* Jobs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job: any) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="group">
              <Card className="hover:shadow-lg transition-all border-gray-100 group-hover:border-blue-200 h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {job.titleAr || job.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-xs border-blue-200 text-blue-700"
                        >
                          {jobCategoryNamesAr[job.category] || job.category}
                        </Badge>
                        {job.isRemote && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            عن بعد
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {job.descriptionAr || job.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
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
                          <Clock className="h-3.5 w-3.5" />
                          {jobTypeNamesAr[job.type] || job.type}
                        </div>
                        {job.experienceLevel && (
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {job.experienceLevel === "entry"
                              ? "مبتدئ"
                              : job.experienceLevel === "mid"
                              ? "متوسط"
                              : job.experienceLevel === "senior"
                              ? "خبير"
                              : "خبير جداً"}
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowLeft className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0 mr-2" />
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
            <p className="text-gray-500">
              جرب تغيير معايير البحث أو التصفية
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
