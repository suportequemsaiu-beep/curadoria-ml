import { ChangeEvent, FormEvent, useState } from "react";
import { buildEditedFields, validateEditForm } from "@/lib/editProduct";
import { EditedFields, EditFormErrors, EditFormState, Product } from "@/lib/types";
import Icon from "./Icon";

interface EditProductPanelProps {
  product: Product;
  affiliateLink: string;
  onSave: (fields: EditedFields, newAffiliateLink: string) => void;
  onCancel: () => void;
}

export default function EditProductPanel({ product, affiliateLink, onSave, onCancel }: EditProductPanelProps) {
  const [form, setForm] = useState<EditFormState>({
    title: product.title || "",
    category: product.category || "",
    price: product.price != null ? String(product.price).replace(".", ",") : "",
    condition: product.condition || "novo",
    rating: product.rating != null ? String(product.rating).replace(".", ",") : "",
    reviewCount: product.reviewCount != null ? String(product.reviewCount) : "",
    seller: product.seller || "",
    reputation: product.reputation || "sem_informacao",
    freeShipping: product.freeShipping ? "gratis" : "pago",
    shippingCost: product.shippingCost != null ? String(product.shippingCost).replace(".", ",") : "",
    deliveryEstimate: product.deliveryEstimate || "",
    link: product.link || "",
    affiliateLink: affiliateLink || "",
    description: product.description || "",
  });
  const [errors, setErrors] = useState<EditFormErrors>({});

  const set =
    (key: keyof EditFormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const val = e.target.value;
      setForm((prev) => ({ ...prev, [key]: val } as EditFormState));
    };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateEditForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onSave(buildEditedFields(form), form.affiliateLink.trim());
  };

  return (
    <div className="draft-overlay" onClick={onCancel}>
      <div
        className="draft-panel"
        role="dialog"
        aria-modal="true"
        aria-label={"Editar dados — " + product.title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="draft-header">
          <h3>Editar dados do produto</h3>
          <button type="button" className="draft-close" onClick={onCancel} aria-label="Fechar">
            <Icon name="x" size={18} />
          </button>
        </div>

        {product.imported && (
          <p className="edit-note">Você pode substituir os dados simulados deste item pelas informações reais do anúncio.</p>
        )}

        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="field field-wide">
            <label htmlFor="ed-title">Título</label>
            <input id="ed-title" type="text" value={form.title} onChange={set("title")} />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="field">
            <label htmlFor="ed-category">Categoria</label>
            <input id="ed-category" type="text" value={form.category} onChange={set("category")} />
            {errors.category && <span className="field-error">{errors.category}</span>}
          </div>

          <div className="field">
            <label htmlFor="ed-condition">Condição</label>
            <select id="ed-condition" value={form.condition} onChange={set("condition")}>
              <option value="novo">Novo</option>
              <option value="usado">Usado</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="ed-price">Preço (R$)</label>
            <input id="ed-price" type="text" inputMode="decimal" placeholder="Ex.: 99,90" value={form.price} onChange={set("price")} />
            {errors.price && <span className="field-error">{errors.price}</span>}
          </div>

          <div className="field">
            <label htmlFor="ed-rating">Nota (0 a 5)</label>
            <input
              id="ed-rating"
              type="text"
              inputMode="decimal"
              placeholder="Deixe vazio se não informado"
              value={form.rating}
              onChange={set("rating")}
            />
            {errors.rating && <span className="field-error">{errors.rating}</span>}
          </div>

          <div className="field">
            <label htmlFor="ed-reviews">Quantidade de avaliações</label>
            <input
              id="ed-reviews"
              type="text"
              inputMode="numeric"
              placeholder="Deixe vazio se não informado"
              value={form.reviewCount}
              onChange={set("reviewCount")}
            />
            {errors.reviewCount && <span className="field-error">{errors.reviewCount}</span>}
          </div>

          <div className="field">
            <label htmlFor="ed-seller">Vendedor / loja</label>
            <input id="ed-seller" type="text" value={form.seller} onChange={set("seller")} />
            {errors.seller && <span className="field-error">{errors.seller}</span>}
          </div>

          <div className="field">
            <label htmlFor="ed-reputation">Reputação do vendedor</label>
            <select id="ed-reputation" value={form.reputation} onChange={set("reputation")}>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
              <option value="sem_informacao">Sem informação</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="ed-shipping">Frete</label>
            <select id="ed-shipping" value={form.freeShipping} onChange={set("freeShipping")}>
              <option value="gratis">Grátis</option>
              <option value="pago">Pago</option>
            </select>
          </div>

          {form.freeShipping === "pago" && (
            <div className="field">
              <label htmlFor="ed-shipping-cost">Valor do frete (R$)</label>
              <input
                id="ed-shipping-cost"
                type="text"
                inputMode="decimal"
                placeholder="Deixe vazio se não informado"
                value={form.shippingCost}
                onChange={set("shippingCost")}
              />
              {errors.shippingCost && <span className="field-error">{errors.shippingCost}</span>}
            </div>
          )}

          <div className="field">
            <label htmlFor="ed-delivery">Prazo de entrega</label>
            <input id="ed-delivery" type="text" value={form.deliveryEstimate} onChange={set("deliveryEstimate")} />
            {errors.deliveryEstimate && <span className="field-error">{errors.deliveryEstimate}</span>}
          </div>

          <div className="field field-wide">
            <label htmlFor="ed-link">Link original do anúncio</label>
            <input id="ed-link" type="text" placeholder="https://..." value={form.link} onChange={set("link")} />
            {errors.link && <span className="field-error">{errors.link}</span>}
          </div>

          <div className="field field-wide">
            <label htmlFor="ed-affiliate">Link de afiliado (opcional)</label>
            <input
              id="ed-affiliate"
              type="text"
              placeholder="Cole aqui seu link de afiliado"
              value={form.affiliateLink}
              onChange={set("affiliateLink")}
            />
          </div>

          <div className="field field-wide">
            <label htmlFor="ed-description">Descrição/resumo do anúncio (opcional)</label>
            <textarea
              id="ed-description"
              className="import-textarea"
              value={form.description}
              onChange={set("description")}
              placeholder="Cole aqui parte da descrição do anúncio (ex.: volume, concentração, tipo)."
            />
            <p className="edit-note">Usado só para a análise automática de curadoria — não aparece na mensagem de WhatsApp.</p>
          </div>

          {product.imported && (
            <p className="edit-note field-wide">
              ID Mercado Livre: <span className="mono">{product.mlbId}</span>
              {product.sourceInput ? (
                <>
                  {" "}
                  · Origem: <span className="mono">{product.sourceInput}</span>
                </>
              ) : null}{" "}
              (não editável)
            </p>
          )}

          <div className="edit-actions field-wide">
            <button type="submit" className="btn btn-primary">
              Salvar alterações
            </button>
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancelar
            </button>
          </div>

          <p className="edit-note field-wide">Confirme os dados no anúncio antes de publicar.</p>
        </form>
      </div>
    </div>
  );
}
