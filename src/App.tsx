import React, { useMemo, useState } from "react";

// ── Comparison Engine ──────────────────────────────────────────────────────
// Data layer — maps product numeric IDs to engine string IDs
const PRODUCT_ID_MAP: Record<number, string> = {
  1: "brick-facing",
  2: "cement-m500",
  3: "drywall",
  4: "metal-profile",
  5: "putty-finish",
  6: "foam-block",
  7: "insulation",
  8: "paint-facade",
};

type Availability = "low" | "medium" | "high";

interface SupplierOffer {
  id: string;
  productId: string;
  supplierName: string;
  city: string;
  price: number;
  deliveryDays: number;
  availability: Availability;
  rating: number;
  lastUpdated: string;
}

interface RankedOffer {
  offer: SupplierOffer;
  score: number;
  rank: number;
  isBest: boolean;
  deliveryLabel: string;
  availabilityLabel: string;
  availabilityColor: string;
  priceVsAvg: number;
}

interface ComparisonResult {
  bestOffer: SupplierOffer;
  allOffers: RankedOffer[];
  savings: number;
  savingsPercent: number;
  cheapestPrice: number;
  mostExpensivePrice: number;
  avgPrice: number;
  fastestDelivery: number;
  recommendation: string;
}

// ── All supplier offers (Data Layer) ──────────────────────────────────────
// Replace fetchOffers() body with API call when ready for production
const ALL_SUPPLIER_OFFERS: SupplierOffer[] = [
  // Кирпич облицовочный
  { id:"o001", productId:"brick-facing", supplierName:"СтройБаза 24", city:"Оренбург", price:11980, deliveryDays:0, availability:"high", rating:4.8, lastUpdated:"2026-03-22T08:00:00Z" },
  { id:"o002", productId:"brick-facing", supplierName:"МегаСтрой", city:"Оренбург", price:12400, deliveryDays:1, availability:"medium", rating:4.5, lastUpdated:"2026-03-21T14:30:00Z" },
  { id:"o003", productId:"brick-facing", supplierName:"СтройМаркет", city:"Оренбург", price:13100, deliveryDays:2, availability:"high", rating:4.3, lastUpdated:"2026-03-20T10:00:00Z" },
  { id:"o004", productId:"brick-facing", supplierName:"КирпичОпт", city:"Оренбург", price:11750, deliveryDays:3, availability:"low", rating:4.1, lastUpdated:"2026-03-19T09:00:00Z" },
  { id:"o005", productId:"brick-facing", supplierName:"БазаСнаб", city:"Оренбург", price:14200, deliveryDays:1, availability:"high", rating:4.6, lastUpdated:"2026-03-22T07:00:00Z" },
  // Цемент М500
  { id:"o006", productId:"cement-m500", supplierName:"ПрофСнаб", city:"Оренбург", price:5400, deliveryDays:1, availability:"high", rating:4.7, lastUpdated:"2026-03-22T09:00:00Z" },
  { id:"o007", productId:"cement-m500", supplierName:"СтройОптом", city:"Оренбург", price:5800, deliveryDays:0, availability:"medium", rating:4.4, lastUpdated:"2026-03-21T11:00:00Z" },
  { id:"o008", productId:"cement-m500", supplierName:"БазаСнаб", city:"Оренбург", price:6100, deliveryDays:2, availability:"high", rating:4.2, lastUpdated:"2026-03-20T15:00:00Z" },
  { id:"o009", productId:"cement-m500", supplierName:"ЦементТорг", city:"Оренбург", price:4950, deliveryDays:4, availability:"low", rating:3.9, lastUpdated:"2026-03-18T08:00:00Z" },
  // Гипсокартон
  { id:"o010", productId:"drywall", supplierName:"СнабМаркет", city:"Оренбург", price:8300, deliveryDays:2, availability:"high", rating:4.9, lastUpdated:"2026-03-22T06:00:00Z" },
  { id:"o011", productId:"drywall", supplierName:"ГипсоТорг", city:"Оренбург", price:8700, deliveryDays:1, availability:"medium", rating:4.5, lastUpdated:"2026-03-21T16:00:00Z" },
  { id:"o012", productId:"drywall", supplierName:"СтройДом", city:"Оренбург", price:9100, deliveryDays:3, availability:"high", rating:4.2, lastUpdated:"2026-03-20T12:00:00Z" },
  { id:"o013", productId:"drywall", supplierName:"ЛистМастер", city:"Оренбург", price:7950, deliveryDays:5, availability:"low", rating:4.0, lastUpdated:"2026-03-17T09:00:00Z" },
  // Профиль металлический
  { id:"o014", productId:"metal-profile", supplierName:"МеталлТорг", city:"Оренбург", price:3900, deliveryDays:0, availability:"high", rating:4.6, lastUpdated:"2026-03-22T10:00:00Z" },
  { id:"o015", productId:"metal-profile", supplierName:"ПрофМetal", city:"Оренбург", price:4200, deliveryDays:1, availability:"medium", rating:4.4, lastUpdated:"2026-03-21T13:00:00Z" },
  { id:"o016", productId:"metal-profile", supplierName:"СтальСнаб", city:"Оренбург", price:4500, deliveryDays:2, availability:"high", rating:4.1, lastUpdated:"2026-03-20T11:00:00Z" },
  { id:"o017", productId:"metal-profile", supplierName:"МеталлБаза", city:"Оренбург", price:3750, deliveryDays:3, availability:"low", rating:4.0, lastUpdated:"2026-03-19T14:00:00Z" },
  // Шпаклёвка
  { id:"o018", productId:"putty-finish", supplierName:"ОтделкаПро", city:"Оренбург", price:4200, deliveryDays:1, availability:"high", rating:4.8, lastUpdated:"2026-03-22T08:30:00Z" },
  { id:"o019", productId:"putty-finish", supplierName:"ШпакляМастер", city:"Оренбург", price:4600, deliveryDays:0, availability:"medium", rating:4.5, lastUpdated:"2026-03-21T09:00:00Z" },
  { id:"o020", productId:"putty-finish", supplierName:"РемСнаб", city:"Оренбург", price:4900, deliveryDays:2, availability:"high", rating:4.3, lastUpdated:"2026-03-20T16:00:00Z" },
  { id:"o021", productId:"putty-finish", supplierName:"СтройОптом", city:"Оренбург", price:3980, deliveryDays:4, availability:"low", rating:3.8, lastUpdated:"2026-03-18T11:00:00Z" },
  // Пеноблок
  { id:"o022", productId:"foam-block", supplierName:"БлокСнаб", city:"Оренбург", price:15600, deliveryDays:2, availability:"high", rating:4.7, lastUpdated:"2026-03-22T07:30:00Z" },
  { id:"o023", productId:"foam-block", supplierName:"ПенобетонТорг", city:"Оренбург", price:16200, deliveryDays:3, availability:"medium", rating:4.4, lastUpdated:"2026-03-21T10:00:00Z" },
  { id:"o024", productId:"foam-block", supplierName:"СтройБаза М", city:"Оренбург", price:17000, deliveryDays:1, availability:"high", rating:4.3, lastUpdated:"2026-03-20T09:00:00Z" },
  { id:"o025", productId:"foam-block", supplierName:"БлокОптТорг", city:"Оренбург", price:14900, deliveryDays:5, availability:"low", rating:4.0, lastUpdated:"2026-03-17T14:00:00Z" },
  // Утеплитель
  { id:"o026", productId:"insulation", supplierName:"ТеплоСтрой", city:"Оренбург", price:6800, deliveryDays:2, availability:"high", rating:4.5, lastUpdated:"2026-03-22T11:00:00Z" },
  { id:"o027", productId:"insulation", supplierName:"ИзолТорг", city:"Оренбург", price:7200, deliveryDays:1, availability:"medium", rating:4.3, lastUpdated:"2026-03-21T15:00:00Z" },
  { id:"o028", productId:"insulation", supplierName:"УтеплМаркет", city:"Оренбург", price:7600, deliveryDays:3, availability:"high", rating:4.1, lastUpdated:"2026-03-20T08:00:00Z" },
  { id:"o029", productId:"insulation", supplierName:"МинватаОпт", city:"Оренбург", price:6400, deliveryDays:4, availability:"low", rating:3.9, lastUpdated:"2026-03-18T13:00:00Z" },
  // Краска
  { id:"o030", productId:"paint-facade", supplierName:"КраскаПро", city:"Оренбург", price:3200, deliveryDays:1, availability:"high", rating:4.6, lastUpdated:"2026-03-22T09:30:00Z" },
  { id:"o031", productId:"paint-facade", supplierName:"КолорМаркет", city:"Оренбург", price:3500, deliveryDays:0, availability:"medium", rating:4.4, lastUpdated:"2026-03-21T12:00:00Z" },
  { id:"o032", productId:"paint-facade", supplierName:"СтройКраска", city:"Оренбург", price:3800, deliveryDays:2, availability:"high", rating:4.2, lastUpdated:"2026-03-20T14:00:00Z" },
  { id:"o033", productId:"paint-facade", supplierName:"ЛКМОпт", city:"Оренбург", price:2950, deliveryDays:5, availability:"low", rating:3.8, lastUpdated:"2026-03-17T10:00:00Z" },
];

// ── Data Access Layer ──────────────────────────────────────────────────────
function fetchOffers(productId: string): SupplierOffer[] {
  // In production: replace with API call
  // return await api.get(`/offers?productId=${productId}`)
  return ALL_SUPPLIER_OFFERS.filter(o => o.productId === productId);
}

// ── Comparison Engine ──────────────────────────────────────────────────────
const WEIGHTS = { price: 0.55, delivery: 0.30, rating: 0.10, availability: 0.05 };

function scoreOffer(o: SupplierOffer, minP: number, maxP: number, maxD: number): number {
  const priceScore = (o.price - minP) / (maxP - minP || 1);
  const deliveryScore = maxD > 0 ? o.deliveryDays / maxD : 0;
  const ratingScore = 1 - (o.rating - 1) / 4;
  const availPenalty = o.availability === "high" ? 0 : o.availability === "medium" ? 0.3 : 0.7;
  return WEIGHTS.price * priceScore + WEIGHTS.delivery * deliveryScore + WEIGHTS.rating * ratingScore + WEIGHTS.availability * availPenalty;
}

function deliveryLabel(days: number): string {
  if (days === 0) return "Сегодня";
  if (days === 1) return "Завтра";
  return `${days} дня`;
}

function availLabel(a: string): { label: string; color: string } {
  if (a === "high") return { label: "В наличии", color: "text-emerald-400" };
  if (a === "medium") return { label: "Мало", color: "text-yellow-400" };
  return { label: "Под заказ", color: "text-slate-400" };
}

function runComparison(offers: SupplierOffer[]): ComparisonResult | null {
  if (!offers.length) return null;
  const prices = offers.map(o => o.price);
  const deliveries = offers.map(o => o.deliveryDays);
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const maxD = Math.max(...deliveries);
  const avgPrice = Math.round(prices.reduce((a,b) => a+b, 0) / prices.length);

  const scored = offers
    .map(o => ({ offer: o, score: scoreOffer(o, minP, maxP, maxD) }))
    .sort((a, b) => a.score - b.score);

  const allOffers: RankedOffer[] = scored.map((s, i) => {
    const av = availLabel(s.offer.availability);
    return {
      offer: s.offer,
      score: Math.round(s.score * 100) / 100,
      rank: i + 1,
      isBest: i === 0,
      deliveryLabel: deliveryLabel(s.offer.deliveryDays),
      availabilityLabel: av.label,
      availabilityColor: av.color,
      priceVsAvg: s.offer.price - avgPrice,
    };
  });

  const savings = maxP - minP;
  const savingsPercent = Math.round((savings / maxP) * 100);
  const best = allOffers[0].offer;
  const savStr = new Intl.NumberFormat("ru-RU").format(savings);
  const recommendation = savings === 0
    ? `${best.supplierName} — лучшее предложение.`
    : `Выбрав ${best.supplierName}, вы сэкономите ${savStr} ₽ (${savingsPercent}%) vs самого дорогого. Доставка: ${deliveryLabel(best.deliveryDays)}.`;

  return { bestOffer: best, allOffers, savings, savingsPercent, cheapestPrice: minP, mostExpensivePrice: maxP, avgPrice, fastestDelivery: Math.min(...deliveries), recommendation };
}

type Tab = "home" | "catalog" | "estimate" | "favorites" | "cart" | "profile";
type ProfileSection = "main" | "orders" | "purchases" | "settings" | "history";
type EstimateTool = "main" | "tile" | "wallpaper" | "paint" | "putty" | "drywall" | "laminate";
type Product = { id: number; name: string; price: number; oldPrice?: number; discount?: number; unit: string; supplier: string; delivery: string; rating: number; category: string; color: string; img: string };
type CatalogCategory = { id: number; title: string; icon: React.ReactNode };
type EstimateCard = { id: number; key: EstimateTool; title: string; subtitle: string; icon: React.ReactNode };
type CartItem = { product: Product; qty: number };

type Supplier = { name: string; price: number; delivery: string; rating: number; badge?: string };

