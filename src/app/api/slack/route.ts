import { NextRequest, NextResponse } from "next/server";
import { ProductResult } from "@/lib/types";

function fmt(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

function buildSlackMessage(results: ProductResult[]): object {
  const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const issueCount = results.filter((r) => !r.ok && !r.error).length;

  const lines: string[] = [
    `*📊 최저가 모니터링 결과* · ${now}`,
    `제품 ${results.length}개 검색 · 이슈 ${issueCount}개 발견`,
    "",
  ];

  for (const r of results) {
    if (r.error) {
      lines.push(`❌ *${r.productName}* — 검색 실패: ${r.error}`);
      continue;
    }
    if (r.ok) {
      lines.push(`✅ *${r.productName}* (기준가 ${fmt(r.basePrice)}) — 이슈 없음`);
      continue;
    }

    lines.push(`⚠️ *${r.productName}* (기준가 ${fmt(r.basePrice)})`);

    for (const s of r.violations) {
      lines.push(`　🚨 위반 · ${s.mallName} · ${fmt(s.price)} · <${s.link}|보기>`);
    }
    for (const s of r.nearViolations) {
      lines.push(`　⚠ 근접 · ${s.mallName} · ${fmt(s.price)} · <${s.link}|보기>`);
    }
  }

  return {
    channel: "PB_공동구매_모니터링",
    text: lines.join("\n"),
  };
}

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "SLACK_WEBHOOK_URL 환경변수가 없습니다." }, { status: 500 });
  }

  let results: ProductResult[];
  try {
    ({ results } = await req.json());
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const message = buildSlackMessage(results);

  const slackRes = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  if (!slackRes.ok) {
    const text = await slackRes.text();
    return NextResponse.json({ error: `Slack 오류: ${text}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
