"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ADMIN_LOGIN_PATH,
  ADMIN_LOGO_CLICKS,
  ADMIN_LOGO_WINDOW_MS,
} from "@/lib/admin-config";
import { CLUB_BASE_PATH, CLUB_LOGIN_PATH } from "@/lib/club-config";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [coachHref, setCoachHref] = useState(CLUB_LOGIN_PATH);
  const router = useRouter();
  const logoClicks = useRef(0);
  const logoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.canAccessClub) setCoachHref(CLUB_BASE_PATH);
      })
      .catch(() => {});
  }, []);

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/club", label: "Le Club" },
    { href: "/seances", label: "Séances" },
    { href: "/nutrition", label: "Nutrition" },
    { href: "/temoignage", label: "Témoignage" },
    { href: "/coachs", label: "Coachs" },
    { href: "/galerie", label: "Galerie" },
    { href: "/contact", label: "Contact" },
  ];

  const handleLogoClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      logoClicks.current += 1;

      if (logoTimer.current) clearTimeout(logoTimer.current);

      if (logoClicks.current >= ADMIN_LOGO_CLICKS) {
        logoClicks.current = 0;
        router.push(ADMIN_LOGIN_PATH);
        return;
      }

      logoTimer.current = setTimeout(() => {
        if (logoClicks.current === 1) {
          router.push("/");
        }
        logoClicks.current = 0;
      }, ADMIN_LOGO_WINDOW_MS);
    },
    [router]
  );

  return (
    <>
      <nav className="hf-nav">
        <div className="hf-nav-inner">
          <Link href="/" onClick={handleLogoClick} aria-label="HealthyFit">
            <Image
              src="/images/logo-2.png"
              alt="HealthyFit"
              width={170}
              height={80}
              priority
              className="w-[140px] lg:w-[170px] h-auto"
            />
          </Link>

          <ul className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hf-nav-link">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={coachHref} className="hf-nav-link hf-nav-link-coach">
                Mon espace coach
              </Link>
            </li>
          </ul>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
            aria-label="Menu"
          >
            <span
              className={`block h-[3px] w-8 rounded-full bg-[#d4af37] transition-all duration-300 ${
                open ? "translate-y-[9px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-[3px] w-8 rounded-full bg-[#d4af37] transition-all duration-300 ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-[3px] w-8 rounded-full bg-[#d4af37] transition-all duration-300 ${
                open ? "-translate-y-[9px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 lg:hidden ${
          open ? "opacity-100 visible z-40" : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`hf-nav-mobile lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-[#d4af37]/20">
          <span className="text-[#d4af37] text-xl font-bold">HealthyFit</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-white text-3xl hover:text-[#d4af37] transition"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col px-6 py-8 gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="hf-nav-mobile-link"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={coachHref}
            onClick={() => setOpen(false)}
            className="hf-nav-mobile-link hf-nav-mobile-link-coach"
          >
            Mon espace coach
          </Link>
        </nav>
      </aside>
    </>
  );
}
