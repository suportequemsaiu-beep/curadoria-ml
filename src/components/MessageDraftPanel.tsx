import { RefObject } from "react";
import Icon from "./Icon";

interface MessageDraftPanelProps {
  productTitle: string;
  draftText: string;
  setDraftText: (val: string) => void;
  feedback: string;
  onCopy: () => void;
  onClose: () => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export default function MessageDraftPanel({
  productTitle,
  draftText,
  setDraftText,
  feedback,
  onCopy,
  onClose,
  textareaRef,
}: MessageDraftPanelProps) {
  return (
    <div className="draft-overlay" onClick={onClose}>
      <div
        className="draft-panel"
        role="dialog"
        aria-modal="true"
        aria-label={"Rascunho de mensagem — " + productTitle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="draft-header">
          <h3>Rascunho para WhatsApp</h3>
          <button type="button" className="draft-close" onClick={onClose} aria-label="Fechar">
            <Icon name="x" size={18} />
          </button>
        </div>
        <textarea
          ref={textareaRef}
          className="draft-textarea"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          aria-label="Texto da mensagem"
        />
        <div className="draft-actions">
          <button type="button" className="btn btn-primary" onClick={onCopy}>
            Copiar mensagem
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Fechar
          </button>
          {feedback && <span className="draft-feedback">{feedback}</span>}
        </div>
        <p className="draft-note">Revise preço, frete, variação e disponibilidade antes de publicar.</p>
      </div>
    </div>
  );
}
