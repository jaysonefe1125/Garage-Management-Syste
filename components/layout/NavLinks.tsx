"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/quotations", label: "Quotations" },
  { href: "/work-orders", label: "Work Orders" },
  { href: "/inventory", label: "Inventory" },
  { href: "/laborers", label: "Laborers" },
  { href: "/settings", label: "Settings" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-stretch gap-1">
      {NAV_LINKS.map((link) => {
        const active = pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex items-center px-3 py-1 text-sm font-medium tracking-wide transition-colors ${
              active ? "text-white" : "text-white/60 hover:text-white/90"
            }`}
          >
            {link.label}
            <span
              className={`absolute inset-x-2 -bottom-[1px] h-[2px] transition-colors ${
                active ? "bg-accent" : "bg-transparent"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
