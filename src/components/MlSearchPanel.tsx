"use client";

import { useState } from "react";
import { searchNowAction } from "@/app/actions/searchNow";
import Icon from "./Icon";

interface MlSearchPanelProps {
  onFoundProducts: () => void;
}

export default function MlSearchPanel({ onFoundProducts }: MlSearchPanelProps) {
  const [open, setOpen] = useState(true);
  const [searching, setSearching] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSearchNow = async () => {
    setSearching(true);
    setFeedback(null);
    try {
      const result = await searchNowAction();
      if (result.ok) {
        onFoundProducts();
        const summary = result.summary || [];
        const total = summary.reduce((sum, s) => sum + s.found, 0);
        const withError = summary.find((s) => s.error);
        if (withError) {
          setFeedback(
            'Busca com problema em "' + withError.keyword + '": ' + withError.error
          );
        } else {
          setFeedback(
            total > 0
              ? "Busca concluída: " + total + " anúncio(s) verificados no Mercado Livre."
              : "Busca concluída: nenhum anúncio encontrado agora."
          );
        }
      } else {
        setFeedback("Não foi possível buscar agora" + (result.error ? ": " + result.error : "."));
      }
    } catch (err) {
      setFeedback("Não foi possível buscar agora: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSearching(false);
    }
  };

  return (
    <section className="filters-card">
      <div className="filters-head">
        <h2>
          <Icon name="import" size={16} /> Busca automática no Mercado Livre
        </h2>
        <button type="button" className="link-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "Ocultar" : "Mostrar"}
          <span className={"chevron-wrap" + (open ? " is-open" : "")}>
            <Icon name="chevron" size={14} />
          </span>
        </button>
      </div>
      {open && (
        <div className="import-body">
          <p className="import-note">
            Uma busca automática roda sozinha várias vezes ao dia e traz anúncios novos para a lista (marcados como
            &quot;Não revisado&quot;). Use o botão abaixo para forçar uma busca agora, sem esperar o próximo horário.
          </p>

          <div className="import-actions">
            <button type="button" className="btn btn-primary" onClick={handleSearchNow} disabled={searching}>
              {searching ? "Buscando..." : "Buscar agora no Mercado Livre"}
            </button>
          </div>

          {feedback && <p className="import-confirmation">{feedback}</p>}

          <p className="import-note">
            A busca usa a API pública de busca do Mercado Livre (sem login) com palavras-chave fixas, escolhidas para
            o nicho de perfumes, beleza e autocuidado. Me avise se quiser mudar as palavras-chave usadas.
          </p>
        </div>
      )}
    </section>
  );
}