const productSuppliers: Record<number, Supplier[]> = {
  1: [
    { name: "СтройБаза 24", price: 11980, delivery: "Сегодня", rating: 4.8, badge: "Лучшая цена" },
    { name: "МегаСтрой", price: 12400, delivery: "Завтра", rating: 4.6 },
    { name: "СтройМаркет", price: 13100, delivery: "2 дня", rating: 4.4 },
  ],
  2: [
    { name: "ПрофСнаб", price: 5400, delivery: "Завтра", rating: 4.7, badge: "Лучшая цена" },
    { name: "СтройОптом", price: 5800, delivery: "Сегодня", rating: 4.5 },
    { name: "БазаСнаб", price: 6100, delivery: "2 дня", rating: 4.3 },
  ],
  3: [
    { name: "СнабМаркет", price: 8300, delivery: "2 дня", rating: 4.9, badge: "Лучшая цена" },
    { name: "ГипсоТорг", price: 8700, delivery: "Завтра", rating: 4.5 },
    { name: "СтройДом", price: 9100, delivery: "3 дня", rating: 4.2 },
  ],
  4: [
    { name: "МеталлТорг", price: 3900, delivery: "Сегодня", rating: 4.6, badge: "Лучшая цена" },
    { name: "ПрофМetal", price: 4200, delivery: "Завтра", rating: 4.4 },
    { name: "СтальСнаб", price: 4500, delivery: "2 дня", rating: 4.1 },
  ],
  5: [
    { name: "ОтделкаПро", price: 4200, delivery: "Завтра", rating: 4.8, badge: "Лучшая цена" },
    { name: "ШпакляМастер", price: 4600, delivery: "Сегодня", rating: 4.5 },
    { name: "РемСнаб", price: 4900, delivery: "2 дня", rating: 4.3 },
  ],
  6: [
    { name: "БлокСнаб", price: 15600, delivery: "2 дня", rating: 4.7, badge: "Лучшая цена" },
    { name: "ПенобетонТорг", price: 16200, delivery: "3 дня", rating: 4.4 },
    { name: "СтройБаза М", price: 17000, delivery: "Завтра", rating: 4.3 },
  ],
  7: [
    { name: "ТеплоСтрой", price: 6800, delivery: "2 дня", rating: 4.5, badge: "Лучшая цена" },
    { name: "ИзолТорг", price: 7200, delivery: "Завтра", rating: 4.3 },
    { name: "УтеплМаркет", price: 7600, delivery: "3 дня", rating: 4.1 },
  ],
  8: [
    { name: "КраскаПро", price: 3200, delivery: "Завтра", rating: 4.6, badge: "Лучшая цена" },
    { name: "КолорМаркет", price: 3500, delivery: "Сегодня", rating: 4.4 },
    { name: "СтройКраска", price: 3800, delivery: "2 дня", rating: 4.2 },
  ],
};

