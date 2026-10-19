import { Product, ScoreResult } from "./types";

// --- Score de triagem (0-100): calculado dinamicamente sobre os produtos
// que passaram pelos filtros atuais. Serve só para ordenar; nunca afirma
// "melhor produto", "menor preço" ou "promoção garantida".
export const SCORE_WEIGHTS = {
  price: 0.35,
  rating: 0.25,
  reviews: 0.2,
  shipping: 0.1,
  reputation: 0.1,
};

// Quantidade de avaliações tratada como "muitas" (retornos decrescentes acima disso).
const REVIEWS_REFERENCE = 500;

export interface PriceRange {
  min: number | null;
  max: number | null;
}

interface PointsResult {
  points: number;
  available: boolean;
}

function clampPts(x: number): number {
  return Math.min(100, Math.max(0, x));
}

function scorePricePoints(price: number | null, range: PriceRange): PointsResult {
  if (price == null || range.min == null || range.max == null) return { points: 50, available: false };
  if (range.max === range.min) return { points: 50, available: true }; // preços iguais: neutro, sem divisão por zero
  const pts = ((range.max - price) / (range.max - range.min)) * 100;
  return { points: clampPts(pts), available: true };
}

function scoreRatingPoints(rating: number | null): PointsResult {
  if (rating == null) return { points: 50, available: false };
  return { points: clampPts((rating / 5) * 100), available: true };
}

function scoreReviewsPoints(count: number | null): PointsResult {
  if (count == null) return { points: 50, available: false };
  const pts = (Math.log10(1 + count) / Math.log10(1 + REVIEWS_REFERENCE)) * 100;
  return { points: clampPts(pts), available: true };
}

function scoreShippingPoints(
  freeShipping: boolean | null,
  shippingCost: number | null,
  price: number | null
): PointsResult {
  if (freeShipping == null) return { points: 50, available: false };
  if (freeShipping) return { points: 100, available: true };
  if (shippingCost != null && price) {
    const ratio = shippingCost / price;
    if (ratio <= 0.1) return { points: 70, available: true };
    if (ratio <= 0.25) return { points: 50, available: true };
    return { points: 30, available: true };
  }
  return { points: 40, available: true };
}

function scoreReputationPoints(reputation: string | null): PointsResult {
  const table: Record<string, number> = { alta: 100, media: 65, baixa: 25 };
  if (reputation == null || !(reputation in table)) return { points: 50, available: false };
  return { points: table[reputation], available: true };
}

export function computeScore(product: Product, priceRange: PriceRange): ScoreResult {
  const price = scorePricePoints(product.price, priceRange);
  const rating = scoreRatingPoints(product.rating);
  const reviews = scoreReviewsPoints(product.reviewCount);
  const shipping = scoreShippingPoints(product.freeShipping, product.shippingCost, product.price);
  const reputation = scoreReputationPoints(product.reputation);

  const points = {
    price: price.points,
    rating: rating.points,
    reviews: reviews.points,
    shipping: shipping.points,
    reputation: reputation.points,
  };
  const available = {
    price: price.available,
    rating: rating.available,
    reviews: reviews.available,
    shipping: shipping.available,
    reputation: reputation.available,
  };

  // Anúncios encontrados automaticamente no Mercado Livre não trazem nota,
  // avaliações nem reputação do vendedor (a API de busca não devolve esses
  // campos) — então antes esses 3 critérios (55% do peso) sempre entravam
  // como um valor neutro fixo (50 pts), inflando artificialmente o score
  // final de todo produto real. Agora o peso é redistribuído só entre os
  // critérios que de fato têm dado disponível para aquele produto.
  const criteria = [
    { weight: SCORE_WEIGHTS.price, pts: points.price, avail: available.price },
    { weight: SCORE_WEIGHTS.rating, pts: points.rating, avail: available.rating },
    { weight: SCORE_WEIGHTS.reviews, pts: points.reviews, avail: available.reviews },
    { weight: SCORE_WEIGHTS.shipping, pts: points.shipping, avail: available.shipping },
    { weight: SCORE_WEIGHTS.reputation, pts: points.reputation, avail: available.reputation },
  ];
  const availableWeight = criteria.filter((c) => c.avail).reduce((acc, c) => acc + c.weight, 0);

  let total: number;
  if (availableWeight <= 0) {
    // Nenhum critério disponível (caso extremo): neutro.
    total = 50;
  } else {
    const weightedPoints = criteria
      .filter((c) => c.avail)
      .reduce((acc, c) => acc + c.weight * c.pts, 0);
    total = weightedPoints / availableWeight;
  }

  return { score: Math.round(clampPts(total)), points, available };
}

export const SCORE_ROWS: { key: keyof ScoreResult["points"]; label: string; weight: number }[] = [
  { key: "price", label: "Preço (comparado aos produtos exibidos)", weight: 35 },
  { key: "rating", label: "Nota média", weight: 25 },
  { key: "reviews", label: "Quantidade de avaliações", weight: 20 },
  { key: "shipping", label: "Frete", weight: 10 },
  { key: "reputation", label: "Reputação do vendedor", weight: 10 },
];
