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
  violations: SellerResult[];   // 기준가 미만
  nearViolations: SellerResult[]; // 기준가 ± N% 이내 (위반 제외)
  ok: boolean; // 위반/근접 없음
}

export interface SearchResponse {
  results: ProductResult[];
  error?: string;
}
