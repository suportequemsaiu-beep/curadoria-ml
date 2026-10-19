import { ImportEntry, ImportValidation, Product, Reputation } from "./types";
import { mapCondition } from "./foundProducts";

// --- Importação manual de links/IDs do Mercado Livre. Esta função só valida
// o formato do que foi colado (sem fazer nenhuma chamada de rede). Os dados
// reais do anúncio são buscados depois, na Server Action
// src/app/actions/importProduct.ts, usando o login OAuth já feito com o
// Mercado Livre — nada aqui é inventado.
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

// --- Mapeamento dos dados reais vindos da API do Mercado Livre para o
// formato de Product usado no resto do app. Fica aqui (sem nenhuma chamada
// de rede) para poder ser usado e testado separadamente da Server Action que
// faz as requisições.

export interface MlItemShipping {
  free_shipping?: boolean;
}

export interface MlItemData {
  id?: string;
  title: string;
  price: number;
  currency_id?: string;
  condition?: string | null;
  permalink?: string;
  category_id?: string;
  seller_id?: number;
  shipping?: MlItemShipping;
}

export interface MlSellerData {
  nickname?: string;
  seller_reputation?: { level_id?: string | null } | null;
}

// Converte o nível de reputação do vendedor (ex.: "5_green") na mesma escala
// alta/média/baixa usada no resto do app. Qualquer nível não reconhecido
// (incluindo vendedores novos, sem reputação ainda) fica como "não informada".
function mapSellerReputation(levelId?: string | null): Reputation {
  switch (levelId) {
    case "5_green":
      return "alta";
    case "4_light_green":
    case "3_yellow":
      return "media";
    case "2_orange":
    case "1_red":
      return "baixa";
    default:
      return null;
  }
}

export function mlItemToProduct(
  entry: ImportEntry,
  item: MlItemData,
  seller: MlSellerData | null,
  categoryName: string | null
): Product {
  return {
    id: "imp-" + entry.mlbId,
    title: item.title,
    category: categoryName || item.category_id || "Mercado Livre",
    icon: "acessorios",
    price: typeof item.price === "number" && !Number.isNaN(item.price) ? item.price : 0,
    condition: mapCondition(item.condition ?? null),
    // A API de item do Mercado Livre não devolve nota média nem quantidade de
    // avaliações — por isso esses dois campos continuam como "não informado"
    // (igual aos produtos achados pela busca automática), em vez de inventar
    // um valor como a versão anterior desta função fazia.
    rating: null,
    reviewCount: null,
    seller: seller?.nickname || "Vendedor do Mercado Livre",
    reputation: mapSellerReputation(seller?.seller_reputation?.level_id ?? null),
    freeShipping: item.shipping?.free_shipping ?? null,
    shippingCost: null,
    deliveryEstimate: "Ver prazo de entrega no anúncio",
    link: item.permalink || entry.url || "https://lista.mercadolivre.com.br/" + entry.mlbId,
    status: "novo",
    imported: true,
    mlbId: entry.mlbId,
    importType: entry.type,
    sourceInput: entry.line,
    description:
      "Importado com os dados reais do anúncio no Mercado Livre (título, preço, condição, frete e, quando disponível, reputação do vendedor). Nota e avaliações não são informadas pela API para este tipo de consulta — confira no próprio anúncio antes de publicar.",
  };
}
