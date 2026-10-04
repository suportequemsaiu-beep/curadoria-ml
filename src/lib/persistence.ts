import { DEFAULT_FILTERS } from "./data";
import { asIdMap, isValidProductsList } from "./shape";
import { Filters, PersistedState, Product } from "./types";

// --- Persistência local (localStorage): guarda a sessão automaticamente
// neste navegador/dispositivo. Nenhum dado sai do navegador; leitura e
// escrita são sempre protegidas contra falha (modo privado, storage
// bloqueado, JSON corrompido, execução no servidor durante o SSR etc.)
// para nunca quebrar a interface.
const STORAGE_KEY = "curadoria-ml/session-v1";

export function loadPersistedState(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    if (!isValidProductsList(data.products)) return null;

    const filters: Filters =
      data.filters && typeof data.filters === "object" && !Array.isArray(data.filters)
        ? { ...DEFAULT_FILTERS, ...(data.filters as Partial<Filters>) }
        : DEFAULT_FILTERS;

    return {
      products: data.products as Product[],
      affiliateLinks: asIdMap(data.affiliateLinks),
      drafts: asIdMap(data.messageDrafts),
      notes: asIdMap(data.internalNotes),
      filters,
    };
  } catch {
    return null;
  }
}

export function savePersistedState(state: PersistedState): boolean {
  try {
    // Links de afiliado são aparados; rascunhos e notas preservam o texto
    // exatamente como digitado (quebras de linha incluídas), só descartando
    // entradas em branco — igual ao comportamento do backup manual em JSON.
    const cleanTrimmedMap = (map: Record<string, string>) => {
      const clean: Record<string, string> = {};
      Object.entries(map || {}).forEach(([id, val]) => {
        if (val && val.trim()) clean[id] = val.trim();
      });
      return clean;
    };
    const cleanRawMap = (map: Record<string, string>) => {
      const clean: Record<string, string> = {};
      Object.entries(map || {}).forEach(([id, val]) => {
        if (val && val.trim()) clean[id] = val;
      });
      return clean;
    };
    const payload = {
      app: "Curadoria ML",
      backupVersion: 1,
      savedAt: new Date().toISOString(),
      products: state.products,
      affiliateLinks: cleanTrimmedMap(state.affiliateLinks),
      messageDrafts: cleanRawMap(state.drafts),
      internalNotes: cleanRawMap(state.notes),
      filters: state.filters,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function clearPersistedState(): boolean {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
