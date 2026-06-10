import { useState } from "react";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Shield,
  Users,
  Store,
  Briefcase,
  Star,
  Search,
  Clock,
  AlertCircle,
  CheckCircle,
  PauseCircle,
  Trash2,
  RefreshCw,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  suspended: "bg-red-100 text-red-700",
  rejected: "bg-gray-100 text-gray-700",
  open: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
  filled: "bg-blue-100 text-blue-700",
  paused: "bg-orange-100 text-orange-700",
  user: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
};

const statusLabels: Record<string, string> = {
  active: "نشط",
  pending: "معلق",
  suspended: "موقوف",
  rejected: "مرفوض",
  open: "مفتوح",
  closed: "مغلق",
  filled: "مشغول",
  paused: "متوقف",
  user: "مستخدم",
  admin: "أدمن",
};

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [merchantSearch, setMerchantSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const { data: stats } = trpc.admin.stats.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const { data: merchantData, refetch: refetchMerchants } =
    trpc.admin.merchants.useQuery(
      { search: merchantSearch || undefined, limit: 50 },
      { enabled: user?.role === "admin" }
    );

  const { data: jobData, refetch: refetchJobs } = trpc.admin.jobs.useQuery(
    { search: jobSearch || undefined, limit: 50 },
    { enabled: user?.role === "admin" }
  );

  const { data: userData, refetch: refetchUsers } = trpc.admin.users.useQuery(
    { search: userSearch || undefined, limit: 50 },
    { enabled: user?.role === "admin" }
  );

  const { data: activity } = trpc.admin.recentActivity.useQuery(undefined, {
    enabled: user?.role === "admin" && activeTab === "dashboard",
  });

  const utils = trpc.useUtils();

  const updateMerchantStatus = trpc.admin.updateMerchantStatus.useMutation({
    onSuccess: () => {
      refetchMerchants();
      utils.admin.stats.invalidate();
    },
  });

  const deleteMerchant = trpc.admin.deleteMerchant.useMutation({
    onSuccess: () => {
      refetchMerchants();
      utils.admin.stats.invalidate();
    },
  });

  const updateJobStatus = trpc.admin.updateJobStatus.useMutation({
    onSuccess: () => {
      refetchJobs();
      utils.admin.stats.invalidate();
    },
  });

  const deleteJob = trpc.admin.deleteJob.useMutation({
    onSuccess: () => {
      refetchJobs();
      utils.admin.stats.invalidate();
    },
  });

  const updateUserRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => refetchUsers(),
  });

  return (
    <Layout>
      {/* Header */}
      <div className="bg-slate-800 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                لوحة التحكم
              </h1>
              <p className="text-slate-400 text-sm">
                إدارة يورو عرب ماركت
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white border">
            <TabsTrigger value="dashboard" className="gap-1.5">
              <Activity className="h-4 w-4" />
              لوحة المعلومات
            </TabsTrigger>
            <TabsTrigger value="merchants" className="gap-1.5">
              <Store className="h-4 w-4" />
              المتاجر
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-1.5">
              <Briefcase className="h-4 w-4" />
              الوظائف
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="h-4 w-4" />
              المستخدمين
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "المستخدمين",
                  value: stats?.users || 0,
                  icon: Users,
                  color: "text-blue-500",
                  bg: "bg-blue-50",
                },
                {
                  label: "المتاجر",
                  value: stats?.merchants || 0,
                  icon: Store,
                  color: "text-emerald-500",
                  bg: "bg-emerald-50",
                },
                {
                  label: "الوظائف",
                  value: stats?.jobs || 0,
                  icon: Briefcase,
                  color: "text-purple-500",
                  bg: "bg-purple-50",
                },
                {
                  label: "التقييمات",
                  value: stats?.reviews || 0,
                  icon: Star,
                  color: "text-yellow-500",
                  bg: "bg-yellow-50",
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">{stat.label}</p>
                          <p className="text-3xl font-bold text-gray-900 mt-1">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-yellow-600">متاجر معلقة</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {stats?.pendingMerchants || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                  <div>
                    <p className="text-sm text-emerald-600">وظائف مفتوحة</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {stats?.openJobs || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <Search className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">بحث اليوم</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {stats?.todaySearches || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  آخر النشاطات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activity?.merchants.slice(0, 3).map((m: any) => (
                    <div
                      key={`m-${m.id}`}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Store className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          متجر جديد: {m.businessNameAr || m.businessName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {m.city}, {m.country}
                        </p>
                      </div>
                      <Badge className={statusColors[m.status]}>
                        {statusLabels[m.status] || m.status}
                      </Badge>
                    </div>
                  ))}
                  {activity?.jobs.slice(0, 3).map((j: any) => (
                    <div
                      key={`j-${j.id}`}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          وظيفة جديدة: {j.titleAr || j.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {j.city}, {j.country}
                        </p>
                      </div>
                      <Badge className={statusColors[j.status]}>
                        {statusLabels[j.status] || j.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Merchants Tab */}
          <TabsContent value="merchants">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">المتاجر</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="بحث..."
                    value={merchantSearch}
                    onChange={(e) => setMerchantSearch(e.target.value)}
                    className="w-64"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => refetchMerchants()}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المتجر</TableHead>
                      <TableHead>التصنيف</TableHead>
                      <TableHead>المدينة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {merchantData?.items.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">
                          {m.businessNameAr || m.businessName}
                        </TableCell>
                        <TableCell>{m.category}</TableCell>
                        <TableCell>
                          {m.city}, {m.country}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[m.status]}>
                            {statusLabels[m.status] || m.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {m.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() =>
                                  updateMerchantStatus.mutate({
                                    id: m.id,
                                    status: "active",
                                  })
                                }
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {m.status === "active" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                onClick={() =>
                                  updateMerchantStatus.mutate({
                                    id: m.id,
                                    status: "suspended",
                                  })
                                }
                              >
                                <PauseCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (
                                  confirm("هل أنت متأكد من حذف هذا المتجر؟")
                                ) {
                                  deleteMerchant.mutate({ id: m.id });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">الوظائف</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="بحث..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="w-64"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => refetchJobs()}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الوظيفة</TableHead>
                      <TableHead>التصنيف</TableHead>
                      <TableHead>المدينة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobData?.items.map((j: any) => (
                      <TableRow key={j.id}>
                        <TableCell className="font-medium">
                          {j.titleAr || j.title}
                        </TableCell>
                        <TableCell>{j.category}</TableCell>
                        <TableCell>
                          {j.city}, {j.country}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[j.status]}>
                            {statusLabels[j.status] || j.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {j.status === "open" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() =>
                                  updateJobStatus.mutate({
                                    id: j.id,
                                    status: "filled",
                                  })
                                }
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {j.status === "open" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                onClick={() =>
                                  updateJobStatus.mutate({
                                    id: j.id,
                                    status: "paused",
                                  })
                                }
                              >
                                <PauseCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (
                                  confirm("هل أنت متأكد من حذف هذه الوظيفة؟")
                                ) {
                                  deleteJob.mutate({ id: j.id });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">المستخدمين</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="بحث..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-64"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => refetchUsers()}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>البريد</TableHead>
                      <TableHead>الدور</TableHead>
                      <TableHead>تاريخ التسجيل</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userData?.items.map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="h-4 w-4 text-gray-500" />
                              </div>
                            )}
                            {u.name || "بدون اسم"}
                          </div>
                        </TableCell>
                        <TableCell>{u.email || "-"}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[u.role]}>
                            {statusLabels[u.role] || u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString("ar-SA")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateUserRole.mutate({
                                id: u.id,
                                role: u.role === "admin" ? "user" : "admin",
                              })
                            }
                          >
                            {u.role === "admin"
                              ? "إزالة أدمن"
                              : "جعل أدمن"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
