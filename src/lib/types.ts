export interface ProductInput {
  name: string;
  basePrice: number; // 기준가 (원)
}

export interface SearchRequest {
  products: ProductInput[];
  tolerancePercent: number; // 근접 범위 %
}

export interface NaverShoppingItem {
  title: string;
  link: string;
  lprice: string; // 최저가
  mallName: string;
  productId: string;
}

export type ViolationStatus = "violation" | "near" | "ok";

export interface SellerResult {
  mallName: string;
  price: number;
  link: string;
  status: ViolationStatus;
}

export interface ProductResult {
  productName: string;
  basePrice: number;
  tolerancePercent: number;
  violations: SellerResult[];
  nearViolations: SellerResult[];
  ok: boolean;
  error?: string;
}

export interface SearchResponse {
  results: ProductResult[];
  error?: string;
}
