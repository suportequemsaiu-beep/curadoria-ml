import { ChangeEvent, useState } from "react";
import { validateImportText } from "@/lib/importProducts";
import { importRealProductsAction } from "@/app/actions/importProduct";
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
  const [errorLines, setErrorLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChangeText = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setResult(null);
    setConfirmation("");
    setErrorLines([]);
  };
  const handleValidate = () => {
    setResult(validateImportText(text));
    setConfirmation("");
    setErrorLines([]);
  };
  const handleClear = () => {
    setText("");
    setResult(null);
    setConfirmation("");
    setErrorLines([]);
  };

  const handleAdd = async () => {
    if (!result || result.valid.length === 0) return;

    const toFetch = result.valid.filter((entry) => !existingMlbIds.has(entry.mlbId));
    const crossDup = result.valid.length - toFetch.length;

    if (toFetch.length === 0) {
      setConfirmation("Nenhuma entrada nova: todas já tinham sido importadas antes.");
      setErrorLines([]);
      return;
    }

    setLoading(true);
    setConfirmation("");
    setErrorLines([]);
    try {
      const results = await importRealProductsAction(toFetch);
      const products = results.filter((r) => r.ok && r.product).map((r) => r.product as Product);
      const failures = results.filter((r) => !r.ok);

      if (products.length > 0) onImport(products);

      let msg =
        products.length === 1
          ? "1 produto importado com dados reais do Mercado Livre."
          : products.length + " produtos importados com dados reais do Mercado Livre.";
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
      if (failures.length > 0)
        msg +=
          " " +
          failures.length +
          (failures.length === 1 ? " entrada não pôde ser importada." : " entradas não puderam ser importadas.");

      setConfirmation(msg);
      setErrorLines(failures.map((f) => f.entry.mlbId + ": " + (f.error || "erro desconhecido")));
      setText("");
      setResult(null);
    } finally {
      setLoading(false);
    }
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
            <button type="button" className="btn btn-outline" onClick={handleValidate} disabled={loading}>
              Validar entradas
            </button>
            <button type="button" className="btn btn-primary" onClick={handleAdd} disabled={!hasValid || loading}>
              {loading ? "Buscando no Mercado Livre…" : "Adicionar produtos válidos"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleClear} disabled={loading}>
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

          {errorLines.length > 0 && (
            <ul className="import-invalid-list">
              {errorLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}

          <p className="import-note">
            Os dados são buscados de verdade na API do Mercado Livre (é preciso estar conectado — veja o painel de
            busca automática acima). Nota e quantidade de avaliações não são informadas pela API para esse tipo de
            consulta e ficam como &quot;não informado&quot;.
          </p>
        </div>
      )}
    </section>
  );
}
