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
  LogIn,
  UserPlus,
  Wrench,
  Store,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import sindbadImg from "@/assets/sindbad.png";

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
      text: "أنا سندباد 🪔\nدليلك العربي في أوروبا.\n\nاسألني عن أي متجر أو خدمة عربية...",
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/15 bg-[#16162a]">
          <div className="flex items-center gap-3">
            <img src={sindbadImg} className="w-9 h-9" alt="" />
            <div>
              <h3 className="font-bold text-amber-400">سندباد</h3>
              <p className="text-[10px] text-amber-400/40">
                دليلك العربي في أوروبا
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

/* ─── Prayer Times ─── */
function PrayerTimes() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Makkah prayer times (approximate)
  const prayers = [
    { nameAr: "الفجر", name: "Fajr", time: "04:15", timeEnd: "05:45" },
    { nameAr: "الشروق", name: "Sunrise", time: "05:45", timeEnd: "12:30" },
    { nameAr: "الظهر", name: "Dhuhr", time: "12:30", timeEnd: "15:45" },
    { nameAr: "العصر", name: "Asr", time: "15:45", timeEnd: "18:50" },
    { nameAr: "المغرب", name: "Maghrib", time: "18:50", timeEnd: "20:20" },
    { nameAr: "العشاء", name: "Isha", time: "20:20", timeEnd: "04:15" },
  ];

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find current and next prayer
  let currentPrayer = prayers[0];
  let nextPrayer = prayers[0];
  let minDiff = Infinity;

  for (let i = 0; i < prayers.length; i++) {
    const [h, m] = prayers[i].time.split(":").map(Number);
    const prayerMinutes = h * 60 + m;
    const diff = prayerMinutes - currentMinutes;

    if (diff <= 0 && diff > -900) {
      currentPrayer = prayers[i];
    }
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextPrayer = prayers[i];
    }
  }

  // If no next prayer today, next is Fajr tomorrow
  if (minDiff === Infinity) {
    nextPrayer = prayers[0];
    const [h, m] = prayers[0].time.split(":").map(Number);
    minDiff = (h + 24) * 60 + m - currentMinutes;
  }

  const hoursLeft = Math.floor(minDiff / 60);
  const minsLeft = minDiff % 60;

  return (
    <div className="w-full max-w-xl mx-auto mt-4">
      <div className="bg-gradient-to-r from-[#1a5f4a]/20 to-[#c9a227]/10 border border-[#c9a227]/20 rounded-xl p-3 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#c9a227]/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                <path d="M12 3v1m0 16v1m-9-9h1m16 0h1M5.6 5.6l.7.7m12.1 12.1l.7.7M3 12a9 9 0 1018 0 9 9 0 00-18 0z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <h4 className="text-[#c9a227] text-xs font-bold">مواقيت الصلاة — مكة المكرمة</h4>
              <p className="text-white/40 text-[10px]">
                باقي {hoursLeft > 0 ? `${hoursLeft} ساعة و ` : ""}{minsLeft} دقيقة على {nextPrayer.nameAr}
              </p>
            </div>
          </div>
          <span className="text-[#c9a227]/60 text-[10px] bg-[#c9a227]/10 px-2 py-0.5 rounded-full">
            {now.toLocaleDateString("ar-SA")}
          </span>
        </div>

        {/* Prayer times row */}
        <div className="flex items-center justify-between gap-1">
          {prayers.filter(p => p.name !== "Sunrise").map((p) => {
            const isNext = p.name === nextPrayer.name;
            const isCurrent = p.name === currentPrayer.name;
            return (
              <div
                key={p.name}
                className={`flex-1 text-center rounded-lg py-1.5 px-1 transition ${
                  isNext
                    ? "bg-[#c9a227]/20 border border-[#c9a227]/40"
                    : isCurrent
                    ? "bg-[#1a5f4a]/20 border border-[#1a5f4a]/30"
                    : "bg-white/5 border border-white/5"
                }`}
              >
                <p className={`text-[10px] font-medium ${isNext ? "text-[#c9a227]" : "text-white/50"}`}>
                  {p.nameAr}
                </p>
                <p className={`text-xs font-bold ${isNext ? "text-white" : "text-white/30"}`}>
                  {p.time}
                </p>
                {isNext && (
                  <div className="w-full h-0.5 bg-[#c9a227] rounded-full mt-1 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
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
        className="relative flex items-center justify-between px-6 py-4"
        style={{ zIndex: 10 }}
      >
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={sindbadImg}
            className="w-7 h-7 group-hover:scale-110 transition-transform"
            alt=""
          />
          <span className="font-bold text-gray-700 text-sm tracking-wide">
            سندباد
          </span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-amber-300/60 text-amber-600 font-medium hover:bg-amber-50 hover:border-amber-400 transition-all text-xs"
          >
            <LogIn className="h-3.5 w-3.5" />
            تسجيل الدخول
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold hover:from-amber-500 hover:to-amber-700 transition-all text-xs shadow-md shadow-amber-500/20"
          >
            <UserPlus className="h-3.5 w-3.5" />
            تسجيل حساب
          </Link>
        </div>
      </nav>

      {/* ─── Center Content ─── */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-4"
        style={{ zIndex: 10 }}
      >
        {/* Lamp Image - BIG */}
        <div className="mb-2 animate-fade-in">
          <img
            src={sindbadImg}
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
          سندباد
        </h1>
        <p className="text-gray-400 text-base md:text-lg mb-6 text-center">
          دليلك العربي في أوروبا
        </p>

        {/* Prayer Times */}
        <PrayerTimes />

        {/* Search Bar */}
        <form onSubmit={onSearch} className="w-full max-w-xl mt-5 mb-3">
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
          </div>

          {/* ONE Brown Search Button */}
          <div className="flex items-center justify-center mt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white font-bold text-sm rounded-full px-10 py-3 shadow-lg shadow-amber-900/20 flex items-center gap-2 transition-all"
            >
              <Search className="h-4 w-4" />
              اسأل سندباد — يبحث في الموقع
            </button>
          </div>
        </form>

        {/* Add Store + Add Skill Buttons */}
        <div className="flex items-center justify-center gap-4 mt-3 mb-4">
          <Link
            to="/skill/register"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border border-dashed border-amber-300/60 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-400 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="text-right">
              <p className="text-amber-700 text-sm font-bold leading-tight">أضف مهارتك</p>
              <p className="text-amber-400/60 text-[10px] leading-tight">سجّل خدمتك واكسب</p>
            </div>
          </Link>
          <Link
            to="/merchant/register"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border border-dashed border-amber-300/60 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-400 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store className="h-4 w-4 text-white" />
            </div>
            <div className="text-right">
              <p className="text-amber-700 text-sm font-bold leading-tight">أضف متجرك</p>
              <p className="text-amber-400/60 text-[10px] leading-tight">سجّل متجرك الأوروبي</p>
            </div>
          </Link>
        </div>

        {/* Hint */}
        <p className="text-gray-300 text-xs mb-6">
          جرب: مطعم حلال في باريس — جزار في برلين — سوبرماركت في لندن
        </p>

        {/* ─── AD SPOT: Place Your Ad Here ─── */}
        <Link
          to="/merchant/register"
          className="group w-full max-w-xl"
        >
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-5 text-center hover:border-amber-300 hover:from-amber-50/30 hover:to-amber-50/50 transition-all duration-300 group-hover:shadow-md">
            <p className="text-gray-400 text-sm font-medium group-hover:text-amber-600 transition-colors">
              <span className="inline-block mr-2">📢</span>
              ضع إعلانك هنا — اسم علامتك التجارية
            </p>
            <p className="text-gray-300 text-xs mt-1 group-hover:text-amber-400 transition-colors">
              احجز مكانك لمدة أسبوع | تواصل معنا للتفاصيل
            </p>
          </div>
        </Link>
      </main>

      {/* ─── Footer ─── */}
      <footer className="relative py-5 text-center" style={{ zIndex: 10 }}>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-300 flex-wrap">
          <Link to="/merchant/register" className="hover:text-amber-500 transition flex items-center gap-1">
            <Store className="h-3 w-3" /> أضف متجرك
          </Link>
          <span className="text-gray-200">|</span>
          <Link to="/skill/register" className="hover:text-amber-500 transition flex items-center gap-1">
            <Wrench className="h-3 w-3" /> أضف مهارتك
          </Link>
          <span className="text-gray-200">|</span>
          <Link to="/terms" className="hover:text-amber-500 transition">
            الشروط والخصوصية
          </Link>
          <span className="text-gray-200">|</span>
          <a href="mailto:info@euroarabmarket.com" className="hover:text-amber-500 transition">
            إعلانات
          </a>
          <span className="text-gray-200">|</span>
          <span>سندباد © 2026</span>
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
