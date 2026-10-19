import { Filters, Product, Status } from "./types";

export const DEFAULT_FILTERS: Filters = {
  query: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  minReviews: "",
  minSold: "",
  onlyNew: false,
  prioritizeFreeShipping: false,
};

export const STATUS_META: Record<Status, { label: string; icon: string; cls: string }> = {
  novo: { label: "Não revisado", icon: "dot", cls: "st-novo" },
  revisar: { label: "Em revisão", icon: "review", cls: "st-revisar" },
  aprovado: { label: "Aprovado para postar", icon: "check", cls: "st-aprovado" },
  descartado: { label: "Descartado", icon: "x", cls: "st-descartado" },
};

export const STATUS_ORDER: Status[] = ["novo", "revisar", "aprovado", "descartado"];

export const REPUTATION_LABEL: Record<string, string> = {
  alta: "alta",
  media: "média",
  baixa: "baixa",
};

// Dados fictícios para demonstração — sem integração real com Mercado Livre,
// Shopee, WhatsApp ou links de afiliado nesta etapa. Todo item aqui recebe
// `demo: true` (ver abaixo) para que a tela possa marcar claramente que não é
// um produto real, evitando confusão com os anúncios reais trazidos pela
// busca automática ou pela importação manual.
const RAW_DEMO_PRODUCTS: Product[] = [
  { id: 1, title: "Mouse sem fio NovaTech M220", category: "Tecnologia", icon: "tecnologia", price: 89.9, condition: "novo", rating: 4.6, reviewCount: 328, seller: "TechPoint Brasil", reputation: "alta", freeShipping: true, shippingCost: null, deliveryEstimate: "5 a 8 dias úteis", link: "https://example.com/anuncio/mouse-novatech-m220", status: "novo" },
  { id: 2, title: "Teclado mecânico RedForce K68 RGB", category: "Games", icon: "games", price: 219.9, condition: "novo", rating: 4.4, reviewCount: 156, seller: "GamerZone Store", reputation: "alta", freeShipping: true, shippingCost: null, deliveryEstimate: "6 a 10 dias úteis", link: "https://example.com/anuncio/teclado-redforce-k68", status: "novo" },
  { id: 3, title: "Headset gamer SoundWave H3", category: "Games", icon: "games", price: 134.5, condition: "novo", rating: 4.1, reviewCount: 92, seller: "AudioMais", reputation: "media", freeShipping: false, shippingCost: 19.9, deliveryEstimate: "7 a 12 dias úteis", link: "https://example.com/anuncio/headset-soundwave-h3", status: "novo" },
  { id: 4, title: "Suporte para notebook articulado ErgoDesk Pro", category: "Setup", icon: "setup", price: 76.0, condition: "novo", rating: 4.7, reviewCount: 410, seller: "Casa & Trabalho", reputation: "alta", freeShipping: true, shippingCost: null, deliveryEstimate: "4 a 7 dias úteis", link: "https://example.com/anuncio/suporte-ergodesk-pro", status: "novo" },
  { id: 5, title: "Power bank 20000mAh VoltCharge 20K", category: "Acessórios para celular", icon: "acessorios", price: 99.9, condition: "novo", rating: 4.3, reviewCount: 275, seller: "EnergyShop", reputation: "alta", freeShipping: true, shippingCost: null, deliveryEstimate: "5 a 9 dias úteis", link: "https://example.com/anuncio/powerbank-voltcharge-20k", status: "novo" },
  { id: 6, title: "Carregador USB-C 65W FastPlug GaN", category: "Acessórios para celular", icon: "acessorios", price: 68.9, condition: "novo", rating: 4.5, reviewCount: 198, seller: "PlugMais", reputation: "alta", freeShipping: true, shippingCost: null, deliveryEstimate: "5 a 8 dias úteis", link: "https://example.com/anuncio/carregador-fastplug-gan", status: "novo" },
  { id: 7, title: "Luminária de mesa LED LumiStudy Flex", category: "Estudo", icon: "estudo", price: 54.9, condition: "novo", rating: 4.2, reviewCount: 121, seller: "IluminaCasa", reputation: "media", freeShipping: false, shippingCost: 14.9, deliveryEstimate: "8 a 14 dias úteis", link: "https://example.com/anuncio/luminaria-lumistudy-flex", status: "novo" },
  { id: 8, title: "Mochila para notebook UrbanTech 15.6", category: "Setup", icon: "setup", price: 149.0, condition: "novo", rating: 4.0, reviewCount: 64, seller: "MalasCenter", reputation: "media", freeShipping: true, shippingCost: null, deliveryEstimate: "9 a 15 dias úteis", link: "https://example.com/anuncio/mochila-urbantech-15", status: "novo" },
  { id: 9, title: "Mousepad gamer XL DeskMat Aurora", category: "Games", icon: "games", price: 42.9, condition: "novo", rating: 4.6, reviewCount: 233, seller: "GamerZone Store", reputation: "alta", freeShipping: true, shippingCost: null, deliveryEstimate: "6 a 9 dias úteis", link: "https://example.com/anuncio/mousepad-deskmat-aurora", status: "novo" },
  { id: 10, title: "Webcam Full HD ClearView 1080", category: "Tecnologia", icon: "tecnologia", price: 112.0, condition: "novo", rating: 3.9, reviewCount: 47, seller: "VisãoDigital", reputation: "media", freeShipping: false, shippingCost: 22.0, deliveryEstimate: "10 a 16 dias úteis", link: "https://example.com/anuncio/webcam-clearview-1080", status: "novo" },
  { id: 11, title: "Suporte de celular articulado FlexArm", category: "Acessórios para celular", icon: "acessorios", price: 29.9, condition: "novo", rating: 4.4, reviewCount: 389, seller: "MobileFix", reputation: "alta", freeShipping: true, shippingCost: null, deliveryEstimate: "4 a 6 dias úteis", link: "https://example.com/anuncio/suporte-flexarm", status: "novo" },
  { id: 12, title: "Fone de ouvido Bluetooth EchoBuds Air (recondicionado)", category: "Acessórios para celular", icon: "acessorios", price: 119.0, condition: "usado", rating: 3.7, reviewCount: 28, seller: "ReCondiTech", reputation: "baixa", freeShipping: false, shippingCost: 24.9, deliveryEstimate: "12 a 20 dias úteis", link: "https://example.com/anuncio/fone-echobuds-air", status: "novo" },
  { id: 13, title: "Cadeira de escritório com apoio lombar ComfortSeat Basic", category: "Setup", icon: "setup", price: 389.0, condition: "novo", rating: 4.3, reviewCount: 71, seller: "MóveisJá", reputation: "media", freeShipping: true, shippingCost: null, deliveryEstimate: "10 a 18 dias úteis", link: "https://example.com/anuncio/cadeira-comfortseat-basic", status: "novo" },
  { id: 14, title: "Hub USB-C 7 em 1 ConnectAll Hub", category: "Tecnologia", icon: "tecnologia", price: 87.5, condition: "novo", rating: 4.5, reviewCount: 143, seller: "TechPoint Brasil", reputation: "alta", freeShipping: true, shippingCost: null, deliveryEstimate: "5 a 9 dias úteis", link: "https://example.com/anuncio/hub-connectall-7in1", status: "novo" },
  { id: 15, title: "Caderno inteligente reutilizável SmartNote Reuse", category: "Estudo", icon: "estudo", price: 64.9, condition: "novo", rating: 4.1, reviewCount: 58, seller: "PapelariaCriativa", reputation: "media", freeShipping: false, shippingCost: 12.9, deliveryEstimate: "7 a 11 dias úteis", link: "https://example.com/anuncio/caderno-smartnote-reuse", status: "novo" },
];

export const PRODUCTS: Product[] = RAW_DEMO_PRODUCTS.map((p) => ({ ...p, demo: true }));
