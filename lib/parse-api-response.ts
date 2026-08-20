/** Lit une réponse API et retourne { ok, data, error }. */
export async function parseApiResponse<T = Record<string, unknown>>(
  res: Response
): Promise<{ ok: boolean; data: T | null; error: string }> {
  const text = await res.text();
  if (!text) {
    return {
      ok: res.ok,
      data: null,
      error: res.ok ? "" : `Erreur serveur (${res.status})`,
    };
  }
  try {
    const data = JSON.parse(text) as T;
    if (!res.ok) {
      const errObj = data as { error?: string; message?: string };
      return {
        ok: false,
        data: null,
        error: errObj.error ?? errObj.message ?? `Erreur (${res.status})`,
      };
    }
    return { ok: true, data, error: "" };
  } catch {
    return {
      ok: false,
      data: null,
      error: res.ok
        ? "Réponse serveur invalide"
        : `Erreur serveur (${res.status})`,
    };
  }
}
