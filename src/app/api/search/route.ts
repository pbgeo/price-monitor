import { NextRequest, NextResponse } from "next/server";
import { SearchRequest, SearchResponse } from "@/lib/types";
import { searchNaverShopping } from "@/lib/naver";
import { classifyResults } from "@/lib/classify";

export async function POST(req: NextRequest) {
  let body: SearchRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json<SearchResponse>(
      { results: [], error: "잘못된 요청 형식입니다." },
      { status: 400 }
    );
  }

  const { products, tolerancePercent } = body;

  if (!products?.length) {
    return NextResponse.json<SearchResponse>(
      { results: [], error: "제품을 1개 이상 입력하세요." },
      { status: 400 }
    );
  }

  const settled = await Promise.allSettled(
    products.map(async (product) => {
      const items = await searchNaverShopping(product.name);
      return classifyResults(product, items, tolerancePercent ?? 5);
    })
  );

  const results = settled.map((s, i) =>
    s.status === "fulfilled"
      ? s.value
      : {
          productName: products[i].name,
          basePrice: products[i].basePrice,
          tolerancePercent: tolerancePercent ?? 5,
          violations: [],
          nearViolations: [],
          ok: false,
          error: s.reason instanceof Error ? s.reason.message : "알 수 없는 오류",
        }
  );

  return NextResponse.json<SearchResponse>({ results });
}
