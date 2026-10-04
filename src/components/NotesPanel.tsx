import Icon from "./Icon";

interface NotesPanelProps {
  productTitle: string;
  notesText: string;
  onChange: (val: string) => void;
  onClose: () => void;
}

// --- Notas internas: anotações privadas por produto (comissão estimada, cupom,
// data de postagem, lembretes, resultado etc.). Nunca entram na mensagem de
// WhatsApp nem em nenhum outro lugar do painel além deste campo e do backup.
export default function NotesPanel({ productTitle, notesText, onChange, onClose }: NotesPanelProps) {
  return (
    <div className="draft-overlay" onClick={onClose}>
      <div
        className="draft-panel"
        role="dialog"
        aria-modal="true"
        aria-label={"Notas internas — " + productTitle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="draft-header">
          <h3>Notas internas</h3>
          <button type="button" className="draft-close" onClick={onClose} aria-label="Fechar">
            <Icon name="x" size={18} />
          </button>
        </div>
        <textarea
          className="draft-textarea"
          value={notesText}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex.: comissão estimada, cupom aplicado, data de postagem, lembrete para conferir preço, resultado do produto..."
          aria-label="Texto das notas internas"
        />
        <div className="draft-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Concluir
          </button>
        </div>
        <p className="draft-note">
          Notas só para você: não aparecem na mensagem gerada para o WhatsApp nem em nenhuma outra parte do
          painel — são salvas automaticamente neste navegador.
        </p>
      </div>
    </div>
  );
}
