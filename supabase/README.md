# Supabase 데이터베이스 설정 가이드

## 1. 마이그레이션 실행

Supabase 대시보드에서 SQL Editor를 열고 다음 순서로 마이그레이션을 실행하세요:

### Step 1: 초기 스키마 생성
`001_initial_schema.sql` 파일의 내용을 실행하여 테이블을 생성합니다.

### Step 2: RLS 정책 설정
`002_rls_policies.sql` 파일의 내용을 실행하여 Row Level Security 정책을 설정합니다.

## 2. 초기 데이터 설정

### 사용자 프로필 생성 함수
사용자가 Supabase Auth에 가입하면 자동으로 프로필을 생성하는 함수를 추가하세요:

```sql
-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 3. 테스트 데이터 삽입

### 관리자 계정 생성
Supabase Auth에서 관리자 계정을 생성한 후, 프로필을 업데이트하세요:

```sql
-- Update user role to admin (replace USER_ID with actual user ID)
UPDATE public.user_profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

### 샘플 업무 데이터
```sql
-- Insert sample tasks (replace USER_ID with actual user IDs)
INSERT INTO public.tasks (title, description, assigned_to, status, progress, deadline, traffic_light)
VALUES
  ('데이터 댐 구축 2차 제안서 마감', '데이터 댐 구축 사업 2차 제안서 작성 및 제출', 'USER_ID', 'todo', 0, '2024-12-25', 'red'),
  ('모델 학습 데이터 확보', '모델 학습을 위한 데이터셋 수집 및 정제 작업', 'USER_ID', 'in_progress', 30, '2024-12-27', 'green');
```

## 4. 환경 변수 설정

`.env.local` 파일에 다음 변수들이 설정되어 있는지 확인하세요:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. RLS 정책 확인

모든 테이블에 RLS가 활성화되어 있고, 적절한 정책이 설정되어 있는지 확인하세요.

## 6. 실시간 구독 (선택사항)

실시간 업데이트를 원하는 경우, Supabase Realtime을 활성화하세요:

```sql
-- Enable Realtime for tasks table
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE feedbacks;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

## 문제 해결

### 연결 타임아웃
- Supabase 프로젝트가 활성 상태인지 확인
- 네트워크 연결 확인
- 환경 변수가 올바르게 설정되었는지 확인

### 권한 오류
- RLS 정책이 올바르게 설정되었는지 확인
- 사용자 역할(role)이 올바르게 설정되었는지 확인

