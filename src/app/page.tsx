"use client";

import { useState } from "react";
import ProductForm from "./components/ProductForm";
import ResultCard from "./components/ResultCard";
import { ProductInput, ProductResult } from "@/lib/types";

const VERSION = process.env.NEXT_PUBLIC_VERSION ?? "";
const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE ?? "";

export default function Home() {
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slackStatus, setSlackStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSearch(products: ProductInput[], tolerancePercent: number) {
    setLoading(true);
    setError(null);
    setResults([]);
    setSlackStatus("idle");

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

  async function handleSendSlack() {
    setSlackStatus("sending");
    try {
      const res = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setSlackStatus("error");
      } else {
        setSlackStatus("sent");
      }
    } catch {
      setError("Slack 전송에 실패했습니다.");
      setSlackStatus("error");
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
          {VERSION && BUILD_DATE && (
            <p className="text-gray-400 mt-1 text-xs">
              v{VERSION} · {BUILD_DATE} 배포
            </p>
          )}
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {results.length}개 제품 검색 완료 ·{" "}
                {results.filter((r) => !r.ok).length}개 이슈 발견
              </p>
              <button
                onClick={handleSendSlack}
                disabled={slackStatus === "sending" || slackStatus === "sent"}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  bg-[#4A154B] hover:bg-[#3b1040] text-white"
              >
                {slackStatus === "sending" && "전송 중…"}
                {slackStatus === "sent" && "✓ 전송 완료"}
                {(slackStatus === "idle" || slackStatus === "error") && (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                    </svg>
                    Slack 전송
                  </>
                )}
              </button>
            </div>
            {results.map((r, i) => (
              <ResultCard key={i} result={r} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
