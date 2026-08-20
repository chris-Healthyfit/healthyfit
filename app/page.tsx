import Image from "next/image";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <main className="hf-home">
      <Navbar />

      <section className="hf-home-inner">
        <div className="hf-home-logo">
          <Image
            src="/images/logo-1.png"
            alt="HealthyFit"
            width={430}
            height={430}
            priority
            className="w-full max-w-[380px] lg:max-w-[430px] h-auto drop-shadow-[0_20px_50px_rgba(212,175,55,0.15)]"
          />
        </div>

        <div className="hf-home-content">
          <h1 className="hf-title">SPORT • NUTRITION • BIEN-ÊTRE</h1>
          <div className="hf-divider" />

          <p className="hf-home-tagline">
            Bougez, Mangez mieux, Gardez la patate !
            <br />
            Rejoins une communauté motivante et transforme ton quotidien.
          </p>

          <Link href="/contact" className="hf-btn-gold hf-btn-gold-round" style={{ marginTop: 35, display: "inline-block" }}>
            Réserver maintenant
          </Link>
        </div>
      </section>
    </main>
  );
}
