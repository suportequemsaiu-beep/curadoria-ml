import { getSupabaseAdmin } from "./supabaseAdmin";

// --- Busca automática no Mercado Livre: usa a API pública de busca (não
// precisa de login nem de app registrado) e salva os anúncios encontrados
// na tabela "found_products" do Supabase, para a rota /api/found-products
// trazê-los depois para a lista de curadoria.
//
// Palavras-chave da busca: pensadas para o nicho de perfumes, beleza e
// autocuidado. Para mudar o que é buscado, edite esta lista (ou me peça
// para mudar).
export const SEARCH_KEYWORDS: string[] = [
  "perfume importado",
  "perfume feminino",
  "perfume masculino",
  "kit perfume",
  "hidratante corporal",
  "protetor solar facial",
];

const RESULTS_PER_KEYWORD = 10;

interface MlShippingInfo {
  free_shipping?: boolean;
}

interface MlSearchItem {
  id: string;
  title: string;
  condition: string;
  thumbnail: string;
  permalink: string;
  price: number;
  currency_id: string;
  sold_quantity?: number;
  category_id?: string;
  shipping?: MlShippingInfo;
}

interface MlSearchResponse {
  results?: MlSearchItem[];
}

async function searchMercadoLivre(keyword: string): Promise<MlSearchItem[]> {
  const url =
    "https://api.mercadolibre.com/sites/MLB/search?q=" +
    encodeURIComponent(keyword) +
    "&limit=" +
    RESULTS_PER_KEYWORD;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; CuradoriaML/1.0; +https://curadoria-ml.vercel.app)",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      'Falha ao buscar "' + keyword + '" no Mercado Livre: HTTP ' + res.status + (body ? " — " + body.slice(0, 200) : "")
    );
  }
  const data = (await res.json()) as MlSearchResponse;
  return Array.isArray(data.results) ? data.results : [];
}

export interface RunMlSearchResult {
  keyword: string;
  found: number;
  upserted: number;
  error?: string;
}

// Busca todas as palavras-chave e grava (upsert) na tabela found_products.
// Produtos já salvos (mesmo ml_id) são atualizados, mas o status de revisão
// que já estiver marcado para eles não é alterado por aqui.
export async function runMlSearch(): Promise<RunMlSearchResult[]> {
  const supabase = getSupabaseAdmin();
  const summary: RunMlSearchResult[] = [];

  for (const keyword of SEARCH_KEYWORDS) {
    try {
      const items = await searchMercadoLivre(keyword);
      const rows = items.map((item) => ({
        ml_id: item.id,
        title: item.title,
        price: item.price,
        currency: item.currency_id || "BRL",
        permalink: item.permalink,
        thumbnail: item.thumbnail,
        category: item.category_id || null,
        condition: item.condition,
        free_shipping: !!item.shipping?.free_shipping,
        sold_quantity: item.sold_quantity ?? null,
        keyword,
        raw: item,
      }));

      if (rows.length > 0) {
        const { error } = await supabase
          .from("found_products")
          .upsert(rows, { onConflict: "ml_id" });

        if (error) {
          summary.push({ keyword, found: rows.length, upserted: 0, error: error.message });
          continue;
        }
      }

      summary.push({ keyword, found: rows.length, upserted: rows.length });
    } catch (err) {
      summary.push({
        keyword,
        found: 0,
        upserted: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return summary;
}
