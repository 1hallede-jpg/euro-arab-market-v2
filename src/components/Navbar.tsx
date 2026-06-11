import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  Store,
  Sparkles,
  Home,
  Shield,
  Phone,
  Menu,
  X,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/stores", label: "المتاجر", icon: Store },
  { href: "/search", label: "البحث", icon: Search },
  { href: "/sindbad", label: "سندباد", icon: Sparkles },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isLoading, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
              <span className="font-bold text-sm">ي</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-emerald-800 text-sm tracking-tight">
                يورو عرب ماركت
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">
                Euro Arab Market
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Link to="/search">
              <Button
                variant="ghost"
                size="icon"
                className={`hidden sm:flex ${
                  isActive("/search")
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-500"
                }`}
              >
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            {/* Auth */}
            {!isLoading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-2"
                      >
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name || ""}
                            className="h-7 w-7 rounded-full ring-2 ring-emerald-200"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-emerald-600" />
                          </div>
                        )}
                        <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[80px] truncate">
                          {user.name || "المستخدم"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-3 py-2 text-sm font-medium text-gray-900 border-b">
                        {user.name || "المستخدم"}
                      </div>
                      {user.role === "admin" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/admin"
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Shield className="h-4 w-4" />
                              لوحة التحكم
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={logout}
                        className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        تسجيل الخروج
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/login">
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <User className="h-4 w-4 ml-1" />
                      <span className="hidden sm:inline">تسجيل الدخول</span>
                    </Button>
                  </Link>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/search")
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Search className="h-4 w-4" />
                البحث
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
