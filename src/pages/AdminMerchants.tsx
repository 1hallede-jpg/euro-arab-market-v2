import { useState } from "react";
import { Link } from "react-router";
import { Building2 } from "lucide-react";

const ADMIN_PASS = "admin123";

export default function AdminMerchants() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
        <div className="text-center p-8 max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-8 w-8 text-yellow-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-4">لوحة إدارة التجار</h2>
          <p className="text-gray-400 text-sm mb-6">Merchant Admin Panel</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && password === ADMIN_PASS) setIsAuthenticated(true);
            }}
            placeholder="كلمة المرور..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white text-center placeholder:text-gray-500 focus:border-yellow-400 focus:outline-none mb-4"
          />
          {password && password !== ADMIN_PASS && (
            <p className="text-red-400 text-xs mb-2">غير صحيحة</p>
          )}
          <button
            onClick={() => { if (password === ADMIN_PASS) setIsAuthenticated(true); }}
            className="w-full py-3 rounded-xl bg-yellow-500 text-gray-900 font-bold hover:bg-yellow-400 transition"
          >
            دخول
          </button>
          <Link to="/" className="text-gray-500 text-xs mt-4 inline-block hover:text-gray-300">
            ← رجوع
          </Link>
        </div>
      </div>
    );
  }

  // Authenticated view
  return (
    <div className="min-h-screen bg-[#0a1628]" dir="rtl">
      <div className="border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-white font-bold">لوحة الإدارة</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-gray-400 text-sm">خروج</button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-white">تم تسجيل الدخول بنجاح!</p>
      </div>
    </div>
  );
}
