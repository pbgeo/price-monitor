import { ProductResult, SellerResult } from "@/lib/types";

function fmt(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

function SellerRow({ seller }: { seller: SellerResult }) {
  return (
    <a
      href={seller.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-lg px-3 py-3 min-h-[44px] hover:bg-black/5 active:bg-black/10 transition-colors group gap-3"
    >
      <span className="font-medium group-hover:underline truncate min-w-0">
        {seller.mallName}
      </span>
      <span className="text-sm font-mono shrink-0">{fmt(seller.price)}</span>
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
  const enriched = sellers.map((s) => ({ ...s, basePrice }));
  const bgColor = color.replace("border-", "bg-").replace("-300", "-100");
  return (
    <div className={`rounded-xl border ${color} overflow-hidden`}>
      <div className={`px-4 py-2.5 font-semibold text-sm ${bgColor} flex flex-wrap items-center gap-1`}>
        <span className="mr-auto">{title}</span>
        <span className="text-xs font-normal opacity-70">{sellers.length}건</span>
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
      <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100">
        <div className="min-w-0">
          <h2 className="font-bold text-base sm:text-lg truncate">{result.productName}</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            기준가 <span className="font-semibold text-gray-800">{fmt(result.basePrice)}</span>
            {" · "}±{result.tolerancePercent}%
          </p>
        </div>
        {result.error ? (
          <span className="shrink-0 rounded-full bg-gray-100 text-gray-500 px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
            검색 실패
          </span>
        ) : result.ok ? (
          <span className="shrink-0 rounded-full bg-green-100 text-green-700 px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
            ✓ 이상 없음
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-red-100 text-red-700 px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
            ⚠ {result.violations.length + result.nearViolations.length}건
          </span>
        )}
      </div>

      {/* 본문 */}
      <div className="p-3 sm:p-4 space-y-3">
        {result.error && (
          <p className="text-center text-red-400 text-sm py-3">{result.error}</p>
        )}
        {!result.error && result.ok && (
          <p className="text-center text-gray-400 text-sm py-4">
            기준가 이하 또는 근접 판매자가 없습니다.
          </p>
        )}
        <Section
          title="🚨 위반 (기준가 미만)"
          color="border-red-300"
          sellers={result.violations}
          basePrice={result.basePrice}
        />
        <Section
          title={`⚠️ 근접 (±${result.tolerancePercent}% 이내)`}
          color="border-yellow-300"
          sellers={result.nearViolations}
          basePrice={result.basePrice}
        />
      </div>
    </div>
  );
}
