import { useState, useEffect } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Search,
  TrendingUp,
  Store,
  MapPin,
  Star,
  Eye,
  Shield,
  ArrowLeft,
  RefreshCw,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const ADMIN_PASSWORD = "euro2026!admin"; // Change this!

export default function SecretAdmin() {
  const [pwd, setPwd] = useState("");
  const [auth, setAuth] = useState(false);
  const [err, setErr] = useState(false);

  // Check local auth
  useEffect(() => {
    const saved = localStorage.getItem("sa_auth");
    if (saved === "1") setAuth(true);
  }, []);

  const login = () => {
    if (pwd === ADMIN_PASSWORD) {
      localStorage.setItem("sa_auth", "1");
      setAuth(true);
      setErr(false);
    } else {
      setErr(true);
    }
  };

  // tRPC queries
  const { data: stats } = trpc.analytics.stats.useQuery(undefined, {
    enabled: auth,
    retry: false,
  });
  const { data: popular } = trpc.analytics.popularSearches.useQuery(undefined, {
    enabled: auth,
    retry: false,
  });
  const { data: recent } = trpc.analytics.recentSearches.useQuery(undefined, {
    enabled: auth,
    retry: false,
  });
  const { data: merchantData } = trpc.merchant.list.useQuery(
    { status: "active", limit: 100 },
    { enabled: auth, retry: false }
  );

  // Toggle featured
  const toggleFeatured = trpc.featured.toggle.useMutation({
    onSuccess: () => window.location.reload(),
  });

  if (!auth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#0f0f1a]"
        dir="rtl"
      >
        <div className="w-full max-w-sm mx-4">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              لوحة التحكم
            </h1>
            <p className="text-gray-400 text-sm">Admin Dashboard</p>
          </div>

          <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-amber-500/20">
            <label className="block text-sm text-gray-400 mb-2">
              كلمة المرور
            </label>
            <Input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="أدخل كلمة المرور..."
              className="bg-[#0f0f1a] border-amber-500/20 text-white text-right mb-4"
              dir="rtl"
            />
            {err && (
              <p className="text-red-400 text-xs mb-3">
                كلمة المرور غير صحيحة
              </p>
            )}
            <Button
              onClick={login}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-bold"
            >
              دخول
            </Button>
          </div>

          <p className="text-center text-gray-600 text-xs mt-6">
            يورو عرب ماركت — نظام آمن
          </p>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ───
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-gray-200" dir="rtl">
      {/* Top bar */}
      <header className="border-b border-amber-500/10 bg-[#16162a] px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-amber-500" />
          <h1 className="font-bold text-amber-400">لوحة التحكم السرية</h1>
          <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">
            ON
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            الموقع
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              localStorage.removeItem("sa_auth");
              window.location.reload();
            }}
            className="text-gray-500 hover:text-red-400 text-xs"
          >
            خروج
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "عمليات البحث",
              value: stats?.totalSearches || 0,
              icon: Search,
              color: "text-blue-400",
            },
            {
              label: "إجمالي المتاجر",
              value: stats?.totalMerchants || 0,
              icon: Store,
              color: "text-emerald-400",
            },
            {
              label: "مميز (مدفوع)",
              value: stats?.featuredCount || 0,
              icon: DollarSign,
              color: "text-amber-400",
            },
            {
              label: "المدن",
              value: stats?.citiesCount || 0,
              icon: MapPin,
              color: "text-purple-400",
            },
          ].map((s) => (
            <Card
              key={s.label}
              className="bg-[#1a1a2e] border-amber-500/10"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className={`text-3xl font-bold ${s.color} mt-1`}>
                      {s.value}
                    </p>
                  </div>
                  <s.icon className={`h-8 w-8 ${s.color} opacity-50`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Searches */}
          <Card className="bg-[#1a1a2e] border-amber-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-amber-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                أكثر البحثات شيوعاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              {popular && (popular as any[]).length > 0 ? (
                <div className="space-y-2">
                  {(popular as any[]).slice(0, 10).map((p: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-amber-500/5 last:border-0"
                    >
                      <span className="text-sm text-gray-300">{p.query}</span>
                      <Badge className="bg-amber-500/10 text-amber-400 text-xs">
                        {p.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">
                  لا توجد بيانات بعد
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Searches */}
          <Card className="bg-[#1a1a2e] border-amber-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-amber-400 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                آخر عمليات البحث
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recent && (recent as any[]).length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {(recent as any[]).slice(0, 20).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-amber-500/5 last:border-0"
                    >
                      <div>
                        <span className="text-sm text-gray-300">
                          {r.query}
                        </span>
                        {r.city && (
                          <span className="text-xs text-gray-600 mr-2">
                            ({r.city})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-600">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString("ar-SA")
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">
                  لا توجد بيانات بعد
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Merchant Management */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            إدارة المتاجر
          </h2>

          <Card className="bg-[#1a1a2e] border-amber-500/10">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#16162a] border-b border-amber-500/10">
                    <tr>
                      <th className="px-4 py-3 text-right text-gray-400 font-medium">
                        المتجر
                      </th>
                      <th className="px-4 py-3 text-right text-gray-400 font-medium">
                        المدينة
                      </th>
                      <th className="px-4 py-3 text-right text-gray-400 font-medium">
                        التقييم
                      </th>
                      <th className="px-4 py-3 text-right text-gray-400 font-medium">
                        الحالة
                      </th>
                      <th className="px-4 py-3 text-right text-gray-400 font-medium">
                        إجراء
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/5">
                    {merchantData?.items.map((m: any) => (
                      <tr
                        key={m.id}
                        className="hover:bg-amber-500/5 transition"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-200">
                            {m.businessNameAr || m.businessName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {m.category}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {m.city}
                        </td>
                        <td className="px-4 py-3">
                          {m.rating ? (
                            <span className="flex items-center gap-1 text-yellow-400">
                              <Star className="h-3 w-3 fill-current" />
                              {m.rating}
                            </span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {m.isFeatured ? (
                            <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                              ⭐ مميز
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-700 text-gray-400 text-xs">
                              عضوية
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              toggleFeatured.mutate({
                                id: m.id,
                                featured: !m.isFeatured,
                              })
                            }
                            className={`text-xs ${
                              m.isFeatured
                                ? "text-gray-400 hover:text-red-400"
                                : "text-amber-400 hover:text-amber-300"
                            }`}
                          >
                            {m.isFeatured ? "إلغاء التمييز" : "تمييز"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
