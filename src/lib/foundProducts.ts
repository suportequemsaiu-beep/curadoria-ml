import { Condition, Product } from "./types";

// --- Converte uma linha da tabela "found_products" (Supabase) no mesmo
// formato de Product usado no restante do app, para que os anúncios
// encontrados automaticamente no Mercado Livre apareçam na lista igual a
// qualquer outro produto (e passem pela mesma análise de curadoria).

export interface FoundProductRow {
  ml_id: string;
  title: string;
  price: number | string | null;
  currency: string | null;
  permalink: string;
  thumbnail: string | null;
  category: string | null;
  condition: string | null;
  free_shipping: boolean | null;
  sold_quantity: number | null;
  keyword: string | null;
  status: string;
  found_at: string;
  raw?: unknown;
}

function mapCondition(condition: string | null): Condition {
  return condition === "used" ? "usado" : "novo";
}

export function foundRowToProduct(row: FoundProductRow): Product {
  const keyword = row.keyword || "Mercado Livre";
  const price = typeof row.price === "string" ? parseFloat(row.price) : row.price;

  return {
    id: "ml-" + row.ml_id,
    title: row.title,
    category: keyword,
    icon: "acessorios",
    price: price != null && !Number.isNaN(price) ? price : 0,
    condition: mapCondition(row.condition),
    rating: null,
    reviewCount: null,
    seller: "Mercado Livre",
    reputation: null,
    freeShipping: row.free_shipping ?? null,
    shippingCost: null,
    deliveryEstimate: "Ver prazo de entrega no anúncio",
    link: row.permalink,
    status: "novo",
    mlbId: row.ml_id,
    description:
      'Encontrado automaticamente pela busca "' +
      keyword +
      '" no Mercado Livre. Confira fotos, variações e todos os detalhes no anúncio antes de preencher o restante.',
  };
}
