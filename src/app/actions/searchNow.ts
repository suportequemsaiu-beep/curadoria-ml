"use server";

import { runMlSearch, RunMlSearchResult } from "@/lib/mlSearch";

// --- Server Action usada pelo botão "Buscar agora no Mercado Livre" na
// interface: roda a mesma busca da rota de cron, mas sem precisar de
// segredo (é chamada diretamente pelo próprio app, nunca por outro site).
export interface SearchNowResponse {
  ok: boolean;
  summary?: RunMlSearchResult[];
  error?: string;
}

export async function searchNowAction(): Promise<SearchNowResponse> {
  try {
    const summary = await runMlSearch();
    return { ok: true, summary };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
