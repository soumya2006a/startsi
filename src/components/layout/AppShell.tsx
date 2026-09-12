"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { PageTransition } from "@/components/layout/PageTransition";
import { useThemeStore } from "@/store/theme";
import { AiAssistantWidget } from "@/components/ai/AiAssistantWidget";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme } = useThemeStore();
  const isPublicPage = pathname === "/login" || pathname === "/for-startups";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  if (isPublicPage) {
    return (
      <main className={`w-full min-h-screen ${theme === "dark" ? "dark bg-[#141210] text-slate-100" : "bg-[#FBF9F4] text-slate-900"}`}>
        <PageTransition>{children}</PageTransition>
        <AiAssistantWidget />
      </main>
    );
  }

  return (
    <div className={`flex flex-row h-screen w-full overflow-hidden antialiased ${theme === "dark" ? "dark bg-[#141210] text-slate-100" : "bg-[#FBF9F4] text-slate-900"}`}>
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <TopBar onMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <AiAssistantWidget />
    </div>
  );
}
