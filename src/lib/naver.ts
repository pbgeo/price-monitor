import { NaverShoppingItem } from "./types";

const NAVER_API_URL = "https://openapi.naver.com/v1/search/shop.json";

export async function searchNaverShopping(
  query: string,
  display = 100
): Promise<NaverShoppingItem[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경변수가 없습니다.");
  }

  const url = new URL(NAVER_API_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("display", String(display));

  const res = await fetch(url.toString(), {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    next: { revalidate: 300 }, // 5분 캐시
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`네이버 API 오류 ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.items as NaverShoppingItem[];
}