const products: Product[] = [
  { id: 1, name: "Кирпич облицовочный", price: 11980, oldPrice: 14500, discount: 17, unit: "200 шт", supplier: "СтройБаза 24", delivery: "Сегодня", rating: 4.8, category: "Блоки и кирпич", color: "from-yellow-400 to-amber-500", img: "https://images.unsplash.com/photo-1564767655658-4e3f5a00d783?w=400&q=80" },
  { id: 2, name: "Цемент М500", price: 5400, oldPrice: 6200, discount: 13, unit: "10 мешков", supplier: "ПрофСнаб", delivery: "Завтра", rating: 4.7, category: "Сухие смеси", color: "from-slate-300 to-slate-500", img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80" },
  { id: 3, name: "Гипсокартон влагостойкий", price: 8300, oldPrice: 9400, discount: 12, unit: "15 листов", supplier: "СнабМаркет", delivery: "2 дня", rating: 4.9, category: "Листовые материалы", color: "from-emerald-300 to-emerald-500", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80" },
  { id: 4, name: "Профиль металлический", price: 3900, oldPrice: 4500, discount: 14, unit: "30 шт", supplier: "МеталлТорг", delivery: "Сегодня", rating: 4.6, category: "Металлопрокат", color: "from-zinc-200 to-zinc-400", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80" },
  { id: 5, name: "Шпаклёвка финишная", price: 4200, oldPrice: 5100, discount: 18, unit: "8 мешков", supplier: "ОтделкаПро", delivery: "Завтра", rating: 4.8, category: "Сухие смеси", color: "from-orange-300 to-orange-500", img: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80" },
  { id: 6, name: "Пеноблок стеновой", price: 15600, oldPrice: 18100, discount: 14, unit: "2 поддона", supplier: "БлокСнаб", delivery: "2 дня", rating: 4.7, category: "Блоки и кирпич", color: "from-stone-300 to-stone-500", img: "https://images.unsplash.com/photo-1590593162201-f67611a18b87?w=400&q=80" },
  { id: 7, name: "Утеплитель минвата", price: 6800, oldPrice: 7900, discount: 14, unit: "10 плит", supplier: "ТеплоСтрой", delivery: "2 дня", rating: 4.5, category: "Теплоизоляция", color: "from-sky-300 to-sky-500", img: "https://images.unsplash.com/photo-1607400201515-c2c41c08da2f?w=400&q=80" },
  { id: 8, name: "Краска фасадная белая", price: 3200, oldPrice: 3800, discount: 16, unit: "10 л", supplier: "КраскаПро", delivery: "Завтра", rating: 4.6, category: "Лакокрасочные материалы", color: "from-blue-200 to-blue-400", img: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80" },
];

const catalogCategories: CatalogCategory[] = [
  { id: 1, title: "Листовые материалы", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><rect x="3" y="3" width="18" height="14" rx="2" stroke="#FACC15" strokeWidth="1.6"/><path d="M3 9h18M3 13h18" stroke="#FACC15" strokeWidth="1.2"/></svg> },
  { id: 2, title: "Сухие смеси и грунтовки", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M7 20V8l5-5 5 5v12H7z" stroke="#FACC15" strokeWidth="1.6" strokeLinejoin="round"/><path d="M10 20v-6h4v6" stroke="#FACC15" strokeWidth="1.4"/></svg> },
  { id: 3, title: "Теплоизоляция", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><rect x="3" y="6" width="18" height="12" rx="3" stroke="#FACC15" strokeWidth="1.6"/><path d="M3 12h18" stroke="#FACC15" strokeWidth="1.2" strokeDasharray="3 2"/></svg> },
  { id: 4, title: "Блоки и кирпич", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><rect x="2" y="5" width="9" height="5" rx="1" stroke="#FACC15" strokeWidth="1.5"/><rect x="13" y="5" width="9" height="5" rx="1" stroke="#FACC15" strokeWidth="1.5"/><rect x="6" y="13" width="12" height="5" rx="1" stroke="#FACC15" strokeWidth="1.5"/></svg> },
  { id: 5, title: "Металлопрокат", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M4 8h16M4 12h16M4 16h16" stroke="#FACC15" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 6, title: "Кровля", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M3 13L12 4l9 9" stroke="#FACC15" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><rect x="8" y="13" width="8" height="8" rx="1" stroke="#FACC15" strokeWidth="1.5"/></svg> },
  { id: 7, title: "Фасадные материалы", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#FACC15" strokeWidth="1.5"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke="#FACC15" strokeWidth="1.1"/></svg> },
  { id: 8, title: "Профиль и комплектующие", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M4 6h16M4 12h16M4 18h10" stroke="#FACC15" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 9, title: "Строительные расходники", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M14.5 3L21 9.5 9.5 21l-7-7L14.5 3z" stroke="#FACC15" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
  { id: 10, title: "Шумоизоляция", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M9 9H5a1 1 0 00-1 1v4a1 1 0 001 1h4l6 5V4L9 9z" stroke="#FACC15" strokeWidth="1.6" strokeLinejoin="round"/><path d="M17 9a4 4 0 010 6" stroke="#FACC15" strokeWidth="1.6" strokeLinecap="round"/></svg> },
  { id: 11, title: "Гидроизоляция", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M12 3C12 3 5 10 5 15a7 7 0 0014 0c0-5-7-12-7-12z" stroke="#FACC15" strokeWidth="1.6" strokeLinejoin="round"/></svg> },
  { id: 12, title: "Товары оптом", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><rect x="3" y="10" width="18" height="11" rx="1.5" stroke="#FACC15" strokeWidth="1.5"/><path d="M8 10V7a4 4 0 018 0v3" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 13, title: "Плитка и керамогранит", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><rect x="3" y="3" width="8" height="8" rx="1.2" stroke="#FACC15" strokeWidth="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.2" stroke="#FACC15" strokeWidth="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.2" stroke="#FACC15" strokeWidth="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.2" stroke="#FACC15" strokeWidth="1.5"/></svg> },
  { id: 14, title: "Обои и декор стен", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#FACC15" strokeWidth="1.5"/><path d="M3 9c3-2 6 2 9 0s6-2 9 0M3 15c3-2 6 2 9 0s6-2 9 0" stroke="#FACC15" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { id: 15, title: "Лакокрасочные материалы", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M8 3h8l1 9H7L8 3z" stroke="#FACC15" strokeWidth="1.5" strokeLinejoin="round"/><rect x="6" y="12" width="12" height="3" rx="1" stroke="#FACC15" strokeWidth="1.3"/><path d="M10 15v4a2 2 0 004 0v-4" stroke="#FACC15" strokeWidth="1.4"/></svg> },
  { id: 16, title: "Электрика", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M13 3L4 14h8l-1 7 9-11h-8l1-7z" stroke="#FACC15" strokeWidth="1.6" strokeLinejoin="round"/></svg> },
  { id: 17, title: "Сантехника", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M4 12h10a4 4 0 010 8H4" stroke="#FACC15" strokeWidth="1.6" strokeLinecap="round"/><circle cx="7" cy="7" r="4" stroke="#FACC15" strokeWidth="1.5"/></svg> },
  { id: 18, title: "Инструменты", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a6 6 0 01-7 7l-7 7a2 2 0 01-3-3l7-7a6 6 0 017-7l-3 3z" stroke="#FACC15" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
];

const estimateCards: EstimateCard[] = [
  { id: 1, key: "tile", title: "Расчёт плитки", subtitle: "Пол и стены", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><rect x="3" y="3" width="8" height="8" rx="1.2" stroke="#FACC15" strokeWidth="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.2" stroke="#FACC15" strokeWidth="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.2" stroke="#FACC15" strokeWidth="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.2" stroke="#FACC15" strokeWidth="1.5"/></svg> },
  { id: 2, key: "wallpaper", title: "Расчёт обоев", subtitle: "Комнаты и стены", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#FACC15" strokeWidth="1.5"/><path d="M3 9c3-2 6 2 9 0s6-2 9 0M3 15c3-2 6 2 9 0s6-2 9 0" stroke="#FACC15" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { id: 3, key: "paint", title: "Расчёт краски", subtitle: "Расход по площади", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M8 3h8l1 9H7L8 3z" stroke="#FACC15" strokeWidth="1.5" strokeLinejoin="round"/><rect x="6" y="12" width="12" height="3" rx="1" stroke="#FACC15" strokeWidth="1.3"/><path d="M10 15v4a2 2 0 004 0v-4" stroke="#FACC15" strokeWidth="1.4"/></svg> },
  { id: 4, key: "putty", title: "Расчёт шпаклёвки", subtitle: "Черновая отделка", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><rect x="3" y="3" width="18" height="14" rx="2" stroke="#FACC15" strokeWidth="1.5"/><path d="M3 10h18" stroke="#FACC15" strokeWidth="1.3"/><path d="M8 17v4M16 17v4" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 5, key: "drywall", title: "Расчёт гипсокартона", subtitle: "Листы и профиль", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><rect x="3" y="3" width="18" height="18" rx="1.5" stroke="#FACC15" strokeWidth="1.5"/><path d="M3 12h18M12 3v18" stroke="#FACC15" strokeWidth="1.2" strokeDasharray="3 2"/></svg> },
  { id: 6, key: "laminate", title: "Расчёт ламината", subtitle: "Пол + запас", icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><rect x="3" y="5" width="18" height="4" rx="1" stroke="#FACC15" strokeWidth="1.4"/><rect x="3" y="11" width="18" height="4" rx="1" stroke="#FACC15" strokeWidth="1.4"/><rect x="3" y="17" width="18" height="4" rx="1" stroke="#FACC15" strokeWidth="1.4"/></svg> },
];

const cities = ["Москва","Санкт-Петербург","Оренбург","Екатеринбург","Новосибирск","Казань","Краснодар","Уфа","Челябинск","Самара"];

function formatPrice(v: number) { return new Intl.NumberFormat("ru-RU").format(v) + " ₽"; }

// ── Логотип ───────────────────────────────────────────────────────────────────
function StrovoLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="gl" cx="35%" cy="28%" r="40%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.13"/>
          <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <line x1="27" y1="65" x2="12" y2="83" stroke="#c8a000" strokeWidth="10" strokeLinecap="round"/>
      <line x1="27" y1="65" x2="12" y2="83" stroke="#FACC15" strokeWidth="7.5" strokeLinecap="round"/>
      <circle cx="55" cy="43" r="34" fill="#1a2744" stroke="#c8a000" strokeWidth="6"/>
      <circle cx="55" cy="43" r="34" fill="none" stroke="#FACC15" strokeWidth="4.5"/>
      <circle cx="55" cy="43" r="34" fill="url(#gl)"/>
      <rect x="34" y="30" width="26" height="12" rx="2.5" fill="#FACC15"/>
      <rect x="62" y="30" width="13" height="12" rx="2.5" fill="#FACC15"/>
      <rect x="34" y="42" width="41" height="2" rx="1" fill="#1a2744"/>
      <rect x="34" y="44" width="13" height="12" rx="2.5" fill="#FACC15"/>
      <rect x="49" y="44" width="26" height="12" rx="2.5" fill="#FACC15"/>
      <rect x="60" y="30" width="2" height="12" rx="1" fill="#1a2744"/>
      <rect x="47" y="44" width="2" height="12" rx="1" fill="#1a2744"/>
    </svg>
  );
}

// ── Nav Icons ─────────────────────────────────────────────────────────────────
const NavHomeIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" fill={active ? "#FACC15" : "#9ca3af"} />
    <rect x="7" y="12" width="6" height="6" rx="1" fill={active ? "#a16207" : "#e5e7eb"} />
  </svg>
);
const NavCatalogIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="3" width="6" height="6" rx="1.5" fill={active ? "#FACC15" : "#64748b"} />
    <rect x="11" y="3" width="6" height="6" rx="1.5" fill={active ? "#FACC15" : "#64748b"} />
    <rect x="3" y="11" width="6" height="6" rx="1.5" fill={active ? "#FACC15" : "#64748b"} />
    <rect x="11" y="11" width="6" height="6" rx="1.5" fill={active ? "#FACC15" : "#64748b"} />
  </svg>
);
const NavEstimateIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="2" width="14" height="16" rx="2" stroke={active ? "#FACC15" : "#64748b"} strokeWidth="1.8" />
    <path d="M6.5 7h7M6.5 10.5h7M6.5 14h4.5" stroke={active ? "#FACC15" : "#64748b"} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const NavHeartIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 15.5S3.5 11.5 3.5 7A3.5 3.5 0 0110 4.8 3.5 3.5 0 0116.5 7c0 4.5-6.5 8.5-6.5 8.5z"
      fill={active ? "#FACC15" : "none"} stroke={active ? "#FACC15" : "#64748b"} strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);
const NavCartIcon = ({ active, count = 0 }: { active: boolean; count?: number }) => (
  <div className="relative flex items-center justify-center">
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
      <path d="M2 3h2.5l2 8h9l1.8-5.5H6.5" stroke={active || count>0 ? "#FACC15" : "#64748b"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="15.5" r="1.5" fill={active || count>0 ? "#FACC15" : "#64748b"} />
      <circle cx="14" cy="15.5" r="1.5" fill={active || count>0 ? "#FACC15" : "#64748b"} />
    </svg>
    {count > 0 && (
      <div className="absolute flex items-center justify-center rounded-full bg-yellow-400 font-bold text-black leading-none"
        style={{
          top: "-3px",
          right: "-3px",
          height: "15px",
          minWidth: "15px",
          width: "auto",
          paddingLeft: count > 9 ? "5px" : "0",
          paddingRight: count > 9 ? "5px" : "0",
          fontSize: count > 9 ? "8px" : "9px",
          transformOrigin: "right center",
        }}>
        {count > 99 ? "99+" : count}
      </div>
    )}
  </div>
);
const NavProfileIcon = ({ active }: { active: boolean }) => {
  const c = active ? "#FACC15" : "#64748b";
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 20 C2 14 5 12 10 12 C15 12 18 14 18 20Z" fill={c}/>
      <circle cx="10" cy="10" r="3.2" fill={c}/>
      <path d="M7.2 10 Q7.2 5 10 5 Q12.8 5 12.8 10Z" fill={c}/>
      <rect x="5.5" y="9.3" width="9" height="1.4" rx="0.7" fill={c}/>
    </svg>
  );
};

// ── Онбординг выбор города ────────────────────────────────────────────────────
function CityScreen({ onDone }: { onDone: (city: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = cities.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="screen-bg flex flex-col h-full px-5 pt-10">
      <div className="flex flex-col items-center gap-3 mb-8">
        <StrovoLogo size={56} />
        <div className="text-main text-2xl font-bold">Ваш город?</div>
        <div className="text-sm text-slate-400 text-center">Покажем актуальные цены и доставку</div>
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 mb-4 h-12">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4" stroke="#64748b" strokeWidth="1.6"/><path d="M10 10l3 3" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск города..." className="flex-1 bg-transparent text-main text-base outline-none placeholder:text-sub"/>
      </div>
      <div className="hide-scrollbar flex-1 overflow-y-auto space-y-2 pb-8">
        {filtered.map(city => (
          <button key={city} onClick={() => onDone(city)} className="w-full flex items-center justify-between rounded-2xl card-bg-raw px-4 py-4 text-left hover:card-bg-raw">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#FACC15" strokeWidth="1.6"/><circle cx="12" cy="9" r="2.5" stroke="#FACC15" strokeWidth="1.4"/></svg>
              <span className="text-main font-medium">{city}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M7 4l6 6-6 6" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Сплэш ─────────────────────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { title: "Strovo — стройка без переплат", sub: "Агрегатор стройматериалов для прорабов и бригадиров" },
    { title: "500+ поставщиков в одном месте", sub: "Сравнивай цены и находи лучшие предложения за секунды" },
    { title: "Сметный калькулятор бесплатно", sub: "Плитка, обои, краска, ламинат — считай прямо в приложении" },
  ];
  const next = () => { if (slide < slides.length - 1) setSlide(s => s + 1); else onDone(); };
  return (
    <div className="screen-bg flex flex-col h-full px-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <StrovoLogo size={90} />
          <span className="text-main text-3xl font-bold tracking-tight">Strovo</span>
          <span className="text-xs text-slate-500 tracking-widest uppercase">стройка без переплат</span>
        </div>
        <div className="w-full rounded-[24px] card-bg-raw p-6 min-h-[130px] flex flex-col justify-center gap-3">
          <div className="text-main text-lg font-bold leading-snug">{slides[slide].title}</div>
          <div className="text-sm text-slate-400 leading-relaxed">{slides[slide].sub}</div>
        </div>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-6 bg-yellow-400" : "w-1.5 bg-slate-700"}`} />
          ))}
        </div>
      </div>
      <div className="pb-12 flex flex-col gap-3">
        <button onClick={next} className="w-full rounded-2xl bg-yellow-400 py-4 font-bold text-black text-base">
          {slide < slides.length - 1 ? "Далее" : "Начать"}
        </button>
        {slide < slides.length - 1 && (
          <button onClick={onDone} className="w-full py-3 text-sm text-slate-500">Пропустить</button>
        )}
      </div>
    </div>
  );
}

// ── Шапки ─────────────────────────────────────────────────────────────────────
function TopBarMain({ setTab, onSearchOpen }: { setTab: (t: Tab) => void; onSearchOpen: () => void }) {
  return (
    <div className="topbar-bg sticky top-0 z-40 px-4 pt-3 pb-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="text-main text-xl font-bold">22:42</div>
        <div className="flex items-center gap-2">
          <StrovoLogo size={28} />
          <div className="flex flex-col">
            <span className="text-main text-base font-bold leading-none">Strovo</span>
            <span className="text-sub text-[9px] leading-none tracking-wide">стройка без переплат</span>
          </div>
        </div>
        <div className="text-main text-xs">LTE 84</div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setTab("catalog")} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 light:bg-gray-100 border border-white/5 light:border-gray-200" style={{background:"var(--btn-bg)",border:"1px solid var(--btn-border)"}}>
          <NavCatalogIcon active={false} />
        </button>
        <button onClick={onSearchOpen} className="flex h-11 flex-1 items-center gap-2 rounded-full px-4" style={{background:"var(--btn-bg)",border:"1px solid var(--btn-border)"}}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4" stroke="#64748b" strokeWidth="1.6"/><path d="M10 10l3 3" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/></svg>
          <span className="text-sub text-base">Найти товары</span>
        </button>
        <button onClick={() => setTab("profile")} className="flex h-11 w-11 items-center justify-center rounded-full" style={{background:"var(--btn-bg)",border:"1px solid var(--btn-border)"}}>
          <NavProfileIcon active={false} />
        </button>
      </div>
    </div>
  );
}

function TopBarInner({ title, onBack, showSearch = true }: { title: string; onBack: () => void; showSearch?: boolean }) {
  return (
    <div className="topbar-bg sticky top-0 z-40 px-4 pt-3 pb-3">
      <div className="mb-1 flex items-center justify-between px-1">
        <div className="text-main text-xl font-bold">22:42</div>
        <div className="text-main text-xs">LTE 84</div>
      </div>
      <div className="flex items-center gap-3 py-1">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full" style={{background:"var(--btn-bg)",border:"1px solid var(--btn-border)"}}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10l6 6" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="text-main flex-1 text-center text-base font-semibold">{title}</div>
        {showSearch ? (
          <button className="flex h-10 w-10 items-center justify-center rounded-full" style={{background:"var(--btn-bg)",border:"1px solid var(--btn-border)"}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5" stroke="#64748b" strokeWidth="1.8"/><path d="M13 13l3.5 3.5" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        ) : (
          <div className="h-10 w-10"/>
        )}
      </div>
    </div>
  );
}

function TopBarTitle({ title, onSearchOpen }: { title: string; onSearchOpen: () => void }) {
  return (
    <div className="topbar-bg sticky top-0 z-40 px-4 pt-3 pb-3">
      <div className="mb-1 flex items-center justify-between px-1">
        <div className="text-main text-xl font-bold">22:42</div>
        <div className="text-main text-xs">LTE 84</div>
      </div>
      <div className="flex items-center gap-3 py-1">
        <div className="h-10 w-10" />
        <div className="text-main flex-1 text-center text-base font-semibold">{title}</div>
        <button onClick={onSearchOpen} className="flex h-10 w-10 items-center justify-center rounded-full" style={{background:"var(--btn-bg)",border:"1px solid var(--btn-border)"}}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5" stroke="#64748b" strokeWidth="1.8"/><path d="M13 13l3.5 3.5" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </div>
    </div>
  );
}

// ── Карточка товара (детальный экран) ─────────────────────────────────────────
function ProductDetailScreen({ item, onBack, onAdd, onOpen, isFavorite, onToggleFavorite }: {
  item: Product; onBack: () => void; onAdd: (item: Product) => void;
  onOpen: (item: Product) => void;
  isFavorite: boolean; onToggleFavorite: (id: number) => void;
}) {
  // ── REAL COMPARISON ENGINE ─────────────────────────────────────────────
  const engineProductId = PRODUCT_ID_MAP[item.id];
  const offers = React.useMemo(() => fetchOffers(engineProductId), [engineProductId]);
  const comparison = React.useMemo(() => runComparison(offers), [offers]);

  // selectedRank: 0 = best offer (default), user can change
  const [selectedRank, setSelectedRank] = React.useState(0);
  const selectedOffer = comparison?.allOffers[selectedRank]?.offer ?? comparison?.bestOffer;
  // ──────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <TopBarInner title={item.name} onBack={onBack} />
      <div className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-24">
        {/* Картинка товара */}
        <div className="relative h-56 rounded-[24px] overflow-hidden mb-4">
          <img src={item.img} alt={item.name} className="h-full w-full object-cover"/>
          <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent`}/>
          <button onClick={() => onToggleFavorite(item.id)} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 15.5S3.5 11.5 3.5 7A3.5 3.5 0 0110 4.8 3.5 3.5 0 0116.5 7c0 4.5-6.5 8.5-6.5 8.5z"
                fill={isFavorite ? "#ef4444" : "none"} stroke={isFavorite ? "#ef4444" : "#64748b"} strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="absolute left-4 top-4 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">-{item.discount}%</div>
        </div>

        {/* Название и рейтинг */}
        <div className="mb-4">
          <div className="text-main text-lg font-bold leading-snug">{item.name}</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-yellow-400 text-sm">★ {item.rating}</span>
            <span className="text-slate-500 text-sm">· {item.unit}</span>
          </div>
        </div>

        {comparison && (
          <>
            {/* ── SAVINGS BLOCK — "Вы экономите X ₽" ─────────────────────── */}
            {comparison.savings > 0 && (
              <div className="rounded-[16px] bg-emerald-400/10 border border-emerald-400/20 px-4 py-3 mb-3 flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="#34d399" opacity="0.3"/><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" stroke="#34d399" strokeWidth="1.4"/></svg>
                <div>
                  <div className="text-emerald-400 text-sm font-bold">
                    Экономия до {formatPrice(comparison.savings)} ({comparison.savingsPercent}%)
                  </div>
                  <div className="text-emerald-400/70 text-xs mt-0.5">
                    vs самого дорогого предложения
                  </div>
                </div>
              </div>
            )}

            {/* ── SELECTED OFFER BLOCK ─────────────────────────────────── */}
            <div className="rounded-[20px] card-bg-raw p-4 mb-3 border border-yellow-400/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                  {selectedRank === 0 ? "Лучшее предложение" : "Выбранный поставщик"}
                </span>
                {selectedRank === 0 && (
                  <span className="text-xs text-slate-500">рассчитано автоматически</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{formatPrice(selectedOffer?.price ?? item.price)}</div>
                  <div className="text-sm text-slate-400 mt-0.5">
                    {selectedOffer?.supplierName} · {deliveryLabel(selectedOffer?.deliveryDays ?? 0)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">★ {selectedOffer?.rating}</span>
                    <span className={`text-xs ${selectedOffer?.availability === "high" ? "text-emerald-400" : selectedOffer?.availability === "medium" ? "text-yellow-400" : "text-slate-400"}`}>
                      {selectedOffer?.availability === "high" ? "В наличии" : selectedOffer?.availability === "medium" ? "Мало" : "Под заказ"}
                    </span>
                  </div>
                </div>
                <button onClick={() => {
                  const p = {...item, price: selectedOffer?.price ?? item.price, supplier: selectedOffer?.supplierName ?? item.supplier};
                  onAdd(p);
                }} className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black text-sm">В корзину</button>
              </div>
            </div>

            {/* ── ALL OFFERS — sorted by engine score ──────────────────── */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-sm text-slate-400">Все предложения ({comparison.allOffers.length})</span>
                <span className="text-xs text-slate-500">Средняя: {formatPrice(comparison.avgPrice)}</span>
              </div>
              <div className="space-y-2">
                {comparison.allOffers.map((ranked, i) => (
                  <div key={ranked.offer.id}
                    onClick={() => setSelectedRank(i)}
                    className={`rounded-[16px] card-bg-raw p-4 flex items-center justify-between cursor-pointer transition-all ${selectedRank===i?"border border-yellow-400/60":""}`}>
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedRank===i?"border-yellow-400":"border-slate-600"}`}>
                        {selectedRank===i && <div className="h-2 w-2 rounded-full bg-yellow-400"/>}
                      </div>
                      <div>
                        <div className="text-main text-sm font-semibold">{ranked.offer.supplierName}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">★ {ranked.offer.rating}</span>
                          <span className="text-slate-600 text-xs">·</span>
                          <span className="text-xs text-slate-400">{ranked.deliveryLabel}</span>
                          <span className="text-slate-600 text-xs">·</span>
                          <span className={`text-xs ${ranked.availabilityColor}`}>{ranked.availabilityLabel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`text-base font-bold ${selectedRank===i?"text-yellow-400":"text-main"}`}>
                        {formatPrice(ranked.offer.price)}
                      </div>
                      {ranked.isBest && (
                        <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full font-medium">Выгоднее</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RECOMMENDATION ───────────────────────────────────────── */}
            <div className="rounded-[16px] bg-yellow-400/5 border border-yellow-400/15 px-4 py-3 mb-3">
              <div className="text-xs text-yellow-400/80 font-semibold mb-1">💡 Рекомендация Strovo</div>
              <div className="text-xs text-slate-400 leading-relaxed">{comparison.recommendation}</div>
            </div>
          </>
        )}

        {/* Характеристики */}
        <div className="rounded-[20px] card-bg-raw p-4 mb-3">
          <div className="text-main text-sm font-semibold mb-3">Характеристики</div>
          <div className="space-y-2">
            {[["Категория", item.category], ["Единица", item.unit], ["Рейтинг", `★ ${item.rating}`], ["Доставка", item.delivery]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 border-b">
                <span className="text-sub text-sm">{k}</span>
                <span className="text-main text-sm">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* С этим также смотрят */}
        <div className="mb-3">
          <div className="text-main text-sm font-semibold mb-2 px-1">С этим также смотрят</div>
          <div className="flex gap-3 pb-1" style={{overflowX:"auto",WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory",scrollbarWidth:"none",msOverflowStyle:"none"}}>
            {products.filter(p => p.id !== item.id).slice(0,5).map(p => (
              <button key={p.id} onClick={() => onOpen(p)} className="shrink-0 w-36 rounded-[16px] card-bg-raw overflow-hidden text-left" style={{scrollSnapAlign:"start"}}>
                <div className="relative h-24 overflow-hidden">
                  <img src={p.img} alt={p.name} className="h-full w-full object-cover"/>
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-20`}/>
                </div>
                <div className="p-2">
                  <div className="text-main text-xs line-clamp-2 leading-snug">{p.name}</div>
                  <div className="mt-1 text-sm font-bold text-yellow-400">{formatPrice(p.price)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Поиск ─────────────────────────────────────────────────────────────────────
function SearchScreen({ onClose, onAdd, favorites, onToggleFavorite, onOpenProduct }: {
  onClose: () => void; onAdd: (item: Product) => void;
  favorites: Set<number>; onToggleFavorite: (id: number) => void;
  onOpenProduct: (item: Product) => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()));
  }, [query]);
  return (
    <div className="flex flex-col h-full screen-bg">
      <div className="topbar-bg px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10l6 6" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Найти товары..." className="input-bg flex-1 h-11 rounded-full px-4 text-main text-base outline-none placeholder:text-sub"/>
      </div>
      <div className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        {query.trim() === "" && <div className="mt-8 text-center text-slate-500 text-sm">Введите название товара или категорию</div>}
        {query.trim() !== "" && results.length === 0 && <div className="mt-8 text-center text-slate-500 text-sm">Ничего не найдено по запросу «{query}»</div>}
        {results.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {results.map(item => <ProductCard key={item.id} item={item} isFavorite={favorites.has(item.id)} onToggleFavorite={onToggleFavorite} onAdd={onAdd} onOpen={onOpenProduct}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ item, isFavorite, onToggleFavorite, onAdd, onOpen }: {
  item: Product; isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onAdd: (item: Product) => void;
  onOpen: (item: Product) => void;
}) {
  return (
    <div className="card-bg overflow-hidden rounded-[24px] shadow-sm">
      <button onClick={() => onOpen(item)} className="w-full text-left">
        <div className={`relative h-32 bg-gradient-to-br ${item.color} p-3`}>
          <button onClick={e => { e.stopPropagation(); onToggleFavorite(item.id); }} className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M10 15.5S3.5 11.5 3.5 7A3.5 3.5 0 0110 4.8 3.5 3.5 0 0116.5 7c0 4.5-6.5 8.5-6.5 8.5z"
                fill={isFavorite ? "#ef4444" : "none"} stroke={isFavorite ? "#ef4444" : "#64748b"} strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">-{item.discount}%</div>
          <div className="flex h-full items-center justify-center">
            <div className="grid grid-cols-2 gap-1">{[0,1,2,3].map(i=><div key={i} className="h-4 w-8 rounded-sm bg-black/20"/>)}</div>
          </div>
        </div>
        <div className="p-3">
          <div className="text-main line-clamp-2 min-h-[42px] text-sm font-medium">{item.name}</div>
          <div className="mt-2 text-xl font-bold text-yellow-400">{formatPrice(item.price)}</div>
          {item.oldPrice && <div className="text-sub text-xs line-through">{formatPrice(item.oldPrice)}</div>}
        </div>
      </button>
      <div className="px-3 pb-3">
        <button onClick={() => onAdd(item)} className="w-full rounded-2xl bg-yellow-400 px-3 py-2 text-sm font-semibold text-black">В корзину</button>
      </div>
    </div>
  );
}

// ── Экраны ────────────────────────────────────────────────────────────────────
function HomeScreen({ favorites, onToggleFavorite, onAdd, onOpen }: { favorites: Set<number>; onToggleFavorite: (id: number) => void; onAdd: (item: Product) => void; onOpen: (item: Product) => void }) {
  return (
    <div className="tab-enter space-y-4 pb-24">
      <div className="overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3c2f15] via-[#5b451a] to-[#7a5d21] p-4">
        <div className="inline-block rounded-xl bg-black/35 px-3 py-1 text-sm font-semibold text-white">Реклама</div>
        <div className="mt-3 max-w-[220px] text-2xl font-extrabold leading-tight text-white">Скидки на<br/>стройматериалы</div>
        <div className="mt-2 text-sm text-slate-100">Сравнивай поставщиков и находи выгодные предложения</div>
        <button className="mt-4 rounded-full bg-white/20 px-4 py-2.5 text-sm font-semibold text-white">Смотреть</button>
      </div>
      <div className="text-main rounded-full border-2 border-current px-4 py-2 text-xl font-medium w-fit">Для вас</div>
      <div className="grid grid-cols-2 gap-3">
        {products.map(item=><ProductCard key={item.id} item={item} isFavorite={favorites.has(item.id)} onToggleFavorite={onToggleFavorite} onAdd={onAdd} onOpen={onOpen}/>)}
      </div>
    </div>
  );
}

type FilterDelivery = "all" | "today" | "tomorrow";
type FilterSort = "default" | "price_asc" | "price_desc";

function CatalogScreen({ favorites, onToggleFavorite, onAdd, selectedCategory, onOpen }: {
  favorites: Set<number>; onToggleFavorite: (id: number) => void;
  onAdd: (item: Product) => void; selectedCategory: string | null;
  onOpen: (item: Product) => void;
}) {
  const [delivery, setDelivery] = useState<FilterDelivery>("all");
  const [sort, setSort] = useState<FilterSort>("default");

  const filteredProducts = useMemo(() => {
    let list = selectedCategory ? products.filter(p => p.category === selectedCategory) : products;
    if (delivery === "today") list = list.filter(p => p.delivery === "Сегодня");
    if (delivery === "tomorrow") list = list.filter(p => p.delivery === "Завтра");
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [selectedCategory, delivery, sort]);

  if (selectedCategory) {
    return (
      <div className="space-y-3 pb-24">
        {/* Фильтры — стиль Каспи */}
        <div className="flex items-center gap-2 pb-1" style={{overflowX:"auto",WebkitOverflowScrolling:"touch",msOverflowStyle:"none",scrollbarWidth:"none"}}>
          {/* Сортировка */}
          <button onClick={() => setSort(s => s === "price_asc" ? "price_desc" : "price_asc")}
            className="shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-white/10 border border-white/10">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 3v10M5 3L3 5M5 3l2 2" stroke={sort!=="default" ? "#FACC15" : "#64748b"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 13V3M11 13l-2-2M11 13l2-2" stroke={sort!=="default" ? "#FACC15" : "#64748b"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Настройки/бюджет */}
          <button className="shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-white/10 border border-white/10">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
          {/* Разделитель */}
          <div className="w-px h-6 bg-white/15 shrink-0"/>
          {/* Прокручиваемые теги */}
          {(["all","today","tomorrow"] as FilterDelivery[]).map(d => (
            <button key={d} onClick={() => setDelivery(d)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-all flex items-center gap-1 ${delivery===d ? "bg-yellow-400 text-black border-yellow-400" : "bg-transparent text-slate-400 border-white/15"}`}>
              {d==="all"?"Доставка":d==="today"?"Сегодня":"Завтра"}
              {d==="all" && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3l3 3 3-3" stroke={delivery==="all"?"#000":"#64748b"} strokeWidth="1.2" strokeLinecap="round"/></svg>}
            </button>
          ))}
          {(["default","price_asc","price_desc"] as FilterSort[]).map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-all flex items-center gap-1 ${sort===s && s!=="default" ? "bg-yellow-400 text-black border-yellow-400" : "bg-transparent text-slate-400 border-white/15"}`}>
              {s==="default"?"Цена":s==="price_asc"?"↑ Цена":"↓ Цена"}
              {s==="default" && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3l3 3 3-3" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round"/></svg>}
            </button>
          ))}
          <button className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border border-white/15 text-slate-400 flex items-center gap-1`}>
            Скидки <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3l3 3 3-3" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
          <button className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border border-white/15 text-slate-400`}>
            Рейтинг ★
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.length > 0 ? filteredProducts.map(item=>(
            <ProductCard key={item.id} item={item} isFavorite={favorites.has(item.id)} onToggleFavorite={onToggleFavorite} onAdd={onAdd} onOpen={onOpen}/>
          )) : (
            <div className="col-span-2 rounded-[20px] card-bg-raw p-5 text-center text-slate-300">Товары не найдены</div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4 pb-24">
      <div className="card-bg rounded-[24px] p-4">
        <div className="text-main text-xl font-bold">Каталог</div>
        <div className="text-sub mt-1 text-sm">Разделы стройматериалов и оборудования</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {catalogCategories.map(cat=>(
          <button key={cat.id} className="rounded-[20px] card-bg-raw p-4 text-left hover:card-bg-raw" data-cat={cat.title}>
            <div className="mb-3 pointer-events-none">{cat.icon}</div>
            <div className="text-main text-sm font-medium leading-snug pointer-events-none">{cat.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function NumInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="mb-1 text-sm text-slate-400">{label}</div>
      <input inputMode="decimal" value={value} onChange={e => onChange(e.target.value.replace(/[^0-9.]/g,"").replace(/(\..*)\./g,"$1"))} className="input-bg w-full rounded-2xl px-4 py-3 text-main outline-none"/>
    </div>
  );
}

function EstimateScreen({ tool, onOpenTool }: { tool: EstimateTool; onOpenTool: (key: EstimateTool) => void }) {
  const [vals, setVals] = useState({ tileRL:"5",tileRW:"4",tileL:"0.6",tileW:"0.6",wallH:"2.7",wallP:"18",rollL:"10",rollW:"1.06",paintA:"45",paintR:"0.12",puttyA:"60",puttyR:"1.2",drywallA:"50",sheetA:"3",lamA:"28",packA:"2.2" });
  const set = (k: string) => (v: string) => setVals(p=>({...p,[k]:v}));
  const n = (k: string) => Number(vals[k as keyof typeof vals])||0;
  const results = useMemo(()=>({
    tile:(()=>{const ra=n("tileRL")*n("tileRW"),ta=n("tileL")*n("tileW");return ra&&ta?Math.ceil(ra/ta*1.1):null;})(),
    wallpaper:(()=>{const wa=n("wallH")*n("wallP"),ra=n("rollL")*n("rollW");return wa&&ra?Math.ceil(wa/ra*1.1):null;})(),
    paint:(()=>{const v=n("paintA")*n("paintR")*1.1;return v?v.toFixed(1):null;})(),
    putty:(()=>{const v=n("puttyA")*n("puttyR")*1.1;return v?Math.ceil(v):null;})(),
    drywall:(()=>{const v=n("drywallA")/n("sheetA")*1.1;return v&&n("sheetA")?Math.ceil(v):null;})(),
    laminate:(()=>{const v=n("lamA")/n("packA")*1.1;return v&&n("packA")?Math.ceil(v):null;})(),
  }),[vals]);
  const R=({text}:{text:string})=><div className="input-bg mt-4 rounded-[20px] p-4 text-lg font-bold text-yellow-400">{text}</div>;
  if (tool==="main") return (
    <div className="space-y-4 pb-24">
      <div className="card-bg rounded-[24px] p-4"><div className="text-main text-xl font-bold">Сметный расчёт</div><div className="text-sub mt-1 text-sm">Выберите калькулятор</div></div>
      <div className="grid grid-cols-2 gap-3">
        {estimateCards.map(card=>(
          <button key={card.id} onClick={()=>onOpenTool(card.key)} className="card-bg rounded-[20px] p-4 text-left hover:opacity-80 w-full">
            <div className="mb-3">{card.icon}</div>
            <div className="text-main text-sm font-semibold">{card.title}</div>
            <div className="mt-1 text-xs text-slate-400">{card.subtitle}</div>
          </button>
        ))}
      </div>
    </div>
  );
  const forms: Record<string,React.ReactNode> = {
    tile:<><div className="grid grid-cols-2 gap-3"><NumInput label="Длина комнаты, м" value={vals.tileRL} onChange={set("tileRL")}/><NumInput label="Ширина комнаты, м" value={vals.tileRW} onChange={set("tileRW")}/><NumInput label="Длина плитки, м" value={vals.tileL} onChange={set("tileL")}/><NumInput label="Ширина плитки, м" value={vals.tileW} onChange={set("tileW")}/></div>{results.tile&&<R text={`Нужно плиток: ${results.tile} шт`}/>}</>,
    wallpaper:<><div className="grid grid-cols-2 gap-3"><NumInput label="Высота стен, м" value={vals.wallH} onChange={set("wallH")}/><NumInput label="Периметр, м" value={vals.wallP} onChange={set("wallP")}/><NumInput label="Длина рулона, м" value={vals.rollL} onChange={set("rollL")}/><NumInput label="Ширина рулона, м" value={vals.rollW} onChange={set("rollW")}/></div>{results.wallpaper&&<R text={`Нужно рулонов: ${results.wallpaper} шт`}/>}</>,
    paint:<><div className="grid grid-cols-2 gap-3"><NumInput label="Площадь, м²" value={vals.paintA} onChange={set("paintA")}/><NumInput label="Расход, л/м²" value={vals.paintR} onChange={set("paintR")}/></div>{results.paint&&<R text={`Нужно краски: ${results.paint} л`}/>}</>,
    putty:<><div className="grid grid-cols-2 gap-3"><NumInput label="Площадь, м²" value={vals.puttyA} onChange={set("puttyA")}/><NumInput label="Расход, кг/м²" value={vals.puttyR} onChange={set("puttyR")}/></div>{results.putty&&<R text={`Нужно шпаклёвки: ${results.putty} кг`}/>}</>,
    drywall:<><div className="grid grid-cols-2 gap-3"><NumInput label="Площадь, м²" value={vals.drywallA} onChange={set("drywallA")}/><NumInput label="Площадь листа, м²" value={vals.sheetA} onChange={set("sheetA")}/></div>{results.drywall&&<R text={`Нужно листов: ${results.drywall} шт`}/>}</>,
    laminate:<><div className="grid grid-cols-2 gap-3"><NumInput label="Площадь, м²" value={vals.lamA} onChange={set("lamA")}/><NumInput label="Площадь упаковки, м²" value={vals.packA} onChange={set("packA")}/></div>{results.laminate&&<R text={`Нужно упаковок: ${results.laminate} шт`}/>}</>,
  };
  return <div className="space-y-4 pb-24"><div className="card-bg rounded-[24px] p-4">{forms[tool]}</div></div>;
}

function FavoritesScreen({ favorites, onToggleFavorite, onAdd, onOpen }: { favorites: Set<number>; onToggleFavorite: (id: number) => void; onAdd: (item: Product) => void; onOpen: (item: Product) => void }) {
  const items = products.filter(p=>favorites.has(p.id));
  return (
    <div className="space-y-4 pb-24">
      {items.length===0 ? (
        <div className="rounded-[24px] card-bg-raw p-8 text-center mt-4 flex flex-col items-center gap-4">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M12 20S4 14 4 8a4.5 4.5 0 019 0 4.5 4.5 0 019 0c0 6-8 12-8 12z" stroke="#FACC15" strokeWidth="1.5" strokeLinejoin="round" fill="none"/></svg>
          <div><div className="text-main text-lg font-bold">Список пуст</div><div className="text-sub mt-1 text-sm">Нажмите ♡ на карточке товара</div></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map(item=><ProductCard key={item.id} item={item} isFavorite={true} onToggleFavorite={onToggleFavorite} onAdd={onAdd} onOpen={onOpen}/>)}
        </div>
      )}
    </div>
  );
}

function CartQtyControl({ qty, onChangeQty, onSetQty, onRemove }: { qty: number; onChangeQty: (delta: number) => void; onSetQty: (q: number) => void; onRemove: () => void }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(qty));
  const MAX_QTY = 999;

  const confirm = () => {
    const num = Math.min(parseInt(inputVal) || 0, MAX_QTY);
    if (num > 0) onSetQty(num);
    else onRemove();
    setEditing(false);
  };

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      <div className="flex items-center gap-1.5">
        <button onClick={()=>onChangeQty(-1)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-main text-lg">−</button>
        {editing ? (
          <input
            autoFocus
            value={inputVal}
            onChange={e=>{
              const v = e.target.value.replace(/[^0-9]/g,"");
              if (Number(v) <= MAX_QTY) setInputVal(v);
            }}
            onBlur={confirm}
            onKeyDown={e=>e.key==="Enter"&&confirm()}
            className="text-main w-12 text-center text-sm font-bold bg-black/10 dark:bg-white/10 rounded-lg outline-none py-0.5"
            inputMode="numeric"
            maxLength={3}
          />
        ) : (
          <button onClick={()=>{setInputVal(String(qty));setEditing(true);}} className="text-main w-10 text-center text-sm font-bold bg-white/5 rounded-lg py-0.5 hover:bg-white/10">
            {qty}
          </button>
        )}
        <button onClick={()=>onChangeQty(1)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-main text-lg">+</button>
      </div>
      <button onClick={onRemove} className="text-xs text-slate-500 hover:text-red-400">Удалить</button>
    </div>
  );
}

function CartScreen({ cartItems, onChangeQty, onSetQty, onRemove, city, onCheckout }: { cartItems: CartItem[]; onChangeQty: (id: number, delta: number) => void; onSetQty: (id: number, qty: number) => void; onRemove: (id: number) => void; city: string; onCheckout: () => void }) {
  const [cartAddress, setCartAddress] = React.useState(`${city}, ул. Салмышская, 62`);
  const [showCartAddrPicker, setShowCartAddrPicker] = React.useState(false);
  const total = useMemo(()=>cartItems.reduce((s,ci)=>s+ci.product.price*ci.qty,0),[cartItems]);
  const delivery = cartItems.length?1200:0;
  return (
    <div className="space-y-4 pb-24">
      {/* Адрес доставки — стиль Яндекс Маркет */}
      {cartItems.length > 0 && (
        <button className="w-full flex items-center gap-3 rounded-[20px] card-bg-raw px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#FACC15" strokeWidth="1.6"/><circle cx="12" cy="9" r="2.5" stroke="#FACC15" strokeWidth="1.4"/></svg>
          <div className="flex-1 text-left">
            <div className="text-xs text-slate-500">Доставка по адресу</div>
            <div className="text-main text-sm font-medium">{city}, ул. Салмышская, 62</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M7 4l6 6-6 6" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
      {cartItems.length===0 ? (
        <div className="rounded-[24px] card-bg-raw p-8 text-center mt-4 flex flex-col items-center gap-4">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M2 3h2.5l2 8h9l1.8-5.5H6.5" stroke="#FACC15" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8.5" cy="15.5" r="1.5" fill="#FACC15"/><circle cx="14" cy="15.5" r="1.5" fill="#FACC15"/></svg>
          <div><div className="text-main text-lg font-bold">Корзина пуста</div><div className="text-sub mt-1 text-sm">Добавьте товары из каталога</div></div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {cartItems.map(ci=>(
              <div key={ci.product.id} className="card-bg rounded-[24px] p-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 rounded-2xl overflow-hidden">
                    <img src={ci.product.img} alt={ci.product.name} className="h-full w-full object-cover"/>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-main truncate font-semibold">{ci.product.name}</div>
                    <div className="text-sub text-sm">{ci.product.supplier}</div>
                    <div className="mt-1 text-sm font-bold text-yellow-400">{formatPrice(ci.product.price*ci.qty)}</div>
                  </div>
                  <CartQtyControl qty={ci.qty} onChangeQty={(delta)=>onChangeQty(ci.product.id,delta)} onSetQty={(q)=>onSetQty(ci.product.id,q)} onRemove={()=>onRemove(ci.product.id)}/>
                </div>
              </div>
            ))}
          </div>
          <div className="card-bg rounded-[24px] p-4">
            <div className="flex justify-between py-2 text-sm text-slate-300"><span>Товары</span><span>{formatPrice(total)}</span></div>
            <div className="flex justify-between py-2 text-sm text-slate-300"><span>Доставка</span><span>{formatPrice(delivery)}</span></div>
            <div className="text-main mt-2 flex justify-between border-t border-white/10 pt-4 text-base font-bold"><span>Итого</span><span>{formatPrice(total+delivery)}</span></div>
            <button onClick={onCheckout} className="mt-4 w-full rounded-2xl bg-yellow-400 px-4 py-3 font-bold text-black">Оформить заказ</button>
          </div>
        </>
      )}
    </div>
  );
}

function ProfileScreen({ section, onOpenSection, city, darkMode, onToggleTheme, onAdd, onOpenProduct, placedOrders=[] }: { section: ProfileSection; onOpenSection: (s: ProfileSection) => void; city: string; darkMode: boolean; onToggleTheme: () => void; onAdd: (item: Product) => void; onOpenProduct: (p: Product) => void; placedOrders?: {id:string;date:string;name:string;unit:string;supplier:string;price:number;color:string;delivery:string}[] }) {
  if (section==="orders") {
    const [orderSearch, setOrderSearch] = React.useState("");
    const staticOrders = [
      {id:"#1042",status:"В пути",date:"Сегодня, 18:00–20:00",name:"Кирпич облицовочный · 200 шт",supplier:"СтройБаза 24",price:11980,active:true,color:"from-yellow-400 to-amber-500"},
      {id:"#1041",status:"Доставлен",date:"18 марта 2026",name:"Цемент М500 · 10 мешков",supplier:"ПрофСнаб",price:5400,active:false,color:"from-slate-300 to-slate-500"},
      {id:"#1038",status:"Доставлен",date:"12 марта 2026",name:"Профиль металлический · 30 шт",supplier:"МеталлТорг",price:3900,active:false,color:"from-zinc-200 to-zinc-400"},
      {id:"#1035",status:"Доставлен",date:"5 марта 2026",name:"Гипсокартон влагостойкий · 15 листов",supplier:"СнабМаркет",price:8300,active:false,color:"from-emerald-300 to-emerald-500"},
    ];
    // Новые заказы из checkout + статические
    const newOrders = placedOrders.map(o=>({...o, status:"Оформлен", active:false}));
    const allOrders = [...newOrders, ...staticOrders];
    const q = orderSearch.trim().toLowerCase();
    const filtered = q ? allOrders.filter(o =>
      o.name.toLowerCase().includes(q) || o.id.includes(q) || o.date.toLowerCase().includes(q) || o.supplier.toLowerCase().includes(q)
    ) : allOrders;
    return (
    <div className="space-y-3 pb-24">
      <div className="flex items-center gap-2 input-bg rounded-2xl px-4 h-11">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4" stroke="#64748b" strokeWidth="1.6"/><path d="M10 10l3 3" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/></svg>
        <input value={orderSearch} onChange={e=>setOrderSearch(e.target.value)} placeholder="Поиск по товару, дате или номеру..." className="flex-1 bg-transparent text-main text-sm outline-none placeholder:text-sub"/>
        {orderSearch && <button onClick={()=>setOrderSearch("")} className="text-sub text-lg leading-none">×</button>}
      </div>
      {filtered.length===0 && <div className="text-center text-sub text-sm py-8">Ничего не найдено</div>}
      {filtered.map((o,idx)=>(
        <div key={o.id+idx} className="card-bg rounded-[20px] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-main text-sm font-bold">Заказ {o.id}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              o.status==="В пути"?"text-yellow-400 bg-yellow-400/10":
              o.status==="Оформлен"?"text-blue-400 bg-blue-400/10":
              "text-emerald-400 bg-emerald-400/10"}`}>{o.status}</span>
          </div>
          {o.status==="В пути" && (
            <>
              <div className="flex items-center gap-1">
                {["Оформлен","Собирается","В пути","Доставлен"].map((step,i)=>(
                  <div key={step} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${i<=2?"bg-yellow-400":"bg-slate-600"}`}/>
                    <div className={`text-[9px] text-center leading-tight ${i<=2?"text-yellow-400":"text-slate-500"}`}>{step}</div>
                  </div>
                ))}
              </div>
              <div className="h-0.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{width:"65%"}}/>
              </div>
              <div className="rounded-xl bg-yellow-400/10 px-3 py-2 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="1" y="11" width="15" height="8" rx="1" stroke="#FACC15" strokeWidth="1.5"/><path d="M16 14h3l3 3v4h-6v-7z" stroke="#FACC15" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="5.5" cy="19.5" r="1.5" stroke="#FACC15" strokeWidth="1.3"/><circle cx="18.5" cy="19.5" r="1.5" stroke="#FACC15" strokeWidth="1.3"/></svg>
                <div>
                  <div className="text-xs font-semibold text-yellow-400">Курьер уже в пути</div>
                  <div className="text-[10px] text-slate-400">Ожидайте сегодня 18:00–20:00</div>
                </div>
              </div>
            </>
          )}
          {o.status==="Оформлен" && (
            <div className="rounded-xl bg-blue-400/10 px-3 py-2 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#60a5fa" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span className="text-xs text-blue-400">Заказ принят, ожидает обработки</span>
            </div>
          )}
          <div className="flex items-center gap-3 pt-1">
            <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${o.color}`}/>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-main truncate">{o.name}</div>
              <div className="text-sub text-xs">{o.supplier}</div>
            </div>
            <div className="text-sm font-bold text-yellow-400">{formatPrice(o.price)}</div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <span className="text-xs text-slate-500">{o.date}</span>
            {o.status!=="В пути" && (
              <button onClick={()=>{const p=products.find(pr=>o.name.includes(pr.name));if(p)onAdd(p);}} className="text-xs font-semibold text-yellow-400 border border-yellow-400 rounded-lg px-3 py-1">Повторить заказ</button>
            )}
            {o.status==="В пути" && (
              <button className="text-xs font-semibold text-yellow-400 border-2 border-yellow-400 rounded-lg px-3 py-1">Связаться с курьером</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );}

  if (section==="purchases") {
    const [purchSearch, setPurchSearch] = React.useState("");
    const filteredPurch = purchSearch.trim()
      ? products.filter(p => p.name.toLowerCase().includes(purchSearch.toLowerCase()) || p.category.toLowerCase().includes(purchSearch.toLowerCase()))
      : products.slice(0,6);
    return (
    <div className="space-y-3 pb-24">
      {/* Поиск */}
      <div className="flex items-center gap-2 input-bg rounded-2xl px-4 h-11">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4" stroke="#64748b" strokeWidth="1.6"/><path d="M10 10l3 3" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/></svg>
        <input value={purchSearch} onChange={e=>setPurchSearch(e.target.value)} placeholder="Поиск по названию или категории..." className="flex-1 bg-transparent text-main text-sm outline-none placeholder:text-sub"/>
        {purchSearch && <button onClick={()=>setPurchSearch("")} className="text-sub text-lg leading-none">×</button>}
      </div>
      {/* Итого потрачено */}
      <div className="card-bg rounded-[20px] p-4">
        <div className="text-xs text-slate-400 mb-1">Всего потрачено</div>
        <div className="text-2xl font-bold text-yellow-400">29 580 ₽</div>
        <div className="text-xs text-slate-500 mt-0.5">8 покупок · март 2026</div>
      </div>
      {filteredPurch.length===0 && <div className="text-center text-sub text-sm py-4">Ничего не найдено</div>}
      {filteredPurch.map((p,i)=>(
        <div key={p.id} className="card-bg rounded-[20px] p-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 rounded-2xl overflow-hidden">
            <img src={p.img} alt={p.name} className="h-full w-full object-cover"/>
          </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-main truncate">{p.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{p.supplier} · {p.unit}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-sm font-bold text-yellow-400">{formatPrice(p.price)}</div>
                <span className="text-[10px] text-slate-500">{i===0?"Сегодня":i===1?"18 марта":i===2?"12 марта":i===3?"5 марта":i===4?"28 февраля":"20 февраля"}</span>
              </div>
            </div>
            <button onClick={()=>onAdd(p)} className="shrink-0 rounded-xl bg-yellow-400/10 px-3 py-2 text-xs font-semibold text-yellow-400">Купить снова</button>
          </div>
          {i===0 && (
            <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-emerald-400/10 px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>
              <span className="text-[10px] text-emerald-400">Доставлен сегодня</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );}

  if (section==="settings") {
    const [notifications, setNotifications] = useState(true);
    const [priceAlerts, setPriceAlerts] = useState(true);
    const [orderUpdates, setOrderUpdates] = useState(true);
    return (
      <div className="space-y-3 pb-24">
        {/* Профиль */}
        <div className="card-bg rounded-[20px] p-4 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Личные данные</div>
          {[["Имя","Андрей А."],["Должность","Прораб"],["Телефон","+7 (999) 123-45-67"],["Email","andrey@strovo.ru"]].map(([k,v])=>(
            <div key={k} className="flex items-center justify-between py-2" style={{borderBottom:"1px solid var(--row-border)"}}>
              <span className="text-sub text-sm">{k}</span>
              <span className="text-main text-sm">{v}</span>
            </div>
          ))}
          <button className="w-full rounded-xl border border-yellow-400/40 bg-yellow-400/10 py-2 text-sm font-semibold text-yellow-400">Редактировать</button>
        </div>

        {/* Уведомления */}
        <div className="card-bg rounded-[20px] p-4 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Уведомления</div>
          {[
            {label:"Все уведомления", val:notifications, set:setNotifications},
            {label:"Снижение цен", val:priceAlerts, set:setPriceAlerts},
            {label:"Статус заказа", val:orderUpdates, set:setOrderUpdates},
          ].map(item=>(
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-main text-sm">{item.label}</span>
              <button onClick={()=>item.set(!item.val)} className={`relative h-6 w-11 rounded-full transition-colors ${item.val?"bg-yellow-400":"bg-slate-600"}`}>
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${item.val?"translate-x-5":"translate-x-0.5"}`}/>
              </button>
            </div>
          ))}
        </div>

        {/* Оплата */}
        <div className="card-bg rounded-[20px] p-4 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Способы оплаты</div>
          <div className="flex items-center gap-3 py-1">
            <div className="flex h-10 w-14 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">VISA</div>
            <div className="flex-1">
              <div className="text-main text-sm">•••• •••• •••• 4521</div>
              <div className="text-sub text-xs">Основная карта · до 12/27</div>
            </div>
            <button className="text-xs font-semibold text-red-400 border border-red-400/40 rounded-lg px-3 py-1">Удалить</button>
          </div>
          <button className="w-full rounded-xl py-2.5 text-sm text-slate-400" style={{border:"1.5px dashed var(--btn-border)"}}>+ Добавить карту</button>
        </div>

        {/* О приложении */}
        <div className="card-bg rounded-[20px] p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">О приложении</div>
          <div className="flex justify-between py-1"><span className="text-sub text-sm">Версия</span><span className="text-main text-sm">1.0.0 (MVP)</span></div>
          <div className="flex justify-between py-1"><span className="text-sub text-sm">Разработчик</span><span className="text-main text-sm">Strovo Tech</span></div>
          <button className="w-full mt-2 rounded-xl bg-red-500/10 py-2.5 text-sm font-semibold text-red-400">Выйти из аккаунта</button>
        </div>
      </div>
    );
  }

  if (section==="history") return (
    <div className="space-y-3 pb-24">
      <div className="text-sub text-xs px-1">Недавно просмотренные товары</div>
      {products.map((p,i)=>(
        <button key={p.id} onClick={()=>onOpenProduct(p)} className="card-bg-raw w-full rounded-[20px] p-4 flex items-center gap-3 text-left">
          <div className="h-14 w-14 shrink-0 rounded-2xl overflow-hidden">
            <img src={p.img} alt={p.name} className="h-full w-full object-cover"/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-main text-sm font-medium truncate">{p.name}</div>
            <div className="text-sub text-xs mt-0.5">{p.category}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-sm font-bold text-yellow-400">{formatPrice(p.price)}</div>
              {p.oldPrice && <div className="text-sub text-xs line-through">{formatPrice(p.oldPrice)}</div>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-sub text-[10px]">{i===0?"5 мин назад":i===1?"1 час назад":i===2?"Вчера":i===3?"2 дня назад":"3 дня назад"}</span>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M7 4l6 6-6 6" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </button>
      ))}
    </div>
  );
  return (
    <div className="space-y-4 pb-24">
      <div className="card-bg rounded-[24px] p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400/10">
            <svg width="40" height="40" viewBox="0 0 20 20" fill="none"><path d="M2 20 C2 14 5 12 10 12 C15 12 18 14 18 20Z" fill="#FACC15"/><circle cx="10" cy="10" r="3.2" fill="#FACC15"/><path d="M7.2 10 Q7.2 5 10 5 Q12.8 5 12.8 10Z" fill="#FACC15"/><rect x="5.5" y="9.3" width="9" height="1.4" rx="0.7" fill="#FACC15"/></svg>
          </div>
          <div>
            <div className="text-main text-lg font-bold">Андрей А.</div>
            <div className="text-sub text-sm">Прораб · {city}</div>
            <div className="mt-1 text-xs text-yellow-400">★ Проверенный пользователь</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {([["orders","Заказы","Мои активные заказы"],["purchases","Купленные товары","История покупок"],["settings","Настройки","Профиль и параметры"],["history","История просмотра","Недавно открытые"]] as [ProfileSection,string,string][]).map(([k,t,s])=>(
          <button key={k} onClick={()=>onOpenSection(k)} className="card-bg rounded-[20px] p-4 text-left hover:opacity-80 w-full">
            <div className="text-main text-base font-semibold">{t}</div>
            <div className="text-sub mt-1 text-sm">{s}</div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="card-bg rounded-[24px] p-4"><div className="text-sub text-sm">Объекты</div><div className="text-main mt-2 text-2xl font-bold">5</div></div>
        <div className="card-bg rounded-[24px] p-4"><div className="text-sub text-sm">Сметы</div><div className="text-main mt-2 text-2xl font-bold">9</div></div>
      </div>
      {/* Тема */}
      <div className="rounded-[24px] card-bg-raw p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3v1M12 20v1M4.22 4.22l.7.7M18.36 18.36l.7.7M3 12h1M20 12h1M4.92 19.07l.7-.7M18.36 5.64l.7-.7" stroke="#FACC15" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="12" r="4" stroke="#FACC15" strokeWidth="1.6"/></svg>
          <span className="text-main text-sm font-medium">Тёмная тема</span>
        </div>
        <button onClick={()=>onToggleTheme()} className={`relative h-7 w-12 rounded-full transition-colors ${darkMode?"bg-yellow-400":"bg-slate-600"}`}>
          <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${darkMode?"translate-x-5":"translate-x-0.5"}`}/>
        </button>
      </div>
    </div>
  );
}

// ── Яндекс Карта ─────────────────────────────────────────────────────────────
function YandexMap({ city, onPending }: { city: string; onPending: (addr: string) => void }) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstance = React.useRef<any>(null);
  const [status, setStatus] = React.useState<"loading"|"ready"|"error">("loading");
  const [geocoding, setGeocoding] = React.useState(false);

  const cityCoords: Record<string, [number,number]> = {
    "Москва": [55.751244, 37.618423],
    "Санкт-Петербург": [59.938784, 30.314997],
    "Оренбург": [51.768199, 55.096955],
    "Самара": [53.195873, 50.100193],
    "Екатеринбург": [56.838011, 60.597465],
    "Новосибирск": [54.989342, 82.904632],
    "Казань": [55.796127, 49.106405],
    "Краснодар": [45.035470, 38.975313],
    "Уфа": [54.735152, 55.958727],
    "Челябинск": [55.159897, 61.402554],
  };

  React.useEffect(() => {
    const API_KEY = "d929f335-1fc3-4dc8-8a1e-7836fbc12733";
    const coords = cityCoords[city] || [55.751244, 37.618423];

    const initMap = () => {
      if (!mapRef.current || !(window as any).ymaps) return;
      try {
        (window as any).ymaps.ready(() => {
          if (!mapRef.current) return;
          if (mapInstance.current) { try { mapInstance.current.destroy(); } catch {} }

          const map = new (window as any).ymaps.Map(mapRef.current, {
            center: coords, zoom: 14,
            controls: ["zoomControl", "searchControl"],
          });
          mapInstance.current = map;

          const pm = new (window as any).ymaps.Placemark(coords, {
            balloonContent: city,
          }, {
            preset: "islands#yellowDotIcon", draggable: true
          });
          map.geoObjects.add(pm);

          const geocode = (c: number[]) => {
            setGeocoding(true);
            (window as any).ymaps.geocode(c).then((res: any) => {
              const a = res.geoObjects.get(0)?.getAddressLine();
              if (a) onPending(a);
              setGeocoding(false);
            }).catch(() => setGeocoding(false));
          };

          pm.events.add("dragend", () => geocode(pm.geometry.getCoordinates()));
          map.events.add("click", (e: any) => {
            const c = e.get("coords");
            pm.geometry.setCoordinates(c);
            geocode(c);
          });
          setStatus("ready");
        });
      } catch { setStatus("error"); }
    };

    const scriptId = "ymaps3-script";
    if ((window as any).ymaps) { initMap(); return; }
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = `https://api-maps.yandex.ru/2.1/?apikey=${API_KEY}&lang=ru_RU&load=package.full`;
      s.async = true;
      s.onload = initMap;
      s.onerror = () => setStatus("error");
      document.head.appendChild(s);
    } else {
      const t = setInterval(() => { if ((window as any).ymaps) { clearInterval(t); initMap(); } }, 200);
    }
    return () => { if (mapInstance.current) { try { mapInstance.current.destroy(); } catch {} mapInstance.current = null; } };
  }, [city]);

  if (status === "error") return (
    <div style={{height:"200px",background:"#1a2744",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"8px"}}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FACC15"/><circle cx="12" cy="9" r="2.5" fill="#0b1120"/></svg>
      <span style={{color:"#94a3b8",fontSize:"12px",textAlign:"center",padding:"0 16px"}}>Выберите адрес из списка ниже</span>
    </div>
  );

  return (
    <div style={{position:"relative",height:"300px"}}>
      <div ref={mapRef} style={{width:"100%",height:"300px"}}/>
      {/* Центральная подсказка */}
      {status==="ready" && (
        <div style={{position:"absolute",top:"12px",left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.7)",borderRadius:"20px",padding:"6px 14px",pointerEvents:"none",whiteSpace:"nowrap"}}>
          <span style={{color:"white",fontSize:"12px"}}>
            {geocoding ? "⏳ Определяем адрес..." : "Нажмите на карту или перетащите метку"}
          </span>
        </div>
      )}
      {status==="loading" && (
        <div style={{position:"absolute",inset:0,background:"#1a2744",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"12px"}}>
          <div style={{width:"28px",height:"28px",border:"3px solid #FACC15",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
          <span style={{color:"#94a3b8",fontSize:"12px"}}>Загружаем карту...</span>
          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        </div>
      )}
    </div>
  );
}

// ── Возврат товара ───────────────────────────────────────────────────────────
function ReturnScreen({ item, onBack }: { item: Product; onBack: () => void }) {
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<"form"|"success">("form");
  const reasons = ["Товар не соответствует описанию","Получил бракованный товар","Ошибся при заказе","Нашёл дешевле","Долгая доставка","Другая причина"];

  if (step === "success") return (
    <div className="flex flex-col h-full">
      <TopBarInner title="Возврат оформлен" onBack={onBack} showSearch={false}/>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-400/10">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="text-center">
          <div className="text-main text-xl font-bold">Заявка принята!</div>
          <div className="mt-2 text-sm text-slate-400 leading-relaxed">Мы свяжемся с вами в течение 24 часов и согласуем детали возврата</div>
        </div>
        <div className="w-full rounded-[20px] card-bg-raw p-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-sub">Товар</span><span className="text-main">{item.name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-sub">Причина</span><span className="text-main">{reason}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-400">Номер заявки</span><span className="text-yellow-400">#RT-{Math.floor(Math.random()*9000+1000)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-sub">Срок возврата</span><span className="text-main">3–5 рабочих дней</span></div>
        </div>
        <button onClick={onBack} className="w-full rounded-2xl bg-yellow-400 py-4 font-bold text-black">Готово</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <TopBarInner title="Возврат товара" onBack={onBack} showSearch={false}/>
      <div className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-24 space-y-4 pt-2">
        {/* Товар */}
        <div className="rounded-[20px] card-bg-raw p-4 flex items-center gap-3">
          <div className={`h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br ${item.color}`}/>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-main truncate">{item.name}</div>
            <div className="text-xs text-slate-400 mt-0.5">{item.supplier}</div>
            <div className="text-sm font-bold text-yellow-400 mt-1">{new Intl.NumberFormat("ru-RU").format(item.price)} ₽</div>
          </div>
        </div>

        {/* Причина */}
        <div className="card-bg rounded-[20px] p-4 space-y-3">
          <div className="text-main text-sm font-semibold">Причина возврата</div>
          {reasons.map(r=>(
            <button key={r} onClick={()=>setReason(r)} className="w-full flex items-center gap-3 py-1">
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${reason===r?"border-yellow-400":"border-slate-600"}`}>
                {reason===r && <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"/>}
              </div>
              <span className={`text-sm ${reason===r?"text-main":"text-sub"}`}>{r}</span>
            </button>
          ))}
        </div>

        {/* Условия */}
        <div className="card-bg rounded-[20px] p-4 space-y-2">
          <div className="text-main text-sm font-semibold">Условия возврата</div>
          {["Товар должен быть в оригинальной упаковке","Срок возврата — 14 дней с момента получения","Деньги вернём в течение 3–5 рабочих дней","Доставку при возврате оплачивает поставщик"].map(c=>(
            <div key={c} className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0"/>
              <span className="text-sub text-xs">{c}</span>
            </div>
          ))}
        </div>

        <button
          onClick={()=>reason&&setStep("success")}
          className={`w-full rounded-2xl py-4 font-bold text-base transition-all ${reason?"bg-yellow-400 text-black":"bg-slate-700 text-slate-500"}`}
          disabled={!reason}
        >
          Оформить возврат
        </button>
      </div>
    </div>
  );
}

// ── Страница оформления заказа ────────────────────────────────────────────────
// ── Выбор адреса доставки ────────────────────────────────────────────────────
function AddressPickerModal({ city, currentAddress, onSelect, onClose }: {
  city: string; currentAddress: string;
  onSelect: (addr: string) => void; onClose: () => void;
}) {
  const [showMap, setShowMap] = React.useState(false);
  const [savedAddresses, setSavedAddresses] = React.useState([
    `${city}, ул. Салмышская, 62`,
    `${city}, ул. Ленина, 1`,
    `${city}, пр. Победы, 34`,
  ]);

  if (showMap) return (
    <div className="fixed inset-0 z-50">
      <MapModal
        city={city}
        currentAddress={currentAddress}
        onConfirm={(addr) => { setSavedAddresses(prev => prev.includes(addr) ? prev : [addr, ...prev]); onSelect(addr); setShowMap(false); onClose(); }}
        onClose={() => setShowMap(false)}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={onClose}>
      <div className="w-full rounded-t-[28px] overflow-hidden" style={{maxHeight:"85vh"}} onClick={e=>e.stopPropagation()}>
        {/* Шапка */}
        <div className="topbar-bg px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-main text-xl font-bold">Адрес доставки</span>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full" style={{background:"var(--btn-bg)"}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        <div className="screen-bg hide-scrollbar overflow-y-auto" style={{maxHeight:"70vh"}}>
          {/* Получатель */}
          <div className="px-5 pt-4 pb-2">
            <div className="text-main text-base font-bold mb-3">Получатель</div>
            <button className="w-full card-bg rounded-2xl p-4 flex items-center gap-3 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/10 shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 20 C2 14 5 12 10 12 C15 12 18 14 18 20Z" fill="#FACC15"/><circle cx="10" cy="10" r="3.2" fill="#FACC15"/><path d="M7.2 10 Q7.2 5 10 5 Q12.8 5 12.8 10Z" fill="#FACC15"/><rect x="5.5" y="9.3" width="9" height="1.4" rx="0.7" fill="#FACC15"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-main text-sm font-semibold">Андрей А.</div>
                <div className="text-sub text-xs mt-0.5">andrey@strovo.ru · +7 (999) 123-45-67</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M7 4l6 6-6 6" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* Адреса */}
          <div className="px-5 pt-2 pb-6">
            <div className="text-main text-base font-bold mb-3">Адреса</div>

            {/* Добавить новый — открывает карту */}
            <button onClick={() => setShowMap(true)} className="w-full flex items-center gap-3 py-3 border-b" style={{borderColor:"var(--row-border)"}}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-yellow-400/50 shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="#FACC15" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <span className="text-yellow-400 text-sm font-medium">Добавить рабочий адрес</span>
            </button>

            {/* Список сохранённых адресов */}
            {savedAddresses.map((addr, i) => (
              <button key={i} onClick={()=>{onSelect(addr);onClose();}}
                className="w-full flex items-center gap-3 py-3 text-left border-b"
                style={{borderColor:"var(--row-border)"}}>
                <div className="shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={addr===currentAddress?"#FACC15":"none"} stroke={addr===currentAddress?"#FACC15":"#64748b"} strokeWidth="1.6"/><circle cx="12" cy="9" r="2.5" fill={addr===currentAddress?"#0b1120":"none"} stroke={addr===currentAddress?"none":"#64748b"} strokeWidth="1.2"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${addr===currentAddress?"text-yellow-400":"text-main"}`}>{addr}</div>
                  <div className="text-sub text-xs mt-0.5">Курьером</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M10 4l6 6-6 6" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            ))}


          </div>
        </div>
      </div>
    </div>
  );
}

function MapModal({ city, currentAddress, onConfirm, onClose }: {
  city: string; currentAddress: string;
  onConfirm: (addr: string) => void; onClose: () => void;
}) {
  const [pendingAddr, setPendingAddr] = React.useState(currentAddress);
  const [tab, setTab] = React.useState<"map"|"list">("map");

  const quickAddresses = [
    `${city}, ул. Салмышская, 62`,
    `${city}, ул. Ленина, 1`,
    `${city}, пр. Победы, 34`,
    `${city}, ул. Терешковой, 15`,
    `${city}, ул. Чкалова, 10`,
    `${city}, пр. Автоматики, 7`,
  ];

  return (
    <div className="fixed inset-0 z-50" style={{background:"rgba(0,0,0,0.7)"}}>
      <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] overflow-hidden" style={{maxHeight:"90vh"}}>
        {/* Шапка */}
        <div className="topbar-bg px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-main text-base font-bold">Адрес доставки</span>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full" style={{background:"var(--btn-bg)"}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
          {/* Табы Карта / Список */}
          <div className="flex gap-2">
            {(["map","list"] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab===t?"bg-yellow-400 text-black":"text-sub"}`}
                style={tab!==t?{background:"var(--btn-bg)"}:{}}>
                {t==="map"?"🗺 На карте":"📋 Быстрый выбор"}
              </button>
            ))}
          </div>
        </div>

        {/* Карта */}
        {tab==="map" && (
          <div>
            <YandexMap city={city} onPending={setPendingAddr}/>
          </div>
        )}

        {/* Список адресов */}
        {tab==="list" && (
          <div className="screen-bg p-4 space-y-2" style={{maxHeight:"300px",overflowY:"auto"}}>
            {quickAddresses.map(a=>(
              <button key={a} onClick={()=>setPendingAddr(a)}
                className={`w-full text-left rounded-2xl p-4 flex items-center gap-3 transition-all ${pendingAddr===a?"border border-yellow-400 bg-yellow-400/5":""}`}
                style={pendingAddr!==a?{background:"var(--btn-bg)"}:{}}>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${pendingAddr===a?"border-yellow-400":"border-slate-600"}`}>
                  {pendingAddr===a && <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"/>}
                </div>
                <span className="text-main text-sm">{a}</span>
              </button>
            ))}
          </div>
        )}

        {/* Нижняя панель с адресом */}
        <div className="card-bg px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-start gap-3 input-bg rounded-2xl p-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#FACC15" strokeWidth="1.6"/><circle cx="12" cy="9" r="2.5" stroke="#FACC15" strokeWidth="1.4"/></svg>
            <div className="flex-1 min-w-0">
              <div className="text-sub text-xs mb-0.5">Адрес доставки</div>
              <div className="text-main text-sm font-medium leading-snug">{pendingAddr || "Выберите адрес на карте"}</div>
            </div>
          </div>
          <button
            onClick={()=>pendingAddr && onConfirm(pendingAddr)}
            className={`w-full rounded-2xl py-4 font-bold text-base transition-all ${pendingAddr?"bg-yellow-400 text-black":"bg-slate-700 text-slate-500"}`}
            disabled={!pendingAddr}>
            Подтвердить адрес
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutScreen({ cartItems, city, onBack, onSuccess }: {
  cartItems: CartItem[]; city: string; onBack: () => void; onSuccess: (delivery: string) => void;
}) {
  const [step, setStep] = useState<"form"|"success">("form");
  const [delivery, setDelivery] = useState<"courier"|"pickup">("courier");
  const [payment, setPayment] = useState<"card"|"cash">("card");
  const [address, setAddress] = useState(`${city}, ул. Салмышская, 62`);
  const [showAddrPicker, setShowAddrPicker] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const total = cartItems.reduce((s,ci)=>s+ci.product.price*ci.qty,0);
  const deliveryCost = delivery==="courier"?1200:0;

  if (step==="success") return (
    <div className="flex flex-col h-full">
      <TopBarInner title="Заказ оформлен" onBack={onSuccess} showSearch={false}/>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400/10">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="text-center">
          <div className="text-main text-2xl font-bold">Заказ принят!</div>
          <div className="mt-2 text-sm text-slate-400">Номер заказа: <span className="text-yellow-400">#1043</span></div>
          <div className="mt-1 text-sm text-slate-400 leading-relaxed">Ожидайте звонка от поставщика для подтверждения доставки</div>
        </div>
        <div className="w-full rounded-[20px] card-bg-raw p-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-sub">Позиций</span><span className="text-main">{cartItems.length}</span></div>
          <div className="flex justify-between text-sm"><span className="text-sub">Сумма</span><span className="text-main">{new Intl.NumberFormat("ru-RU").format(total+deliveryCost)} ₽</span></div>
          <div className="flex justify-between text-sm"><span className="text-sub">Доставка</span><span className="text-main">{delivery==="courier"?"Курьер":"Самовывоз"}</span></div>
          <div className="flex justify-between text-sm"><span className="text-sub">Оплата</span><span className="text-main">{payment==="card"?"Картой":"Наличными"}</span></div>
        </div>
        <button onClick={()=>onSuccess(delivery==="courier"?"Курьер":"Самовывоз")} className="w-full rounded-2xl bg-yellow-400 py-4 font-bold text-black">На главную</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <TopBarInner title="Оформление заказа" onBack={onBack} showSearch={false}/>
      <div className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-24 space-y-4 pt-2">

        {/* Адрес */}
        <button onClick={()=>setShowAddrPicker(true)} className="card-bg w-full rounded-[20px] p-4 flex items-center gap-3 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/10 shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#FACC15" strokeWidth="1.6"/><circle cx="12" cy="9" r="2.5" stroke="#FACC15" strokeWidth="1.4"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sub text-xs">Адрес доставки</div>
            <div className="text-main text-sm font-semibold mt-0.5 truncate">{address}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M7 4l6 6-6 6" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        {showAddrPicker && (
          <AddressPickerModal
            city={city}
            currentAddress={address}
            onSelect={setAddress}
            onClose={()=>setShowAddrPicker(false)}
          />
        )}

        {/* Способ доставки */}
        <div className="card-bg rounded-[20px] p-4 space-y-3">
          <div className="text-main text-sm font-semibold">Способ доставки</div>
          {([["courier","Курьер","1 200 ₽ · Сегодня 18:00–20:00"],["pickup","Самовывоз","Бесплатно · Пн-Сб 9:00–18:00"]] as [typeof delivery, string, string][]).map(([k,t,s])=>(
            <button key={k} onClick={()=>setDelivery(k)} className="w-full flex items-center gap-3">
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${delivery===k?"border-yellow-400":"border-slate-600"}`}>
                {delivery===k && <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"/>}
              </div>
              <div className="flex-1 text-left">
                <div className={`text-sm font-medium ${delivery===k?"text-main":"text-sub"}`}>{t}</div>
                <div className="text-xs text-slate-500">{s}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Способ оплаты */}
        <div className="card-bg rounded-[20px] p-4 space-y-3">
          <div className="text-main text-sm font-semibold">Способ оплаты</div>
          {([["card","Банковская карта","•••• 4521"],["cash","Наличными","При получении"]] as [typeof payment, string, string][]).map(([k,t,s])=>(
            <button key={k} onClick={()=>setPayment(k)} className="w-full flex items-center gap-3">
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payment===k?"border-yellow-400":"border-slate-600"}`}>
                {payment===k && <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"/>}
              </div>
              <div className="flex-1 text-left">
                <div className={`text-sm font-medium ${payment===k?"text-main":"text-sub"}`}>{t}</div>
                <div className="text-xs text-slate-500">{s}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Товары */}
        <div className="card-bg rounded-[20px] p-4 space-y-2">
          <div className="text-main text-sm font-semibold mb-2">Ваши товары</div>
          {cartItems.map(ci=>(
            <div key={ci.product.id} className="flex items-center justify-between py-1 border-b">
              <span className="text-sm text-slate-300 flex-1 truncate pr-2">{ci.product.name} × {ci.qty}</span>
              <span className="text-main text-sm font-medium shrink-0">{new Intl.NumberFormat("ru-RU").format(ci.product.price*ci.qty)} ₽</span>
            </div>
          ))}
          <div className="flex justify-between pt-2"><span className="text-sub text-sm">Доставка</span><span className="text-main text-sm">{deliveryCost?new Intl.NumberFormat("ru-RU").format(deliveryCost)+" ₽":"Бесплатно"}</span></div>
          <div className="flex justify-between pt-1 border-t border-white/10 mt-1">
            <span className="text-main text-base font-bold">Итого</span>
            <span className="text-base font-bold text-yellow-400">{new Intl.NumberFormat("ru-RU").format(total+deliveryCost)} ₽</span>
          </div>
        </div>

        <button onClick={()=>setStep("success")} className="w-full rounded-2xl bg-yellow-400 py-4 font-bold text-black text-base">
          Подтвердить заказ
        </button>
      </div>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
const estimateToolTitles: Record<EstimateTool,string> = {
  main:"Сметный расчёт",tile:"Расчёт плитки",wallpaper:"Расчёт обоев",
  paint:"Расчёт краски",putty:"Расчёт шпаклёвки",drywall:"Расчёт гипсокартона",laminate:"Расчёт ламината",
};
const profileTitles: Record<ProfileSection,string> = {
  main:"Профиль",orders:"Заказы",purchases:"Купленные товары",settings:"Настройки",history:"История просмотра",
};

type AppStage = "city" | "splash" | "main";

export default function App() {
  const [stage, setStage] = useState<AppStage>("city");
  const [darkMode, setDarkMode] = useState(true);
  const [city, setCity] = useState("");
  const [tab, setTab] = useState<Tab>("home");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [placedOrders, setPlacedOrders] = useState<{id:string;date:string;name:string;unit:string;supplier:string;price:number;color:string;delivery:string}[]>([]);
  const [catalogCategory, setCatalogCategory] = useState<string | null>(null);
  const [estimateTool, setEstimateTool] = useState<EstimateTool>("main");
  const [profileSection, setProfileSection] = useState<ProfileSection>("main");
  const [searchOpen, setSearchOpen] = useState(false);
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [returnProduct, setReturnProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const switchTab = (t: Tab) => { setTab(t); setCatalogCategory(null); setEstimateTool("main"); setProfileSection("main"); setSearchOpen(false); setOpenProduct(null); };

  const inSubPage =
    (tab==="catalog" && catalogCategory!==null) ||
    (tab==="estimate" && estimateTool!=="main") ||
    (tab==="profile" && profileSection!=="main");

  const innerTitle =
    tab==="catalog" && catalogCategory ? catalogCategory :
    tab==="estimate" ? estimateToolTitles[estimateTool] :
    tab==="profile" ? profileTitles[profileSection] : "";

  const handleBack = () => {
    if (tab==="catalog") setCatalogCategory(null);
    else if (tab==="estimate") setEstimateTool("main");
    else if (tab==="profile") setProfileSection("main");
  };

  const handleCatClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const btn = (e.target as HTMLElement).closest("[data-cat]");
    if (btn) setCatalogCategory((btn as HTMLElement).dataset.cat!);
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  };
  const addToCart = (item: Product) => {
    setCartItems(prev=>{
      const ex=prev.find(ci=>ci.product.id===item.id);
      return ex?prev.map(ci=>ci.product.id===item.id?{...ci,qty:ci.qty+1}:ci):[...prev,{product:item,qty:1}];
    });
    switchTab("cart");
  };
  const changeQty=(id:number,delta:number)=>setCartItems(prev=>prev.map(ci=>ci.product.id===id?{...ci,qty:ci.qty+delta}:ci).filter(ci=>ci.qty>0));
  const setQty=(id:number,qty:number)=>setCartItems(prev=>prev.map(ci=>ci.product.id===id?{...ci,qty}:ci).filter(ci=>ci.qty>0));
  const removeFromCart=(id:number)=>setCartItems(prev=>prev.filter(ci=>ci.product.id!==id));
  const cartCount=cartItems.reduce((s,ci)=>s+ci.qty,0);

  const navItems: {key:Tab;icon:(a:boolean)=>React.ReactNode}[] = [
    {key:"home",icon:a=><NavHomeIcon active={a}/>},
    {key:"catalog",icon:a=><NavCatalogIcon active={a}/>},
    {key:"estimate",icon:a=><NavEstimateIcon active={a}/>},
    {key:"favorites",icon:a=><NavHeartIcon active={a}/>},
    {key:"cart",icon:a=><NavCartIcon active={a} count={cartCount}/>},
    {key:"profile",icon:a=><NavProfileIcon active={a}/>},
  ];

  const renderTopBar = () => {
    if (openProduct) return null;
    if (tab==="favorites") return <TopBarTitle title="Понравившееся" onSearchOpen={()=>setSearchOpen(true)}/>;
    if (tab==="cart") return <TopBarTitle title="Корзина" onSearchOpen={()=>setSearchOpen(true)}/>;
    if (inSubPage) return <TopBarInner title={innerTitle} onBack={handleBack}/>;
    return <TopBarMain setTab={switchTab} onSearchOpen={()=>setSearchOpen(true)}/>;
  };

  return (
    <div className={`min-h-screen px-4 py-6 ${darkMode ? "bg-[#0b1120] text-white" : "bg-gray-100 text-gray-900"}`}>
      <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}button{-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}input{-webkit-tap-highlight-color:transparent}@keyframes fadeSlideIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}.tab-enter{animation:fadeSlideIn 0.18s ease-out}.no-scrollbar::-webkit-scrollbar{display:none}.dark,.light{transition:background-color 0.25s ease,color 0.25s ease}.card-bg,.card-bg-raw,.topbar-bg,.navbar-bg,.input-bg,.screen-bg{transition:background-color 0.25s ease,border-color 0.25s ease}
.dark{--btn-bg:rgba(255,255,255,0.1);--btn-border:rgba(255,255,255,0.05);--divider:rgba(255,255,255,0.08);--row-border:rgba(255,255,255,0.06)}
.light{--btn-bg:rgba(0,0,0,0.05);--btn-border:rgba(0,0,0,0.1);--divider:rgba(0,0,0,0.08);--row-border:rgba(0,0,0,0.08)}.dark .card-bg{background:#182235}.light .card-bg{background:#ffffff;border:1px solid #e8e8e8;box-shadow:0 1px 3px rgba(0,0,0,0.04)}.dark .screen-bg{background:#0f172a}.light .screen-bg{background:#f5f5f5}.screen-bg{background:#0f172a}.dark .topbar-bg{background:#0f172a}.light .topbar-bg{background:#ffffff;border-bottom:1px solid #efefef}.dark .navbar-bg{background:#111827;border-top:1px solid rgba(255,255,255,0.1)}.light .navbar-bg{background:#ffffff;border-top:1px solid #efefef}.dark .input-bg{background:#0f172a}.light .input-bg{background:#f5f5f5}.card-bg-raw{background:#182235}.light .card-bg-raw{background:#ffffff;border:1px solid #e8e8e8;box-shadow:0 1px 3px rgba(0,0,0,0.04)}.dark .text-main{color:#ffffff}.light .text-main{color:#1a1a1a}.dark .text-sub{color:#94a3b8}.light .text-sub{color:#6b7280}.dark .section-header{color:#ffffff}.light .section-header{color:#1a1a1a}`}</style>
      <div className="mx-auto max-w-[390px]">
        <div data-theme={darkMode?"dark":"light"} className={`relative h-[844px] overflow-hidden rounded-[36px] border shadow-2xl ${darkMode ? "dark border-white/10 bg-[#0f172a]" : "light border-gray-200 bg-[#f5f5f5]"}`} style={{transition:"background-color 0.3s ease,border-color 0.3s ease"}}>

          {stage==="city" ? (
            <CityScreen onDone={c=>{setCity(c);setStage("splash");}}/>
          ) : stage==="splash" ? (
            <SplashScreen onDone={()=>setStage("main")}/>
          ) : searchOpen ? (
            <SearchScreen onClose={()=>setSearchOpen(false)} onAdd={addToCart} favorites={favorites} onToggleFavorite={toggleFavorite} onOpenProduct={setOpenProduct}/>
          ) : returnProduct ? (
            <ReturnScreen item={returnProduct} onBack={()=>setReturnProduct(null)}/>
          ) : showCheckout ? (
            <CheckoutScreen cartItems={cartItems} city={city} onBack={()=>setShowCheckout(false)} onSuccess={(deliveryMethod)=>{
              const newOrders = cartItems.map((ci,i)=>({
                id:`#${1043+i}`,
                date:"Только что",
                name:ci.product.name,
                unit:ci.product.unit,
                supplier:ci.product.supplier,
                price:ci.product.price*ci.qty,
                color:ci.product.color,
                delivery:deliveryMethod,
              }));
              setPlacedOrders(prev=>[...newOrders,...prev]);
              setShowCheckout(false);
              setCartItems([]);
              switchTab("home");
            }}/>
          ) : openProduct ? (
            <ProductDetailScreen item={openProduct} onBack={()=>setOpenProduct(null)} onAdd={addToCart} onOpen={setOpenProduct} isFavorite={favorites.has(openProduct.id)} onToggleFavorite={toggleFavorite}/>
          ) : (
            <>
              {renderTopBar()}
              <div className="hide-scrollbar h-[calc(100%-104px)] overflow-y-auto px-4 pb-2" onClick={handleCatClick}>
                {tab==="home" && <HomeScreen favorites={favorites} onToggleFavorite={toggleFavorite} onAdd={addToCart} onOpen={setOpenProduct}/>}
                {tab==="catalog" && <CatalogScreen favorites={favorites} onToggleFavorite={toggleFavorite} onAdd={addToCart} selectedCategory={catalogCategory} onOpen={setOpenProduct}/>}
                {tab==="estimate" && <EstimateScreen tool={estimateTool} onOpenTool={setEstimateTool}/>}
                {tab==="favorites" && <FavoritesScreen favorites={favorites} onToggleFavorite={toggleFavorite} onAdd={addToCart} onOpen={setOpenProduct}/>}
                {tab==="cart" && <CartScreen cartItems={cartItems} onChangeQty={changeQty} onSetQty={setQty} onRemove={removeFromCart} city={city} onCheckout={()=>setShowCheckout(true)}/>}
                {tab==="profile" && <ProfileScreen section={profileSection} onOpenSection={setProfileSection} city={city} darkMode={darkMode} onToggleTheme={()=>setDarkMode(d=>!d)} onAdd={addToCart} onOpenProduct={setOpenProduct} placedOrders={placedOrders}/>}
              </div>
              <div className="navbar-bg absolute bottom-0 left-0 right-0 z-50">
                <div className="grid h-[72px] grid-cols-6">
                  {navItems.map(item=>(
                    <button key={item.key} onClick={()=>switchTab(item.key)} className="relative flex flex-col items-center justify-center gap-0.5">
                      <div className="flex h-5 w-5 items-center justify-center">{item.icon(tab===item.key)}</div>
                      <span className={`text-[9px] leading-none font-medium ${tab===item.key ? "text-yellow-400" : "text-slate-500"}`}>
                        {item.key==="home"?"Главная":item.key==="catalog"?"Каталог":item.key==="estimate"?"Смета":item.key==="favorites"?"Избранное":item.key==="cart"?"Корзина":"Профиль"}
                      </span>

                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
