import { ImportEntry, ImportValidation, Product } from "./types";

// --- Importação manual simulada de links/IDs do Mercado Livre. Sem API real:
// cada entrada válida vira um produto fictício, marcado como importado.
const MLB_ID_RE = /MLB-?(\d{5,})/i;

export function validateImportText(text: string): ImportValidation {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const valid: ImportEntry[] = [];
  const invalid: { line: string; reason: string }[] = [];
  const seen = new Set<string>();

  lines.forEach((line) => {
    const bareMatch = line.match(/^MLB-?(\d{5,})$/i);
    if (bareMatch) {
      const mlbId = "MLB" + bareMatch[1];
      if (seen.has(mlbId)) {
        invalid.push({ line, reason: "ID repetido nesta lista" });
        return;
      }
      seen.add(mlbId);
      valid.push({ line, mlbId, type: "id" });
      return;
    }

    if (/^https?:\/\//i.test(line) || /^www\./i.test(line)) {
      let url: URL;
      try {
        url = new URL(/^https?:\/\//i.test(line) ? line : "https://" + line);
      } catch {
        invalid.push({ line, reason: "URL inválida" });
        return;
      }
      if (!url.hostname.toLowerCase().includes("mercadolivre.com")) {
        invalid.push({ line, reason: "domínio não é do Mercado Livre" });
        return;
      }
      const linkMatch = line.match(MLB_ID_RE);
      if (!linkMatch) {
        invalid.push({ line, reason: "link sem ID MLB reconhecível" });
        return;
      }
      const mlbId = "MLB" + linkMatch[1];
      if (seen.has(mlbId)) {
        invalid.push({ line, reason: "ID repetido nesta lista" });
        return;
      }
      seen.add(mlbId);
      valid.push({ line, mlbId, type: "link", url: line });
      return;
    }

    invalid.push({ line, reason: "formato não reconhecido (use um ID MLB ou um link do Mercado Livre)" });
  });

  return { valid, invalid };
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedReputation(): "alta" | "media" | "baixa" {
  const r = Math.random();
  if (r < 0.6) return "alta";
  if (r < 0.9) return "media";
  return "baixa";
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const IMPORT_CATEGORIES = [
  { name: "Tecnologia", icon: "tecnologia" },
  { name: "Games", icon: "games" },
  { name: "Setup", icon: "setup" },
  { name: "Acessórios para celular", icon: "acessorios" },
  { name: "Estudo", icon: "estudo" },
];
const IMPORT_NAME_PARTS = [
  "Mouse óptico", "Teclado slim", "Carregador portátil", "Suporte ajustável",
  "Fone intra-auricular", "Cabo reforçado", "Luminária USB", "Organizador de mesa",
  "Case protetor", "Adaptador multiportas",
];
const IMPORT_BRANDS = ["NexTech", "ZenPro", "UrbanGear", "BrightLine", "CoreFit", "PixelWave"];
const IMPORT_SELLERS = ["Loja Horizonte", "TechCasa", "Ponto Certo Store", "Vitrine Digital", "Comércio Rápido MG"];
const IMPORT_DELIVERY = ["5 a 9 dias úteis", "7 a 12 dias úteis", "4 a 8 dias úteis", "6 a 11 dias úteis"];

export function generateImportedProduct(entry: ImportEntry): Product {
  const category = pickRandom(IMPORT_CATEGORIES);
  const brand = pickRandom(IMPORT_BRANDS);
  const namePart = pickRandom(IMPORT_NAME_PARTS);
  const suffix = entry.mlbId.slice(-4);
  const freeShipping = Math.random() < 0.7;

  return {
    id: "imp-" + entry.mlbId,
    title: brand + " " + namePart + " " + suffix,
    category: category.name,
    icon: category.icon,
    price: round2(29.9 + Math.random() * 320),
    condition: Math.random() < 0.9 ? "novo" : "usado",
    rating: round2(3.6 + Math.random() * 1.3),
    reviewCount: Math.floor(5 + Math.random() * 295),
    seller: pickRandom(IMPORT_SELLERS),
    reputation: weightedReputation(),
    freeShipping,
    shippingCost: freeShipping ? null : round2(9.9 + Math.random() * 20),
    deliveryEstimate: pickRandom(IMPORT_DELIVERY),
    link: entry.type === "link" ? entry.url ?? "" : "https://lista.mercadolivre.com.br/" + entry.mlbId,
    status: "novo",
    imported: true,
    mlbId: entry.mlbId,
    importType: entry.type,
    sourceInput: entry.line,
  };
}
