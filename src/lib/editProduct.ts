import { EditedFields, EditFormErrors, EditFormState } from "./types";

// --- Edição manual dos dados de um produto (principalmente itens importados),
// para substituir dados fictícios por informações reais encontradas no anúncio.
export function validateEditForm(f: EditFormState): EditFormErrors {
  const errors: EditFormErrors = {};
  if (!f.title.trim()) errors.title = "Informe um título.";
  if (!f.category.trim()) errors.category = "Informe uma categoria.";
  if (!f.seller.trim()) errors.seller = "Informe o vendedor ou loja.";
  if (!f.deliveryEstimate.trim()) errors.deliveryEstimate = "Informe o prazo de entrega.";

  const priceNum = parseFloat(f.price.replace(",", "."));
  if (f.price.trim() === "" || Number.isNaN(priceNum) || priceNum <= 0) {
    errors.price = "Informe um preço maior que zero.";
  }

  if (f.rating.trim() !== "") {
    const r = parseFloat(f.rating.replace(",", "."));
    if (Number.isNaN(r) || r < 0 || r > 5) errors.rating = "A nota deve ficar entre 0 e 5.";
  }

  if (f.reviewCount.trim() !== "") {
    const rc = Number(f.reviewCount);
    if (!Number.isInteger(rc) || rc < 0) errors.reviewCount = "Use um número inteiro maior ou igual a zero.";
  }

  if (f.freeShipping === "pago" && f.shippingCost.trim() !== "") {
    const sc = parseFloat(f.shippingCost.replace(",", "."));
    if (Number.isNaN(sc) || sc < 0) errors.shippingCost = "O valor do frete deve ser maior ou igual a zero.";
  }

  if (f.link.trim() !== "" && !/^https?:\/\//i.test(f.link.trim())) {
    errors.link = "O link deve começar com http:// ou https://.";
  }

  return errors;
}

export function buildEditedFields(f: EditFormState): EditedFields {
  const priceNum = parseFloat(f.price.replace(",", "."));
  const ratingNum = f.rating.trim() === "" ? null : parseFloat(f.rating.replace(",", "."));
  const reviewCountNum = f.reviewCount.trim() === "" ? null : Number(f.reviewCount);
  const freeShipping = f.freeShipping === "gratis";
  const shippingCostNum =
    !freeShipping && f.shippingCost.trim() !== "" ? parseFloat(f.shippingCost.replace(",", ".")) : null;
  return {
    title: f.title.trim(),
    category: f.category.trim(),
    price: priceNum,
    condition: f.condition,
    rating: ratingNum,
    reviewCount: reviewCountNum,
    seller: f.seller.trim(),
    reputation: f.reputation === "sem_informacao" ? null : f.reputation,
    freeShipping,
    shippingCost: shippingCostNum,
    deliveryEstimate: f.deliveryEstimate.trim(),
    link: f.link.trim(),
    edited: true,
  };
}
