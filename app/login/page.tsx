"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function login() {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      alert("Mot de passe incorrect");
    }
  }

  return (
    <main
      style={{
        background: "#111",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 380,
          background: "#1b1b1b",
          padding: 40,
          borderRadius: 15,
          border: "1px solid #d4af37",
        }}
      >
        <h1
          style={{
            color: "#d4af37",
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          🔒 Administration HealthyFit
        </h1>

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
          }}
        />

        <button
          onClick={login}
          style={{
            width: "100%",
            padding: 14,
            background: "#d4af37",
            border: 0,
            borderRadius: 8,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Se connecter
        </button>
      </div>
    </main>
  );
}