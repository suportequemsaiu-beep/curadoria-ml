"use server";

import { getValidAccessToken } from "@/lib/mlAuth";
import { MlItemData, MlSellerData, mlItemToProduct } from "@/lib/importProducts";
import { ImportEntry, Product } from "@/lib/types";

// --- Busca os dados reais de cada entrada validada no painel de importação
// manual, usando o mesmo login OAuth da busca automática (src/lib/mlAuth.ts).
// Antes, a importação manual gerava produtos 100% inventados (título, preço,
// nota, vendedor aleatórios); agora busca o anúncio de verdade na API do
// Mercado Livre — exige estar conectado ("Conectar ao Mercado Livre").
export interface ImportRealResult {
  entry: ImportEntry;
  ok: boolean;
  product?: Product;
  error?: string;
}

interface MlCategoryData {
  name?: string;
}

async function fetchJson<T>(url: string, accessToken: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: "Bearer " + accessToken, Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function importRealProductsAction(entries: ImportEntry[]): Promise<ImportRealResult[]> {
  if (!entries || entries.length === 0) return [];

  let accessToken: string;
  try {
    accessToken = await getValidAccessToken();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return entries.map((entry) => ({ entry, ok: false, error: message }));
  }

  const results: ImportRealResult[] = [];

  for (const entry of entries) {
    try {
      const res = await fetch("https://api.mercadolibre.com/items/" + entry.mlbId, {
        headers: { Authorization: "Bearer " + accessToken, Accept: "application/json" },
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        results.push({
          entry,
          ok: false,
          error:
            "Não encontrei esse anúncio no Mercado Livre (HTTP " +
            res.status +
            (body ? " — " + body.slice(0, 200) : "") +
            "). Confira se o ID ou o link está correto.",
        });
        continue;
      }
      const item = (await res.json()) as MlItemData;

      // Reputação do vendedor e nome da categoria são "melhor esforço": se
      // qualquer uma dessas duas chamadas falhar, a importação continua sem
      // travar, só com esses dois dados como "não informado".
      const [seller, category] = await Promise.all([
        item.seller_id != null
          ? fetchJson<MlSellerData>("https://api.mercadolibre.com/users/" + item.seller_id, accessToken)
          : Promise.resolve(null),
        item.category_id
          ? fetchJson<MlCategoryData>("https://api.mercadolibre.com/categories/" + item.category_id, accessToken)
          : Promise.resolve(null),
      ]);

      const product = mlItemToProduct(entry, item, seller, category?.name || null);
      results.push({ entry, ok: true, product });
    } catch (err) {
      results.push({ entry, ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return results;
}
