# 최저가 모니터링

네이버 쇼핑 API로 기준가 위반·근접 판매자를 탐지하는 웹앱.

## 로컬 실행

```bash
cp .env.example .env.local
# .env.local에 NAVER_CLIENT_ID, NAVER_CLIENT_SECRET 입력

npm install
npm run dev
# http://localhost:3000
```

## Vercel 배포

1. GitHub에 push
2. [vercel.com](https://vercel.com) → Import Project
3. Environment Variables에 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` 추가
4. Deploy

## 네이버 API 발급

1. [네이버 개발자센터](https://developers.naver.com) → 애플리케이션 등록
2. 사용 API: **검색 → 쇼핑**
3. 로컬: `http://localhost` 등록 / 운영: 배포 도메인 등록

## 분류 기준

| 분류 | 조건 |
|------|------|
| 🚨 위반 | 판매가 < 기준가 |
| ⚠️ 근접 | 기준가 ≤ 판매가 ≤ 기준가 × (1 + N%) |
| ✓ 정상 | 위·근접 없음 |

## 쿠팡 대응 (향후)

네이버 API 1차 탐지 → 쿠팡 직접 크롤링(Playwright/Puppeteer) 2단계 추가 예정.
