import { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { Filters } from "@/lib/types";
import Icon from "./Icon";

interface FiltersPanelProps {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  open: boolean;
  onToggle: () => void;
  onApply: (e: FormEvent) => void;
  onClear: () => void;
}

export default function FiltersPanel({ filters, setFilters, open, onToggle, onApply, onClear }: FiltersPanelProps) {
  const set =
    (key: keyof Filters) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setFilters((prev) => ({ ...prev, [key]: val } as Filters));
    };

  return (
    <section className="filters-card">
      <div className="filters-head">
        <h2>
          <Icon name="filter" size={16} /> Filtros de busca
        </h2>
        <button type="button" className="link-btn" onClick={onToggle} aria-expanded={open}>
          {open ? "Ocultar" : "Mostrar"}
          <span className={"chevron-wrap" + (open ? " is-open" : "")}>
            <Icon name="chevron" size={14} />
          </span>
        </button>
      </div>
      {open && (
        <form className="filters-form" onSubmit={onApply}>
          <div className="field field-wide">
            <label htmlFor="f-query">Buscar por palavra-chave</label>
            <input
              id="f-query"
              type="text"
              placeholder="Ex.: mouse sem fio, teclado mecânico…"
              value={filters.query}
              onChange={set("query")}
            />
          </div>
          <div className="field">
            <label htmlFor="f-min-price">Preço mínimo</label>
            <div className="input-prefix">
              <span>R$</span>
              <input
                id="f-min-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={filters.minPrice}
                onChange={set("minPrice")}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="f-max-price">Preço máximo</label>
            <div className="input-prefix">
              <span>R$</span>
              <input
                id="f-max-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="500,00"
                value={filters.maxPrice}
                onChange={set("maxPrice")}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="f-min-rating">Nota mínima</label>
            <input
              id="f-min-rating"
              type="text"
              inputMode="decimal"
              placeholder="Ex.: 4,7"
              value={filters.minRating}
              onChange={set("minRating")}
            />
          </div>
          <div className="field">
            <label htmlFor="f-min-reviews">Mínimo de avaliações</label>
            <input
              id="f-min-reviews"
              type="number"
              min="0"
              step="1"
              placeholder="Ex.: 50"
              value={filters.minReviews}
              onChange={set("minReviews")}
            />
          </div>
          <div className="field">
            <label htmlFor="f-min-sold">Quantidade vendida (mínimo)</label>
            <input
              id="f-min-sold"
              type="number"
              min="0"
              step="1"
              placeholder="Ex.: 20"
              value={filters.minSold}
              onChange={set("minSold")}
            />
          </div>
          <div className="field field-check">
            <label htmlFor="f-only-new">
              <input id="f-only-new" type="checkbox" checked={filters.onlyNew} onChange={set("onlyNew")} />
              Somente produtos novos
            </label>
          </div>
          <div className="field field-check">
            <label htmlFor="f-free-shipping">
              <input
                id="f-free-shipping"
                type="checkbox"
                checked={filters.prioritizeFreeShipping}
                onChange={set("prioritizeFreeShipping")}
              />
              Priorizar frete grátis
            </label>
            <p className="field-hint">Coloca os itens com frete grátis no topo, sem remover os demais.</p>
          </div>
          <div className="filters-buttons">
            <button type="submit" className="btn btn-primary">
              Aplicar filtros
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClear}>
              Limpar filtros
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
