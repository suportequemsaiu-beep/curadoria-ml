// Tipos compartilhados do Curadoria ML.
// Espelham exatamente os formatos de dados usados no Artifact original.

export type Condition = "novo" | "usado";
export type Reputation = "alta" | "media" | "baixa" | null;
export type Status = "novo" | "revisar" | "aprovado" | "descartado";
export type ImportType = "id" | "link";

export interface Product {
  id: string | number;
  title: string;
  category: string;
  icon: string;
  price: number;
  condition: Condition;
  rating: number | null;
  reviewCount: number | null;
  seller: string;
  reputation: Reputation;
  freeShipping: boolean | null;
  shippingCost: number | null;
  soldQuantity?: number | null;
  deliveryEstimate: string;
  link: string;
  status: Status;
  imported?: boolean;
  demo?: boolean;
  edited?: boolean;
  mlbId?: string;
  importType?: ImportType;
  sourceInput?: string;
  description?: string;
}

export interface Filters {
  query: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  minReviews: string;
  minSold: string;
  onlyNew: boolean;
  prioritizeFreeShipping: boolean;
}

export interface ScorePoints {
  price: number;
  rating: number;
  reviews: number;
  shipping: number;
  reputation: number;
}

export interface ScoreAvailable {
  price: boolean;
  rating: boolean;
  reviews: boolean;
  shipping: boolean;
  reputation: boolean;
}

export interface ScoreResult {
  score: number;
  points: ScorePoints;
  available: ScoreAvailable;
}

export interface ScoredProduct extends Product {
  scoreResult: ScoreResult;
}

export interface ImportEntry {
  line: string;
  mlbId: string;
  type: ImportType;
  url?: string;
}

export interface ImportInvalidEntry {
  line: string;
  reason: string;
}

export interface ImportValidation {
  valid: ImportEntry[];
  invalid: ImportInvalidEntry[];
}

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
