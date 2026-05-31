"use client";

import { useState } from "react";
import ProductForm from "./components/ProductForm";
import ResultCard from "./components/ResultCard";
import { ProductInput, ProductResult } from "@/lib/types";

export default function Home() {
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(products: ProductInput[], tolerancePercent: number) {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products, tolerancePercent }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.results);
      }
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">최저가 모니터링</h1>
          <p className="text-gray-500 mt-1 text-sm">
            네이버 쇼핑에서 기준가 위반·근접 판매자를 자동으로 탐지합니다.
          </p>
        </div>

        {/* 입력 폼 */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <ProductForm onSubmit={handleSearch} loading={loading} />
        </div>

        {/* 에러 */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="text-center text-gray-400 py-10 text-sm animate-pulse">
            네이버 쇼핑 검색 중…
          </div>
        )}

        {/* 결과 */}
        {results.length > 0 && (
          <div className="space-y-5">
            <p className="text-sm text-gray-500">
              {results.length}개 제품 검색 완료 ·{" "}
              {results.filter((r) => !r.ok).length}개 이슈 발견
            </p>
            {results.map((r, i) => (
              <ResultCard key={i} result={r} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
