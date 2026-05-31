"use client";

import { useState } from "react";
import { ProductInput } from "@/lib/types";

interface Row {
  name: string;
  basePrice: string;
}

interface Props {
  onSubmit: (products: ProductInput[], tolerancePercent: number) => void;
  loading: boolean;
}

const EMPTY_ROW: Row = { name: "", basePrice: "" };

export default function ProductForm({ onSubmit, loading }: Props) {
  const [rows, setRows] = useState<Row[]>([{ ...EMPTY_ROW }]);
  const [tolerance, setTolerance] = useState("5");
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  function updateRow(i: number, field: keyof Row, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { ...EMPTY_ROW }]);
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  function parseBulk() {
    // 형식: 제품명,기준가 (줄바꿈으로 구분)
    const parsed: Row[] = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, price] = line.split(",").map((s) => s.trim());
        return { name: name ?? "", basePrice: price ?? "" };
      });
    if (parsed.length) {
      setRows(parsed);
      setShowBulk(false);
      setBulkText("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const products: ProductInput[] = rows
      .filter((r) => r.name && r.basePrice)
      .map((r) => ({ name: r.name, basePrice: parseInt(r.basePrice.replace(/,/g, ""), 10) }));
    if (!products.length) return;
    onSubmit(products, parseFloat(tolerance) || 5);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 일괄 입력 토글 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowBulk((v) => !v)}
          className="text-sm text-blue-600 underline"
        >
          {showBulk ? "▲ 일괄 입력 닫기" : "▼ CSV 일괄 입력"}
        </button>
        <span className="text-xs text-gray-400">형식: 제품명,기준가 (줄마다)</span>
      </div>

      {showBulk && (
        <div className="space-y-2">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={6}
            placeholder={"아이오닉6 풀옵션,55000000\n갤럭시 S24 256GB,1100000"}
            className="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={parseBulk}
            className="rounded-md bg-gray-700 px-4 py-1.5 text-sm text-white hover:bg-gray-800"
          >
            적용
          </button>
        </div>
      )}

      {/* 개별 행 입력 */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
          <span className="col-span-7">제품명</span>
          <span className="col-span-4">기준가 (원)</span>
        </div>
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <input
              value={row.name}
              onChange={(e) => updateRow(i, "name", e.target.value)}
              placeholder="제품명"
              className="col-span-7 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={row.basePrice}
              onChange={(e) => updateRow(i, "basePrice", e.target.value)}
              placeholder="1500000"
              type="text"
              inputMode="numeric"
              className="col-span-4 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={rows.length === 1}
              className="col-span-1 text-gray-400 hover:text-red-500 disabled:opacity-30 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="text-sm text-blue-600 hover:underline"
        >
          + 제품 추가
        </button>
      </div>

      {/* 근접 범위 */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          근접 범위
        </label>
        <input
          type="number"
          value={tolerance}
          onChange={(e) => setTolerance(e.target.value)}
          min="0"
          max="100"
          step="0.5"
          className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-500">% 이내 → 근접 경고</span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "검색 중…" : "모니터링 시작"}
      </button>
    </form>
  );
}
