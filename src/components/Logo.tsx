import { Link } from "react-router";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-sm", sub: "text-[10px]" },
    md: { icon: 36, text: "text-lg", sub: "text-xs" },
    lg: { icon: 48, text: "text-2xl", sub: "text-sm" },
  };
  const s = sizes[size];

  return (
    <Link to="/" className={`flex items-center gap-2 no-underline ${className}`} dir="rtl">
      {/* SVG Logo Icon */}
      <svg width={s.icon} height={s.icon} viewBox="0 0 48 48" fill="none" className="shrink-0">
        {/* Background circle with gradient */}
        <circle cx="24" cy="24" r="23" fill="url(#logoGrad)" stroke="#c9a227" strokeWidth="1.5" />
        {/* Mosque dome */}
        <path d="M24 8 C18 8 14 14 14 18 L34 18 C34 14 30 8 24 8Z" fill="#c9a227" />
        {/* Mosque base */}
        <rect x="16" y="18" width="16" height="10" rx="1" fill="#c9a227" />
        {/* Door arch */}
        <path d="M20 28 V24 C20 21.8 21.8 20 24 20 C26.2 20 28 21.8 28 24 V28" fill="#1a5f4a" />
        {/* Minaret left */}
        <rect x="12" y="12" width="3" height="16" rx="0.5" fill="#c9a227" />
        <circle cx="13.5" cy="10" r="2" fill="#c9a227" />
        {/* Minaret right */}
        <rect x="33" y="14" width="3" height="14" rx="0.5" fill="#c9a227" />
        <circle cx="34.5" cy="12" r="2" fill="#c9a227" />
        {/* Crescent moon */}
        <path d="M36 6 C34 6 33 7.5 33 9 C33 7.5 34 6 36 6Z" fill="#ffd700" />
        {/* Sparkle */}
        <path d="M8 16 L9 19 L12 20 L9 21 L8 24 L7 21 L4 20 L7 19Z" fill="#ffd700" />
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#1a5f4a" />
            <stop offset="100%" stopColor="#0d3d2f" />
          </linearGradient>
        </defs>
      </svg>

      {/* Text */}
      <div className="flex flex-col leading-tight">
        <span className={`font-bold ${s.text}`} style={{ color: "#1a5f4a", fontFamily: "'Noto Naskh Arabic', serif" }}>
          يورو عرب ماركت
        </span>
        <span className={`${s.sub} font-medium tracking-wide`} style={{ color: "#c9a227" }}>
          Euro Arab Market
        </span>
      </div>
    </Link>
  );
}
