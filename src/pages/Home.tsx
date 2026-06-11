import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Sparkles,
  X,
  Send,
  User,
  Loader2,
  Globe,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ============ PARTICLES BACKGROUND ============
function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: { x: number; y: number; r: number; dx: number; dy: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx *= -1;
        if (p.y < 0 || p.y > h) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`; // Gold
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

// ============ SINDBAD CHAT ============
function SindbadChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "أنا سندباد، دليلك الذكي.\nاسألني عن أي متجر أو خدمة عربية في أوروبا...",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: merchantData } = trpc.merchant.list.useQuery(
    { status: "active", limit: 100 },
    { enabled: isOpen }
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", content: userMsg }]);
    setIsLoading(true);

    const terms = userMsg.toLowerCase();
    const matches =
      merchantData?.items.filter((m) => {
        const text = `${m.businessNameAr} ${m.businessName} ${m.category} ${m.city} ${m.country} ${m.tags}`.toLowerCase();
        return terms.split(" ").some((t) => text.includes(t));
      }) || [];

    setTimeout(() => {
      let r = "";
      if (matches.length > 0) {
        r = `وجدت ${matches.length} نتيجة:\n\n`;
        matches.slice(0, 5).forEach((m, i) => {
          r += `${i + 1}. **${m.businessNameAr || m.businessName}** — ${m.city}`;
          if (m.rating) r += ` ⭐${m.rating}`;
          if (m.phone) r += `\n   📞 ${m.phone}`;
          r += "\n\n";
        });
      } else {
        r = "لم أجد نتائج مباشرة.\n\nجرب: مطعم سوري في باريس، جزار حلال في برلين، سوبرماركت عربي في لندن...";
      }
      setMessages((p) => [...p, { role: "assistant", content: r }]);
      setIsLoading(false);
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg h-[70vh] bg-[#1a1a2e] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-amber-500/20">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/20 bg-gradient-to-r from-[#1a1a2e] to-[#16213e]">
          <div className="flex items-center gap-3">
            <img src="/sindbad-icon.png" alt="" className="w-10 h-10" />
            <div>
              <h3 className="font-bold text-amber-400 text-lg">سندباد</h3>
              <p className="text-xs text-amber-400/50">دليلك الذكي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "assistant"
                    ? "bg-gradient-to-br from-amber-400 to-amber-600"
                    : "bg-gray-700"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Sparkles className="h-4 w-4 text-white" />
                ) : (
                  <User className="h-4 w-4 text-gray-300" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "assistant"
                    ? "bg-[#16213e] text-gray-200 border border-amber-500/10"
                    : "bg-amber-500 text-black font-medium"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="bg-[#16213e] rounded-2xl px-4 py-3 border border-amber-500/10">
                <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-amber-500/20 bg-[#1a1a2e]">
          <div className="flex items-center gap-2 bg-[#16213e] rounded-full px-4 py-2 border border-amber-500/20">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اسأل سندباد عن أي متجر..."
              className="border-0 bg-transparent focus-visible:ring-0 text-right text-gray-200 placeholder:text-gray-500"
              dir="rtl"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black rounded-full hover:from-amber-500 hover:to-amber-700 disabled:opacity-50 transition-all shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ MAIN HOME PAGE ============
export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showSindbad, setShowSindbad] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      dir="rtl"
    >
      <ParticlesBackground />

      {/* Soft gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(212,175,55,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Navbar */}
      <nav
        className="relative flex items-center justify-between px-8 py-5"
        style={{ zIndex: 10 }}
      >
        <div className="flex items-center gap-2">
          <img src="/sindbad-icon.png" alt="" className="w-7 h-7" />
          <span className="font-bold text-gray-700 text-sm tracking-wide">
            يورو عرب ماركت
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link
            to="/stores"
            className="text-gray-500 hover:text-amber-600 transition-colors"
          >
            المتاجر
          </Link>
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              setShowSindbad(true);
            }}
            className="text-amber-600 font-medium hover:text-amber-700 transition-colors flex items-center gap-1"
          >
            <Sparkles className="h-3.5 w-3.5" />
            سندباد
          </Link>
          <Link
            to="/admin"
            className="text-gray-300 hover:text-gray-500 transition-colors text-xs"
          >
            إدارة
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-4 -mt-16"
        style={{ zIndex: 10 }}
      >
        {/* Sindbad Lamp */}
        <div className="mb-6 animate-fade-in">
          <img
            src="/sindbad-icon.png"
            alt="سندباد"
            className="w-28 h-28 md:w-36 md:h-36 drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 8px 32px rgba(212,175,55,0.3))",
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight text-center">
          يورو عرب ماركت
        </h1>
        <p className="text-gray-400 text-base md:text-lg mb-10 text-center">
          محرك البحث للعالم العربي في أوروبا
        </p>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="w-full max-w-xl mb-4">
          <div
            className={`relative flex items-center bg-white rounded-full shadow-lg transition-all duration-300 border ${
              isFocused
                ? "border-amber-400 shadow-xl shadow-amber-500/20"
                : "border-gray-200"
            }`}
          >
            <Search className="h-5 w-5 text-gray-400 mr-5 shrink-0" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="ابحث عن مطاعم، متاجر، خدمات عربية..."
              className="border-0 bg-transparent focus-visible:ring-0 text-right text-base py-6"
              dir="rtl"
            />
            <button
              type="button"
              onClick={() => setShowSindbad(true)}
              className="ml-2 p-2.5 rounded-full hover:bg-amber-50 text-amber-500 transition-colors shrink-0"
              title="اسأل سندباد"
            >
              <Sparkles className="h-5 w-5" />
            </button>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <Button
              type="submit"
              className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-medium rounded-full px-8 shadow-lg shadow-amber-500/30"
            >
              بحث
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSindbad(true)}
              className="rounded-full px-8 border-gray-300 text-gray-600 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/50"
            >
              <Sparkles className="h-4 w-4 ml-2" />
              اسأل سندباد
            </Button>
          </div>
        </form>

        {/* Subtle hint */}
        <p className="text-gray-300 text-xs mt-8">
          جرب: مطعم حلال في باريس، جزار في برلين، سوبرماركت في لندن...
        </p>
      </main>

      {/* Footer */}
      <footer className="relative py-6 text-center" style={{ zIndex: 10 }}>
        <div className="flex items-center justify-center gap-6 text-xs text-gray-300">
          <Link to="/add-store" className="hover:text-amber-500 transition-colors">
            أضف متجرك
          </Link>
          <span className="text-gray-200">|</span>
          <Link to="/stores" className="hover:text-amber-500 transition-colors">
            المتاجر
          </Link>
          <span className="text-gray-200">|</span>
          <a href="mailto:info@euroarabmarket.com" className="hover:text-amber-500 transition-colors">
            تواصل معنا
          </a>
        </div>
      </footer>

      {/* Sindbad Modal */}
      <SindbadChat isOpen={showSindbad} onClose={() => setShowSindbad(false)} />

      {/* CSS Animation */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
