import { NaverShoppingItem, ProductInput, ProductResult, SellerResult } from "./types";

// HTML 태그 제거
function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, "");
}

export function classifyResults(
  product: ProductInput,
  items: NaverShoppingItem[],
  tolerancePercent: number
): ProductResult {
  const lowerBound = product.basePrice;
  const upperBound = product.basePrice * (1 + tolerancePercent / 100);

  const violations: SellerResult[] = [];
  const nearViolations: SellerResult[] = [];

  // 중복 mallName 제거: 판매자별 최저가만 남김
  const seen = new Map<string, SellerResult>();

  for (const item of items) {
    const price = parseInt(item.lprice, 10);
    if (isNaN(price)) continue;

    const mallName = stripHtml(item.mallName) || "알 수 없음";
    const existing = seen.get(mallName);
    if (!existing || price < existing.price) {
      let status: SellerResult["status"];
      if (price < lowerBound) {
        status = "violation";
      } else if (price <= upperBound) {
        status = "near";
      } else {
        status = "ok";
      }
      seen.set(mallName, { mallName, price, link: item.link, status });
    }
  }

  for (const seller of seen.values()) {
    if (seller.status === "violation") violations.push(seller);
    else if (seller.status === "near") nearViolations.push(seller);
  }

  // 가격 오름차순 정렬
  violations.sort((a, b) => a.price - b.price);
  nearViolations.sort((a, b) => a.price - b.price);

  return {
    productName: product.name,
    basePrice: product.basePrice,
    tolerancePercent,
    violations,
    nearViolations,
    ok: violations.length === 0 && nearViolations.length === 0,
  };
}
