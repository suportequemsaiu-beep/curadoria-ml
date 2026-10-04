import { BackupPayload, BackupValidation, IdMap, Product } from "./types";
import { asIdMap, isValidProductsList } from "./shape";

// --- Backup manual da sessão: exporta/restaura o estado atual (produtos,
// status, edições, links de afiliado, rascunhos e notas internas) como JSON,
// sem servidor, sem persistência automática e sem credenciais.
// Links de afiliado são aparados (não têm razão para ter espaços nas pontas).
function cleanTrimmedMap(map: IdMap | undefined): IdMap {
  const clean: IdMap = {};
  Object.entries(map || {}).forEach(([id, val]) => {
    if (val && val.trim()) clean[id] = val.trim();
  });
  return clean;
}

// Rascunhos e notas preservam o texto exatamente como digitado (quebras de
// linha incluídas) — só descartamos entradas em branco.
function cleanRawMap(map: IdMap | undefined): IdMap {
  const clean: IdMap = {};
  Object.entries(map || {}).forEach(([id, val]) => {
    if (val && val.trim()) clean[id] = val;
  });
  return clean;
}

export function buildBackup(
  products: Product[],
  affiliateLinks: IdMap,
  drafts: IdMap,
  notes: IdMap
): BackupPayload {
  return {
    app: "Curadoria ML",
    backupVersion: 1,
    exportedAt: new Date().toISOString(),
    products,
    affiliateLinks: cleanTrimmedMap(affiliateLinks),
    messageDrafts: cleanRawMap(drafts),
    internalNotes: cleanRawMap(notes),
  };
}

export function validateBackup(text: string): BackupValidation {
  if (!text || !text.trim()) {
    return { valid: false, error: "Cole o conteúdo do backup antes de validar." };
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { valid: false, error: "O texto colado não é um JSON válido." };
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { valid: false, error: "Formato inesperado: esperado um objeto JSON de backup." };
  }
  const obj = data as Record<string, unknown>;
  if (obj.app !== "Curadoria ML") {
    return { valid: false, error: "Este conteúdo não parece ser um backup do Curadoria ML." };
  }
  if (!isValidProductsList(obj.products)) {
    return { valid: false, error: "O backup não contém uma lista de produtos válida." };
  }
  return {
    valid: true,
    data: {
      products: obj.products as Product[],
      affiliateLinks: asIdMap(obj.affiliateLinks),
      messageDrafts: asIdMap(obj.messageDrafts),
      internalNotes: asIdMap(obj.internalNotes),
    },
  };
}

export function dedupeRestoredProducts(products: Product[]): Product[] {
  const seenIds = new Set<string | number>();
  const seenMlb = new Set<string>();
  const result: Product[] = [];
  products.forEach((p) => {
    if (seenIds.has(p.id)) return;
    if (p.mlbId && seenMlb.has(p.mlbId)) return;
    seenIds.add(p.id);
    if (p.mlbId) seenMlb.add(p.mlbId);
    result.push(p);
  });
  return result;
}
