import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Landmark, Phone, MapPin, Search, Globe } from "lucide-react";
import Logo from "@/components/Logo";

const API_URL = "/api/trpc";

const cityDisplayNames: Record<string, string> = { Paris:"باريس",London:"لندن",Berlin:"برلين",Madrid:"مدريد",Barcelona:"برشلونة",Rome:"روما",Milan:"ميلان",Amsterdam:"أمستردام",Brussels:"بروكسل",Vienna:"فيينا",Copenhagen:"كوبنهاغن",Stockholm:"ستوكهولم",Oslo:"أوسلو",Zurich:"زيورخ",Geneva:"جنيف",Budapest:"بودابست",Prague:"براغ",Athens:"أثينا",Helsinki:"هلسنكي",Lisbon:"لشبونة",Dublin:"دبلن" };
const cityFlags: Record<string, string> = { Paris:"🇫🇷",London:"🇬🇧",Berlin:"🇩🇪",Madrid:"🇪🇸",Barcelona:"🇪🇸",Rome:"🇮🇹",Milan:"🇮🇹",Amsterdam:"🇳🇱",Brussels:"🇧🇪",Vienna:"🇦🇹",Copenhagen:"🇩🇰",Stockholm:"🇸🇪",Oslo:"🇳🇴",Zurich:"🇨🇭",Geneva:"🇨🇭",Budapest:"🇭🇺",Prague:"🇨🇿",Athens:"🇬🇷",Helsinki:"🇫🇮",Lisbon:"🇵🇹",Dublin:"🇮🇪" };
const citiesEn = ["Paris","London","Berlin","Madrid","Barcelona","Rome","Milan","Amsterdam","Brussels","Vienna","Copenhagen","Stockholm","Oslo","Zurich","Geneva","Budapest","Prague","Athens","Helsinki","Lisbon","Dublin"];

export default function EmbassiesPage() {
  const [embassies, setEmbassies] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params: any = { json: { type: "embassy", limit: 200 } };
        if (selectedCity) params.json.city = selectedCity;
        const inp = encodeURIComponent(JSON.stringify(params));
        const res = await fetch(`${API_URL}/emergency.list?input=${inp}`);
        if (res.ok) {
          const data = await res.json();
          let items = data?.result?.data?.json?.items || [];
          if (query) {
            const q = query.toLowerCase();
            items = items.filter((e: any) =>
              (e.nameAr || "").toLowerCase().includes(q) ||
              (e.name || "").toLowerCase().includes(q) ||
              (e.city || "").toLowerCase().includes(q)
            );
          }
          setEmbassies(items);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [selectedCity, query]);

  // Group by country
  const byCountry: Record<string, any[]> = {};
  for (const e of embassies) {
    const country = e.country || "أخرى";
    if (!byCountry[country]) byCountry[country] = [];
    byCountry[country].push(e);
  }

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: "#0a1628" }}>
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a1628]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex-1 max-w-md relative">
            <div className="flex items-center rounded-full bg-white/5 border border-white/15 px-4 py-2">
              <Search className="h-4 w-4 text-white/30 ml-2" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="ابحث عن سفارة..." dir="rtl"
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 outline-none text-right" />
            </div>
          </div>
          <Link to="/search" className="text-white/40 hover:text-white text-sm">← بحث</Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#c9a227]/15 flex items-center justify-center">
            <Landmark className="h-6 w-6 text-[#c9a227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">🏛️ السفارات العربية في أوروبا</h1>
            <p className="text-white/30 text-sm">Arab Embassies in Europe — {embassies.length} سفارة</p>
          </div>
        </div>

        {/* City filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setSelectedCity("")}
            className={`px-3 py-1.5 rounded-full text-xs transition border ${!selectedCity ? "bg-[#c9a227] text-[#0a1628] border-[#c9a227]" : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"}`}>
            الكل
          </button>
          {citiesEn.map(c => (
            <button key={c} onClick={() => setSelectedCity(selectedCity === c ? "" : c)}
              className={`px-3 py-1.5 rounded-full text-xs transition border ${selectedCity === c ? "bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/40" : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"}`}>
              {cityFlags[c]} {cityDisplayNames[c]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="animate-spin h-8 w-8 border-2 border-[#c9a227] border-t-transparent rounded-full mx-auto" /></div>
        ) : embassies.length === 0 ? (
          <div className="text-center py-20">
            <Landmark className="h-16 w-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/30">لا توجد سفارات</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(byCountry).map(([country, items]) => (
              <div key={country}>
                <h2 className="text-[#c9a227] font-bold text-lg mb-3 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  سفارات {country}
                  <span className="text-white/20 text-sm">({items.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map(e => (
                    <div key={e.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#c9a227]/30 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-sm">{e.nameAr || e.name}</h3>
                          <p className="text-white/30 text-xs mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{e.city ? `${cityDisplayNames[e.city] || e.city}، ` : ""}{e.country}
                          </p>
                        </div>
                        {e.phone && (
                          <a href={`tel:${e.phone}`} className="flex items-center gap-1 text-xs bg-[#c9a227]/10 hover:bg-[#c9a227]/20 text-[#c9a227] px-3 py-2 rounded-lg transition mr-2 shrink-0">
                            <Phone className="h-3.5 w-3.5" />
                            <span dir="ltr">{e.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
