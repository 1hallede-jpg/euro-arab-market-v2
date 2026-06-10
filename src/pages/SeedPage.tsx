import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2, Database } from "lucide-react";

export default function SeedPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const runSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trpc/seed.runSeed", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json();
      setResult(data.result?.data || data);
    } catch (e) { setResult({ success: false, message: "Error" }); }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">اضافة المتاجر</CardTitle>
          <p className="text-gray-500 mt-2">اضغط الزر لاضافة 50 متجر عربي</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runSeed} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg">
            {loading ? <><Loader2 className="h-5 w-5 animate-spin ml-2" /> جاري...</> : "اضافة 50 متجر الان"}
          </Button>
          {result && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {result.success ? <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" /> : <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />}
              <div>
                <p className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>{result.message}</p>
                {result.count !== undefined && <p className="text-sm text-gray-500 mt-1">عدد المتاجر: {result.count}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
