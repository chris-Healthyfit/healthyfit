import { getTypeLabel, CONTACT_LABELS, SOURCE_LABELS } from "@/lib/reservations";
import { getJourLabel, getMomentLabel } from "@/lib/disponibilites";

type ReservationEmailData = {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  type: string;
  objectifs: string[];
  autreObjectif?: string | null;
  seanceTitre?: string | null;
  coachNom?: string | null;
  jourDisponibilite?: string | null;
  momentDisponibilite?: string | null;
  contactPreference: string;
  source: string;
  recommandation?: string | null;
  autreSource?: string | null;
  message?: string | null;
};

const GOLD = "#d4af37";
const ADMIN_EMAIL = process.env.HEALTHYFIT_ADMIN_EMAIL ?? "contact@healthyfit.be";
const PRODUCTION_FROM = "HealthyFit <noreply@healthyfit.be>";

function resolveFromEmail() {
  const configured =
    process.env.EMAIL_FROM?.trim() || PRODUCTION_FROM;

  // resend.dev = domaine test Resend : envoi client impossible (403)
  if (configured.includes("resend.dev")) {
    console.warn(
      "[Email] EMAIL_FROM utilise resend.dev — bascule sur noreply@healthyfit.be"
    );
    return PRODUCTION_FROM;
  }

  return configured;
}

const FROM_EMAIL = resolveFromEmail();

function ligne(label: string, value: string | null | undefined) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:8px 12px;color:${GOLD};font-weight:700;width:180px;vertical-align:top;">${label}</td>
      <td style="padding:8px 12px;color:#eee;">${value}</td>
    </tr>`;
}

function templateBase(titre: string, contenu: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0b0b0b;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0b;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#141414;border:1px solid rgba(212,175,55,.3);border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a1a,#0b0b0b);padding:28px;text-align:center;border-bottom:1px solid rgba(212,175,55,.2);">
            <h1 style="margin:0;color:${GOLD};font-size:26px;font-weight:900;">HealthyFit</h1>
            <p style="margin:8px 0 0;color:#aaa;font-size:14px;">Sport • Nutrition • Bien-être</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 28px;">
            <h2 style="margin:0 0 20px;color:#fff;font-size:22px;">${titre}</h2>
            ${contenu}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px;background:#0b0b0b;text-align:center;border-top:1px solid rgba(212,175,55,.15);">
            <p style="margin:0;color:#666;font-size:12px;">© HealthyFit — Péruwelz</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildDetailsTable(data: ReservationEmailData) {
  const objectifs = data.objectifs.join(", ");
  const objectifsComplets = data.autreObjectif
    ? `${objectifs} — ${data.autreObjectif}`
    : objectifs;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0b;border-radius:12px;border:1px solid rgba(212,175,55,.15);">
      ${ligne("Nom", `${data.prenom} ${data.nom}`)}
      ${ligne("Téléphone", data.telephone)}
      ${ligne("Email", data.email)}
      ${ligne("Demande", getTypeLabel(data.type as "SEANCE" | "BILAN"))}
      ${ligne("Séance", data.seanceTitre ?? undefined)}
      ${ligne("Coach", data.coachNom ?? "Aucune préférence")}
      ${ligne("Objectifs", objectifsComplets)}
      ${ligne("Jour souhaité", data.jourDisponibilite ? getJourLabel(data.jourDisponibilite) : undefined)}
      ${ligne("Moment souhaité", data.momentDisponibilite ? getMomentLabel(data.momentDisponibilite) : undefined)}
      ${ligne("Contact préféré", CONTACT_LABELS[data.contactPreference] ?? data.contactPreference)}
      ${ligne("Source", SOURCE_LABELS[data.source] ?? data.source)}
      ${ligne("Recommandation", data.recommandation ?? undefined)}
      ${ligne("Autre source", data.autreSource ?? undefined)}
      ${ligne("Message", data.message ?? undefined)}
    </table>`;
}

function emailClient(data: ReservationEmailData) {
  const typeLabel =
    data.type === "SEANCE" ? "séance" : "bilan Sport & Nutrition";

  return templateBase(
    `Merci ${data.prenom} !`,
    `<p style="color:#ccc;line-height:1.7;font-size:16px;">
      Votre demande de <strong style="color:${GOLD};">${typeLabel}</strong> a bien été reçue.
      Un coach HealthyFit vous contactera rapidement pour organiser la suite de votre parcours.
    </p>
    <p style="color:#aaa;font-size:14px;margin-top:24px;">
      À très bientôt chez HealthyFit 💛
    </p>`
  );
}

function emailAdmin(data: ReservationEmailData) {
  return templateBase(
    "Nouvelle réservation reçue",
    `<p style="color:#ccc;line-height:1.7;font-size:16px;margin-bottom:24px;">
      Une nouvelle demande vient d'être envoyée depuis le formulaire Contact du site.
    </p>
    ${buildDetailsTable(data)}
    <p style="color:#aaa;font-size:13px;margin-top:24px;">
      Connectez-vous à l'administration pour gérer le statut de cette réservation.
    </p>`
  );
}

type EmailSendResult =
  | { ok: true }
  | { ok: false; skipped?: boolean; error?: string };

async function envoyerViaResend(
  to: string,
  subject: string,
  html: string
): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      "[Email] RESEND_API_KEY manquant — email non envoyé vers:",
      to
    );
    return { ok: false, skipped: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        reply_to: ADMIN_EMAIL,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Email] Erreur Resend:", to, error);
      return { ok: false, error };
    }

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Email] Exception Resend:", to, message);
    return { ok: false, error: message };
  }
}

export async function envoyerEmailsReservation(data: ReservationEmailData) {
  const typeLabel = getTypeLabel(data.type as "SEANCE" | "BILAN");

  const [clientResult, adminResult] = await Promise.all([
    envoyerViaResend(
      data.email,
      `HealthyFit — Votre demande de ${typeLabel.toLowerCase()} est bien reçue`,
      emailClient(data)
    ),
    envoyerViaResend(
      ADMIN_EMAIL,
      `Nouvelle reservation — ${data.prenom} ${data.nom}`,
      emailAdmin(data)
    ),
  ]);

  const ok = clientResult.ok && adminResult.ok;
  const missingApiKey =
    (!clientResult.ok && clientResult.skipped) ||
    (!adminResult.ok && adminResult.skipped);

  return {
    ok,
    client: clientResult,
    admin: adminResult,
    missingApiKey,
  };
}

export function getEmailConfigStatus() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const configuredFrom = process.env.EMAIL_FROM?.trim() || PRODUCTION_FROM;
  const usesTestDomain = configuredFrom.includes("resend.dev");

  return {
    hasApiKey: Boolean(apiKey),
    apiKeyPrefix: apiKey ? `${apiKey.slice(0, 8)}…` : null,
    from: FROM_EMAIL,
    configuredFrom,
    usesTestDomain,
    adminEmail: ADMIN_EMAIL,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
  };
}

export async function envoyerEmailTest(to: string) {
  return envoyerViaResend(
    to,
    "HealthyFit — Test envoi email",
    templateBase(
      "Test d'envoi email",
      `<p style="color:#ccc;line-height:1.7;font-size:16px;">
        Si vous recevez ce message, l'envoi d'emails depuis le site HealthyFit fonctionne correctement.
      </p>`
    )
  );
}
