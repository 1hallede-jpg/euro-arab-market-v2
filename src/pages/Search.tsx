import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, MapPin, Star, Phone, Store, Navigation, ChevronDown, Globe, LogIn, Landmark } from "lucide-react";
import Logo from "@/components/Logo";
import PrayerTimes from "@/components/PrayerTimes";
import EmergencyBanner from "@/components/EmergencyBanner";

const API_URL = "/api/trpc";

const citiesEn = ["Paris","London","Berlin","Madrid","Barcelona","Rome","Milan","Amsterdam","Brussels","Vienna","Copenhagen","Stockholm","Oslo","Zurich","Geneva","Budapest","Prague","Athens","Helsinki","Lisbon","Dublin"];
const cityDisplayNames: Record<string, string> = { Paris:"باريس",London:"لندن",Berlin:"برلين",Madrid:"مدريد",Barcelona:"برشلونة",Rome:"روما",Milan:"ميلان",Amsterdam:"أمستردام",Brussels:"بروكسل",Vienna:"فيينا",Copenhagen:"كوبنهاغن",Stockholm:"ستوكهولم",Oslo:"أوسلو",Zurich:"زيورخ",Geneva:"جنيف",Budapest:"بودابست",Prague:"براغ",Athens:"أثينا",Helsinki:"هلسنكي",Lisbon:"لشبونة",Dublin:"دبلن" };
const cityFlags: Record<string, string> = { Paris:"🇫🇷",London:"🇬🇧",Berlin:"🇩🇪",Madrid:"🇪🇸",Barcelona:"🇪🇸",Rome:"🇮🇹",Milan:"🇮🇹",Amsterdam:"🇳🇱",Brussels:"🇧🇪",Vienna:"🇦🇹",Copenhagen:"🇩🇰",Stockholm:"🇸🇪",Oslo:"🇳🇴",Zurich:"🇨🇭",Geneva:"🇨🇭",Budapest:"🇭🇺",Prague:"🇨🇿",Athens:"🇬🇷",Helsinki:"🇫🇮",Lisbon:"🇵🇹",Dublin:"🇮🇪" };
const cityCountries: Record<string, string> = { Paris:"France",London:"UK",Berlin:"Germany",Madrid:"Spain",Barcelona:"Spain",Rome:"Italy",Milan:"Italy",Amsterdam:"Netherlands",Brussels:"Belgium",Vienna:"Austria",Copenhagen:"Denmark",Stockholm:"Sweden",Oslo:"Norway",Zurich:"Switzerland",Geneva:"Switzerland",Budapest:"Hungary",Prague:"Czech Republic",Athens:"Greece",Helsinki:"Finland",Lisbon:"Portugal",Dublin:"Ireland" };

// Country → cities mapping for country-level search
const countryCities: Record<string, string[]> = {
  Germany: ["Berlin","Munich","Hamburg","Cologne","Frankfurt","Stuttgart"],
  France: ["Paris","Lyon","Marseille","Nice"],
  UK: ["London","Birmingham","Manchester"],
  Spain: ["Madrid","Barcelona"],
  Italy: ["Rome","Milan"],
  Netherlands: ["Amsterdam","Rotterdam"],
  Belgium: ["Brussels"], Austria: ["Vienna"],
  Switzerland: ["Zurich","Geneva"], Sweden: ["Stockholm"],
  Denmark: ["Copenhagen"], Greece: ["Athens"],
  Hungary: ["Budapest"], Portugal: ["Lisbon"],
  Ireland: ["Dublin"], Finland: ["Helsinki"],
  Norway: ["Oslo"], Czech: ["Prague"],
};

const countryNamesAr: Record<string, string> = {
  Germany:"ألمانيا",France:"فرنسا",UK:"بريطانيا",Spain:"إسبانيا",Italy:"إيطاليا",
  Netherlands:"هولندا",Belgium:"بلجيكا",Austria:"النمسا",Switzerland:"سويسرا",
  Sweden:"السويد",Denmark:"الدنمارك",Greece:"اليونان",Hungary:"المجر",
  Portugal:"البرتغال",Ireland:"أيرلندا",Finland:"فنلندا",Norway:"النرويج",
  "Czech Republic":"التشيك",
};

