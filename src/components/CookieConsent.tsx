import { useState, useEffect } from "react";
import { X, Cookie, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookies_accepted");
    if (!accepted) {
      setTimeout(() => setShow(true), 1500);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookies_accepted", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <Cookie className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900 text-sm">
                نحن نستخدم ملفات تعريف الارتباط
              </h3>
              <button
                onClick={() => setShow(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed mb-3">
              نستخدم ملفات تعريف الارتباط الأساسية فقط لتحسين تجربتك.
              لا نجمع بيانات شخصية. نلتزم بقانون GDPR.
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={accept}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-full px-4"
              >
                <Shield className="h-3 w-3 ml-1" />
                أوافق
              </Button>
              <Link to="/terms">
                <Button
                  variant="link"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  اقرأ المزيد
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
      `}</style>
    </div>
  );
}
