import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Search, Sparkles, ChevronDown, Globe, LogIn } from "lucide-react";
import Logo from "@/components/Logo";

/* ─────────────── DATA ─────────────── */
const cities = [
  { name: "باريس", en: "Paris", flag: "🇫🇷" }, { name: "لندن", en: "London", flag: "🇬🇧" },
  { name: "برلين", en: "Berlin", flag: "🇩🇪" }, { name: "مدريد", en: "Madrid", flag: "🇪🇸" },
  { name: "روما", en: "Rome", flag: "🇮🇹" }, { name: "فيينا", en: "Vienna", flag: "🇦🇹" },
  { name: "أمستردام", en: "Amsterdam", flag: "🇳🇱" }, { name: "برشلونة", en: "Barcelona", flag: "🇪🇸" },
  { name: "ميلان", en: "Milan", flag: "🇮🇹" }, { name: "بروكسل", en: "Brussels", flag: "🇧🇪" },
  { name: "كوبنهاغن", en: "Copenhagen", flag: "🇩🇰" }, { name: "ستوكهولم", en: "Stockholm", flag: "🇸🇪" },
  { name: "أثينا", en: "Athens", flag: "🇬🇷" }, { name: "بودابست", en: "Budapest", flag: "🇭🇺" },
  { name: "زيورخ", en: "Zurich", flag: "🇨🇭" }, { name: "أوسلو", en: "Oslo", flag: "🇳🇴" },
  { name: "لشبونة", en: "Lisbon", flag: "🇵🇹" }, { name: "دبلن", en: "Dublin", flag: "🇮🇪" },
  { name: "براغ", en: "Prague", flag: "🇨🇿" }, { name: "هلسنكي", en: "Helsinki", flag: "🇫🇮" },
];

const coreCategories = [
  { icon: "🕌", ar: "مساجد", en: "Mosques", cat: "mosque", for: "both" },
  { icon: "🍽️", ar: "مطاعم", en: "Restaurants", cat: "restaurant", for: "both" },
  { icon: "🏛️", ar: "سفارات", en: "Embassies", cat: "embassy", for: "both" },
  { icon: "🏪", ar: "متاجر", en: "Shops", cat: "shop", for: "both" },
];

const touristCategories = [
  { icon: "🛍️", ar: "تسوق", en: "Shopping", cat: "shopping" },
  { icon: "📸", ar: "معالم", en: "Sights", cat: "sights" },
  { icon: "🎯", ar: "أنشطة", en: "Activities", cat: "activities" },
  { icon: "🏨", ar: "فنادق", en: "Hotels", cat: "hotels" },
  { icon: "✈️", ar: "مطار", en: "Airport", cat: "airport" },
  { icon: "🚕", ar: "مواصلات", en: "Transport", cat: "transport" },
];

const residentCategories = [
  { icon: "📋", ar: "أوراق", en: "Papers", cat: "papers" },
  { icon: "🏫", ar: "مدارس", en: "Schools", cat: "schools" },
  { icon: "💼", ar: "وظائف", en: "Jobs", cat: "jobs" },
  { icon: "🏠", ar: "شقق", en: "Apartments", cat: "apartments" },
  { icon: "⚕️", ar: "صحة", en: "Health", cat: "health" },
  { icon: "📚", ar: "لغة", en: "Language", cat: "language" },
  { icon: "🆘", ar: "خدمات اللاجئين", en: "Refugee Services", cat: "refugee" },
];

/* ─────────────── STAR FIELD ─────────────── */
function StarField() {
  const [stars] = useState(() =>
    Array.from({ length: 100 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 65,
      size: Math.random() * 2.5 + 0.5, delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }))
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <div key={s.id} className="star-twinkle" style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}px`, height: `${s.size}px`, borderRadius: "50%",
          background: "#ffffff", boxShadow: `0 0 ${s.size * 2}px rgba(255,255,255,0.8)`,
          animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s`,
        }} />
      ))}
    </div>
  );
}

