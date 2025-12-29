# 개발 환경 설정 가이드

## 📍 프로젝트 위치

프로젝트가 다음 경로에 생성되었습니다:
```
C:\Users\bigda\staff-board\
```

## ✅ 설치 완료 항목

### 1. 기본 프레임워크
- ✅ Vite 7.2.4
- ✅ React 19.2.0
- ✅ TypeScript 5.9.3

### 2. 스타일링
- ✅ Tailwind CSS 3.4.19
- ✅ PostCSS & Autoprefixer
- ✅ shadcn/ui 설정 완료
- ✅ tailwindcss-animate

### 3. 상태 관리
- ✅ Zustand 5.0.9 (글로벌 상태)
- ✅ TanStack Query 5.90.14 (서버 상태)

### 4. Backend
- ✅ Supabase Client 2.89.0

### 5. 유틸리티
- ✅ clsx & tailwind-merge (CSS 클래스 관리)

## 📁 프로젝트 구조

```
C:\Users\bigda\staff-board\
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui 컴포넌트
│   │   ├── layout/          # 레이아웃 컴포넌트
│   │   ├── admin/           # 관리자 전용 컴포넌트
│   │   ├── user/            # 사용자 전용 컴포넌트
│   │   └── common/          # 공통 컴포넌트
│   ├── pages/               # 페이지 컴포넌트
│   ├── stores/              # Zustand 스토어
│   │   ├── authStore.ts     # 인증 상태 관리
│   │   └── taskStore.ts     # 태스크 상태 관리
│   ├── hooks/               # Custom React Hooks
│   │   ├── useAuth.ts       # 인증 훅
│   │   └── useTasks.ts      # 태스크 훅
│   ├── types/               # TypeScript 타입 정의
│   │   └── index.ts         # 공통 타입
│   └── lib/                 # 라이브러리 및 유틸리티
│       ├── utils.ts         # 공통 유틸리티
│       ├── supabase.ts      # Supabase 클라이언트
│       └── queryClient.ts   # TanStack Query 설정
├── .env.example             # 환경 변수 예제
├── components.json          # shadcn/ui 설정
├── tailwind.config.js       # Tailwind CSS 설정
├── postcss.config.js        # PostCSS 설정
├── vite.config.ts           # Vite 설정
└── tsconfig.json            # TypeScript 설정
```

## 🚀 시작하기

### 1. 프로젝트 디렉토리로 이동
```bash
cd C:\Users\bigda\staff-board
```

### 2. 환경 변수 설정
`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 Supabase 정보를 입력합니다:

```bash
# .env 파일 내용
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ `.env` 파일은 Git에 커밋되지 않습니다 (.gitignore에 포함됨)

### 3. 개발 서버 실행
```bash
npm run dev
```

서버가 실행되면 브라우저에서 `http://localhost:5173`으로 접속합니다.

### 4. 빌드 (프로덕션)
```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 5. 빌드 미리보기
```bash
npm run preview
```

## 🎨 shadcn/ui 컴포넌트 추가하기

필요한 UI 컴포넌트를 프로젝트에 추가할 수 있습니다:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add input
# 등등...
```

추가된 컴포넌트는 `src/components/ui/` 폴더에 자동으로 생성됩니다.

## 📝 다음 단계

### 1. Supabase 데이터베이스 설정
PRD.md에 정의된 다음 테이블들을 Supabase에서 생성해야 합니다:
- `users` - 사용자 정보
- `tasks` - 업무 정보
- `feedbacks` - 피드백 정보
- `notifications` - 알림 정보

### 2. 페이지 컴포넌트 개발
- `src/pages/LoginPage.tsx` - 로그인 페이지
- `src/pages/UserDashboard.tsx` - 사용자 대시보드
- `src/pages/AdminDashboard.tsx` - 관리자 대시보드

### 3. 공통 컴포넌트 개발
- `src/components/layout/Header.tsx` - 헤더
- `src/components/layout/Sidebar.tsx` - 사이드바
- `src/components/common/TaskCard.tsx` - 태스크 카드
- `src/components/common/FeedbackModal.tsx` - 피드백 모달

### 4. 라우팅 설정
React Router 또는 다른 라우팅 라이브러리를 설치하고 설정:

```bash
npm install react-router-dom
```

## 🔧 유용한 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# TypeScript 타입 체크
npm run build

# 린트 실행
npm run lint

# 빌드 (프로덕션)
npm run build

# 빌드 미리보기
npm run preview
```

## 🐛 문제 해결

### 포트가 이미 사용 중인 경우
다른 포트로 실행:
```bash
npm run dev -- --port 3000
```

### 캐시 문제
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# Vite 캐시 삭제
rm -rf .vite
```

## 📚 참고 문서

- [React 공식 문서](https://react.dev/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/)
- [shadcn/ui 공식 문서](https://ui.shadcn.com/)
- [Zustand 공식 문서](https://zustand-demo.pmnd.rs/)
- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [Supabase 공식 문서](https://supabase.com/docs)

## 💡 팁

1. **Hot Module Replacement (HMR)**: 코드 수정 시 자동으로 브라우저가 새로고침됩니다.
2. **TypeScript**: 타입 에러는 IDE에서 실시간으로 확인할 수 있습니다.
3. **Tailwind IntelliSense**: VS Code에 Tailwind CSS IntelliSense 확장을 설치하면 클래스 자동완성을 사용할 수 있습니다.
4. **ESLint**: 코드 품질을 유지하기 위해 ESLint가 설정되어 있습니다.

---

개발 중 문제가 발생하면 SETUP.md 문서를 참고하거나 팀에 문의하세요! 🚀