const categoryNamesAr: Record<string, string> = {
  restaurant: "مطاعم عربية", supermarket: "سوبرماركت", sweets: "حلويات",
  barber: "حلاقة", butcher: "جزار حلال", bakery: "مخابز",
  cafe: "مقاهي", clothing: "ملابس", electronics: "إلكترونيات",
  pharmacy: "صيدليات", halal_grocery: "بقالة حلال", shisha_lounge: "مقاهي شيشة",
  travel_agency: "وكالات سفر", money_transfer: "تحويل أموال", mosque: "مساجد",
  cultural_center: "مراكز ثقافية", car_dealer: "سيارات", repair_shop: "ورش إصلاح", other: "أخرى",
};

const foodCategories = ["restaurant","butcher","supermarket","bakery","sweets","halal_grocery","cafe"];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCity = searchParams.get("city") || "";

  const [query, setQuery] = useState(initialQuery);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [embassies, setEmbassies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [activeCatTab, setActiveCatTab] = useState("");
  const [showCityPrompt, setShowCityPrompt] = useState(!initialCity);
  const [totalCount, setTotalCount] = useState(0);
  const [showEmbassies, setShowEmbassies] = useState(false);

  // Detect if query is a country name
  const getCitiesForQuery = (q: string): string[] | null => {
    const lower = q.toLowerCase().trim();
    // Check English country names
    for (const [country, cities] of Object.entries(countryCities)) {
      if (lower === country.toLowerCase() || lower === country.toLowerCase().split(' ')[0]) return cities;
    }
    // Check Arabic country names
    for (const [country, arName] of Object.entries(countryNamesAr)) {
      if (lower === arName) return countryCities[country];
    }
    // Check city names
    for (const city of citiesEn) {
      if (lower === city.toLowerCase()) return [city];
      if (lower === cityDisplayNames[city]) return [city];
    }
    return null;
  };

  const loadData = async () => {
    if (!selectedCity) { setShowCityPrompt(true); setMerchants([]); return; }
    setShowCityPrompt(false);
    setLoading(true);

    try {
      // Fetch merchants
      let targetCities = [selectedCity];
      const countryCitiesList = getCitiesForQuery(query);
      if (countryCitiesList && !citiesEn.includes(selectedCity)) {
        targetCities = countryCitiesList.filter(c => citiesEn.includes(c));
      }

      const allResults: any[] = [];
      for (const city of targetCities) {
        const mParams: any = { json: { status: "active", limit: 100, city } };
        if (query && !getCitiesForQuery(query)) mParams.json.search = query;
        if (activeCatTab && activeCatTab !== "embassy") mParams.json.category = activeCatTab;

        const mInput = encodeURIComponent(JSON.stringify(mParams));
        const mRes = await fetch(`${API_URL}/merchant.list?input=${mInput}`);
        if (mRes.ok) {
          const data = await mRes.json();
          const items = data?.result?.data?.json?.items || [];
          const pagination = data?.result?.data?.json?.pagination || {};
          setTotalCount(pagination.total || items.length);
          const clean = items.filter((m: any) => {
            const nameAr = (m.businessNameAr || m.nameAr || "").toLowerCase();
            const nameEn = (m.businessName || m.nameEn || "").toLowerCase();
            return !nameAr.includes("سفارة") && !nameEn.includes("embassy") &&
                   !nameAr.includes("قنصلية") && !nameEn.includes("consulate") &&
                   !nameAr.includes("أمم متحدة") && !nameEn.includes("united nations");
          });
          allResults.push(...clean);
        }
      }

      const unique = allResults.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      unique.sort((a, b) => {
        const aFood = foodCategories.includes(a.category) ? 1 : 0;
        const bFood = foodCategories.includes(b.category) ? 1 : 0;
        return bFood - aFood;
      });
      setMerchants(unique);

      // Fetch embassies for this city
      const eParams = { json: { type: "embassy", city: selectedCity, limit: 50 } };
      const eInput = encodeURIComponent(JSON.stringify(eParams));
      const eRes = await fetch(`${API_URL}/emergency.list?input=${eInput}`);
      if (eRes.ok) {
        const eData = await eRes.json();
        const eItems = eData?.result?.data?.json?.items || [];
        setEmbassies(eItems);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [selectedCity, activeCatTab]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => { loadData(); }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Compute categories that ACTUALLY have data in current results
  const actualCatCounts: Record<string, number> = {};
  for (const m of merchants) {
    actualCatCounts[m.category] = (actualCatCounts[m.category] || 0) + 1;
  }
  const nonEmptyCats = Object.entries(actualCatCounts)
    .filter(([_, c]) => c > 0)
    .sort((a, b) => b[1] - a[1]);

  const filteredMerchants = activeCatTab ? merchants.filter(m => m.category === activeCatTab) : merchants;

  const handleSearch = () => {
    const cityList = getCitiesForQuery(query);
    if (cityList) {
      const firstCity = cityList.find(c => citiesEn.includes(c));
      if (firstCity) setSelectedCity(firstCity);
    }
    loadData();
  };

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: "#0a1628" }}>
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a1628]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex-1 max-w-xl relative">
            <div className="flex items-center rounded-full bg-white/5 border border-white/15 px-4 py-2 focus-within:border-[#c9a227]/50 transition">
              <Search className="h-4 w-4 text-white/30 ml-2 shrink-0" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="اسأل سندباد..." dir="rtl"
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 outline-none text-right" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedCity && (
              <button onClick={() => setShowCityPrompt(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#c9a227]/30 text-[#c9a227] text-xs hover:bg-[#c9a227]/10 transition">
                <Globe className="h-3 w-3" />
                {cityFlags[selectedCity]} {cityDisplayNames[selectedCity]}
                <ChevronDown className="h-3 w-3" />
              </button>
            )}
            <a href="/login" className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/15 text-white/50 text-xs hover:text-white transition">
              <LogIn className="h-3 w-3" /> دخول
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* City Selection Prompt */}
        {showCityPrompt ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#c9a227]/10 flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-10 w-10 text-[#c9a227]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">📍 اختر مدينة</h2>
            <p className="text-white/30 text-sm mb-2">يمكنك أيضاً البحث باسم الدولة (مثل: ألمانيا، فرنسا)</p>
            <p className="text-white/20 text-xs mb-8">Search by country: Germany, France, UK...</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              {citiesEn.map(c => (
                <button key={c} onClick={() => { setSelectedCity(c); setShowCityPrompt(false); }}
                  className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white hover:border-[#c9a227]/40 hover:bg-[#c9a227]/10 transition text-sm flex items-center gap-2">
                  <span className="text-lg">{cityFlags[c]}</span><span>{cityDisplayNames[c]}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* City Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-xl">{cityFlags[selectedCity]}</span>
                  <span>دليل سندباد أوروبا — {cityDisplayNames[selectedCity]}</span>
                </h1>
                <p className="text-white/20 text-xs">Sindbad Europe Guide | {cityCountries[selectedCity]}</p>
              </div>
              <button onClick={() => { setSelectedCity(""); setActiveCatTab(""); setShowCityPrompt(true); }}
                className="text-xs text-[#c9a227] hover:text-[#ffd700] transition border border-[#c9a227]/30 px-3 py-1.5 rounded-full">
                تغيير المدينة
              </button>
            </div>

            {/* Emergency Banner — City specific */}
            <EmergencyBanner city={selectedCity} />

            {/* Category Tabs — ONLY show categories with ACTUAL data + Embassies */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4" dir="rtl">
              <button onClick={() => { setActiveCatTab(""); setShowEmbassies(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                  !activeCatTab && !showEmbassies ? "bg-[#c9a227] text-[#0a1628]" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                }`}>
                الكل <span className="opacity-60 text-xs">({merchants.length + embassies.length})</span>
              </button>
              {nonEmptyCats.map(([cat, count]) => (
                <button key={cat} onClick={() => { setActiveCatTab(activeCatTab === cat ? "" : cat); setShowEmbassies(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeCatTab === cat ? "bg-[#c9a227] text-[#0a1628]" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                  }`}>
                  <span>{categoryNamesAr[cat] || cat}</span>
                  <span className="opacity-50 text-xs">{count}</span>
                </button>
              ))}
              {/* Embassies tab */}
              {embassies.length > 0 && (
                <button onClick={() => { setShowEmbassies(!showEmbassies); setActiveCatTab(""); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                    showEmbassies ? "bg-[#c9a227] text-[#0a1628]" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                  }`}>
                  <span>🏛️ سفارات</span>
                  <span className="opacity-50 text-xs">{embassies.length}</span>
                </button>
              )}
            </div>

            {/* Prayer Times for Mosques */}
            {activeCatTab === "mosque" && <PrayerTimes city={selectedCity} />}

            {/* Embassies Results */}
            {showEmbassies && embassies.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Landmark className="h-5 w-5 text-[#c9a227]" />
                  <h2 className="text-lg font-bold text-white">
                    🏛️ السفارات في {cityDisplayNames[selectedCity]}
                    <span className="text-white/30 text-sm mr-2">({embassies.length})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {embassies.map(e => (
                    <div key={e.id} className="bg-white/5 border border-white/10 rounded-xl hover:border-[#c9a227]/30 transition-all p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-base">{e.nameAr || e.name || "—"}</h3>
                          <p className="text-white/30 text-xs mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {e.address || `${cityDisplayNames[e.city] || e.city}، ${e.country}`}
                          </p>
                        </div>
                        {e.phone && (
                          <a href={`tel:${e.phone}`} className="flex items-center gap-1.5 text-xs bg-[#c9a227]/10 hover:bg-[#c9a227]/20 text-[#c9a227] px-3 py-2 rounded-lg transition border border-[#c9a227]/15 mr-2 shrink-0">
                            <Phone className="h-3.5 w-3.5" />
                            <span dir="ltr">{e.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Merchant Results */}
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin h-8 w-8 border-2 border-[#c9a227] border-t-transparent rounded-full mx-auto" />
                <p className="text-white/30 text-sm mt-4">جاري البحث...</p>
              </div>
            ) : !showEmbassies && filteredMerchants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMerchants.map(m => (
                  <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl hover:border-[#c9a227]/30 transition-all p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-base truncate">{m.businessNameAr || m.nameAr || "—"}</h3>
                        {(m.businessName || m.nameEn) && (m.businessName !== m.businessNameAr) && (
                          <p className="text-white/25 text-xs mt-0.5" dir="ltr">{m.businessName || m.nameEn}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mr-2 shrink-0">
                        {foodCategories.includes(m.category) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">✅ حلال</span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/35">{categoryNamesAr[m.category] || m.category}</span>
                      </div>
                    </div>
                    {m.shortDescription && (
                      <p className="text-white/30 text-xs mb-3 line-clamp-2">{m.shortDescription}</p>
                    )}
                    <div className="flex items-center text-xs text-white/25 mb-3">
                      <MapPin className="h-3 w-3 ml-1 shrink-0" />
                      <span className="truncate">{m.address || m.city}</span>
                      {m.rating > 0 && (
                        <span className="mr-auto flex items-center gap-1 text-yellow-400/80">
                          <Star className="h-3 w-3 fill-yellow-400" />{parseFloat(m.rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {m.phone && (
                        <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg transition border border-emerald-500/15">
                          <Phone className="h-3.5 w-3.5" />
                          <span dir="ltr">{m.phone}</span>
                        </a>
                      )}
                      {(m.latitude && m.longitude) ? (
                        <a href={`https://www.google.com/maps?q=${m.latitude},${m.longitude}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg transition border border-blue-500/15">
                          <Navigation className="h-3.5 w-3.5" />خريطة
                        </a>
                      ) : m.address ? (
                        <a href={`https://www.google.com/maps/search/${encodeURIComponent(m.address)}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg transition border border-blue-500/15">
                          <Navigation className="h-3.5 w-3.5" />خريطة
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : showEmbassies ? (
              <div className="text-center py-20">
                <Landmark className="h-16 w-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">لا توجد سفارات مسجلة في {cityDisplayNames[selectedCity]}</h3>
              </div>
            ) : (
              <div className="text-center py-20">
                <Store className="h-16 w-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">
                  {activeCatTab ? `لا توجد نتائج الآن في "${categoryNamesAr[activeCatTab]}"` : "لا توجد نتائج الآن"}
                </h3>
                <p className="text-white/30 text-sm mb-4">
                  {activeCatTab ? "هذا التصنيف فارغ حالياً" : "جرب كلمة بحث أخرى أو تصنيف مختلف"}
                </p>
                {activeCatTab && (
                  <button onClick={() => setActiveCatTab("")} className="text-[#c9a227] text-sm hover:underline">
                    عرض كل النتائج
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