/* ─────────────── CRESCENT MOON ─────────────── */
function CrescentMoon() {
  return (
    <div className="absolute top-6 left-6 md:top-10 md:left-12 moon-sway pointer-events-none">
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <path d="M48 6 A28 28 0 1 1 20 54 A22 22 0 1 0 48 6Z" fill="#f6f1d5" filter="url(#mg)" />
        <defs><filter id="mg" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter></defs>
      </svg>
    </div>
  );
}

/* ─────────────── DESERT DUNES ─────────────── */
function DesertDunes() {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: "15vh" }}>
      <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="w-full h-full">
        <defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2744" /><stop offset="100%" stopColor="#0a1628" />
        </linearGradient></defs>
        <path d="M0,100 Q180,50 360,85 T720,70 T1080,90 T1440,60 L1440,160 L0,160Z" fill="url(#dg)" opacity="0.9" />
        <path d="M0,120 Q240,80 480,110 T960,95 T1440,120 L1440,160 L0,160Z" fill="#0f1d32" opacity="0.7" />
      </svg>
    </div>
  );
}

/* ─────────────── MAGIC LAMP ─────────────── */
function MagicLamp({ isSearching, isFocused }: { isSearching: boolean; isFocused: boolean }) {
  return (
    <div className={`relative mx-auto ${isSearching ? "lamp-shake" : isFocused ? "lamp-bright" : "lamp-glow"}`}>
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{
        background: "radial-gradient(circle, rgba(255,215,0,0.25) 0%, transparent 70%)",
        transform: "scale(2.5)", filter: "blur(20px)",
      }} />
      <svg width="100" height="85" viewBox="0 0 100 85" className="relative z-10 mx-auto">
        <ellipse cx="50" cy="60" rx="28" ry="14" fill="#c9a227" />
        <ellipse cx="50" cy="56" rx="24" ry="11" fill="#e8b923" />
        <path d="M75,56 Q88,48 84,35 Q80,30 74,36" fill="#c9a227" stroke="#a07d1a" strokeWidth="1" />
        <path d="M26,56 Q12,50 16,38 Q18,32 26,36" fill="none" stroke="#c9a227" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M38,44 Q50,26 62,44" fill="#d4af37" />
        <circle cx="50" cy="32" r="4" fill="#ffd700" />
        <path d="M34,60 Q50,68 66,60" fill="none" stroke="#a07d1a" strokeWidth="0.8" opacity="0.5" />
        <circle cx="84" cy="33" r="7" fill="#ffd700" opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none">
        {[0,1,2].map(i => <div key={i} className="smoke-wisp" style={{ animationDelay: `${i*0.8}s`, left: `${(i-1)*12}px` }} />)}
      </div>
    </div>
  );
}

