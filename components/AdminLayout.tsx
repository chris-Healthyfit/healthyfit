"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const menu = [
  { titre: "🏠 Tableau de bord", lien: "/admin" },
  { titre: "🏋️ Séances", lien: "/admin/seances" },
  { titre: "👥 Coachs", lien: "/admin/coachs" },
  { titre: "🏢 Le Club", lien: "/admin/club" },
  { titre: "🥗 Nutrition", lien: "/admin/nutrition" },
  { titre: "🖼 Galerie", lien: "/admin/galerie" },
  { titre: "💬 Témoignages", lien: "/admin/temoignages" },
  { titre: "📞 Contact", lien: "/admin/contact" },
  { titre: "📦 Stock", lien: "#" },
  { titre: "👤 Présences", lien: "#" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [mobile, setMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const resize = () => {
      setMobile(window.innerWidth <= 900);
    };

    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    window.location.href = "/login";
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#0b0b0b",
      }}
    >
      {mobile && menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            zIndex: 998,
          }}
        />
      )}

      {mobile && (
        <button
          onClick={() => setMenuOpen(true)}
          style={{
            position: "fixed",
            top: 15,
            left: 15,
            width: 46,
            height: 46,
            border: "none",
            borderRadius: 10,
            background: "#d4af37",
            color: "#000",
            fontWeight: "bold",
            fontSize: 24,
            cursor: "pointer",
            zIndex: 1001,
          }}
        >
          ☰
        </button>
      )}

      <aside
        style={{
          width: 270,
          background: "#111",
          borderRight: "1px solid rgba(212,175,55,.15)",
          padding: 25,
          display: "flex",
          flexDirection: "column",
          position: mobile ? "fixed" : "relative",
          top: 0,
          left: mobile ? (menuOpen ? 0 : -280) : 0,
          height: "100vh",
          transition: ".3s",
          zIndex: 999,
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            color: "#d4af37",
            fontSize: 28,
            fontWeight: 900,
            marginBottom: 35,
          }}
        >
          HealthyFit CMS
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
                    {menu.map((item) => (
            <Link
              key={item.titre}
              href={item.lien}
              onClick={() => {
                if (mobile) setMenuOpen(false);
              }}
              style={{
                textDecoration: "none",
                color: pathname === item.lien ? "#000" : "#fff",
                background:
                  pathname === item.lien
                    ? "#d4af37"
                    : "transparent",
                padding: "14px 18px",
                borderRadius: 12,
                transition: ".25s",
                fontWeight: 600,
              }}
            >
              {item.titre}
            </Link>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={logout}
          style={{
            marginTop: 20,
            background: "#d4af37",
            color: "#000",
            border: "none",
            padding: "14px",
            borderRadius: 999,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          🚪 Déconnexion
        </button>
      </aside>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: mobile ? 0 : 0,
        }}
      >
        <header
          style={{
            height: 75,
            background: "#0f0f0f",
            borderBottom: "1px solid rgba(212,175,55,.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: mobile ? "0 20px 0 75px" : "0 35px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#fff",
            }}
          >
            Administration
          </h2>
             <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 15,
            }}
          >
            <span
              style={{
                color: "#d4af37",
                fontWeight: 600,
                display: mobile ? "none" : "block",
              }}
            >
              Administration HealthyFit
            </span>

            <button
              onClick={logout}
              style={{
                background: "#d4af37",
                color: "#000",
                border: "none",
                padding: "12px 22px",
                borderRadius: 999,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              🚪 Déconnexion
            </button>
          </div>
        </header>

        <main
          style={{
            flex: 1,
            padding: mobile ? 20 : 40,
            color: "#fff",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
       </div>
  );
}          