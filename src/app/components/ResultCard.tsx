import { ProductResult, SellerResult } from "@/lib/types";

function fmt(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

function SellerRow({ seller }: { seller: SellerResult }) {
  const diff = seller.price - (seller as SellerResult & { basePrice?: number }).basePrice!;
  return (
    <a
      href={seller.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-black/5 transition-colors group"
    >
      <span className="font-medium group-hover:underline truncate max-w-[55%]">
        {seller.mallName}
      </span>
      <span className="text-sm font-mono">{fmt(seller.price)}</span>
    </a>
  );
}

function Section({
  title,
  color,
  sellers,
  basePrice,
}: {
  title: string;
  color: string;
  sellers: SellerResult[];
  basePrice: number;
}) {
  if (!sellers.length) return null;
  // basePrice를 각 seller에 주입 (diff 계산용)
  const enriched = sellers.map((s) => ({ ...s, basePrice }));
  return (
    <div className={`rounded-xl border ${color} overflow-hidden`}>
      <div className={`px-4 py-2 font-semibold text-sm ${color.replace("border-", "bg-").replace("-300", "-100")} flex items-center gap-2`}>
        {title}
        <span className="ml-auto text-xs font-normal opacity-70">{sellers.length}건</span>
      </div>
      <div className="divide-y divide-gray-100">
        {enriched.map((s, i) => (
          <SellerRow key={i} seller={s} />
        ))}
      </div>
    </div>
  );
}

export default function ResultCard({ result }: { result: ProductResult }) {
  const hasIssue = result.violations.length > 0 || result.nearViolations.length > 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-lg">{result.productName}</h2>
          <p className="text-sm text-gray-500">
            기준가 <span className="font-semibold text-gray-800">{fmt(result.basePrice)}</span>
            {" · "}근접범위 ±{result.tolerancePercent}%
          </p>
        </div>
        {result.ok ? (
          <span className="shrink-0 rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold">
            ✓ 위반 없음
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-semibold">
            ⚠ 이슈 {result.violations.length + result.nearViolations.length}건
          </span>
        )}
      </div>

      {/* 본문 */}
      <div className="p-4 space-y-3">
        {result.ok && (
          <p className="text-center text-gray-400 text-sm py-4">
            기준가 이하 또는 근접 판매자가 없습니다.
          </p>
        )}
        <Section
          title="🚨 위반 판매자 (기준가 미만)"
          color="border-red-300"
          sellers={result.violations}
          basePrice={result.basePrice}
        />
        <Section
          title={`⚠️ 근접 판매자 (±${result.tolerancePercent}% 이내)`}
          color="border-yellow-300"
          sellers={result.nearViolations}
          basePrice={result.basePrice}
        />
      </div>
    </div>
  );
}
