import { ChangeEvent, useState } from "react";
import { generateImportedProduct, validateImportText } from "@/lib/importProducts";
import { ImportValidation, Product } from "@/lib/types";
import Icon from "./Icon";

interface ImportPanelProps {
  existingMlbIds: Set<string>;
  onImport: (products: Product[]) => void;
}

export default function ImportPanel({ existingMlbIds, onImport }: ImportPanelProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<ImportValidation | null>(null);
  const [confirmation, setConfirmation] = useState("");

  const handleChangeText = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setResult(null);
    setConfirmation("");
  };
  const handleValidate = () => {
    setResult(validateImportText(text));
    setConfirmation("");
  };
  const handleClear = () => {
    setText("");
    setResult(null);
    setConfirmation("");
  };
  const handleAdd = () => {
    if (!result || result.valid.length === 0) return;
    let added = 0;
    let crossDup = 0;
    const toAdd: Product[] = [];
    result.valid.forEach((entry) => {
      if (existingMlbIds.has(entry.mlbId)) {
        crossDup++;
        return;
      }
      toAdd.push(generateImportedProduct(entry));
      added++;
    });
    if (toAdd.length > 0) onImport(toAdd);

    let msg = added === 1 ? "1 produto adicionado." : added + " produtos adicionados.";
    if (crossDup > 0)
      msg +=
        " " +
        crossDup +
        (crossDup === 1 ? " entrada ignorada" : " entradas ignoradas") +
        " por duplicidade (já importadas antes).";
    if (result.invalid.length > 0)
      msg +=
        " " +
        result.invalid.length +
        (result.invalid.length === 1 ? " linha inválida não foi usada." : " linhas inválidas não foram usadas.");
    setConfirmation(msg);
    setText("");
    setResult(null);
  };

  const hasValid = !!(result && result.valid.length > 0);

  return (
    <section className="filters-card">
      <div className="filters-head">
        <h2>
          <Icon name="import" size={16} /> Importar produtos manualmente
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
          <label htmlFor="import-textarea" className="import-label">
            Cole links ou IDs do Mercado Livre, um por linha
          </label>
          <textarea
            id="import-textarea"
            className="import-textarea"
            value={text}
            onChange={handleChangeText}
            placeholder={"MLB1234567890\nhttps://www.mercadolivre.com.br/produto-exemplo/p/MLB1234567890"}
          />
          <p className="import-examples">
            Exemplos: <code>MLB1234567890</code> ·{" "}
            <code>https://www.mercadolivre.com.br/produto-exemplo/p/MLB1234567890</code>
          </p>

          <div className="import-actions">
            <button type="button" className="btn btn-outline" onClick={handleValidate}>
              Validar entradas
            </button>
            <button type="button" className="btn btn-primary" onClick={handleAdd} disabled={!hasValid}>
              Adicionar produtos válidos
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleClear}>
              Limpar
            </button>
          </div>

          {result && (
            <div className="import-summary">
              <span className="import-summary-ok">
                {result.valid.length} {result.valid.length === 1 ? "linha válida" : "linhas válidas"}
              </span>
              <span className="import-summary-bad">
                {result.invalid.length} {result.invalid.length === 1 ? "linha inválida" : "linhas inválidas"}
              </span>
            </div>
          )}

          {result && result.invalid.length > 0 && (
            <ul className="import-invalid-list">
              {result.invalid.slice(0, 5).map((item, i) => (
                <li key={i}>
                  <span className="mono">{item.line.length > 42 ? item.line.slice(0, 42) + "…" : item.line}</span> —{" "}
                  {item.reason}
                </li>
              ))}
              {result.invalid.length > 5 && <li>+ {result.invalid.length - 5} outra(s) linha(s) inválida(s)</li>}
            </ul>
          )}

          {confirmation && <p className="import-confirmation">{confirmation}</p>}

          <p className="import-note">
            Os dados dos produtos importados são simulados e serão substituídos por uma consulta autorizada a uma
            API oficial em uma etapa futura.
          </p>
        </div>
      )}
    </section>
  );
}
