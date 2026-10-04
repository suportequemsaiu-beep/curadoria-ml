import { Product } from "./types";

// Checagem mínima de formato reaproveitada pelo backup manual (JSON) e pela
// persistência automática (localStorage), para nunca aceitar dados corrompidos.
export function isValidProductsList(products: unknown): products is Product[] {
  if (!Array.isArray(products) || products.length === 0) return false;
  return !products.some(
    (p) =>
      !p ||
      typeof p !== "object" ||
      (typeof (p as Product).id !== "string" && typeof (p as Product).id !== "number") ||
      typeof (p as Product).title !== "string" ||
      typeof (p as Product).price !== "number"
  );
}

export function asIdMap(value: unknown): Record<string, string> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, string>;
  }
  return {};
}
