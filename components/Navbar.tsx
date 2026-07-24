"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">

          <Link href="/">
            <Image
              src="/images/logo-2.png"
              alt="HealthyFit"
              width={170}
              height={80}
              priority
              className="w-[140px] lg:w-[170px] h-auto"
            />
          </Link>

          {/* Desktop */}
          <ul className="hidden lg:flex items-center gap-8 text-white font-semibold">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition hover:text-[#d4af37]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Téléphone */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
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
            {/* Fond noir */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 lg:hidden ${
          open
            ? "opacity-100 visible z-40"
            : "opacity-0 invisible"
        }`}
      />

      {/* Menu mobile */}
      <aside
        className={`fixed top-0 right-0 h-screen w-[320px] bg-[#111111] border-l border-[#d4af37]/20 shadow-2xl transition-transform duration-300 z-50 lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-[#d4af37]/20">

          <span className="text-[#d4af37] text-xl font-bold">
            HealthyFit
          </span>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-white text-3xl hover:text-[#d4af37] transition"
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
              className="text-white text-xl font-semibold border-b border-white/10 pb-3 hover:text-[#d4af37] transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
          </>
  );
}