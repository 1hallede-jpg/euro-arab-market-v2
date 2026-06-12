import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, MapPin, Star, Phone, X, Store, Building2, Landmark, Navigation } from "lucide-react";
import Logo from "@/components/Logo";
import PrayerTimes from "@/components/PrayerTimes";

const API_URL = "/api/trpc";

const citiesEn = ["Paris","London","Berlin","Madrid","Barcelona","Rome","Milan","Amsterdam","Brussels","Vienna","Copenhagen","Stockholm","Oslo","Zurich","Geneva","Budapest","Prague","Athens","Helsinki","Lisbon","Dublin"];
const cityDisplayNames: Record<string, string> = { Paris:"باريس",London:"لندن",Berlin:"برلين",Madrid:"مدريد",Barcelona:"برشلونة",Rome:"روما",Milan:"ميلان",Amsterdam:"أمستردام",Brussels:"بروكسل",Vienna:"فيينا",Copenhagen:"كوبنهاغن",Stockholm:"ستوكهولم",Oslo:"أوسلو",Zurich:"زيورخ",Geneva:"جنيف",Budapest:"بودابست",Prague:"براغ",Athens:"أثينا",Helsinki:"هلسنكي",Lisbon:"لشبونة",Dublin:"دبلن" };
const cityFlags: Record<string, string> = { Paris:"🇫🇷",London:"🇬🇧",Berlin:"🇩🇪",Madrid:"🇪🇸",Barcelona:"🇪🇸",Rome:"🇮🇹",Milan:"🇮🇹",Amsterdam:"🇳🇱",Brussels:"🇧🇪",Vienna:"🇦🇹",Copenhagen:"🇩🇰",Stockholm:"🇸🇪",Oslo:"🇳🇴",Zurich:"🇨🇭",Geneva:"🇨🇭",Budapest:"🇭🇺",Prague:"🇨🇿",Athens:"🇬🇷",Helsinki:"🇫🇮",Lisbon:"🇵🇹",Dublin:"🇮🇪" };
const cityCountries: Record<string, string> = { Paris:"فرنسا",London:"بريطانيا",Berlin:"ألمانيا",Madrid:"إسبانيا",Barcelona:"إسبانيا",Rome:"إيطاليا",Milan:"إيطاليا",Amsterdam:"هولندا",Brussels:"بلجيكا",Vienna:"النمسا",Copenhagen:"الدنمارك",Stockholm:"السويد",Oslo:"النرويج",Zurich:"سويسرا",Geneva:"سويسرا",Budapest:"المجر",Prague:"التشيك",Athens:"اليونان",Helsinki:"فنلندا",Lisbon:"البرتغال",Dublin:"أيرلندا" };

const categoryNamesAr: Record<string, string> = {
  restaurant: "مطاعم عربية", supermarket: "سوبرماركت حلال", sweets: "حلويات شرقية",
  barber: "صالونات حلاقة", butcher: "جزار حلال", bakery: "مخابز عربية",
  cafe: "مقاهي", clothing: "ملابس", electronics: "إلكترونيات",
  pharmacy: "صيدليات", halal_grocery: "بقالة حلال", shisha_lounge: "مقاهي شيشة",
  travel_agency: "وكالات سفر", money_transfer: "تحويل أموال", mosque: "مساجد",
  cultural_center: "مراكز ثقافية", car_dealer: "سيارات", repair_shop: "ورش إصلاح", other: "أخرى",
};

const categoryIcons: Record<string, string> = {
  restaurant: "🍽️", supermarket: "🛒", sweets: "🍰", barber: "💈", butcher: "🥩",
  bakery: "🥖", cafe: "☕", clothing: "👔", electronics: "📱", pharmacy: "💊",
  halal_grocery: "🥬", shisha_lounge: "🪴", travel_agency: "✈️", money_transfer: "💱",
  mosque: "🕌", cultural_center: "🏛️", car_dealer: "🚗", repair_shop: "🔧", other: "📍",
};

