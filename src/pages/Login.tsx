import { useState, useEffect } from "react";
import { Link } from "react-router";
import { LogIn, AlertCircle, Shield } from "lucide-react";
import Logo from "@/components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);
  const [googleConfigured, setGoogleConfigured] = useState(true);

  // Check if Google OAuth is configured
  useEffect(() => {
    async function checkGoogleAuth() {
      try {
        const res = await fetch("/api/trpc/googleAuth.getAuthUrl");
        const data = await res.json();
        const result = data?.result?.data?.json;
        if (result?.url) {
          setGoogleUrl(result.url);
        } else if (result?.error) {
          setGoogleConfigured(false);
        }
      } catch {
        setGoogleConfigured(false);
      }
    }
    checkGoogleAuth();

    // Also check if we have a token from Google OAuth callback
    const params = new URLSearchParams(window.location.search);
    const googleError = params.get("error");
    if (googleError) {
      setError(googleError === "access_denied" ? "تم إلغاء تسجيل الدخول" : "حدث خطأ في تسجيل الدخول");
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@euroarabmarket.com" && password === "Sindbad2024!Admin") {
      window.location.href = "/admin/merchants";
    } else {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  };

  const handleGoogleLogin = () => {
    if (googleUrl) {
      window.location.href = googleUrl;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a1628" }} dir="rtl">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a1628]/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Logo size="sm" />
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#c9a227]/10 flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-8 w-8 text-[#c9a227]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">تسجيل الدخول</h1>
              <p className="text-white/40 text-sm">Login to Sindbad</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Google Login Button */}
            {googleConfigured && (
              <button
                onClick={handleGoogleLogin}
                disabled={!googleUrl}
                className="w-full py-3 rounded-xl bg-white text-gray-800 font-bold text-sm hover:bg-gray-100 transition flex items-center justify-center gap-3 mb-4 border border-gray-200 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                تسجيل الدخول بحساب Google
              </button>
            )}

            {!googleConfigured && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4 text-yellow-400 text-sm text-center">
                تسجيل الدخول عبر Google قيد الإعداد
              </div>
            )}

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs">أو</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Admin Login */}
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-white/40" />
              <span className="text-white/40 text-xs">تسجيل دخول الإدارة</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white text-sm mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@euroarabmarket.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:border-[#c9a227] focus:outline-none transition"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-white text-sm mb-2">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:border-[#c9a227] focus:outline-none transition"
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e8b923] text-[#0a1628] font-bold text-lg hover:shadow-lg hover:shadow-[#c9a227]/30 transition"
              >
                تسجيل الدخول
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/" className="text-[#c9a227] text-sm hover:text-[#ffd700] transition">
                ← العودة للرئيسية
              </Link>
            </div>
          </div>

          <p className="text-center text-white/20 text-xs mt-6">
            سندباد | دليلك العربي في أوروبا
          </p>
        </div>
      </div>
    </div>
  );
}
