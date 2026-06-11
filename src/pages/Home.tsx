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

/* ─── particles ─── */
function ParticlesBg() {
  const cvs = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cvs.current;
    if (!c) return;
    const x = c.getContext("2d");
    if (!x) return;

    let W = (c.width = window.innerWidth);
    let H = (c.height = window.innerHeight);
    const P = Array.from({ length: 70 }, () => ({
      px: Math.random() * W,
      py: Math.random() * H,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.35 + 0.08,
    }));

    let rid = 0;
    const loop = () => {
      x.clearRect(0, 0, W, H);
      P.forEach((p) => {
        p.px += p.vx;
        p.py += p.vy;
        if (p.px < 0 || p.px > W) p.vx *= -1;
        if (p.py < 0 || p.py > H) p.vy *= -1;
        x.beginPath();
        x.arc(p.px, p.py, p.r, 0, Math.PI * 2);
        x.fillStyle = `rgba(212,175,55,${p.a})`;
        x.fill();
      });
      rid = requestAnimationFrame(loop);
    };
    loop();

    const onR = () => {
      W = c.width = window.innerWidth;
      H = c.height = window.innerHeight;
    };
    window.addEventListener("resize", onR);
    return () => {
      cancelAnimationFrame(rid);
      window.removeEventListener("resize", onR);
    };
  }, []);
  return (
    <canvas
      ref={cvs}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

/* ─── Sindbad Chat ─── */
function SindbadChat({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const [msgs, setMsgs] = useState<
    { role: "user" | "bot"; text: string }[]
  >([
    {
      role: "bot",
      text: "أنا سندباد 🪔\nدليلك الذكي للعالم العربي في أوروبا.\n\nاسألني عن أي متجر أو خدمة عربية...",
    },
  ]);
  const [inp, setInp] = useState("");
  const [load, setLoad] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { data: mData } = trpc.merchant.list.useQuery(
    { status: "active", limit: 200 },
    { enabled: open }
  );

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [
    msgs,
  ]);

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inp.trim() || load) return;
    const q = inp.trim();
    setInp("");
    setMsgs((p) => [...p, { role: "user", text: q }]);
    setLoad(true);

    const t = q.toLowerCase();
    const hits =
      mData?.items.filter((m) => {
        const txt = `${m.businessNameAr} ${m.businessName} ${m.category} ${m.city} ${m.country} ${m.tags}`.toLowerCase();
        return t.split(/\s+/).some((w) => txt.includes(w));
      }) || [];

    setTimeout(() => {
      let r = "";
      if (hits.length > 0) {
        r = `وجدت ${hits.length} نتيجة:\n\n`;
        hits.slice(0, 5).forEach((m, i) => {
          r += `${i + 1}. **${m.businessNameAr || m.businessName}** — ${m.city}`;
          if (m.rating) r += ` ⭐${m.rating}`;
          if (m.phone) r += `\n   📞 ${m.phone}`;
          if (m.whatsapp) r += `\n   💬 واتساب: ${m.whatsapp}`;
          r += "\n\n";
        });
      } else {
        r =
          "لم أجد نتائج مباشرة في بياناتنا.\n\nجرب البحث في جوجل أو اسأل بطريقة أخرى:\n• مطعم سوري باريس\n• جزار حلال برلين\n• سوبرماركت عربي لندن";
      }
      setMsgs((p) => [...p, { role: "bot", text: r }]);
      setLoad(false);
    }, 800);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg h-[72vh] bg-[#0f0f1a] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-amber-500/20">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/15 bg-[#16162a]">
          <div className="flex items-center gap-3">
            <img src="/sindbad-icon.png" className="w-9 h-9" alt="" />
            <div>
              <h3 className="font-bold text-amber-400">سندباد</h3>
              <p className="text-[10px] text-amber-400/40">
                دليلك الذكي للعالم العربي
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "bot"
                    ? "bg-gradient-to-br from-amber-400 to-amber-600"
                    : "bg-gray-700"
                }`}
              >
                {m.role === "bot" ? (
                  <Sparkles className="h-4 w-4 text-white" />
                ) : (
                  <User className="h-4 w-4 text-gray-300" />
                )}
              </div>
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  m.role === "bot"
                    ? "bg-[#1e1e3a] text-gray-200 border border-amber-500/8"
                    : "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {load && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="bg-[#1e1e3a] rounded-2xl px-4 py-3 border border-amber-500/8">
                <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* input */}
        <form
          onSubmit={onSend}
          className="p-4 border-t border-amber-500/15 bg-[#16162a]"
        >
          <div className="flex items-center gap-2 bg-[#0f0f1a] rounded-full px-4 py-2 border border-amber-500/15 focus-within:border-amber-500/40 transition">
            <Input
              value={inp}
              onChange={(e) => setInp(e.target.value)}
              placeholder="اسأل سندباد عن أي متجر..."
              className="border-0 bg-transparent focus-visible:ring-0 text-right text-gray-200 placeholder:text-gray-600"
              dir="rtl"
            />
            <button
              type="submit"
              disabled={load || !inp.trim()}
              className="p-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black rounded-full hover:from-amber-500 hover:to-amber-700 disabled:opacity-40 transition shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function Home() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [showBot, setShowBot] = useState(false);
  const [foc, setFoc] = useState(false);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-[#fafafa]" dir="rtl">
      <ParticlesBg />

      {/* gold glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(ellipse 70% 50% at 50% 35%, rgba(212,175,55,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ─── Navbar ─── */}
      <nav
        className="relative flex items-center justify-between px-8 py-5"
        style={{ zIndex: 10 }}
      >
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/sindbad-icon.png"
            className="w-7 h-7 group-hover:scale-110 transition-transform"
            alt=""
          />
          <span className="font-bold text-gray-700 text-sm tracking-wide">
            يورو عرب ماركت
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            to="/stores"
            className="text-gray-500 hover:text-amber-600 transition-colors"
          >
            المتاجر
          </Link>
          <button
            onClick={() => setShowBot(true)}
            className="text-amber-600 font-semibold hover:text-amber-700 transition-colors flex items-center gap-1"
          >
            <Sparkles className="h-3.5 w-3.5" />
            سندباد
          </button>
          <a
            href="mailto:info@euroarabmarket.com"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            تواصل
          </a>
        </div>
      </nav>

      {/* ─── Center Content ─── */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-4 -mt-12"
        style={{ zIndex: 10 }}
      >
        {/* Lamp Image - BIG */}
        <div className="mb-2 animate-fade-in">
          <img
            src="/sindbad-icon.png"
            alt="سندباد"
            className="w-36 h-36 md:w-44 md:h-44 drop-shadow-2xl"
            style={{
              filter:
                "drop-shadow(0 10px 40px rgba(212,175,55,0.35)) drop-shadow(0 0 80px rgba(212,175,55,0.15))",
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-1 tracking-tight text-center">
          يورو عرب ماركت
        </h1>
        <p className="text-gray-400 text-base md:text-lg mb-10 text-center">
          محرك البحث للعالم العربي في أوروبا
        </p>

        {/* Search Bar — integrated with lamp */}
        <form onSubmit={onSearch} className="w-full max-w-xl mb-5">
          <div
            className={`relative flex items-center bg-white rounded-2xl shadow-lg transition-all duration-300 border-2 ${
              foc
                ? "border-amber-400 shadow-xl shadow-amber-500/20"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Search className="h-5 w-5 text-gray-400 mr-5 shrink-0" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFoc(true)}
              onBlur={() => setFoc(false)}
              placeholder="ابحث عن مطاعم، متاجر، خدمات عربية..."
              className="border-0 bg-transparent focus-visible:ring-0 text-right text-base py-7"
              dir="rtl"
            />
            <button
              type="button"
              onClick={() => setShowBot(true)}
              className="ml-2 p-3 rounded-xl hover:bg-amber-50 text-amber-500 transition-colors shrink-0"
              title="اسأل سندباد"
            >
              <Sparkles className="h-5 w-5" />
            </button>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <Button
              type="submit"
              className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-bold rounded-full px-10 shadow-lg shadow-amber-500/25"
            >
              بحث
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBot(true)}
              className="rounded-full px-8 border-gray-300 text-gray-600 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/50"
            >
              <Sparkles className="h-4 w-4 ml-2" />
              اسأل سندباد
            </Button>
          </div>
        </form>

        {/* Hint */}
        <p className="text-gray-300 text-xs mt-6">
          جرب: مطعم حلال في باريس — جزار في برلين — سوبرماركت في لندن
        </p>
      </main>

      {/* ─── Footer ─── */}
      <footer className="relative py-5 text-center" style={{ zIndex: 10 }}>
        <div className="flex items-center justify-center gap-6 text-xs text-gray-300">
          <Link to="/add-store" className="hover:text-amber-500 transition">
            أضف متجرك
          </Link>
          <span className="text-gray-200">|</span>
          <Link to="/stores" className="hover:text-amber-500 transition">
            المتاجر
          </Link>
          <span className="text-gray-200">|</span>
          <Link to="/terms" className="hover:text-amber-500 transition">
            الشروط والخصوصية
          </Link>
          <span className="text-gray-200">|</span>
          <span>يورو عرب ماركت © 2026</span>
        </div>
      </footer>

      {/* ─── Sindbad Modal ─── */}
      <SindbadChat open={showBot} close={() => setShowBot(false)} />

      {/* Animation CSS */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(15px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in { animation: fade-in 1s cubic-bezier(0.19,1,0.22,1); }
      `}</style>
    </div>
  );
}
