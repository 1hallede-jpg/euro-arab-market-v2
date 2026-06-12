import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Search, Sparkles } from "lucide-react";

/* ─────────────── DATA ─────────────── */
const cities = [
  { name: "باريس", en: "Paris", flag: "🇫🇷" },
  { name: "لندن", en: "London", flag: "🇬🇧" },
  { name: "برلين", en: "Berlin", flag: "🇩🇪" },
  { name: "مدريد", en: "Madrid", flag: "🇪🇸" },
  { name: "روما", en: "Rome", flag: "🇮🇹" },
  { name: "فيينا", en: "Vienna", flag: "🇦🇹" },
  { name: "أمستردام", en: "Amsterdam", flag: "🇳🇱" },
  { name: "برشلونة", en: "Barcelona", flag: "🇪🇸" },
  { name: "ميلان", en: "Milan", flag: "🇮🇹" },
  { name: "بروكسل", en: "Brussels", flag: "🇧🇪" },
  { name: "كوبنهاغن", en: "Copenhagen", flag: "🇩🇰" },
  { name: "ستوكهولم", en: "Stockholm", flag: "🇸🇪" },
  { name: "أثينا", en: "Athens", flag: "🇬🇷" },
  { name: "بودابست", en: "Budapest", flag: "🇭🇺" },
  { name: "زيورخ", en: "Zurich", flag: "🇨🇭" },
  { name: "أوسلو", en: "Oslo", flag: "🇳🇴" },
  { name: "لشبونة", en: "Lisbon", flag: "🇵🇹" },
  { name: "دبلن", en: "Dublin", flag: "🇮🇪" },
  { name: "براغ", en: "Prague", flag: "🇨🇿" },
  { name: "هلسنكي", en: "Helsinki", flag: "🇫🇮" },
];

const coreCategories = [
  { icon: "🕌", ar: "مساجد", en: "Mosques", cat: "mosque" },
  { icon: "🍽️", ar: "مطاعم", en: "Restaurants", cat: "restaurant" },
  { icon: "🏛️", ar: "سفارات", en: "Embassies", cat: "embassy" },
  { icon: "🚕", ar: "خدمات", en: "Services", cat: "service" },
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
];

/* ─────────────── STAR FIELD ─────────────── */
function StarField() {
  const [stars] = useState(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }))
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star-twinkle"
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: `0 0 ${s.size * 2}px rgba(255,255,255,0.8)`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────── CRESCENT MOON ─────────────── */
function CrescentMoon() {
  return (
    <div className="absolute top-8 left-8 md:top-12 md:left-16 moon-sway pointer-events-none">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <path
          d="M65 10 A35 35 0 1 1 30 70 A28 28 0 1 0 65 10Z"
          fill="#f6f1d5"
          filter="url(#moonGlow)"
        />
        <defs>
          <filter id="moonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}

/* ─────────────── DESERT DUNES ─────────────── */
function DesertDunes() {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: "18vh" }}>
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="duneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2744" />
            <stop offset="100%" stopColor="#0a1628" />
          </linearGradient>
        </defs>
        <path d="M0,120 Q180,60 360,100 T720,80 T1080,110 T1440,70 L1440,200 L0,200Z" fill="url(#duneGrad)" opacity="0.9" />
        <path d="M0,150 Q240,100 480,140 T960,120 T1440,150 L1440,200 L0,200Z" fill="#0f1d32" opacity="0.7" />
      </svg>
    </div>
  );
}

