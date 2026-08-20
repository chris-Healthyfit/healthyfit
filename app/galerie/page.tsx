import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import GalerieClient from "./GalerieClient";

export const dynamic = "force-dynamic";

export default async function Galerie() {
  const photos = await prisma.galerie.findMany({
    where: { actif: true },
    orderBy: { ordre: "asc" },
  });

  const categories = ["Toutes", ...new Set(photos.map((p) => p.categorie))];

  return (
    <main className="hf-page">
      <Navbar />

      <div className="hf-wrap-lg">
        <header className="hf-hero">
          <h1 className="hf-title">Galerie</h1>
          <div className="hf-divider" />
          <p className="hf-subtitle">
            Découvrez quelques moments de la vie chez HealthyFit.
          </p>
        </header>

        <GalerieClient photos={photos} categories={categories} />
      </div>
    </main>
  );
}
