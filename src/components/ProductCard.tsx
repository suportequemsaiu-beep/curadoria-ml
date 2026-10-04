import { useRef, useState } from "react";
import { buildDraft } from "@/lib/draft";
import { REPUTATION_LABEL } from "@/lib/data";
import { brl } from "@/lib/format";
import { EditedFields, ScoredProduct } from "@/lib/types";
import Icon from "./Icon";
import Stars from "./Stars";
import { StatusPill } from "./StatusBadges";
import ScoreBreakdown from "./ScoreBreakdown";
import MessageDraftPanel from "./MessageDraftPanel";
import EditProductPanel from "./EditProductPanel";
import NotesPanel from "./NotesPanel";

interface ProductCardProps {
  product: ScoredProduct;
  onStatusChange: (id: string | number, status: ScoredProduct["status"]) => void;
  onEditProduct: (id: string | number, fields: EditedFields) => void;
  affiliateLink: string;
  onAffiliateLinkChange: (val: string) => void;
  draftText: string;
  onDraftTextChange: (val: string) => void;
  notesText: string;
  onNotesChange: (val: string) => void;
}

export default function ProductCard({
  product,
  onStatusChange,
  onEditProduct,
  affiliateLink,
  onAffiliateLinkChange,
  draftText,
  onDraftTextChange,
  notesText,
  onNotesChange,
}: ProductCardProps) {
  const p = product;
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showDraft, setShowDraft] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = () => {
    onDraftTextChange(buildDraft(p, affiliateLink));
    setCopyFeedback("");
    setShowDraft(true);
  };
  const handleCloseDraft = () => {
    setShowDraft(false);
    setCopyFeedback("");
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draftText);
      setCopyFeedback("Mensagem copiada");
    } catch {
      if (textareaRef.current) textareaRef.current.select();
      setCopyFeedback("Não copiou automaticamente — texto selecionado, use copiar do teclado.");
    }
    setTimeout(() => setCopyFeedback(""), 2500);
  };
  const handleSaveEdit = (fields: EditedFields, newAffiliateLink: string) => {
    onEditProduct(p.id, fields);
    onAffiliateLinkChange(newAffiliateLink);
    if (showDraft) {
      const merged = { ...p, ...fields };
      onDraftTextChange(buildDraft(merged, newAffiliateLink));
    }
    setShowEdit(false);
  };

  return (
    <article className="card">
      <div className="card-accent" />
      <div className="card-head">
        <span className="badge badge-category">
          <Icon name={p.icon} size={13} /> {p.category}
        </span>
        <span className={"badge badge-condition " + (p.condition === "novo" ? "is-new" : "is-used")}>
          {p.condition === "novo" ? "Novo" : "Usado"}
        </span>
      </div>

      <div className="card-media" aria-hidden="true">
        <Icon name={p.icon} size={38} />
      </div>

      <h2 className="card-title">{p.title}</h2>

      {p.imported && (
        <span className="badge-imported">
          <Icon name={p.edited ? "check" : "import"} size={12} />
          {p.edited ? "Dados preenchidos manualmente" : "Importado manualmente"}
        </span>
      )}

      <StatusPill status={p.status} />

      <div className="price-row">
        <span className="price">{brl(p.price)}</span>
        {p.freeShipping ? (
          <span className="ship-chip ship-free">Frete grátis</span>
        ) : p.shippingCost != null ? (
          <span className="ship-chip">+ {brl(p.shippingCost)} de frete estimado</span>
        ) : (
          <span className="ship-chip">Frete pago (valor não informado)</span>
        )}
      </div>

      <div className="rating-row">
        <Stars value={p.rating || 0} />
        <span className="rating-num">{p.rating != null ? p.rating.toFixed(1).replace(".", ",") : "—"}</span>
        <span className="rating-count">
          {p.reviewCount != null ? "(" + p.reviewCount + " avaliações)" : "(avaliações não informadas)"}
        </span>
      </div>

      <div className="seller-row">
        <span className="seller-name">{p.seller}</span>
        <span className={"reputation-dot rep-" + (p.reputation || "desconhecida")} />
        <span>Reputação {p.reputation ? REPUTATION_LABEL[p.reputation] : "não informada"}</span>
      </div>

      <div className="shipping-row">
        <Icon name="truck" size={15} />
        <span>Entrega estimada: {p.deliveryEstimate}</span>
      </div>

      <div className="score">
        <div className="score-top">
          <span className="score-label">Score de triagem</span>
          <span className="score-value">
            <span className="score-num">{p.scoreResult.score}</span>
            <span className="score-max">/100</span>
          </span>
        </div>
        <div className="score-track">
          <div className="score-fill" style={{ width: p.scoreResult.score + "%" }} />
        </div>
        <button
          type="button"
          className="score-detail-toggle"
          onClick={() => setShowBreakdown((v) => !v)}
          aria-expanded={showBreakdown}
        >
          {showBreakdown ? "Ocultar cálculo" : "Ver cálculo"}
        </button>
        {showBreakdown && <ScoreBreakdown result={p.scoreResult} />}
      </div>

      <div className="actions">
        <div className="actions-row">
          {p.link ? (
            <a className="btn btn-outline" href={p.link} target="_blank" rel="noopener noreferrer">
              Abrir anúncio <Icon name="external" size={13} />
            </a>
          ) : (
            <button type="button" className="btn btn-outline" disabled>
              Sem link cadastrado
            </button>
          )}
          <button type="button" className="btn btn-outline" onClick={handleGenerate}>
            Gerar mensagem
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setShowEdit(true)}>
            <Icon name="edit" size={13} /> Editar dados
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setShowNotes(true)}>
            <Icon name="notes" size={13} /> Notas internas{notesText && notesText.trim() ? " •" : ""}
          </button>
        </div>

        <div className="field field-affiliate">
          <label htmlFor={"aff-" + p.id}>Link de afiliado (opcional)</label>
          <input
            id={"aff-" + p.id}
            type="text"
            placeholder="Cole aqui seu link de afiliado"
            value={affiliateLink}
            onChange={(e) => onAffiliateLinkChange(e.target.value)}
          />
        </div>

        <div className="status-actions" role="group" aria-label="Status de curadoria">
          <button
            type="button"
            className={"status-btn sa-revisar" + (p.status === "revisar" ? " is-active" : "")}
            aria-pressed={p.status === "revisar"}
            onClick={() => onStatusChange(p.id, "revisar")}
          >
            <Icon name="review" size={13} /> Revisar
          </button>
          <button
            type="button"
            className={"status-btn sa-aprovado" + (p.status === "aprovado" ? " is-active" : "")}
            aria-pressed={p.status === "aprovado"}
            onClick={() => onStatusChange(p.id, "aprovado")}
          >
            <Icon name="check" size={13} /> Aprovar para postar
          </button>
          <button
            type="button"
            className={"status-btn sa-descartado" + (p.status === "descartado" ? " is-active" : "")}
            aria-pressed={p.status === "descartado"}
            onClick={() => onStatusChange(p.id, "descartado")}
          >
            <Icon name="x" size={13} /> Descartar
          </button>
        </div>
      </div>

      {showDraft && (
        <MessageDraftPanel
          productTitle={p.title}
          draftText={draftText}
          setDraftText={onDraftTextChange}
          feedback={copyFeedback}
          onCopy={handleCopy}
          onClose={handleCloseDraft}
          textareaRef={textareaRef}
        />
      )}

      {showEdit && (
        <EditProductPanel
          product={p}
          affiliateLink={affiliateLink}
          onSave={handleSaveEdit}
          onCancel={() => setShowEdit(false)}
        />
      )}

      {showNotes && (
        <NotesPanel
          productTitle={p.title}
          notesText={notesText}
          onChange={onNotesChange}
          onClose={() => setShowNotes(false)}
        />
      )}
    </article>
  );
}
