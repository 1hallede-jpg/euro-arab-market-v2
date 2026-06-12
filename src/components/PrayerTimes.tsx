import { useState, useEffect } from "react";
import { Moon, Sunrise, Sunset, Sun, CloudMoon, Clock } from "lucide-react";

interface PrayerTimesProps {
  city: string;
}

// Approximate prayer times for European cities (simplified)
const getPrayerTimes = (city: string) => {
  const times: Record<string, Record<string, string>> = {
    Paris: { fajr: "04:12", sunrise: "06:15", dhuhr: "13:45", asr: "17:30", maghrib: "21:15", isha: "23:00" },
    London: { fajr: "03:45", sunrise: "05:50", dhuhr: "13:10", asr: "16:45", maghrib: "20:30", isha: "22:20" },
    Berlin: { fajr: "03:30", sunrise: "05:40", dhuhr: "13:20", asr: "17:10", maghrib: "20:55", isha: "22:45" },
    Madrid: { fajr: "04:45", sunrise: "06:50", dhuhr: "14:15", asr: "17:45", maghrib: "21:30", isha: "23:15" },
    Rome: { fajr: "04:15", sunrise: "06:10", dhuhr: "13:30", asr: "17:15", maghrib: "20:50", isha: "22:30" },
    Vienna: { fajr: "03:35", sunrise: "05:25", dhuhr: "12:55", asr: "16:40", maghrib: "20:20", isha: "22:10" },
    Amsterdam: { fajr: "03:55", sunrise: "05:55", dhuhr: "13:40", asr: "17:35", maghrib: "21:25", isha: "23:10" },
    Barcelona: { fajr: "04:30", sunrise: "06:35", dhuhr: "14:00", asr: "17:35", maghrib: "21:15", isha: "23:00" },
    Milan: { fajr: "04:10", sunrise: "06:05", dhuhr: "13:25", asr: "17:10", maghrib: "20:45", isha: "22:25" },
    Brussels: { fajr: "04:05", sunrise: "06:05", dhuhr: "13:35", asr: "17:30", maghrib: "21:10", isha: "23:00" },
  };
  return times[city] || times["Paris"];
};

const prayers = [
  { key: "fajr", label: "الفجر", icon: Moon, color: "text-indigo-300", bg: "bg-indigo-500/10" },
  { key: "sunrise", label: "الشروق", icon: Sunrise, color: "text-amber-300", bg: "bg-amber-500/10" },
  { key: "dhuhr", label: "الظهر", icon: Sun, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { key: "asr", label: "العصر", icon: Sunset, color: "text-orange-300", bg: "bg-orange-500/10" },
  { key: "maghrib", label: "المغرب", icon: CloudMoon, color: "text-rose-300", bg: "bg-rose-500/10" },
  { key: "isha", label: "العشاء", icon: Clock, color: "text-violet-300", bg: "bg-violet-500/10" },
];

export default function PrayerTimes({ city }: PrayerTimesProps) {
  const [times, setTimes] = useState(getPrayerTimes(city));
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setTimes(getPrayerTimes(city));
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [city]);

  return (
    <div className="rounded-xl border border-[#c9a227]/20 bg-[#c9a227]/5 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#c9a227] font-bold text-sm flex items-center gap-2">
          <Moon className="h-4 w-4" />
          🕌 مواقيت الصلاة في {city}
        </h3>
        <span className="text-white/30 text-xs flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {currentTime}
        </span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {prayers.map(p => {
          const Icon = p.icon;
          return (
            <div key={p.key} className={`${p.bg} rounded-lg p-2 text-center`}>
              <Icon className={`h-4 w-4 mx-auto mb-1 ${p.color}`} />
              <p className="text-white/50 text-[10px]">{p.label}</p>
              <p className="text-white font-bold text-sm" dir="ltr">{(times as any)[p.key]}</p>
            </div>
          );
        })}
      </div>
      <p className="text-white/20 text-[10px] mt-2 text-center">
        التوقيت تقريبي — يرجى التحقق من المسجد المحلي
      </p>
    </div>
  );
}
