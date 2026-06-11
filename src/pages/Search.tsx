import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router";
import Layout from "@/components/Layout";
import {
  Search, MapPin, Star, Phone, MessageCircle,
  BadgeCheck, Globe, X, Filter, Store, Sparkles,
  Shield, Heart, Flame, Landmark, Plane, CreditCard,
  AlertTriangle, ChevronDown, ChevronUp, Navigation, Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API_URL = "/api/trpc";

const categoryNamesAr: Record<string, string> = {
  restaurant: "مطاعم عربية", supermarket: "سوبرماركت حلال", sweets: "حلويات شرقية",
  barber: "صالونات حلاقة", butcher: "جزار حلال", bakery: "مخابز",
  cafe: "مقاهي", clothing: "ملابس", electronics: "إلكترونيات",
  pharmacy: "صيدليات", halal_grocery: "بقالة حلال", shisha_lounge: "مقاهي شيشة",
  travel_agency: "وكالات سفر", money_transfer: "تحويل أموال", mosque: "مساجد",
  cultural_center: "مراكز ثقافية", car_dealer: "سيارات", repair_shop: "ورش إصلاح", other: "أخرى",
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

const cities = ["باريس", "لندن", "برلين", "مدريد", "برشلونة", "روما", "ميلان", "أمستردام", "بروكسل", "فيينا", "كوبنهاغن", "ستوكهولم", "أوسلو", "زيورخ", "بودابست"];

function getDisplayName(m: any): string {
  if (m.shortDescription && m.shortDescription.length < 50) return m.shortDescription;
  if (m.businessNameAr) return m.businessNameAr;
  if (m.businessName) return m.businessName;
  return `${categoryNamesAr[m.category] || m.category || 'متجر'} - ${m.city || ''}`;
}

// Fetch merchants directly via GET
async function fetchMerchants(): Promise<any[]> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: { status: "active", limit: 500 } }));
    const res = await fetch(`${API_URL}/merchant.list?input=${input}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data?.result?.data?.json?.items || [];
  } catch { return []; }
}

async function fetchEmergency(): Promise<any[]> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: { limit: 200 } }));
    const res = await fetch(`${API_URL}/emergency.list?input=${input}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data?.result?.data?.json?.items || [];
  } catch { return []; }
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showEmergency, setShowEmergency] = useState(true);
  const [showStores, setShowStores] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [mItems, eItems] = await Promise.all([fetchMerchants(), fetchEmergency()]);
    setMerchants(mItems);
    setEmergencyContacts(eItems);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  let filteredMerchants = [...merchants];
  let filteredEmergency = [...emergencyContacts];

  if (selectedCity) {
    filteredMerchants = filteredMerchants.filter(m => m.city === selectedCity);
    filteredEmergency = filteredEmergency.filter(e => e.city === selectedCity);
  }
  if (selectedCategory) {
    filteredMerchants = filteredMerchants.filter(m => m.category === selectedCategory);
  }
  if (query.trim()) {
    const q = query.toLowerCase();
    filteredMerchants = filteredMerchants.filter(m => {
      const text = `${m.businessNameAr || ''} ${m.businessName || ''} ${m.category || ''} ${m.city || ''} ${m.country || ''} ${m.shortDescription || ''} ${m.description || ''}`.toLowerCase();
      return text.includes(q);
    });
    filteredEmergency = filteredEmergency.filter(e => {
      const text = `${e.name || ''} ${e.nameAr || ''} ${e.type || ''} ${e.city || ''} ${e.country || ''}`.toLowerCase();
      return text.includes(q);
    });
  }

  const sortedMerchants = filteredMerchants.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
  });

  const emergencyByType: Record<string, any[]> = {};
  for (const e of filteredEmergency) {
    if (!emergencyByType[e.type]) emergencyByType[e.type] = [];
    emergencyByType[e.type].push(e);
  }

  const clearFilters = () => { setSelectedCity(""); setSelectedCategory(""); setQuery(""); };
  const totalResults = sortedMerchants.length + filteredEmergency.length;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] py-8">
          <div className="mx-auto max-w-5xl px-4">
            <Link to="/" className="text-amber-400 font-bold text-sm hover:text-amber-300 mb-4 inline-block">← يورو عرب ماركت</Link>
            <h1 className="text-xl font-bold text-white mb-1">
              {query ? `${totalResults} نتيجة لـ "${query}"` : `جميع المتاجر العربية (${merchants.length})`}
            </h1>
            <p className="text-gray-400 text-sm mb-5">دليل المتاجر العربية في أوروبا + أرقام الطوارئ والسفارات</p>

            <div className="flex gap-2 max-w-2xl">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input placeholder="ابحث عن مطعم، متجر، سفارة، مستشفى..." value={query} onChange={(e) => setQuery(e.target.value)}
                  className="pr-12 py-6 text-right bg-white/10 border-white/10 text-white placeholder:text-gray-500 rounded-xl" dir="rtl" />
              </div>
              <Button className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-bold px-6 rounded-xl"><Search className="h-5 w-5" /></Button>
            </div>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1 text-amber-400 text-sm hover:text-amber-300"><Filter className="h-4 w-4" /> فلاتر</button>
              {selectedCity && <Badge className="bg-amber-500/20 text-amber-400 text-xs cursor-pointer" onClick={() => setSelectedCity("")}>{selectedCity} ✕</Badge>}
              {selectedCategory && <Badge className="bg-amber-500/20 text-amber-400 text-xs cursor-pointer" onClick={() => setSelectedCategory("")}>{categoryNamesAr[selectedCategory]} ✕</Badge>}
              {query && <Badge className="bg-amber-500/20 text-amber-400 text-xs cursor-pointer" onClick={() => setQuery("")}>{query} ✕</Badge>}
            </div>

            {showFilters && (
              <div className="mt-3 bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-gray-400 text-xs mb-2">المدينة</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {cities.map(c => (
                    <button key={c} onClick={() => setSelectedCity(selectedCity === c ? "" : c)}
                      className={`text-xs px-3 py-1.5 rounded-full transition ${selectedCity === c ? "bg-amber-500 text-black font-medium" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>{c}</button>
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

        <div className="mx-auto max-w-5xl px-4 py-6">
          {loading ? (
            <div className="text-center py-16"><div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" /></div>
          ) : (
            <>
              {filteredEmergency.length > 0 && (
                <div className="mb-8">
                  <button onClick={() => setShowEmergency(!showEmergency)} className="flex items-center gap-2 mb-4 w-full">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h2 className="text-lg font-bold text-gray-900">أرقام الطوارئ والسفارات <Badge className="mr-2 bg-red-100 text-red-700">{filteredEmergency.length}</Badge></h2>
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
                                      {e.address && <p className="text-xs text-gray-500 mt-0.5"><MapPin className="h-3 w-3 inline ml-1" />{e.city ? `${e.city}، ` : ""}{e.country}{e.address ? ` - ${e.address}` : ""}</p>}
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

              {sortedMerchants.length > 0 && (
                <div className="mb-8">
                  <button onClick={() => setShowStores(!showStores)} className="flex items-center gap-2 mb-4 w-full">
                    <Store className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-bold text-gray-900">المتاجر والمحلات <Badge className="mr-2 bg-amber-100 text-amber-700">{sortedMerchants.length}</Badge></h2>
                    {showStores ? <ChevronUp className="h-5 w-5 text-gray-400 mr-auto" /> : <ChevronDown className="h-5 w-5 text-gray-400 mr-auto" />}
                  </button>
                  {showStores && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sortedMerchants.map(m => <MerchantCard key={m.id} merchant={m} />)}
                    </div>
                  )}
                </div>
              )}

              {totalResults === 0 && (
                <div className="text-center py-16">
                  <Search className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد نتائج</h3>
                  <p className="text-gray-500 text-sm mb-4">جرب تغيير معايير البحث</p>
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

function MerchantCard({ merchant: m }: { merchant: any }) {
  const detailUrl = `/stores/${m.id}`;
  const displayName = getDisplayName(m);
  const displayDesc = m.shortDescription || m.descriptionAr || m.description || "";
  const displayAddress = [m.address, m.city, m.country].filter(Boolean).join(", ");
  const catName = categoryNamesAr[m.category] || m.category || "متجر";

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all overflow-hidden group">
      {m.isFeatured && <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1.5 flex items-center gap-1"><Sparkles className="h-3 w-3 text-black" /><span className="text-black text-xs font-bold">إعلان مميز</span></div>}
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 text-base leading-snug flex-1">{displayName}</h3>
          <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600 bg-amber-50/50 mr-2 shrink-0">{catName}</Badge>
        </div>
        {displayDesc && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{displayDesc}</p>}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{m.city}{m.country ? `، ${m.country}` : ''}</div>
          {m.rating && <div className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />{m.rating}{m.reviewCount ? <span className="text-gray-400">({m.reviewCount})</span> : null}</div>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {m.phone && <a href={`tel:${m.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg transition border border-gray-100"><Phone className="h-4 w-4" /><span className="font-medium" dir="ltr">{m.phone}</span></a>}
          {m.whatsapp && <a href={`https://wa.me/${m.whatsapp}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-sm bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg transition border border-green-100"><MessageCircle className="h-4 w-4" /> واتساب</a>}
          {m.website && <a href={m.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition border border-blue-100"><Globe className="h-4 w-4" /> موقع</a>}
          {displayAddress && <a href={`https://www.google.com/maps/search/${encodeURIComponent(displayName + " " + displayAddress)}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-sm bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-2 rounded-lg transition border border-amber-100"><MapPin className="h-4 w-4" /> الخريطة</a>}
          <Link to={detailUrl} className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 px-2 py-2 transition ml-auto font-medium">التفاصيل ←</Link>
        </div>
      </div>
    </div>
  );
}
