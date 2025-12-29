# 백엔드 설정 가이드

## 📋 목차
1. [Supabase 프로젝트 설정](#1-supabase-프로젝트-설정)
2. [데이터베이스 마이그레이션 실행](#2-데이터베이스-마이그레이션-실행)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [초기 데이터 설정](#4-초기-데이터-설정)
5. [테스트](#5-테스트)

---

## 1. Supabase 프로젝트 설정

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 설정에서 다음 정보 확인:
   - Project URL
   - API Keys (anon/public key)

---

## 2. 데이터베이스 마이그레이션 실행

Supabase Dashboard의 **SQL Editor**에서 다음 순서로 마이그레이션을 실행하세요:

### Step 1: 초기 스키마 생성
`supabase/migrations/001_initial_schema.sql` 파일의 전체 내용을 복사하여 실행

이 마이그레이션은 다음을 생성합니다:
- `user_profiles` 테이블
- `tasks` 테이블
- `feedbacks` 테이블
- `comments` 테이블
- `notifications` 테이블
- 인덱스 및 트리거

### Step 2: RLS 정책 설정
`supabase/migrations/002_rls_policies.sql` 파일의 전체 내용을 복사하여 실행

이 마이그레이션은 Row Level Security 정책을 설정합니다:
- 사용자는 자신의 데이터만 조회/수정 가능
- 관리자는 모든 데이터 조회/수정 가능

### Step 3: 자동 프로필 생성
`supabase/migrations/003_auto_create_profile.sql` 파일의 전체 내용을 복사하여 실행

이 마이그레이션은 사용자 가입 시 자동으로 프로필을 생성하는 트리거를 설정합니다.

### Step 4: 실시간 구독 (선택사항)
`supabase/migrations/004_enable_realtime.sql` 파일의 주석을 해제하여 실행

실시간 업데이트가 필요한 경우에만 실행하세요.

---

## 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ 중요**: `.env.local` 파일은 `.gitignore`에 포함되어 있어야 합니다.

---

## 4. 초기 데이터 설정

### 4.1. 관리자 계정 생성

1. Supabase Dashboard의 **Authentication** > **Users**에서 새 사용자 생성
2. 또는 Auth UI를 통해 회원가입
3. SQL Editor에서 다음 쿼리 실행 (이메일을 실제 이메일로 변경):

```sql
-- 관리자 권한 부여
UPDATE public.user_profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

### 4.2. 테스트 사용자 생성

1. 여러 사용자 계정 생성 (일반 사용자)
2. 각 사용자에게 업무 할당

### 4.3. 샘플 데이터 삽입 (선택사항)

```sql
-- 샘플 업무 데이터 삽입
-- 먼저 user_profiles에서 사용자 ID를 확인하세요
INSERT INTO public.tasks (title, description, assigned_to, status, progress, deadline, traffic_light)
SELECT 
  '데이터 댐 구축 2차 제안서 마감',
  '데이터 댐 구축 사업 2차 제안서 작성 및 제출',
  id,
  'todo',
  0,
  CURRENT_DATE + INTERVAL '5 days',
  'red'
FROM public.user_profiles
WHERE role = 'user'
LIMIT 1;
```

---

## 5. 테스트

### 5.1. 로컬 개발 서버 실행

```bash
npm run dev
```

### 5.2. 로그인 테스트

1. `/login` 페이지로 이동
2. 생성한 계정으로 로그인
3. 역할에 따라 `/user` 또는 `/admin`으로 리다이렉트되는지 확인

### 5.3. 기능 테스트

#### 이용자 페이지 (`/user`)
- ✅ 업무 목록 조회
- ✅ 업무 상태 변경 (드래그앤드롭)
- ✅ 업무 상세 보기
- ✅ 상태 업데이트
- ✅ 새 업무 등록
- ✅ 피드백 확인
- ✅ 댓글 작성

#### 관리자 페이지 (`/admin`)
- ✅ 전체 직원 업무 현황 조회
- ✅ 필터링 (오늘 마감, 진행중, 완료)
- ✅ 업무 상세 보기
- ✅ 피드백 작성
- ✅ 댓글 확인
- ✅ 통계 및 현황 보기

---

## 🔧 문제 해결

### 연결 오류
- **증상**: "Failed to connect to Supabase"
- **해결**: 
  - `.env.local` 파일의 URL과 키가 올바른지 확인
  - Supabase 프로젝트가 활성 상태인지 확인
  - 네트워크 연결 확인

### 권한 오류
- **증상**: "permission denied" 또는 데이터가 보이지 않음
- **해결**:
  - RLS 정책이 올바르게 설정되었는지 확인
  - 사용자 역할(role)이 올바르게 설정되었는지 확인
  - Supabase Dashboard의 **Authentication** > **Policies**에서 정책 확인

### 데이터가 표시되지 않음
- **증상**: 페이지는 로드되지만 데이터가 없음
- **해결**:
  - 데이터베이스에 실제 데이터가 있는지 확인
  - 브라우저 콘솔에서 에러 확인
  - Supabase Dashboard의 **Table Editor**에서 데이터 확인

### 타입 오류
- **증상**: TypeScript 컴파일 오류
- **해결**:
  - `src/types/index.ts`의 타입 정의 확인
  - 데이터베이스 스키마와 타입 정의가 일치하는지 확인

---

## 📚 추가 리소스

- [Supabase 문서](https://supabase.com/docs)
- [Supabase React 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ 체크리스트

마이그레이션 실행 전:
- [ ] Supabase 프로젝트 생성 완료
- [ ] 환경 변수 설정 완료

마이그레이션 실행:
- [ ] `001_initial_schema.sql` 실행 완료
- [ ] `002_rls_policies.sql` 실행 완료
- [ ] `003_auto_create_profile.sql` 실행 완료

초기 설정:
- [ ] 관리자 계정 생성 및 권한 설정
- [ ] 테스트 사용자 생성
- [ ] 샘플 데이터 삽입 (선택사항)

테스트:
- [ ] 로그인 기능 테스트
- [ ] 이용자 페이지 기능 테스트
- [ ] 관리자 페이지 기능 테스트

---

## 🚀 다음 단계

백엔드 설정이 완료되면:

1. **실제 사용자 데이터로 테스트**
2. **실시간 업데이트 활성화** (필요한 경우)
3. **이미지 업로드 기능 추가** (피드백 첨부)
4. **알림 시스템 고도화**
5. **성능 최적화** (인덱스, 쿼리 최적화)

