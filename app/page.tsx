import Image from "next/image";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <main
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(rgba(0,0,0,.82), rgba(0,0,0,.72)), url('/images/fond.jpg') center/cover no-repeat",
      }}
    >
      <Navbar />

      <section className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row items-center justify-center gap-12 px-10 pt-24">

        {/* Logo */}
        <div
          className="flex justify-center"
          style={{
            flex: "0 0 45%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Image
            src="/images/logo-1.png"
            alt="HealthyFit"
            width={430}
            height={430}
            priority
          />
        </div>

        {/* Texte */}
        <div
          className="text-center"
          style={{
            flex: "0 0 55%",
            width: "900px",
            maxWidth: "100%",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(26px,2vw,42px)",
              lineHeight: 1.15,
              fontWeight: 900,
              textTransform: "uppercase",
              background:
                "linear-gradient(180deg,#fff8d7 0%,#f4d66a 25%,#d4af37 55%,#9f7a23 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 2px 8px rgba(0,0,0,.35)",
              letterSpacing: "1px",
            }}
          >
            SPORT • NUTRITION • BIEN-ÊTRE
          </h1>

          <p
            style={{
              marginTop: "25px",
              fontSize: "18px",
              color: "#ffffff",
              lineHeight: 1.6,
            }}
          >
            Bougez, Mangez mieux, Gardez la patate !
            <br />
            Rejoins une communauté motivante et transforme ton quotidien.
          </p>

          <Link href="/contact">
  <button
    style={{
      marginTop: "35px",
      background: "#d4af37",
      color: "#000",
      border: "none",
      borderRadius: "999px",
      padding: "20px 60px",
      fontSize: "22px",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow:
        "0 10px 35px rgba(212,175,55,.35), inset 0 1px 1px rgba(255,255,255,.4)",
    }}
  >
    Réserver maintenant
  </button>
</Link>
          
        </div>

      </section>

    </main>
  );
}