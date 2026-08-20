"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-config";

type NavItem = {
  icon: string;
  label: string;
  href: string;
  disabled?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
  superOnly?: boolean;
};

const navSections: NavSection[] = [
  {
    title: "Principal",
    items: [{ icon: "◆", label: "Tableau de bord", href: "/admin" }],
  },
  {
    title: "Contenu",
    items: [
      { icon: "🏋️", label: "Séances", href: "/admin/seances" },
      { icon: "👥", label: "Coachs", href: "/admin/coachs" },
      { icon: "🏢", label: "Le Club", href: "/admin/club" },
      { icon: "🥗", label: "Nutrition", href: "/admin/nutrition" },
      { icon: "🖼", label: "Galerie", href: "/admin/galerie" },
      { icon: "💬", label: "Témoignages", href: "/admin/temoignages" },
      { icon: "📞", label: "Contact", href: "/admin/contact" },
    ],
  },
  {
    title: "Gestion",
    items: [
      { icon: "📅", label: "Réservations", href: "/admin/reservations" },
    ],
  },
  {
    title: "Espace Club",
    superOnly: true,
    items: [
      { icon: "◆", label: "Tableau de bord club", href: "/espace-club" },
      { icon: "⚡", label: "Présences", href: "/espace-club/presences" },
      { icon: "👥", label: "Clients", href: "/espace-club/clients" },
      { icon: "📊", label: "Centre Financier", href: "/espace-club/finances" },
      { icon: "📦", label: "Stock", href: "/espace-club/stock" },
      { icon: "🔑", label: "Comptes coachs", href: "/admin/comptes-coach" },
    ],
  },
  {
    title: "Système",
    superOnly: true,
    items: [
      { icon: "🔑", label: "Administrateurs", href: "/admin/admins" },
      { icon: "📋", label: "Historique", href: "/admin/historique" },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/admin": "Tableau de bord",
  "/admin/seances": "Séances",
  "/admin/coachs": "Coachs",
  "/admin/club": "Le Club",
  "/admin/nutrition": "Nutrition",
  "/admin/galerie": "Galerie",
  "/admin/temoignages": "Témoignages",
  "/admin/contact": "Contact",
  "/admin/reservations": "Réservations",
  "/admin/admins": "Administrateurs",
  "/admin/comptes-coach": "Comptes coachs",
  "/admin/historique": "Historique",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [mobile, setMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [utilisateur, setUtilisateur] = useState("");
  const [initiales, setInitiales] = useState("HF");
  const [superAdmin, setSuperAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUtilisateur(`${data.prenom} ${data.nom}`);
          setInitiales(
            `${data.prenom?.[0] ?? ""}${data.nom?.[0] ?? ""}`.toUpperCase()
          );
          setSuperAdmin(data.isSuperAdmin === true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const resize = () => setMobile(window.innerWidth <= 900);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const sections = useMemo(
    () =>
      navSections.filter((s) => !s.superOnly || superAdmin),
    [superAdmin]
  );

  const headerTitle = pageTitles[pathname] ?? "Administration";

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = ADMIN_LOGIN_PATH;
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="hf-admin-root">
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
        className={`hf-admin-sidebar${mobile && menuOpen ? " open" : ""}`}
      >
        <div className="hf-admin-sidebar-logo">
          <Image
            src="/images/logo-2.png"
            alt="HealthyFit"
            width={120}
            height={48}
            style={{ height: "auto", width: 110 }}
          />
          <span>CMS</span>
        </div>

        <nav>
          {sections.map((section) => (
            <div key={section.title} className="hf-admin-nav-section">
              <div className="hf-admin-nav-label">{section.title}</div>
              {section.items.map((item) =>
                item.disabled ? (
                  <span
                    key={item.label}
                    className="hf-admin-nav-link disabled"
                  >
                    <span className="hf-admin-nav-icon">{item.icon}</span>
                    {item.label}
                    <span style={{ fontSize: 10, marginLeft: "auto", opacity: 0.6 }}>
                      bientôt
                    </span>
                  </span>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => mobile && setMenuOpen(false)}
                    className={`hf-admin-nav-link${isActive(item.href) ? " active" : ""}`}
                  >
                    <span className="hf-admin-nav-icon">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              )}
            </div>
          ))}
        </nav>

        <div className="hf-admin-sidebar-footer">
          <div className="hf-admin-user-card">
            <div className="hf-admin-user-avatar">{initiales}</div>
            <div>
              <div className="hf-admin-user-name">
                {utilisateur || "Admin"}
              </div>
              <div className="hf-admin-user-role">
                {superAdmin ? "Super admin" : "Administrateur"}
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
          <h2 className="hf-admin-header-title">{headerTitle}</h2>
          <div className="hf-admin-header-actions">
            <Link href="/" className="hf-admin-btn hf-admin-btn-ghost hf-admin-btn-sm">
              Voir le site
            </Link>
            <button
              type="button"
              className="hf-admin-btn hf-admin-btn-sm"
              onClick={logout}
            >
              Déconnexion
            </button>
          </div>
        </header>

        <main className="hf-admin-main">{children}</main>
      </div>
    </div>
  );
}
