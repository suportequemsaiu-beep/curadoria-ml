types parte1 OKcat

export type EditReputation = "alta" | "media" | "baixa" | "sem_informacao";
export type EditFreeShipping = "gratis" | "pago";

export interface EditFormState {
  title: string;
  category: string;
  price: string;
  condition: Condition;
  rating: string;
  reviewCount: string;
  seller: string;
  reputation: EditReputation;
  freeShipping: EditFreeShipping;
  shippingCost: string;
  deliveryEstimate: string;
  link: string;
  affiliateLink: string;
  description: string;
}

export type EditFormErrors = Partial<Record<keyof EditFormState, string>>;

export interface EditedFields {
  title: string;
  category: string;
  price: number;
  condition: Condition;
  rating: number | null;
  reviewCount: number | null;
  seller: string;
  reputation: Reputation;
  freeShipping: boolean;
  shippingCost: number | null;
  deliveryEstimate: string;
  link: string;
  description: string;
  edited: true;
}

// Mapas id-do-produto -> texto (links de afiliado, rascunhos, notas internas).
export type IdMap = Record<string, string>;

export interface BackupPayload {
  app: "Curadoria ML";
  backupVersion: number;
  exportedAt?: string;
  savedAt?: string;
  products: Product[];
  affiliateLinks: IdMap;
  messageDrafts: IdMap;
  internalNotes: IdMap;
  filters?: Filters;
}

export interface BackupData {
  products: Product[];
  affiliateLinks: IdMap;
  messageDrafts: IdMap;
  internalNotes: IdMap;
}

export type BackupValidation =
  | { valid: true; data: BackupData }
  | { valid: false; error: string };

export interface PersistedState {
  products: Product[];
  affiliateLinks: IdMap;
  drafts: IdMap;
  notes: IdMap;
  filters: Filters;
}
types parte2 OKcat
