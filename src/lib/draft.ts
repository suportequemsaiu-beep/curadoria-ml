import { Product } from "./types";
import { brl } from "./format";
import { AnalysisResult, hasAnalysisSignal } from "./analysis";

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

// Quando a análise automática de curadoria (perfumes/beleza) detecta volume,
// concentração, tipo especial (kit, tester, decant...) ou termos de risco,
// a mensagem ganha esse contexto no título e um rodapé mais específico —
// sem nunca afirmar que o produto é original.
function buildMessageTitleLine(p: Product, analysis: AnalysisResult): string {
  if (!hasAnalysisSignal(analysis)) return p.title;
  const extra = [analysis.volume, analysis.concentration].filter(Boolean).join(" · ");
  return extra ? p.title + " — " + extra : p.title;
}

function buildMessageFooterLine(analysis: AnalysisResult): string {
  return hasAnalysisSignal(analysis)
    ? "Confira volume, concentração, versão e detalhes do anúncio antes de comprar."
    : "Confira frete, variações, prazo e detalhes do anúncio antes de comprar.";
}

export function buildDraft(p: Product, affiliateLink: string, analysis: AnalysisResult): string {
  const link = affiliateLink && affiliateLink.trim() ? affiliateLink.trim() : p.link;
  return [
    "#publi | link de afiliado",
    "",
    "🔥 OPÇÃO ENCONTRADA",
    "",
    buildMessageTitleLine(p, analysis),
    "💰 Preço: " + brl(p.price),
    ratingLine(p),
    shippingLine(p),
    "",
    "🛒 Link: " + link,
    "",
    buildMessageFooterLine(analysis),
  ].join("\n");
}
