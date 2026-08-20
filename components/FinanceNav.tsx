"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/espace-club/finances", label: "Centre Financier", icon: "📊" },
  { href: "/espace-club/finances/historique", label: "Historique", icon: "📋" },
  { href: "/espace-club/finances/achats", label: "Achats", icon: "🛒" },
  { href: "/espace-club/finances/charges", label: "Charges", icon: "🏢" },
  { href: "/espace-club/finances/parametres", label: "Paramètres", icon: "⚙️" },
];

export default function FinanceNav() {
  const pathname = usePathname();

  return (
    <nav className="hf-finance-nav">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
      className={`hf-finance-nav-link${
            (l.href === "/espace-club/finances"
              ? pathname === l.href
              : pathname.startsWith(l.href))
              ? " active"
              : ""
          }`}
        >
          <span>{l.icon}</span> {l.label}
        </Link>
      ))}
    </nav>
  );
}
