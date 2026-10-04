import { ChangeEvent, useState } from "react";
import { buildBackup, validateBackup } from "@/lib/backup";
import { BackupValidation, IdMap, Product } from "@/lib/types";
import Icon from "./Icon";

interface SessionBackupPanelProps {
  products: Product[];
  affiliateLinks: IdMap;
  drafts: IdMap;
  notes: IdMap;
  onRestore: (
    products: Product[],
    affiliateLinks: IdMap,
    drafts: IdMap,
    notes: IdMap
  ) => number;
  onClearDeviceData: () => void;
}

export default function SessionBackupPanel({
  products,
  affiliateLinks,
  drafts,
  notes,
  onRestore,
  onClearDeviceData,
}: SessionBackupPanelProps) {
  const [open, setOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [backupText, setBackupText] = useState("");
  const [restoreText, setRestoreText] = useState("");
  const [validation, setValidation] = useState<BackupValidation | null>(null);
  const [confirmingRestore, setConfirmingRestore] = useState(false);
  const [restoreFeedback, setRestoreFeedback] = useState("");
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearFeedback, setClearFeedback] = useState("");

  const handleCopyBackup = async () => {
    const backup = buildBackup(products, affiliateLinks, drafts, notes);
    const json = JSON.stringify(backup, null, 2);
    setBackupText(json);
    try {
      await navigator.clipboard.writeText(json);
      setCopyFeedback("Backup copiado para a área de transferência.");
    } catch {
      setCopyFeedback("Não copiou automaticamente — toque no texto abaixo para selecionar e copiar manualmente.");
    }
    setTimeout(() => setCopyFeedback(""), 4000);
  };

  const handleRestoreTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setRestoreText(e.target.value);
    setValidation(null);
    setConfirmingRestore(false);
    setRestoreFeedback("");
  };

  const handleValidateRestore = () => {
    setValidation(validateBackup(restoreText));
    setConfirmingRestore(false);
    setRestoreFeedback("");
  };

  const handleRequestRestore = () => {
    if (!validation || !validation.valid) return;
    setConfirmingRestore(true);
  };

  const handleCancelRestore = () => setConfirmingRestore(false);

  const handleConfirmRestore = () => {
    if (!validation || !validation.valid) return;
    const count = onRestore(
      validation.data.products,
      validation.data.affiliateLinks,
      validation.data.messageDrafts,
      validation.data.internalNotes
    );
    setConfirmingRestore(false);
    setValidation(null);
    setRestoreText("");
    setRestoreFeedback("Sessão restaurada com " + count + (count === 1 ? " produto." : " produtos."));
  };

  const handleClearRestore = () => {
    setRestoreText("");
    setValidation(null);
    setConfirmingRestore(false);
    setRestoreFeedback("");
  };

  const handleRequestClearDevice = () => {
    setConfirmingClear(true);
    setClearFeedback("");
  };
  const handleCancelClearDevice = () => setConfirmingClear(false);
  const handleConfirmClearDevice = () => {
    onClearDeviceData();
    setConfirmingClear(false);
    setClearFeedback("Dados salvos neste dispositivo foram apagados. O painel voltou aos produtos iniciais da demonstração.");
  };

  return (
    <section className="filters-card">
      <div className="filters-head">
        <h2>
          <Icon name="backup" size={16} /> Backup da sessão
        </h2>
        <button type="button" className="link-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "Ocultar" : "Mostrar"}
          <span className={"chevron-wrap" + (open ? " is-open" : "")}>
            <Icon name="chevron" size={14} />
          </span>
        </button>
      </div>
      {open && (
        <div className="backup-body">
          <p className="backup-hint">
            Os dados deste painel (produtos, status, edições, links de afiliado, rascunhos, notas internas e
            filtros) são salvos automaticamente neste navegador. Eles ficam somente neste dispositivo — nada é
            enviado para servidores externos. Você também pode gerar um backup manual em JSON abaixo, para levar
            para outro navegador ou guardar à parte.
          </p>

          <div className="backup-actions">
            <button type="button" className="btn btn-outline" onClick={handleCopyBackup}>
              Copiar backup
            </button>
            {copyFeedback && <span className="backup-feedback">{copyFeedback}</span>}
          </div>

          {backupText && (
            <textarea
              readOnly
              className="backup-textarea"
              value={backupText}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              aria-label="JSON do backup gerado"
            />
          )}

          <div className="backup-divider" />

          <label htmlFor="backup-restore-textarea" className="import-label">
            Restaurar backup — cole aqui o JSON copiado anteriormente
          </label>
          <textarea
            id="backup-restore-textarea"
            className="import-textarea"
            value={restoreText}
            onChange={handleRestoreTextChange}
            placeholder="Cole aqui o JSON do backup..."
          />

          <div className="import-actions">
            <button type="button" className="btn btn-outline" onClick={handleValidateRestore}>
              Validar backup
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRequestRestore}
              disabled={!(validation && validation.valid)}
            >
              Restaurar sessão
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleClearRestore}>
              Limpar
            </button>
          </div>

          {validation && !validation.valid && <p className="backup-error">{validation.error}</p>}
          {validation && validation.valid && !confirmingRestore && (
            <p className="import-summary-ok">Backup válido — {validation.data.products.length} produto(s) encontrados.</p>
          )}

          {confirmingRestore && (
            <div className="backup-confirm">
              <p>
                Isso vai substituir os produtos, status, links de afiliado, rascunhos e notas internas atuais
                desta sessão pelos dados do backup. Deseja continuar?
              </p>
              <div className="edit-actions">
                <button type="button" className="btn btn-primary" onClick={handleConfirmRestore}>
                  Sim, restaurar
                </button>
                <button type="button" className="btn btn-ghost" onClick={handleCancelRestore}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {restoreFeedback && <p className="import-confirmation">{restoreFeedback}</p>}

          <p className="import-note">
            O backup guarda apenas os dados desta sessão. Não inclua senhas, tokens, chaves de acesso, CPF ou
            outros documentos ao colar ou compartilhar este JSON.
          </p>

          <div className="backup-divider" />

          <div className="backup-danger">
            <p className="backup-hint">
              Para apagar tudo o que está salvo neste navegador e recomeçar do zero com os produtos de demonstração:
            </p>
            <button type="button" className="btn btn-outline backup-danger-btn" onClick={handleRequestClearDevice}>
              Apagar dados salvos deste dispositivo
            </button>

            {confirmingClear && (
              <div className="backup-confirm">
                <p>
                  Isso vai apagar permanentemente os dados salvos neste navegador (produtos, status, edições,
                  links de afiliado, rascunhos e notas internas) e voltar aos produtos iniciais da demonstração.
                  Essa ação não pode ser desfeita e afeta somente este navegador/dispositivo.
                </p>
                <div className="edit-actions">
                  <button type="button" className="btn btn-primary" onClick={handleConfirmClearDevice}>
                    Sim, apagar
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={handleCancelClearDevice}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {clearFeedback && <p className="import-confirmation">{clearFeedback}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
