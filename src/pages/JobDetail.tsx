import { useParams, Link } from "react-router";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import {
  Briefcase,
  MapPin,
  TrendingUp,
  Clock,
  ArrowLeft,
  GraduationCap,
  Mail,
  Phone,
  ListChecks,
  Sparkles,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading } = trpc.job.getById.useQuery(
    { id: Number(id) },
    { enabled: !!id && !isNaN(Number(id)) }
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="h-32 w-full rounded-xl mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            الوظيفة غير موجودة
          </h2>
          <p className="text-gray-500 mb-6">
            الوظيفة اللي تبحث عنها غير موجودة أو تم حذفها
          </p>
          <Link to="/jobs">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للوظائف
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="bg-blue-600 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1 text-blue-200 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للوظائف
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {job.titleAr || job.title}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-white/20 text-white border-white/30">
              {jobCategoryNamesAr[job.category] || job.category}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30">
              {jobTypeNamesAr[job.type] || job.type}
            </Badge>
            {job.isRemote && (
              <Badge className="bg-green-400/30 text-green-100 border-green-400/30">
                عمل عن بعد
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  وصف الوظيفة
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {job.descriptionAr || job.description}
                </p>
              </CardContent>
            </Card>

            {job.requirementsAr || job.requirements ? (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-emerald-500" />
                    المتطلبات
                  </h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {job.requirementsAr || job.requirements}
                  </p>
                </CardContent>
              </Card>
            ) : null}

            {job.skills ? (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-gray-900 mb-3">
                    المهارات المطلوبة
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.split(",").map((skill: any) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="border-blue-200 text-blue-700"
                      >
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-gray-900">
                  تفاصيل الوظيفة
                </h3>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">الموقع</p>
                    <p className="text-sm text-gray-700">
                      {job.city}, {job.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">الراتب</p>
                    <p className="text-sm text-gray-700">
                      {job.salaryMin && job.salaryMax
                        ? `€${job.salaryMin} - €${job.salaryMax} ${job.salaryCurrency || "EUR"}`
                        : "راتب مجدي"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">نوع العمل</p>
                    <p className="text-sm text-gray-700">
                      {jobTypeNamesAr[job.type] || job.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">مستوى الخبرة</p>
                    <p className="text-sm text-gray-700">
                      {job.experienceLevel === "entry"
                        ? "مبتدئ"
                        : job.experienceLevel === "mid"
                        ? "متوسط"
                        : job.experienceLevel === "senior"
                        ? "خبير"
                        : job.experienceLevel === "expert"
                        ? "خبير جداً"
                        : "غير محدد"}
                    </p>
                  </div>
                </div>

                {job.expiresAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">تاريخ الإغلاق</p>
                      <p className="text-sm text-gray-700">
                        {new Date(job.expiresAt).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-gray-900">معلومات التواصل</h3>

                {job.contactEmail && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">البريد</p>
                      <a
                        href={`mailto:${job.contactEmail}`}
                        className="text-sm text-gray-700 hover:text-blue-600"
                      >
                        {job.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {job.contactPhone && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">الهاتف</p>
                      <a
                        href={`tel:${job.contactPhone}`}
                        className="text-sm text-gray-700 hover:text-green-600"
                      >
                        {job.contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                <Button className="w-full bg-blue-500 hover:bg-blue-600 mt-2">
                  <Mail className="h-4 w-4 ml-2" />
                  تقدم للوظيفة
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
