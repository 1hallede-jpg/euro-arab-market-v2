import { useState } from "react";
import { Link } from "react-router";
import { LogIn, AlertCircle } from "lucide-react";
import Logo from "@/components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@euroarabmarket.com" && password === "Sindbad2024!Admin") {
      window.location.href = "/admin/merchants";
    } else {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
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
              <p className="text-white/40 text-sm">Login to Sindbad Admin Panel</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

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
