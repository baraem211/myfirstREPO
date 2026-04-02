# SchedulAI — AI 기반 스마트 일정 관리 서비스

> **"친구 생일"이라고 말하면, AI가 연락처·메모·날씨·캘린더를 한번에 분석해 완벽한 하루 코스를 자동으로 완성합니다.**

#### ▣ 사이트 보기 : https://baraem211.github.io/myfirstREPO/index.html
---

## 🎯 프로젝트 소개

SchedulAI는 자연어 입력(텍스트 or 음성)만으로 AI가 맞춤 일정 코스를 추천해 주는 스마트 일정 관리 서비스입니다.  
전체 사이트는 **밝고 선명한 라이트 테마**로 통일되어 있으며, 모든 페이지가 동일한 디자인 시스템을 공유합니다.

---

## ✅ 구현 완료 기능

### 🌅 메인 랜딩 (index.html)
- 히어로 섹션: 배경 영상 제거 → 밝은 그라데이션 + UI 목업 카드 + 플로팅 배지 애니메이션
- 통합 서비스 로고 바 (Google Calendar, Apple Calendar, Slack, KakaoTalk, Notion, Naver Map)
- 핵심 기능 6종 카드 (스크롤 fade-in 애니메이션)
- 4단계 작동 방식 (How it works)
- 서비스 비교 테이블 (SchedulAI vs 경쟁사)
- 요금제 3종 (Free / Pro / Team)
- CTA 섹션 & 푸터
- 숫자 카운터 애니메이션, 네비게이션 스크롤 그림자, 모바일 햄버거 메뉴

### ✨ AI 추천 페이지 (recommend.html)
- **텍스트 입력**: 실시간 글자 수 카운팅, 입력값 기반 분석 버튼 자동 활성화
- **음성 입력** (Web Speech API): 마이크 버튼 → 권한 요청 → 실시간 음성 전사 → 확인/재시도
  - 녹음 중 펄스 애니메이션 + 빨간 버튼 효과
  - 오류 상태별 안내 (권한 거부 / no-speech / 네트워크 오류)
  - 미지원 브라우저 자동 fallback 안내 (Firefox 등)
- **빠른 예시 칩** 5종 클릭 시 자동 입력 & 텍스트 탭 전환
- **Ctrl+Enter** 단축키 지원
- **상세 설정**: 날짜, 인원, 예산, 분위기
- **5단계 로딩 애니메이션** + 데이터 소스 상태 표시
- **5가지 시나리오 AI 추천 결과** 렌더링:
  - 생일 파티, 팀 회식, 혼자 힐링, 기념일 데이트, 가족 나들이
- 공유 모달, 캘린더 추가 모달, 토스트 알림

### 📊 대시보드 (dashboard.html)
- 사이드바 네비게이션 (대시보드 / AI 추천 / 캘린더 / 통계 / 연락처 분석)
- KPI 카드 4종 (AI 추천 횟수, 확정 일정, 만족도, 계획 시간 단축률) + 카운터 애니메이션
- 최근 AI 추천 일정 리스트 (상태 배지 포함)
- 미니 달력 (이벤트 마커, 오늘 하이라이트)
- AI 학습 취향 프로필 (진행바 애니메이션)
- 스마트 알림 피드
- CTA 배너

---

## 📁 파일 구조

```
/
├── index.html          # 메인 랜딩 페이지
├── recommend.html      # AI 추천 페이지 (텍스트+음성 입력)
├── dashboard.html      # 대시보드
├── css/
│   ├── common.css      # 공통 CSS 변수, 리셋, 버튼, nav, footer
│   ├── landing.css     # 랜딩 페이지 전용 스타일
│   ├── recommend.css   # AI 추천 페이지 스타일
│   └── dashboard.css   # 대시보드 스타일
├── js/
│   ├── landing.js      # 랜딩 인터랙션 (nav, scroll, fade-in, counter)
│   ├── recommend.js    # 음성/텍스트 입력, 추천 로직, 모달
│   └── dashboard.js    # 대시보드 취향 렌더링, KPI 애니메이션
└── README.md
```

---

## 🔗 페이지 경로

| 경로 | 설명 |
|------|------|
| `index.html` | 메인 랜딩 (히어로, 기능, 비교, 요금제) |
| `recommend.html` | AI 추천 (텍스트/음성 입력, 결과 렌더링) |
| `dashboard.html` | 사용자 대시보드 (KPI, 일정, 달력, 취향) |

---

## 🎨 디자인 시스템

### 컬러 팔레트 (라이트 테마)
| 변수 | 값 | 용도 |
|------|----|------|
| `--primary` | `#4f6ef7` | 주요 브랜드 컬러 |
| `--accent` | `#7c5cfc` | 포인트 컬러 |
| `--bg-base` | `#f8faff` | 페이지 배경 |
| `--bg-white` | `#ffffff` | 카드 배경 |
| `--text-primary` | `#0f1c3f` | 주 텍스트 |
| `--text-secondary` | `#4a5578` | 보조 텍스트 |
| `--border-color` | `#e2e8f4` | 테두리 |

### 폰트
- Inter (Google Fonts) — 300, 400, 500, 600, 700, 800, 900

---

## 🎙️ 음성 입력 지원 브라우저

| 브라우저 | 지원 여부 |
|----------|-----------|
| Chrome (PC/Android) | ✅ |
| Edge | ✅ |
| Safari (iOS/macOS) | ✅ |
| Firefox | ❌ (텍스트 탭 자동 전환) |

---

## 📱 반응형 지원

| 해상도 | 레이아웃 |
|--------|----------|
| 1200px+ | 2단 그리드 풀 레이아웃 |
| 860px~ | 1단 스택 |
| 768px~ | 모바일 nav, 사이드바 수평 |
| 480px~ | 단일 컬럼 전체 |

---

## 🚀 배포 방법

**Publish 탭**에서 배포 버튼을 클릭하면 자동으로 웹에 게시됩니다.  
별도의 서버 설정이 필요 없는 순수 정적 사이트입니다.

---

## 📌 미구현 / 향후 개발 예정 기능

- [ ] 실제 외부 API 연동 (Google Calendar OAuth, 날씨 API)
- [ ] 로그인 / 회원 인증 시스템
- [ ] 실제 AI LLM 추천 엔진 연동
- [ ] 카카오톡 / SMS 공유 SDK 연동
- [ ] 앱 내 푸시 알림
- [ ] 다국어 지원 (en, ja)

---

## 🔧 기술 스택

- **HTML5** — 시맨틱 마크업, ARIA 접근성
- **CSS3** — CSS 변수, Grid, Flexbox, Animations
- **Vanilla JavaScript** — Web Speech API, Intersection Observer, requestAnimationFrame
- **Google Fonts** — Inter
- **데이터 저장** — RESTful Table API (향후 연동 예정)
