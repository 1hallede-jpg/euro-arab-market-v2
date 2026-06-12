import type { ReactNode } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a1628" }}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/10 bg-[#0a1628] py-6">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-white/20 text-xs">© 2025 سندباد | Sindbad Europe Guide</p>
        </div>
      </footer>
    </div>
  );
}
