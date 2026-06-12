import { useState } from "react";
import { Link, useLocation } from "react-router";
import Logo from "./Logo";
import {
  Sparkles, PlusCircle, Wrench, Menu, X, LogIn,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "سندباد", icon: Sparkles },
  { href: "/search", label: "اسأل سندباد", icon: Sparkles },
  { href: "/merchant/register", label: "سجل متجرك", icon: PlusCircle },
  { href: "/skill/register", label: "أضف مهارتك", icon: Wrench },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Don't show navbar on Sindbad homepage
  if (location.pathname === "/") return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a1628]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo size="sm" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link key={link.href} to={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive(link.href) ? "text-[#c9a227] bg-[#c9a227]/10" : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}>
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <Link to="/login"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#c9a227]/40 text-[#c9a227] text-sm hover:bg-[#c9a227]/10 transition">
              <LogIn className="h-4 w-4" />
              <span>تسجيل الدخول</span>
            </Link>
            <button className="md:hidden p-2 text-white/60" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-3">
            <nav className="flex flex-col gap-1">
              {navLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive(link.href) ? "text-[#c9a227] bg-[#c9a227]/10" : "text-white/60 hover:bg-white/5"
                    }`}>
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#c9a227] hover:bg-[#c9a227]/10 transition">
                <LogIn className="h-4 w-4" />
                تسجيل الدخول
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
