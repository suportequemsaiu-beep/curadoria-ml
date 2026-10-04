"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DEFAULT_FILTERS, PRODUCTS, STATUS_ORDER } from "@/lib/data";
import { dedupeRestoredProducts } from "@/lib/backup";
import { compareProducts, matchesFilters } from "@/lib/filters";
import { clearPersistedState, loadPersistedState, savePersistedState } from "@/lib/persistence";
import { computeScore } from "@/lib/score";
import { EditedFields, Filters, IdMap, Product, ScoredProduct, Status } from "@/lib/types";
import FiltersPanel from "./FiltersPanel";
import ImportPanel from "./ImportPanel";
import { StatusChip } from "./StatusBadges";
import ProductCard from "./ProductCard";
import EmptyState from "./EmptyState";
import SessionBackupPanel from "./SessionBackupPanel";

export default function CuradoriaApp() {
  const [hydrated, setHydrated] = useState(false);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [affiliateLinks, setAffiliateLinks] = useState<IdMap>({});
  const [drafts, setDrafts] = useState<IdMap>({});
  const [notes, setNotes] = useState<IdMap>({});

  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) {
      setProducts(persisted.products);
      setFilters(persisted.filters);
      setAffiliateLinks(persisted.affiliateLinks);
      setDrafts(persisted.drafts);
      setNotes(persisted.notes);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    savePersistedState({ products, affiliateLinks, drafts, notes, filters });
  }, [hydrated, products, affiliateLinks, drafts, notes, filters]);

  const handleClearDeviceData = () => {
    clearPersistedState();
    setProducts(PRODUCTS);
    setFilters(DEFAULT_FILTERS);
    setAffiliateLinks({});
    setDrafts({});
    setNotes({});
  };

  const onStatusChange = (id: string | number, status: Status) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const handleAffiliateLinkChange = (id: string | number, val: string) => {
    setAffiliateLinks((prev) => ({ ...prev, [id]: val }));
  };
  const handleDraftTextChange = (id: string | number, val: string) => {
    setDrafts((prev) => ({ ...prev, [id]: val }));
  };
  const handleNotesChange = (id: string | number, val: string) => {
    setNotes((prev) => ({ ...prev, [id]: val }));
  };

  const handleApply = (e: FormEvent) => {
    e.preventDefault();
    setFiltersOpen(false);
  };
  const handleClear = () => setFilters(DEFAULT_FILTERS);

  const existingMlbIds = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.mlbId) set.add(p.mlbId);
    });
    return set;
  }, [products]);

  const handleImportProducts = (newProducts: Product[]) => {
    if (!newProducts || newProducts.length === 0) return;
    setProducts((prev) => [...prev, ...newProducts]);
  };

  const handleEditProduct = (id: string | number, fields: EditedFields) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p)));
  };

  const handleRestoreSession = (
    restoredProducts: Product[],
    restoredAffiliateLinks: IdMap,
    restoredDrafts: IdMap,
    restoredNotes: IdMap
  ) => {
    const deduped = dedupeRestoredProducts(restoredProducts);
    setProducts(deduped);

    const validIds = new Set(deduped.map((p) => String(p.id)));
    const cleanAffiliateLinks: IdMap = {};
    Object.entries(restoredAffiliateLinks || {}).forEach(([id, val]) => {
      if (validIds.has(String(id))) cleanAffiliateLinks[id] = val;
    });
    setAffiliateLinks(cleanAffiliateLinks);

    const cleanDrafts: IdMap = {};
    Object.entries(restoredDrafts || {}).forEach(([id, val]) => {
      if (validIds.has(String(id))) cleanDrafts[id] = val;
    });
    setDrafts(cleanDrafts);

    const cleanNotes: IdMap = {};
    Object.entries(restoredNotes || {}).forEach(([id, val]) => {
      if (validIds.has(String(id))) cleanNotes[id] = val;
    });
    setNotes(cleanNotes);

    return deduped.length;
  };

  const visible = useMemo<ScoredProduct[]>(() => {
    const filtered = products.filter((p) => matchesFilters(p, filters));
    const prices = filtered.map((p) => p.price).filter((v) => v != null);
    const priceRange = {
      min: prices.length ? Math.min(...prices) : null,
      max: prices.length ? Math.max(...prices) : null,
    };
    const scored: ScoredProduct[] = filtered.map((p) => ({ ...p, scoreResult: computeScore(p, priceRange) }));
    return scored.sort((a, b) => compareProducts(a, b, filters.prioritizeFreeShipping));
  }, [products, filters]);

  const statusCounts = useMemo(() => {
    const counts: Record<Status, number> = { novo: 0, revisar: 0, aprovado: 0, descartado: 0 };
    products.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [products]);

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <h1>Curadoria ML</h1>
          <p className="subtitle">Painel privado para analisar produtos antes de publicar ofertas.</p>
        </div>
      </header>

      <main className="content">
        <FiltersPanel
          filters={filters}
          setFilters={setFilters}
          open={filtersOpen}
          onToggle={() => setFiltersOpen((o) => !o)}
          onApply={handleApply}
          onClear={handleClear}
        />

        <ImportPanel existingMlbIds={existingMlbIds} onImport={handleImportProducts} />

        <section className="summary-row" aria-label="Resumo da curadoria">
          {STATUS_ORDER.map((s) => (
            <StatusChip key={s} status={s} count={statusCounts[s]} />
          ))}
        </section>

        <div className="results-meta" aria-live="polite">
          <span>
            <strong>{visible.length}</strong> {visible.length === 1 ? "produto encontrado" : "produtos encontrados"}
          </span>
          <span>Ordenado por score{filters.prioritizeFreeShipping ? " · frete grátis em destaque" : ""}</span>
        </div>
        <p className="score-note">
          O score de triagem (0–100) ajuda a ordenar os resultados fictícios; a decisão de publicar é sempre sua.
        </p>

        {visible.length === 0 ? (
          <EmptyState onClear={handleClear} />
        ) : (
          <div className="grid">
            {visible.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onStatusChange={onStatusChange}
                onEditProduct={handleEditProduct}
                affiliateLink={affiliateLinks[p.id] || ""}
                onAffiliateLinkChange={(val) => handleAffiliateLinkChange(p.id, val)}
                draftText={drafts[p.id] || ""}
                onDraftTextChange={(val) => handleDraftTextChange(p.id, val)}
                notesText={notes[p.id] || ""}
                onNotesChange={(val) => handleNotesChange(p.id, val)}
              />
            ))}
          </div>
        )}

        <SessionBackupPanel
          products={products}
          affiliateLinks={affiliateLinks}
          drafts={drafts}
          notes={notes}
          onRestore={handleRestoreSession}
          onClearDeviceData={handleClearDeviceData}
        />

        <p className="disclaimer">
          Dados fictícios para demonstração — sem integração real com Mercado Livre, Shopee, WhatsApp ou links de
          afiliado nesta etapa.
        </p>
      </main>
    </div>
  );
}