/* ─────────────── MAGIC LAMP ─────────────── */
function MagicLamp({ isSearching, isFocused }: { isSearching: boolean; isFocused: boolean }) {
  return (
    <div className={`relative mx-auto ${isSearching ? "lamp-shake" : isFocused ? "lamp-bright" : "lamp-glow"}`}>
      {/* Glow effect behind lamp */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
          transform: "scale(2.5)",
          filter: "blur(20px)",
        }}
      />
      {/* Lamp SVG */}
      <svg width="120" height="100" viewBox="0 0 120 100" className="relative z-10 mx-auto">
        {/* Lamp body */}
        <ellipse cx="60" cy="70" rx="35" ry="18" fill="#c9a227" />
        <ellipse cx="60" cy="65" rx="30" ry="14" fill="#e8b923" />
        {/* Lamp spout */}
        <path d="M90,65 Q105,55 100,40 Q95,35 88,42" fill="#c9a227" stroke="#a07d1a" strokeWidth="1" />
        {/* Lamp handle */}
        <path d="M30,65 Q15,60 20,45 Q22,38 30,42" fill="none" stroke="#c9a227" strokeWidth="4" strokeLinecap="round" />
        {/* Lamp lid */}
        <path d="M45,52 Q60,30 75,52" fill="#d4af37" />
        <circle cx="60" cy="38" r="5" fill="#ffd700" />
        {/* Decorative lines */}
        <path d="M40,70 Q60,80 80,70" fill="none" stroke="#a07d1a" strokeWidth="1" opacity="0.5" />
        {/* Glow from spout */}
        <circle cx="100" cy="38" r="8" fill="#ffd700" opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
      {/* Smoke wisps */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="smoke-wisp"
            style={{
              animationDelay: `${i * 0.8}s`,
              left: `${(i - 1) * 15}px`,
            }}
          />
        ))}
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
      const params = new URLSearchParams();
      params.set("q", query.trim());
      if (selectedCity) params.set("city", selectedCity);
      navigate(`/search?${params.toString()}`);
    }, 800);
  }, [query, selectedCity, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCategoryClick = (cat: string) => {
    const params = new URLSearchParams();
    params.set("q", cat);
    if (selectedCity) params.set("city", selectedCity);
    navigate(`/search?${params.toString()}`);
  };

  const modeCategories = mode === "tourist" ? touristCategories : residentCategories;

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl" style={{ background: "#0a1628" }}>
      {/* ── BACKGROUND LAYERS ── */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, #1a2744 0%, #0a1628 70%)",
        }}
      />
      <StarField />
      <CrescentMoon />
      <DesertDunes />

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pb-16">
        {/* City Picker (top right) */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setShowCityPicker(!showCityPicker)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white text-sm hover:bg-white/20 hover:border-[#c9a227]/50 transition-all"
          >
            <span>{selectedCity ? cities.find((c) => c.en === selectedCity)?.flag : "🌍"}</span>
            <span>{selectedCity ? cities.find((c) => c.en === selectedCity)?.name : "اختر المدينة"}</span>
          </button>
          {showCityPicker && (
            <div className="absolute top-12 right-0 w-56 max-h-72 overflow-y-auto rounded-xl border border-white/20 bg-[#0a1628]/95 backdrop-blur-md shadow-2xl">
              <button
                onClick={() => { setSelectedCity(""); setShowCityPicker(false); }}
                className="w-full px-4 py-2 text-left text-white/70 hover:bg-white/10 text-sm border-b border-white/10"
              >
                🌍 كل المدن
              </button>
              {cities.map((c) => (
                <button
                  key={c.en}
                  onClick={() => { setSelectedCity(c.en); setShowCityPicker(false); }}
                  className={`w-full px-4 py-2 text-left hover:bg-white/10 text-sm flex items-center gap-2 transition ${
                    selectedCity === c.en ? "text-[#c9a227] bg-[#c9a227]/10" : "text-white"
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sindbad Brand */}
        <div className="text-center mb-4 mt-8">
          <h1
            className="text-5xl md:text-6xl font-bold tracking-wide"
            style={{
              color: "#c9a227",
              textShadow: "0 0 30px rgba(201,162,39,0.5), 0 0 60px rgba(201,162,39,0.2)",
              fontFamily: "'Noto Naskh Arabic', 'Scheherazade', serif",
            }}
          >
            سندباد
          </h1>
          <p className="text-lg md:text-xl mt-1" style={{ color: "#c9a227", opacity: 0.8 }}>
            Sindbad
          </p>
          <p className="text-sm mt-2" style={{ color: "#b0b8c4" }}>
            محرك البحث العربي في أوروبا
          </p>
          <p className="text-xs" style={{ color: "#b0b8c4", opacity: 0.6 }}>
            The Arabic Search Engine for Europe
          </p>
        </div>

        {/* Magic Lamp */}
        <div className="my-6">
          <MagicLamp isSearching={isSearching} isFocused={isFocused} />
        </div>

        {/* Search Bar */}
        <div
          className={`w-full max-w-xl mx-auto relative transition-all duration-500 ${
            isFocused ? "scale-105" : ""
          }`}
        >
          <div
            className="flex items-center rounded-full px-2 py-1 transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: isFocused
                ? "2px solid rgba(201,162,39,0.8)"
                : "2px solid rgba(201,162,39,0.3)",
              boxShadow: isFocused
                ? "0 0 40px rgba(201,162,39,0.4), inset 0 0 20px rgba(201,162,39,0.05)"
                : "0 0 20px rgba(201,162,39,0.15)",
            }}
          >
            <button
              onClick={handleSearch}
              className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: isSearching ? "#ffd700" : "#c9a227",
                boxShadow: "0 0 20px rgba(201,162,39,0.4)",
              }}
            >
              {isSearching ? (
                <Sparkles className="h-5 w-5 text-[#0a1628]" />
              ) : (
                <Search className="h-5 w-5 text-[#0a1628]" />
              )}
            </button>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب ما تبحث عنه... مطعم، مسجد، سفارة، خدمة..."
              className="flex-1 bg-transparent text-white text-lg px-4 py-3 outline-none placeholder:text-white/30 text-right"
              dir="rtl"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            />
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-3 mt-6 mb-4">
          <button
            onClick={() => setMode("tourist")}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
              mode === "tourist"
                ? "bg-[#c9a227] text-[#0a1628] border-[#c9a227] shadow-lg shadow-[#c9a227]/30"
                : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-[#c9a227]/50"
            }`}
          >
            <span className="ml-1">🧳</span> سائح Tourist
          </button>
          <button
            onClick={() => setMode("resident")}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
              mode === "resident"
                ? "bg-[#c9a227] text-[#0a1628] border-[#c9a227] shadow-lg shadow-[#c9a227]/30"
                : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-[#c9a227]/50"
            }`}
          >
            <span className="ml-1">🏠</span> مقيم Resident
          </button>
        </div>

        {/* Core Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-3 max-w-2xl">
          {coreCategories.map((c) => (
            <button
              key={c.cat}
              onClick={() => handleCategoryClick(c.cat)}
              className="category-btn px-4 py-2 rounded-full text-sm text-white border border-white/20 bg-white/5 backdrop-blur-sm hover:border-[#c9a227]/60 hover:bg-[#c9a227]/10 transition-all duration-300 flex items-center gap-1.5"
            >
              <span>{c.icon}</span>
              <span>{c.ar}</span>
              <span className="text-white/40 text-xs">{c.en}</span>
            </button>
          ))}
        </div>

        {/* Mode-specific Categories */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
          {modeCategories.map((c) => (
            <button
              key={c.cat}
              onClick={() => handleCategoryClick(c.cat)}
              className="category-btn px-4 py-2 rounded-full text-sm text-white border border-white/20 bg-white/5 backdrop-blur-sm hover:border-[#c9a227]/60 hover:bg-[#c9a227]/10 transition-all duration-300 flex items-center gap-1.5"
            >
              <span>{c.icon}</span>
              <span>{c.ar}</span>
              <span className="text-white/40 text-xs">{c.en}</span>
            </button>
          ))}
        </div>

        {/* Quick city pills */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-6 max-w-xl">
          {cities.slice(0, 10).map((c) => (
            <button
              key={c.en}
              onClick={() => setSelectedCity(selectedCity === c.en ? "" : c.en)}
              className={`px-3 py-1 rounded-full text-xs transition-all duration-300 border ${
                selectedCity === c.en
                  ? "bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/50"
                  : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {c.flag} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── CSS ANIMATIONS ── */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        .star-twinkle {
          animation: twinkle ease-in-out infinite;
        }

        @keyframes moonSway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        .moon-sway {
          animation: moonSway 6s ease-in-out infinite;
        }

        @keyframes lampGlow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(255,215,0,0.4)); }
          50% { filter: drop-shadow(0 0 40px rgba(255,215,0,0.7)); }
        }
        .lamp-glow {
          animation: lampGlow 2s ease-in-out infinite;
        }

        @keyframes lampBright {
          0%, 100% { filter: drop-shadow(0 0 30px rgba(255,215,0,0.6)); }
          50% { filter: drop-shadow(0 0 60px rgba(255,215,0,0.9)); }
        }
        .lamp-bright {
          animation: lampBright 1s ease-in-out infinite;
        }

        @keyframes lampShake {
          0% { transform: rotate(0deg) scale(1); }
          15% { transform: rotate(-8deg) scale(1.05); }
          30% { transform: rotate(6deg) scale(1.05); }
          45% { transform: rotate(-4deg) scale(1.03); }
          60% { transform: rotate(3deg) scale(1.02); }
          75% { transform: rotate(-1deg) scale(1.01); }
          100% { transform: rotate(0deg) scale(1); }
        }
        .lamp-shake {
          animation: lampShake 0.6s ease-out;
        }

        @keyframes smokeRise {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          30% { opacity: 0.4; }
          100% { opacity: 0; transform: translateY(-40px) scale(2); }
        }
        .smoke-wisp {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200,200,200,0.4), transparent);
          animation: smokeRise 2.5s ease-out infinite;
        }

        @keyframes categoryPop {
          0% { opacity: 0; transform: translateY(10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .category-btn {
          animation: categoryPop 0.4s ease-out backwards;
        }
        .category-btn:nth-child(1) { animation-delay: 0.05s; }
        .category-btn:nth-child(2) { animation-delay: 0.1s; }
        .category-btn:nth-child(3) { animation-delay: 0.15s; }
        .category-btn:nth-child(4) { animation-delay: 0.2s; }
        .category-btn:nth-child(5) { animation-delay: 0.25s; }
        .category-btn:nth-child(6) { animation-delay: 0.3s; }

        /* Scrollbar styling */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,162,39,0.3); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(201,162,39,0.5); }
      `}</style>
    </div>
  );
}