/* ─────────────── MAIN PAGE ─────────────── */
export default function SindbadHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mode, setMode] = useState<"tourist" | "resident">("tourist");
  const [selectedCity, setSelectedCity] = useState("");
  const [showCityPicker, setShowCityPicker] = useState(false);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      if (!selectedCity) {
        setShowCityPicker(true);
        setIsSearching(false);
        return;
      }
      const params = new URLSearchParams();
      params.set("q", query.trim());
      params.set("city", selectedCity);
      navigate(`/search?${params.toString()}`);
    }, 600);
  }, [query, selectedCity, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };

  const handleCategoryClick = (cat: string) => {
    if (!selectedCity) { setShowCityPicker(true); return; }
    const params = new URLSearchParams();
    params.set("q", cat); params.set("city", selectedCity);
    navigate(`/search?${params.toString()}`);
  };

  const modeCategories = mode === "tourist" ? touristCategories : residentCategories;

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl" style={{ background: "#0a1628" }}>
      {/* Background */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 30%, #1a2744 0%, #0a1628 70%)" }} />
      <StarField /><CrescentMoon /><DesertDunes />

      {/* ── HEADER ── */}
      <div className="relative z-20 border-b border-white/10 bg-[#0a1628]/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <button onClick={() => setShowCityPicker(!showCityPicker)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white text-sm hover:bg-white/20 transition-all">
              <Globe className="h-4 w-4" />
              <span>{selectedCity ? cities.find(c => c.en === selectedCity)?.flag + " " + cities.find(c => c.en === selectedCity)?.name : "🌍 اختر المدينة"}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            <a href="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227] text-sm hover:bg-[#c9a227]/20 transition-all">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">تسجيل الدخول</span>
            </a>
          </div>
        </div>
        {/* City Picker Dropdown */}
        {showCityPicker && (
          <div className="absolute top-full left-4 z-50 w-64 max-h-80 overflow-y-auto rounded-xl border border-white/20 bg-[#0f1d32]/95 backdrop-blur-md shadow-2xl">
            <button onClick={() => { setSelectedCity(""); setShowCityPicker(false); }}
              className="w-full px-4 py-2.5 text-left text-white/70 hover:bg-white/10 text-sm border-b border-white/10">🌍 كل المدن</button>
            {cities.map(c => (
              <button key={c.en} onClick={() => { setSelectedCity(c.en); setShowCityPicker(false); }}
                className={`w-full px-4 py-2.5 text-left hover:bg-white/10 text-sm flex items-center gap-2 transition ${selectedCity === c.en ? "text-[#c9a227] bg-[#c9a227]/10" : "text-white"}`}>
                <span>{c.flag}</span><span>{c.name}</span><span className="text-white/30 mr-auto text-xs">{c.en}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-72px)] px-4 pb-16">

        {/* Brand */}
        <div className="text-center mb-6 mt-4">
          <h1 className="sindbad-title text-6xl md:text-7xl font-bold tracking-wide mb-1" style={{
            background: "linear-gradient(135deg, #c9a227 0%, #ffd700 50%, #c9a227 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            textShadow: "none", filter: "drop-shadow(0 0 20px rgba(201,162,39,0.4))",
            fontFamily: "'Noto Naskh Arabic', 'Scheherazade', serif",
          }}>سندباد</h1>
          <p className="text-lg" style={{ color: "#c9a227", opacity: 0.7 }}>Sindbad</p>
        </div>

        {/* Magic Lamp */}
        <div className="my-4"><MagicLamp isSearching={isSearching} isFocused={isFocused} /></div>

        {/* Search Bar with "اسأل سندباد" */}
        <div className="w-full max-w-2xl mx-auto relative mb-3">
          {!selectedCity && (
            <div className="text-center mb-3">
              <p className="text-[#c9a227] text-sm animate-pulse">📍 الرجاء اختيار مدينة أولاً</p>
            </div>
          )}
          <div className={`flex items-center rounded-full px-2 py-1.5 transition-all duration-500 ${isFocused ? "scale-105" : ""}`}
            style={{
              background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)",
              border: isFocused ? "2px solid rgba(201,162,39,0.8)" : "2px solid rgba(201,162,39,0.25)",
              boxShadow: isFocused ? "0 0 40px rgba(201,162,39,0.3)" : "0 0 15px rgba(201,162,39,0.1)",
            }}>
            <button onClick={handleSearch} disabled={isSearching}
              className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: isSearching ? "#ffd700" : "#c9a227", boxShadow: "0 0 15px rgba(201,162,39,0.4)" }}>
              {isSearching ? <Sparkles className="h-5 w-5 text-[#0a1628]" /> : <Search className="h-5 w-5 text-[#0a1628]" />}
            </button>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} onKeyDown={handleKeyDown}
              placeholder="اسأل سندباد... مطعم، مسجد، سفارة، خدمة..."
              className="flex-1 bg-transparent text-white text-lg px-4 py-2.5 outline-none placeholder:text-white/25 text-right"
              dir="rtl" style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }} />
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mt-4 mb-3">
          <button onClick={() => setMode("tourist")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${mode === "tourist" ? "bg-[#c9a227] text-[#0a1628] border-[#c9a227]" : "bg-white/5 text-white border-white/15 hover:border-[#c9a227]/40"}`}>
            🧳 سائح Tourist
          </button>
          <button onClick={() => setMode("resident")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${mode === "resident" ? "bg-[#c9a227] text-[#0a1628] border-[#c9a227]" : "bg-white/5 text-white border-white/15 hover:border-[#c9a227]/40"}`}>
            🏠 مقيم Resident
          </button>
        </div>

        {/* Core Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-2 max-w-2xl">
          {coreCategories.map(c => (
            <button key={c.cat} onClick={() => handleCategoryClick(c.cat)}
              className="cat-btn px-4 py-2 rounded-full text-sm text-white border border-white/15 bg-white/5 hover:border-[#c9a227]/50 hover:bg-[#c9a227]/10 transition-all flex items-center gap-1.5">
              <span>{c.icon}</span><span>{c.ar}</span><span className="text-white/30 text-xs">{c.en}</span>
            </button>
          ))}
        </div>

        {/* Mode-specific Categories */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
          {modeCategories.map(c => (
            <button key={c.cat} onClick={() => handleCategoryClick(c.cat)}
              className="cat-btn px-4 py-2 rounded-full text-sm text-white border border-white/15 bg-white/5 hover:border-[#c9a227]/50 hover:bg-[#c9a227]/10 transition-all flex items-center gap-1.5">
              <span>{c.icon}</span><span>{c.ar}</span><span className="text-white/30 text-xs">{c.en}</span>
            </button>
          ))}
        </div>

        {/* City Quick Pills */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-5 max-w-xl">
          {cities.slice(0, 12).map(c => (
            <button key={c.en} onClick={() => setSelectedCity(selectedCity === c.en ? "" : c.en)}
              className={`px-3 py-1 rounded-full text-xs transition border ${selectedCity === c.en ? "bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/40" : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"}`}>
              {c.flag} {c.name}
            </button>
          ))}
        </div>

        {/* Register Store Link */}
        <a href="/merchant/register"
          className="mt-8 px-6 py-3 rounded-full border border-[#c9a227]/30 text-[#c9a227] text-sm hover:bg-[#c9a227]/10 transition flex items-center gap-2">
          ➕ سجل متجرك في يورو عرب ماركت
        </a>
      </div>

      {/* ── CSS ── */}
      <style>{`
        @keyframes twinkle { 0%,100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
        .star-twinkle { animation: twinkle ease-in-out infinite; }
        @keyframes moonSway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
        .moon-sway { animation: moonSway 6s ease-in-out infinite; }
        @keyframes lampGlow { 0%,100% { filter: drop-shadow(0 0 15px rgba(255,215,0,0.3)); } 50% { filter: drop-shadow(0 0 30px rgba(255,215,0,0.6)); } }
        .lamp-glow { animation: lampGlow 2.5s ease-in-out infinite; }
        @keyframes lampBright { 0%,100% { filter: drop-shadow(0 0 25px rgba(255,215,0,0.5)); } 50% { filter: drop-shadow(0 0 50px rgba(255,215,0,0.8)); } }
        .lamp-bright { animation: lampBright 1s ease-in-out infinite; }
        @keyframes lampShake { 0% { transform: rotate(0deg) scale(1); } 15% { transform: rotate(-8deg) scale(1.05); } 30% { transform: rotate(6deg) scale(1.05); } 45% { transform: rotate(-4deg) scale(1.03); } 60% { transform: rotate(3deg) scale(1.02); } 75% { transform: rotate(-1deg) scale(1.01); } 100% { transform: rotate(0deg) scale(1); } }
        .lamp-shake { animation: lampShake 0.6s ease-out; }
        @keyframes smokeRise { 0% { opacity: 0; transform: translateY(0) scale(1); } 30% { opacity: 0.35; } 100% { opacity: 0; transform: translateY(-35px) scale(2); } }
        .smoke-wisp { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: radial-gradient(circle, rgba(200,200,200,0.35), transparent); animation: smokeRise 2.5s ease-out infinite; }
        @keyframes catPop { 0% { opacity: 0; transform: translateY(8px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .cat-btn { animation: catPop 0.35s ease-out backwards; }
        .cat-btn:nth-child(1) { animation-delay: 0.04s; } .cat-btn:nth-child(2) { animation-delay: 0.08s; }
        .cat-btn:nth-child(3) { animation-delay: 0.12s; } .cat-btn:nth-child(4) { animation-delay: 0.16s; }
        .cat-btn:nth-child(5) { animation-delay: 0.20s; } .cat-btn:nth-child(6) { animation-delay: 0.24s; }
        .cat-btn:nth-child(7) { animation-delay: 0.28s; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,162,39,0.25); border-radius: 3px; }
      `}</style>
    </div>
  );
}
