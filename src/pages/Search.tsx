import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import Layout from "@/components/Layout";
import {
  Search, MapPin, Star, Phone, MessageCircle,
  Globe, X, Filter, Store, Sparkles,
  Shield, Heart, Flame, Landmark, Plane, CreditCard,
  AlertTriangle, ChevronDown, ChevronUp, Navigation, Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API_URL = "/api/trpc";

// English city names (must match DB)
const citiesEn = [
  "Paris", "London", "Berlin", "Madrid", "Barcelona",
  "Rome", "Milan", "Amsterdam", "Brussels", "Vienna",
  "Copenhagen", "Stockholm", "Oslo", "Zurich", "Geneva",
  "Budapest", "Prague", "Athens", "Helsinki", "Lisbon", "Dublin"
];

// Arabic display names
const cityDisplayNames: Record<string, string> = {
  Paris: "باريس", London: "لندن", Berlin: "برلين", Madrid: "مدريد",
  Barcelona: "برشلونة", Rome: "روما", Milan: "ميلان", Amsterdam: "أمستردام",
  Brussels: "بروكسل", Vienna: "فيينا", Copenhagen: "كوبنهاغن", Stockholm: "ستوكهولم",
  Oslo: "أوسلو", Zurich: "زيورخ", Geneva: "جنيف", Budapest: "بودابست",
  Prague: "براغ", Athens: "أثينا", Helsinki: "هلسنكي", Lisbon: "لشبونة", Dublin: "دبلن"
};

// Country info for emergency
const cityFlags: Record<string, string> = {
  Paris: "🇫🇷", London: "🇬🇧", Berlin: "🇩🇪", Madrid: "🇪🇸", Barcelona: "🇪🇸",
  Rome: "🇮🇹", Milan: "🇮🇹", Amsterdam: "🇳🇱", Brussels: "🇧🇪", Vienna: "🇦🇹",
  Copenhagen: "🇩🇰", Stockholm: "🇸🇪", Oslo: "🇳🇴", Zurich: "🇨🇭", Geneva: "🇨🇭",
  Budapest: "🇭🇺", Prague: "🇨🇿", Athens: "🇬🇷", Helsinki: "🇫🇮", Lisbon: "🇵🇹", Dublin: "🇮🇪"
};

const cityCountries: Record<string, string> = {
  Paris: "فرنسا", London: "بريطانيا", Berlin: "ألمانيا", Madrid: "إسبانيا", Barcelona: "إسبانيا",
  Rome: "إيطاليا", Milan: "إيطاليا", Amsterdam: "هولندا", Brussels: "بلجيكا", Vienna: "النمسا",
  Copenhagen: "الدنمارك", Stockholm: "السويد", Oslo: "النرويج", Zurich: "سويسرا", Geneva: "سويسرا",
  Budapest: "المجر", Prague: "التشيك", Athens: "اليونان", Helsinki: "فنلندا", Lisbon: "البرتغال", Dublin: "أيرلندا"
};

const categoryNamesAr: Record<string, string> = {
  restaurant: "مطاعم عربية", supermarket: "سوبرماركت حلال", sweets: "حلويات شرقية",
  barber: "صالونات حلاقة", butcher: "جزار حلال", bakery: "مخابز",
  cafe: "مقاهي", clothing: "ملابس", electronics: "إلكترونيات",
  pharmacy: "صيدليات", halal_grocery: "بقالة حلال", shisha_lounge: "مقاهي شيشة",
  travel_agency: "وكالات سفر", money_transfer: "تحويل أموال", mosque: "مساجد",
  cultural_center: "مراكز ثقافية", car_dealer: "سيارات", repair_shop: "ورش إصلاح", other: "أخرى"
};

const categoryIcons: Record<string, string> = {
  restaurant: "🍽️", supermarket: "🛒", sweets: "🍰",
  barber: "💈", butcher: "🥩", bakery: "🥖",
  cafe: "☕", clothing: "👔", electronics: "📱",
  pharmacy: "💊", halal_grocery: "🥬", shisha_lounge: "🪴",
  travel_agency: "✈️", money_transfer: "💱", mosque: "🕌",
  cultural_center: "🏛️", car_dealer: "🚗", repair_shop: "🔧", other: "📍"
};

const emergencyTypeAr: Record<string, { name: string; color: string; bg: string; border: string; icon: any }> = {
  embassy: { name: "سفارة", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: Landmark },
  hospital: { name: "مستشفى", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: Heart },
  police: { name: "شرطة", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Shield },
  fire: { name: "إطفاء", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", icon: Flame },
  pharmacy_24h: { name: "صيدلية 24س", color: "text-green-700", bg: "bg-green-50", border: "border-green-200", icon: Clock },
  tourist_police: { name: "شرطة سياحية", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", icon: Shield },
  airport: { name: "مطار", color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200", icon: Plane },
  lost_card: { name: "حجز بطاقات", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", icon: CreditCard },
  taxi: { name: "تاكسي", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", icon: Navigation },
  other: { name: "طوارئ", color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200", icon: AlertTriangle },
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeCatTab, setActiveCatTab] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showEmergency, setShowEmergency] = useState(true);

  // Load data from API
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 1. Load merchants — filtered by city
        const mParams: any = { json: { status: "active", limit: 500 } };
        if (query) mParams.json.search = query;
        if (selectedCity) mParams.json.city = selectedCity;
        if (selectedCategory) mParams.json.category = selectedCategory;

        const mInput = encodeURIComponent(JSON.stringify(mParams));
        const mRes = await fetch(`${API_URL}/merchant.list?input=${mInput}`);
        let mItems: any[] = [];
        if (mRes.ok) {
          const data = await mRes.json();
          mItems = data?.result?.data?.json?.items || [];
          setMerchants(mItems);
        }

        // 2. Load emergency contacts — filtered by city (CRITICAL FIX)
        const eParams: any = { json: { limit: 500 } };
        if (selectedCity) eParams.json.city = selectedCity;
        const eInput = encodeURIComponent(JSON.stringify(eParams));
        const eRes = await fetch(`${API_URL}/emergency.list?input=${eInput}`);
        if (eRes.ok) {
          const eData = await eRes.json();
          const eItems = eData?.result?.data?.json?.items || [];
          // Also filter by search query if any
          const filtered = query ? eItems.filter((e: any) => {
            const q = query.toLowerCase();
            const text = `${e.name || ''} ${e.nameAr || ''} ${e.city || ''} ${e.country || ''}`.toLowerCase();
            return text.includes(q);
          }) : eItems;
          setEmergencyContacts(filtered);
        }

        // 3. Auto-select first category that has items
        const catCounts: Record<string, number> = {};
        for (const m of mItems) {
          catCounts[m.category] = (catCounts[m.category] || 0) + 1;
        }
        if (!activeCatTab) {
          const firstCat = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a])[0];
          if (firstCat) setActiveCatTab(firstCat);
        }
      } catch (e) {
        console.error("Load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [query, selectedCity, selectedCategory]);

  // Filter merchants by active category tab
  const filteredMerchants = activeCatTab
    ? merchants.filter(m => m.category === activeCatTab)
    : merchants;

  // Count merchants per category (for tabs)
  const catCounts: Record<string, number> = {};
  for (const m of merchants) {
    catCounts[m.category] = (catCounts[m.category] || 0) + 1;
  }
  // Only show categories that have items
  const nonEmptyCats = Object.entries(catCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  // Group emergency by type
  const emergencyByType: Record<string, any[]> = {};
  for (const e of emergencyContacts) {
    if (!emergencyByType[e.type]) emergencyByType[e.type] = [];
    emergencyByType[e.type].push(e);
  }

  const clearFilters = () => {
    setSelectedCity(""); setSelectedCategory(""); setQuery(""); setActiveCatTab("");
  };
  const totalResults = merchants.length + emergencyContacts.length;

  // Show city header with emergency numbers if a city is selected
  const showCityHeader = selectedCity !== "";

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] py-8">
          <div className="mx-auto max-w-5xl px-4">
            <Link to="/" className="text-amber-400 font-bold text-sm hover:text-amber-300 mb-4 inline-block">← يورو عرب ماركت</Link>
            <h1 className="text-xl font-bold text-white mb-1">
              {query ? `${totalResults} نتيجة لـ "${query}"` : selectedCity ? `${cityDisplayNames[selectedCity] || selectedCity}` : `جميع المتاجر العربية (${merchants.length})`}
            </h1>
            <p className="text-gray-400 text-sm mb-5">
              {selectedCity ? `${cityFlags[selectedCity] || "🌍"} دليل العرب في ${cityDisplayNames[selectedCity] || selectedCity}` : "دليل المتاجر العربية في أوروبا + أرقام الطوارئ والسفارات"}
            </p>

            <div className="flex gap-2 max-w-2xl">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input placeholder="ابحث عن مطعم، متجر، سفارة، مستشفى..." value={query} onChange={(e) => setQuery(e.target.value)}
                  className="pr-12 py-6 text-right bg-white/10 border-white/10 text-white placeholder:text-gray-500 rounded-xl" dir="rtl" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1 text-amber-400 text-sm hover:text-amber-300"><Filter className="h-4 w-4" /> فلاتر</button>
              {selectedCity && <Badge className="bg-amber-500/20 text-amber-400 text-xs cursor-pointer" onClick={() => setSelectedCity("")}>{cityDisplayNames[selectedCity] || selectedCity} ✕</Badge>}
              {selectedCategory && <Badge className="bg-amber-500/20 text-amber-400 text-xs cursor-pointer" onClick={() => setSelectedCategory("")}>{categoryNamesAr[selectedCategory]} ✕</Badge>}
              {query && <Badge className="bg-amber-500/20 text-amber-400 text-xs cursor-pointer" onClick={() => setQuery("")}>{query} ✕</Badge>}
            </div>

            {showFilters && (
              <div className="mt-3 bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-gray-400 text-xs mb-2">المدينة</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {citiesEn.map(c => (
                    <button key={c} onClick={() => setSelectedCity(selectedCity === c ? "" : c)}
                      className={`text-xs px-3 py-1.5 rounded-full transition ${selectedCity === c ? "bg-amber-500 text-black font-medium" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>
                      {cityDisplayNames[c] || c}
                    </button>
                  ))}
                </div>
                <p className="text-gray-400 text-xs mb-2">التصنيف</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(categoryNamesAr).map(([k, v]) => (
                    <button key={k} onClick={() => setSelectedCategory(selectedCategory === k ? "" : k)}
                      className={`text-xs px-3 py-1.5 rounded-full transition ${selectedCategory === k ? "bg-amber-500 text-black font-medium" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>{v}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* City Header with Emergency Numbers */}
        {showCityHeader && (
          <div className="bg-red-50 border-b border-red-200">
            <div className="mx-auto max-w-5xl px-4 py-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {cityFlags[selectedCity]} {cityDisplayNames[selectedCity]}، {cityCountries[selectedCity]}
                  </h2>
                  <p className="text-xs text-gray-500" dir="ltr">{selectedCity}, {cityCountries[selectedCity]}</p>
                </div>
                <EmergencyNumbers city={selectedCity} />
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-5xl px-4 py-6">
          {loading ? (
            <div className="text-center py-16"><div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" /></div>
          ) : (
            <>
              {/* Category Tabs — ONLY show non-empty categories */}
              {merchants.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4" dir="rtl">
                  {nonEmptyCats.map(([cat, count]) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCatTab(activeCatTab === cat ? "" : cat)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                        activeCatTab === cat
                          ? "bg-emerald-600 text-white shadow"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span>{categoryIcons[cat] || "📍"}</span>
                      <span>{categoryNamesAr[cat] || cat}</span>
                      <Badge className={`text-xs ${activeCatTab === cat ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>{count}</Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Emergency Contacts */}
              {emergencyContacts.length > 0 && (
                <div className="mb-8">
                  <button onClick={() => setShowEmergency(!showEmergency)} className="flex items-center gap-2 mb-4 w-full">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h2 className="text-lg font-bold text-gray-900">أرقام الطوارئ والسفارات <Badge className="mr-2 bg-red-100 text-red-700">{emergencyContacts.length}</Badge></h2>
                    {showEmergency ? <ChevronUp className="h-5 w-5 text-gray-400 mr-auto" /> : <ChevronDown className="h-5 w-5 text-gray-400 mr-auto" />}
                  </button>
                  {showEmergency && (
                    <div className="space-y-4">
                      {Object.entries(emergencyByType).map(([type, contacts]) => {
                        const typeInfo = emergencyTypeAr[type] || emergencyTypeAr.other;
                        const TypeIcon = typeInfo.icon;
                        return (
                          <div key={type} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className={`${typeInfo.bg} ${typeInfo.border} border-b px-4 py-2 flex items-center gap-2`}>
                              <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                              <span className={`font-bold text-sm ${typeInfo.color}`}>{typeInfo.name}</span>
                              <Badge variant="outline" className="text-xs mr-2">{contacts.length}</Badge>
                            </div>
                            <div className="divide-y divide-gray-100">
                              {contacts.map(e => (
                                <div key={e.id} className="p-4 hover:bg-gray-50 transition">
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <div className="flex-1">
                                      <h3 className="font-bold text-gray-900 text-sm">{e.nameAr || e.name}</h3>
                                      <p className="text-xs text-gray-500 mt-0.5"><MapPin className="h-3 w-3 inline ml-1" />{e.city ? `${e.city}، ` : ""}{e.country}</p>
                                    </div>
                                    {e.phone && <a href={`tel:${e.phone}`} className="flex items-center gap-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg transition border border-red-100 font-bold"><Phone className="h-4 w-4" /><span dir="ltr">{e.phone}</span></a>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Merchants Grid */}
              {filteredMerchants.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Store className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-bold text-gray-900">
                      {activeCatTab ? categoryNamesAr[activeCatTab] || activeCatTab : "المتاجر والمحلات"}
                      <Badge className="mr-2 bg-amber-100 text-amber-700">{filteredMerchants.length}</Badge>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMerchants.map(m => <MerchantCard key={m.id} merchant={m} />)}
                  </div>
                </div>
              )}

              {totalResults === 0 && (
                <div className="text-center py-16">
                  <Search className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد نتائج</h3>
                  <p className="text-gray-500 text-sm mb-4">جرب تغيير كلمة البحث أو اختر مدينة أخرى</p>
                  <Button onClick={clearFilters} variant="outline" className="rounded-full"><X className="h-4 w-4 ml-2" />مسح الفلاتر</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Emergency Numbers Banner Component
function EmergencyNumbers({ city }: { city: string }) {
  const numbers = getEmergencyNumbers(city);
  return (
    <div className="flex items-center gap-3 flex-wrap" dir="ltr">
      <span className="text-xs text-red-600 font-bold">🚨 Emergency:</span>
      {numbers.map((n, i) => (
        <a key={i} href={`tel:${n.phone}`} className="flex items-center gap-1 bg-white border border-red-200 rounded-lg px-2 py-1 hover:bg-red-100 transition">
          <span className="text-xs text-gray-500">{n.label}</span>
          <span className="text-sm font-bold text-red-700" dir="ltr">{n.phone}</span>
        </a>
      ))}
    </div>
  );
}

function getEmergencyNumbers(city: string): { label: string; phone: string }[] {
  const map: Record<string, { label: string; phone: string }[]> = {
    Paris: [{ label: "Police", phone: "17" }, { label: "Ambulance", phone: "15" }, { label: "Fire", phone: "18" }, { label: "General", phone: "112" }],
    London: [{ label: "Police", phone: "999" }, { label: "Ambulance", phone: "999" }, { label: "Fire", phone: "999" }, { label: "General", phone: "112" }],
    Berlin: [{ label: "Police", phone: "110" }, { label: "Ambulance", phone: "112" }, { label: "Fire", phone: "112" }, { label: "General", phone: "112" }],
    Madrid: [{ label: "Police", phone: "091" }, { label: "Ambulance", phone: "112" }, { label: "Fire", phone: "112" }, { label: "General", phone: "112" }],
    Barcelona: [{ label: "Police", phone: "091" }, { label: "Ambulance", phone: "112" }, { label: "Fire", phone: "112" }, { label: "General", phone: "112" }],
    Rome: [{ label: "Police", phone: "113" }, { label: "Ambulance", phone: "118" }, { label: "Fire", phone: "115" }, { label: "General", phone: "112" }],
    Milan: [{ label: "Police", phone: "113" }, { label: "Ambulance", phone: "118" }, { label: "Fire", phone: "115" }, { label: "General", phone: "112" }],
    Amsterdam: [{ label: "Police", phone: "112" }, { label: "Ambulance", phone: "112" }, { label: "Fire", phone: "112" }, { label: "General", phone: "112" }],
    Brussels: [{ label: "Police", phone: "101" }, { label: "Ambulance", phone: "112" }, { label: "Fire", phone: "112" }, { label: "General", phone: "112" }],
    Vienna: [{ label: "Police", phone: "133" }, { label: "Ambulance", phone: "144" }, { label: "Fire", phone: "122" }, { label: "General", phone: "112" }],
    Copenhagen: [{ label: "Police", phone: "112" }, { label: "Ambulance", phone: "112" }, { label: "Fire", phone: "112" }, { label: "General", phone: "112" }],
    Stockholm: [{ label: "Police", phone: "112" }, { label: "Ambulance", phone: "112" }, { label: "Fire", phone: "112" }, { label: "General", phone: "112" }],
    Oslo: [{ label: "Police", phone: "112" }, { label: "Ambulance", phone: "113" }, { label: "Fire", phone: "110" }, { label: "General", phone: "112" }],
    Zurich: [{ label: "Police", phone: "117" }, { label: "Ambulance", phone: "144" }, { label: "Fire", phone: "118" }, { label: "General", phone: "112" }],
    Geneva: [{ label: "Police", phone: "117" }, { label: "Ambulance", phone: "144" }, { label: "Fire", phone: "118" }, { label: "General", phone: "112" }],
    Budapest: [{ label: "Police", phone: "107" }, { label: "Ambulance", phone: "104" }, { label: "Fire", phone: "105" }, { label: "General", phone: "112" }],
    Prague: [{ label: "Police", phone: "158" }, { label: "Ambulance", phone: "155" }, { label: "Fire", phone: "150" }, { label: "General", phone: "112" }],
    Athens: [{ label: "Police", phone: "100" }, { label: "Ambulance", phone: "166" }, { label: "Fire", phone: "199" }, { label: "General", phone: "112" }],
    Helsinki: [{ label: "Police", phone: "112" }, { label: "Ambulance", phone: "112" }, { label: "Fire", phone: "112" }, { label: "General", phone: "112" }],
    Lisbon: [{ label: "Police", phone: "112" }, { label: "Ambulance", phone: "112" }, { label: "Fire", phone: "112" }, { label: "General", phone: "112" }],
    Dublin: [{ label: "Police", phone: "999" }, { label: "Ambulance", phone: "999" }, { label: "Fire", phone: "999" }, { label: "General", phone: "112" }],
  };
  return map[city] || [{ label: "General", phone: "112" }];
}

function MerchantCard({ merchant: m }: { merchant: any }) {
  const detailUrl = `/stores/${m.id}`;
  const nameAr = m.businessNameAr || m.nameAr || "";
  const nameEn = m.businessName || m.nameEn || "";
  const displayDesc = m.shortDescription || "";
  const fullAddress = m.address || [m.city, m.country].filter(Boolean).join(", ");
  const catName = categoryNamesAr[m.category] || m.subcategory || m.category || "متجر";
  const ratingVal = parseFloat(m.rating) || 0;

  // Google Maps link
  const mapsUrl = m.latitude && m.longitude
    ? `https://www.google.com/maps?q=${m.latitude},${m.longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(fullAddress)}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all overflow-hidden">
      {m.isFeatured && <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1.5 flex items-center gap-1"><Sparkles className="h-3 w-3 text-black" /><span className="text-black text-xs font-bold">إعلان مميز</span></div>}
      <div className="p-4 md:p-5">
        {/* Arabic Name + Category */}
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-900 text-base leading-snug flex-1">{nameAr || nameEn}</h3>
          <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600 bg-amber-50/50 mr-2 shrink-0">{catName}</Badge>
        </div>
        {/* English Name */}
        {nameEn && nameAr && nameEn !== nameAr && (
          <p className="text-xs text-gray-500 mb-2 font-medium" dir="ltr">{nameEn}</p>
        )}
        {/* Description */}
        {displayDesc && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{displayDesc}</p>}
        {/* Address + Rating */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{fullAddress}</span>
          </div>
          {ratingVal > 0 && (
            <div className="flex items-center gap-1 shrink-0 mr-2">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="font-medium text-gray-600">{ratingVal.toFixed(1)}</span>
            </div>
          )}
        </div>
        {/* Phone + Map + Details */}
        <div className="flex flex-wrap items-center gap-2">
          {m.phone && (
            <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg transition border border-emerald-100 font-medium">
              <Phone className="h-4 w-4" />
              <span dir="ltr">{m.phone}</span>
            </a>
          )}
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition border border-blue-100">
            <MapPin className="h-4 w-4" /> الخريطة
          </a>
          {m.whatsapp && (
            <a href={`https://wa.me/${m.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg transition border border-green-100">
              <MessageCircle className="h-4 w-4" /> واتساب
            </a>
          )}
          {m.website && (
            <a href={m.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg transition border border-purple-100">
              <Globe className="h-4 w-4" /> موقع
            </a>
          )}
          <Link to={detailUrl} className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 px-2 py-2 transition mr-auto font-medium">التفاصيل ←</Link>
        </div>
      </div>
    </div>
  );
}
