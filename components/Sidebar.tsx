"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarClock, ImagePlus, LayoutDashboard, Package, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/generate", label: "Generate", icon: Sparkles },
  { href: "/pins", label: "Pins", icon: ImagePlus },
  { href: "/schedule", label: "Schedule", icon: CalendarClock },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-neutral-900 bg-black md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center gap-3 border-b border-neutral-900 px-4">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-neutral-200 to-neutral-700 text-xs font-bold text-black">
            P
          </div>
          <div>
            <p className="text-sm font-semibold leading-none text-neutral-100">pin-pilot</p>
            <p className="mt-1 text-xs text-neutral-500">post automation</p>
          </div>
        </div>

        <div className="px-3 py-3">
          <div className="flex h-9 items-center rounded-md border border-neutral-900 bg-neutral-950 px-3 text-sm text-neutral-500">
            Find...
            <span className="ml-auto rounded border border-neutral-800 px-1.5 py-0.5 text-xs">F</span>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-1 md:flex-col md:overflow-visible md:pb-0">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-neutral-100",
                  active && "bg-neutral-900 text-white hover:bg-neutral-900 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-neutral-900 p-3 text-xs text-neutral-600 md:block">
          <div className="rounded-md border border-neutral-900 bg-neutral-950 p-3">
            Local workspace
          </div>
        </div>
      </div>
    </aside>
  );
}