// Categories that ARE food (can show halal badge)
const foodCategories = ["restaurant", "butcher", "supermarket", "bakery", "sweets", "halal_grocery", "cafe"];

// Categories that should NOT appear on merchants page
const excludedFromMerchants = ["mosque"]; // Embassies already removed from DB

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCity = searchParams.get("city") || "";

  const [query, setQuery] = useState(initialQuery);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [activeCatTab, setActiveCatTab] = useState("");
  const [showCityPrompt, setShowCityPrompt] = useState(!initialCity);

  useEffect(() => {
    if (!selectedCity) { setShowCityPrompt(true); setMerchants([]); return; }
    setShowCityPrompt(false);
    setLoading(true);
    
    async function loadData() {
      try {
        const mParams: any = { json: { status: "active", limit: 500, city: selectedCity } };
        if (query) mParams.json.search = query;
        if (activeCatTab) mParams.json.category = activeCatTab;

        const mInput = encodeURIComponent(JSON.stringify(mParams));
        const mRes = await fetch(`${API_URL}/merchant.list?input=${mInput}`);
        if (mRes.ok) {
          const data = await mRes.json();
          let items = data?.result?.data?.json?.items || [];
          // Filter out excluded categories
          items = items.filter((m: any) => !excludedFromMerchants.includes(m.category));
          // Sort: food first, then others
          items.sort((a: any, b: any) => {
            const aFood = foodCategories.includes(a.category) ? 1 : 0;
            const bFood = foodCategories.includes(b.category) ? 1 : 0;
            return bFood - aFood;
          });
          setMerchants(items);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    loadData();
  }, [query, selectedCity, activeCatTab]);

  // Count per category (excluding mosques from merchants view)
  const catCounts: Record<string, number> = {};
  for (const m of merchants) {
    if (!excludedFromMerchants.includes(m.category)) {
      catCounts[m.category] = (catCounts[m.category] || 0) + 1;
    }
  }
  const nonEmptyCats = Object.entries(catCounts).filter(([_, c]) => c > 0).sort((a, b) => b[1] - a[1]);
  const filteredMerchants = activeCatTab ? merchants.filter(m => m.category === activeCatTab) : merchants;
  const isMosqueSearch = activeCatTab === "mosque" || query.toLowerCase().includes("مسجد") || query.toLowerCase().includes("mosque");
  const isEmbassySearch = activeCatTab === "embassy" || query.toLowerCase().includes("سفارة") || query.toLowerCase().includes("embassy");

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: "#0a1628" }}>
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a1628]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex-1 max-w-lg relative">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="اسأل سندباد..." dir="rtl"
              className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/15 text-white text-sm placeholder:text-white/25 focus:border-[#c9a227]/50 focus:outline-none" />
          </div>
          <Link to="/" className="text-white/40 hover:text-white text-sm hidden sm:block">← رئيسية</Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* City Selection Prompt */}
        {showCityPrompt ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-[#c9a227]/10 flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-10 w-10 text-[#c9a227]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">📍 اختر مدينة أولاً</h2>
            <p className="text-gray-400 text-sm mb-2">Please select a city first to browse results</p>
            <p className="text-gray-500 text-xs mb-8">الرجاء اختيار مدينة لتصفح النتائج</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {citiesEn.map(c => (
                <button key={c} onClick={() => setSelectedCity(c)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white hover:border-[#c9a227]/40 hover:bg-[#c9a227]/10 transition text-sm flex items-center gap-2">
                  <span className="text-lg">{cityFlags[c]}</span>
                  <span>{cityDisplayNames[c]}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* City Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">{cityFlags[selectedCity]}</span>
                  <span>{cityDisplayNames[selectedCity] || selectedCity} — {cityCountries[selectedCity]}</span>
                  <span className="text-white/30 text-sm font-normal">({merchants.length})</span>
                </h1>
              </div>
              <button onClick={() => { setSelectedCity(""); setActiveCatTab(""); }} className="text-sm text-[#c9a227] hover:text-[#ffd700] transition">
                تغيير المدينة
              </button>
            </div>

            {/* Category Tabs */}
            {nonEmptyCats.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-4 mb-4" dir="rtl">
                <button onClick={() => setActiveCatTab("")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${!activeCatTab ? "bg-[#c9a227] text-[#0a1628]" : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"}`}>
                  الكل ({merchants.length})
                </button>
                {nonEmptyCats.map(([cat, count]) => (
                  <button key={cat} onClick={() => setActiveCatTab(activeCatTab === cat ? "" : cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-1.5 ${activeCatTab === cat ? "bg-[#c9a227] text-[#0a1628]" : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"}`}>
                    <span>{categoryIcons[cat] || "📍"}</span>
                    <span>{categoryNamesAr[cat] || cat}</span>
                    <span className="opacity-60 text-xs">{count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Prayer Times - Only for Mosques */}
            {isMosqueSearch && <PrayerTimes city={selectedCity} />}

            {/* Embassy Banner */}
            {isEmbassySearch && (
              <div className="rounded-xl border border-[#c9a227]/20 bg-[#c9a227]/5 p-4 mb-4 text-center">
                <Building2 className="h-8 w-8 text-[#c9a227] mx-auto mb-2" />
                <p className="text-white text-sm">
                  السفارات متوفرة في قسم الطوارئ والسفارات
                </p>
                <Link to={`/search?city=${selectedCity}&q=embassy`} className="text-[#c9a227] text-xs hover:underline">
                  عرض السفارات في {cityDisplayNames[selectedCity]}
                </Link>
              </div>
            )}

            {/* Merchants Grid */}
            {filteredMerchants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMerchants.map(m => (
                  <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl hover:border-[#c9a227]/30 hover:bg-white/8 transition-all p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-base">{m.businessNameAr || m.nameAr || "—"}</h3>
                        {(m.businessName || m.nameEn) && (m.businessName !== m.businessNameAr) && (
                          <p className="text-white/30 text-xs mt-0.5" dir="ltr">{m.businessName || m.nameEn}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Halal badge - ONLY for food */}
                        {foodCategories.includes(m.category) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            ✅ حلال
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">
                          {categoryNamesAr[m.category] || m.category}
                        </span>
                      </div>
                    </div>
                    {m.shortDescription && (
                      <p className="text-white/40 text-xs mb-3 line-clamp-2">{m.shortDescription}</p>
                    )}
                    <div className="flex items-center text-xs text-white/30 mb-3">
                      <MapPin className="h-3 w-3 ml-1" />
                      <span>{m.address || m.city}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {m.phone && (
                        <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 text-sm bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg transition border border-emerald-500/15">
                          <Phone className="h-4 w-4" />
                          <span dir="ltr" className="text-xs">{m.phone}</span>
                        </a>
                      )}
                      {m.latitude && m.longitude && (
                        <a href={`https://www.google.com/maps?q=${m.latitude},${m.longitude}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg transition border border-blue-500/15">
                          <Navigation className="h-4 w-4" />
                          <span className="text-xs">الخريطة</span>
                        </a>
                      )}
                      {m.rating > 0 && (
                        <div className="flex items-center gap-1 text-yellow-400 mr-auto">
                          <Star className="h-4 w-4 fill-yellow-400" />
                          <span className="text-sm font-bold">{parseFloat(m.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading ? (
              <div className="text-center py-16">
                <Store className="h-16 w-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">لا توجد نتائج</h3>
                <p className="text-white/30 text-sm">جرب تصنيفاً آخر أو غير كلمة البحث</p>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 bg-[#0a1628] py-4">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <Logo size="sm" className="justify-center mb-2" />
          <p className="text-white/20 text-xs">© 2025 يورو عرب ماركت — Euro Arab Market</p>
        </div>
      </div>
    </div>
  );
}
