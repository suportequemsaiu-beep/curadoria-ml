import { Product } from "./types";
import { brl } from "./format";

// --- Rascunho de mensagem para WhatsApp: texto para revisão manual antes de
// publicar. Nunca menciona score, promoção, menor preço ou garantias.
function ratingLine(p: Product): string {
  if (p.rating == null || p.reviewCount == null) return "⭐ Avaliação não informada";
  return "⭐ Avaliação: " + p.rating.toFixed(1).replace(".", ",") + " (" + p.reviewCount + " avaliações)";
}

function shippingLine(p: Product): string {
  const shipping = p.freeShipping
    ? "Frete grátis"
    : p.shippingCost != null
    ? "Frete pago (" + brl(p.shippingCost) + ")"
    : "Frete pago";
  return "🚚 " + shipping + " · entrega estimada em " + p.deliveryEstimate;
}

export function buildDraft(p: Product, affiliateLink: string): string {
  const link = affiliateLink && affiliateLink.trim() ? affiliateLink.trim() : p.link;
  return [
    "#publi | link de afiliado",
    "",
    "🔥 OPÇÃO ENCONTRADA",
    "",
    p.title,
    "💰 Preço: " + brl(p.price),
    ratingLine(p),
    shippingLine(p),
    "",
    "🛒 Link: " + link,
    "",
    "Confira frete, variações, prazo e detalhes do anúncio antes de comprar.",
  ].join("\n");
}
