"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { CLUB_LOGIN_PATH } from "@/lib/club-config";

const menuBase = [
  { icon: "◆", label: "Tableau de bord", href: "/espace-club" },
  { icon: "⚡", label: "Présences", href: "/espace-club/presences" },
  { icon: "👥", label: "Clients", href: "/espace-club/clients" },
  { icon: "📦", label: "Stock", href: "/espace-club/stock" },
];

const menuAdmin = [
  { icon: "📊", label: "Centre Financier", href: "/espace-club/finances" },
];

export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    prenom: string;
    nom: string;
    role: string;
    canViewFinances?: boolean;
  } | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setUser(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const resize = () => setMobile(window.innerWidth <= 900);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const menu = useMemo(() => {
    const items = [...menuBase];
    if (user?.canViewFinances) items.push(...menuAdmin);
    return items;
  }, [user]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = CLUB_LOGIN_PATH;
  }

  function isActive(href: string) {
    if (href === "/espace-club") return pathname === "/espace-club";
    return pathname.startsWith(href);
  }

  const initiales = user
    ? `${user.prenom[0] ?? ""}${user.nom[0] ?? ""}`.toUpperCase()
    : "HF";

  return (
    <div className="hf-admin-root hf-club-root">
      {mobile && menuOpen && (
        <div className="hf-admin-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {mobile && (
        <button
          type="button"
          className="hf-admin-mobile-toggle"
          onClick={() => setMenuOpen(true)}
          aria-label="Menu"
        >
          ☰
        </button>
      )}

      <aside
        className={`hf-admin-sidebar hf-club-sidebar${mobile && menuOpen ? " open" : ""}`}
      >
        <div className="hf-admin-sidebar-logo">
          <Image
            src="/images/logo-2.png"
            alt="HealthyFit"
            width={120}
            height={48}
            style={{ height: "auto", width: 110 }}
          />
          <span>CLUB</span>
        </div>

        <nav>
          <div className="hf-admin-nav-section">
            <div className="hf-admin-nav-label">Espace coach</div>
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => mobile && setMenuOpen(false)}
                className={`hf-admin-nav-link${isActive(item.href) ? " active" : ""}`}
              >
                <span className="hf-admin-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {user?.role === "SUPER_ADMIN" && (
            <div className="hf-admin-nav-section">
              <div className="hf-admin-nav-label">Direction</div>
              <Link href="/admin" className="hf-admin-nav-link">
                <span className="hf-admin-nav-icon">⚙️</span>
                Administration CMS
              </Link>
              <Link href="/admin/comptes-coach" className="hf-admin-nav-link">
                <span className="hf-admin-nav-icon">🔑</span>
                Comptes coachs
              </Link>
            </div>
          )}
        </nav>

        <div className="hf-admin-sidebar-footer">
          <div className="hf-admin-user-card">
            <div className="hf-admin-user-avatar">{initiales}</div>
            <div>
              <div className="hf-admin-user-name">
                {user ? `${user.prenom} ${user.nom}` : "…"}
              </div>
              <div className="hf-admin-user-role">
                {user?.role === "SUPER_ADMIN" ? "Direction" : "Coach"}
              </div>
            </div>
          </div>
          <button type="button" className="hf-admin-btn" style={{ width: "100%" }} onClick={logout}>
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="hf-admin-shell">
        <header className="hf-admin-header">
          <h2 className="hf-admin-header-title">Espace Club</h2>
          <div className="hf-admin-header-actions">
            <Link href="/club" className="hf-admin-btn hf-admin-btn-ghost hf-admin-btn-sm">
              Voir le site
            </Link>
            <button type="button" className="hf-admin-btn hf-admin-btn-sm" onClick={logout}>
              Déconnexion
            </button>
          </div>
        </header>
        <main className="hf-admin-main">{children}</main>
      </div>
    </div>
  );
}
