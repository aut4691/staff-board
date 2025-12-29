# 대구 빅데이터 활용센터 성과 관리 시스템 (Simple Staff Board)

업무 가시성 확보 및 신속한 병목 해결을 위한 웹 기반 직원 업무 관리 시스템입니다.

## 🎯 프로젝트 목적

- **업무 가시성 확보**: 담당자별로 산재된 대구시·국비·AI 사업의 진행 현황을 한눈에 파악
- **신속한 병목 해결**: 직관적인 신호등(Traffic Light) UI를 통해 지연 업무를 즉시 식별
- **피드백 루프 단축**: 시스템 내 원클릭 피드백 기능을 통해 실시간 소통 강화

## 🛠️ 기술 스택

### Frontend
- **React 19.2.0** - UI 라이브러리
- **Vite 7.2.4** - 빌드 도구
- **TypeScript 5.9.3** - 타입 안정성
- **Tailwind CSS 4.1.18** - 스타일링
- **shadcn/ui** - UI 컴포넌트 라이브러리

### 상태 관리
- **Zustand** - 글로벌 상태 관리
- **TanStack Query** - 서버 상태 관리

### Backend & Database
- **Supabase** - 인증, PostgreSQL, Realtime

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고, Supabase 정보를 입력합니다:

```bash
cp .env.example .env
```

`.env` 파일 내용:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 기본적으로 `http://localhost:5173`에서 실행됩니다.

### 4. 빌드

```bash
npm run build
```

### 5. 프로덕션 미리보기

```bash
npm run preview
```

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── ui/             # shadcn/ui 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트 (Header, Sidebar)
│   ├── admin/          # 관리자 전용 컴포넌트
│   ├── user/           # 사용자 전용 컴포넌트
│   └── common/         # 공통 컴포넌트
├── pages/              # 페이지 컴포넌트
├── stores/             # Zustand 스토어
├── hooks/              # Custom React Hooks
├── types/              # TypeScript 타입 정의
└── lib/                # 유틸리티 및 설정
    ├── utils.ts        # 공통 유틸리티
    ├── supabase.ts     # Supabase 클라이언트
    └── queryClient.ts  # TanStack Query 설정
```

## 🔑 주요 기능

### 관리자 모드
- 전체 직원 업무 현황 대시보드 (Masonry Card UI)
- 프로젝트 유형별(시/국비/AI) 및 상태별 필터링
- 개별 업무에 대한 피드백 작성 및 전송 기능

### 사용자 모드
- 본인 할당 업무 조회 (My Task)
- 업무 상태(진행/지연/완료) 및 진도율 업데이트
- 관리자 피드백 수신 알림 및 확인

### 신호등 시스템
- 🟢 **초록색**: 정상 진행 (여유 있음)
- 🟡 **노란색**: 주의 필요 (마감일이 가까움)
- 🔴 **빨간색**: 지연 또는 긴급 (마감일 임박 또는 지연)

## 🗄️ Supabase 설정

### 데이터베이스 테이블

프로젝트 실행을 위해 다음 테이블이 필요합니다:

1. **users** - 사용자 정보
2. **tasks** - 업무 정보
3. **feedbacks** - 피드백 정보
4. **notifications** - 알림 정보

Supabase 대시보드에서 데이터베이스 스키마를 생성하거나 마이그레이션 스크립트를 실행하세요.

### Row Level Security (RLS)

보안을 위해 Supabase RLS 정책을 적용하여 직원은 본인의 업무와 관련된 데이터에만 접근하도록 제한합니다.

## 📱 반응형 디자인

- **데스크톱**: 전체 레이아웃 (기본)
- **태블릿**: 사이드바 햄버거 메뉴 전환
- **모바일**: 최적화된 카드 레이아웃 및 가로 스크롤

## 🔒 보안

- Supabase 인증을 통한 사용자 관리
- Row Level Security (RLS)를 통한 데이터 접근 제어
- 환경 변수를 통한 민감한 정보 관리

## 📄 라이선스

이 프로젝트는 대구 빅데이터 활용센터 내부용입니다.

## 🤝 기여

프로젝트에 대한 문의사항이나 개선 제안이 있으시면 담당자에게 연락해주세요.
