import { useState, useEffect } from "react";
import { Phone, Shield, Heart, Flame, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface EmergencyBannerProps {
  city: string;
}

const API_URL = "/api/trpc";

export default function EmergencyBanner({ city }: EmergencyBannerProps) {
  const [emergency, setEmergency] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!city) return;
    async function load() {
      try {
        const params = { json: { city, limit: 20 } };
        const inp = encodeURIComponent(JSON.stringify(params));
        const res = await fetch(`${API_URL}/emergency.list?input=${inp}`);
        if (res.ok) {
          const data = await res.json();
          const items = data?.result?.data?.json?.items || [];
          // Only show police, hospital, fire, other types
          const filtered = items.filter((e: any) =>
            ["police", "hospital", "fire", "other"].includes(e.type) &&
            e.phone
          );
          setEmergency(filtered);
        }
      } catch (e) { console.error(e); }
    }
    load();
  }, [city]);

  if (emergency.length === 0) return null;

  const typeConfig: Record<string, { icon: any; color: string; bg: string; labelAr: string }> = {
    police: { icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", labelAr: "شرطة" },
    hospital: { icon: Heart, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", labelAr: "إسعاف" },
    fire: { icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", labelAr: "مطافئ" },
    other: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", labelAr: "طوارئ" },
  };

  // Sort: police first, then ambulance, fire, general
  const sorted = [...emergency].sort((a, b) => {
    const order = { police: 1, hospital: 2, fire: 3, other: 4 };
    return (order[a.type as keyof typeof order] || 5) - (order[b.type as keyof typeof order] || 5);
  });

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 mb-4 overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-500/5 transition"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <span className="text-red-400 font-bold text-sm">🆘 أرقام الطوارئ — {city}</span>
          <span className="text-white/20 text-xs mr-2">({sorted.length})</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-white/40" />
        ) : (
          <ChevronDown className="h-4 w-4 text-white/40" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {sorted.map((e) => {
              const cfg = typeConfig[e.type] || typeConfig.other;
              const Icon = cfg.icon;
              return (
                <a
                  key={e.id}
                  href={`tel:${e.phone}`}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${cfg.bg} hover:bg-opacity-20 transition`}
                >
                  <Icon className={`h-4 w-4 ${cfg.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${cfg.color}`}>{cfg.labelAr}</p>
                    <p className="text-white text-sm font-bold" dir="ltr">{e.phone}</p>
                  </div>
                </a>
              );
            })}
          </div>
          <p className="text-white/20 text-[10px] mt-2 text-center">
            اضغط على الرقم للاتصال المباشر — في حالات الطوارئ فقط
          </p>
        </div>
      )}
    </div>
  );
}
