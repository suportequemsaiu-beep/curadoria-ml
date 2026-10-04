import { normalize } from "./format";
import { Product } from "./types";

// --- Análise automática de curadoria (perfumes, beleza e autocuidado): lê
// o título, a categoria e a descrição/resumo opcional do anúncio para tentar
// detectar volume, concentração, tipo e termos de risco, tudo localmente —
// sem API, sem scraping e sem IA externa. Serve só para orientar a revisão
// manual; nunca afirma que um produto é original.

export type AnalysisStatus = "apto" | "revisar" | "nao_recomendado";
export type AnalysisType = "regular" | "kit" | "miniatura" | "tester" | "decant" | "amostra" | "refil";

export interface AnalysisResult {
  volume: string | null;
  concentration: string | null;
  type: AnalysisType;
  riskTerms: string[];
  status: AnalysisStatus;
  checklist: string[];
  lineGuess: string | null;
}

export const ANALYSIS_TYPE_LABEL: Record<AnalysisType, string> = {
  regular: "Regular",
  kit: "Kit",
  miniatura: "Miniatura",
  tester: "Tester",
  decant: "Decant",
  amostra: "Amostra",
  refil: "Refil",
};

export const ANALYSIS_STATUS_META: Record<AnalysisStatus, { label: string; icon: string }> = {
  apto: { label: "Apto para revisão", icon: "check" },
  revisar: { label: "Revisar com atenção", icon: "review" },
  nao_recomendado: { label: "Não recomendado", icon: "x" },
};

const ANALYSIS_REVISAR_TYPES: AnalysisType[] = ["tester", "miniatura", "kit", "refil"];

const ANALYSIS_RISK_TERMS: { re: RegExp; label: string }[] = [
  { re: /\bdecants?\b/, label: "decant" },
  { re: /\bamostras?\b/, label: "amostra" },
  { re: /\binspirad\w*\b/, label: "inspirado" },
  { re: /\bsimilar(es)?\b/, label: "similar" },
  { re: /\bcontratipo\w*\b/, label: "contratipo" },
  { re: /\breplica\w*\b/, label: "réplica" },
  { re: /\bfalsificad\w*\b/, label: "falsificado" },
  { re: /\bfrasco vazio\b/, label: "frasco vazio" },
  { re: /\busado\b/, label: "usado" },
];

function extractAnalysisVolume(rawText: string): string | null {
  const m = rawText.match(/\b(\d{1,4}(?:[.,]\d{1,2})?)\s*ml\b/i);
  if (!m) return null;
  const num = m[1].replace(",", ".").replace(/\.0+$/, "");
  return num + "ml";
}

function extractAnalysisConcentration(normText: string): string | null {
  if (/\beau de parfum\b/.test(normText) || /\bedp\b/.test(normText)) return "EDP (Eau de Parfum)";
  if (/\beau de toilette\b/.test(normText) || /\bedt\b/.test(normText)) return "EDT (Eau de Toilette)";
  if (/\bbody splash\b/.test(normText)) return "Body Splash";
  if (/\bcolonia\b/.test(normText)) return "Colônia";
  if (/\bparfum\b/.test(normText)) return "Parfum";
  return null;
}

function extractAnalysisType(normText: string): AnalysisType {
  if (/\bdecants?\b/.test(normText)) return "decant";
  if (/\bamostras?\b/.test(normText)) return "amostra";
  if (/\btester\b/.test(normText)) return "tester";
  if (/\bminiatura\w*\b/.test(normText)) return "miniatura";
  if (/\bkit\b/.test(normText)) return "kit";
  if (/\brefil\w*\b/.test(normText)) return "refil";
  return "regular";
}

function findAnalysisRiskTerms(normText: string): string[] {
  const found: string[] = [];
  ANALYSIS_RISK_TERMS.forEach((rt) => {
    if (rt.re.test(normText)) found.push(rt.label);
  });
  return found;
}

function extractAnalysisLineGuess(rawTitle: string | undefined): string | null {
  if (!rawTitle) return null;
  let s = rawTitle;
  s = s.replace(/\b\d{1,4}(?:[.,]\d{1,2})?\s*ml\b/gi, "");
  s = s.replace(
    /\b(edp|edt|eau de parfum|eau de toilette|parfum|col[oô]nia|body splash|kit|miniaturas?|tester|decants?|amostras?|refil\w*)\b/gi,
    ""
  );
  s = s.replace(/\s{2,}/g, " ").trim();
  s = s.replace(/^[-–·,]+|[-–·,]+$/g, "").trim();
  return s || null;
}

export function computeAnalysis(product: Product): AnalysisResult {
  const rawText = [product.title, product.category, product.description].filter(Boolean).join(" ");
  const normText = normalize(rawText);
  const volume = extractAnalysisVolume(rawText);
  const concentration = extractAnalysisConcentration(normText);
  const type = extractAnalysisType(normText);
  const riskTerms = findAnalysisRiskTerms(normText);
  const lineGuess = extractAnalysisLineGuess(product.title);

  let status: AnalysisStatus;
  if (riskTerms.length > 0) {
    status = "nao_recomendado";
  } else if (ANALYSIS_REVISAR_TYPES.includes(type) || !volume || !concentration) {
    status = "revisar";
  } else {
    status = "apto";
  }

  const checklist: string[] = [];
  if (!volume) checklist.push("Confirmar o volume (ml) no anúncio.");
  if (!concentration) checklist.push("Confirmar a concentração (EDP, EDT, Parfum, Colônia, Body Splash etc.) no anúncio.");
  if (ANALYSIS_REVISAR_TYPES.includes(type)) {
    checklist.push('Confirmar se é mesmo "' + ANALYSIS_TYPE_LABEL[type] + '" e se isso está claro no anúncio.');
  }
  if (riskTerms.length > 0) {
    checklist.push("Revisar com cuidado os termos de risco encontrados antes de qualquer decisão: " + riskTerms.join(", ") + ".");
  }
  if (checklist.length === 0) {
    checklist.push("Nenhum ponto adicional identificado pela análise automática — revise os dados normalmente antes de publicar.");
  }

  return { volume, concentration, type, riskTerms, status, checklist, lineGuess };
}

export function hasAnalysisSignal(analysis: AnalysisResult): boolean {
  return !!(
    analysis &&
    (analysis.volume ||
      analysis.concentration ||
      analysis.type !== "regular" ||
      (analysis.riskTerms && analysis.riskTerms.length > 0))
  );
}
