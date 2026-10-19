import { Filters, Product, ScoredProduct } from "./types";
import { normalize } from "./format";

export function matchesFilters(p: Product, f: Filters): boolean {
  if (f.query) {
    const q = normalize(f.query);
    const hay = normalize(p.title + " " + p.category + " " + p.seller);
    if (!hay.includes(q)) return false;
  }
  const minPrice = parseFloat(f.minPrice);
  if (!Number.isNaN(minPrice) && p.price < minPrice) return false;
  const maxPrice = parseFloat(f.maxPrice);
  if (!Number.isNaN(maxPrice) && p.price > maxPrice) return false;
  // Nota mínima aceita vírgula ou ponto como separador decimal (ex.: "4,7" ou "4.7").
  // Produtos sem nota/avaliações informadas (ex.: anúncios achados automaticamente no
  // Mercado Livre, que não trazem esse dado) NÃO são excluídos por esses filtros — só
  // produtos que de fato têm o dado e ficam abaixo do mínimo são removidos. Do
  // contrário, qualquer valor nesses filtros escondia 100% dos produtos reais do ML.
  const minRating = parseFloat((f.minRating || "").replace(",", "."));
  if (!Number.isNaN(minRating) && p.rating != null && p.rating < minRating) return false;
  const minReviews = parseFloat(f.minReviews);
  if (!Number.isNaN(minReviews) && p.reviewCount != null && p.reviewCount < minReviews) return false;
  if (f.onlyNew && p.condition !== "novo") return false;
  return true;
}

export function compareProducts(a: ScoredProduct, b: ScoredProduct, prioritizeFree: boolean): number {
  if (prioritizeFree && a.freeShipping !== b.freeShipping) {
    return a.freeShipping ? -1 : 1;
  }
  return b.scoreResult.score - a.scoreResult.score;
}
