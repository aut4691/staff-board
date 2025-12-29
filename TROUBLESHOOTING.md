# 로그인 문제 해결 가이드

## 문제: "Email not confirmed" 오류

회원가입은 성공했지만 로그인이 안 되는 경우, 이메일 인증이 완료되지 않았기 때문입니다.

## 해결 방법

### 방법 1: 이메일 인증 완료 (프로덕션 권장)

1. 회원가입 시 받은 이메일 확인
2. 이메일 내 인증 링크 클릭
3. 인증 완료 후 로그인

### 방법 2: Supabase Dashboard에서 이메일 인증 비활성화 (개발 환경)

1. Supabase Dashboard 접속
2. **Authentication** > **Settings** 메뉴로 이동
3. **Email Auth** 섹션에서:
   - **Enable email confirmations** 옵션을 **OFF**로 변경
4. 변경사항 저장

이제 이메일 인증 없이도 로그인할 수 있습니다.

### 방법 3: 사용자 이메일 수동 인증 (개발/테스트용)

Supabase Dashboard에서:

1. **Authentication** > **Users** 메뉴로 이동
2. 인증이 필요한 사용자 선택
3. **Confirm email** 버튼 클릭 또는
4. SQL Editor에서 다음 쿼리 실행:

```sql
-- 특정 사용자의 이메일 인증 상태 확인
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'your-email@example.com';

-- 이메일 인증 상태 업데이트 (개발 환경용)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'your-email@example.com';
```

### 방법 4: 인증 이메일 재전송

로그인 페이지에서:
1. 이메일 입력
2. "이메일 인증이 필요합니다" 에러 메시지 옆의 **재전송** 버튼 클릭
3. 이메일 확인 후 인증 링크 클릭

## 현재 상태 확인

### 사용자 인증 상태 확인 SQL

```sql
-- 모든 사용자의 인증 상태 확인
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '미인증'
    ELSE '인증됨'
  END as status
FROM auth.users
ORDER BY created_at DESC;
```

### 프로필과 인증 상태 함께 확인

```sql
-- 사용자 프로필과 인증 상태 확인
SELECT 
  up.id,
  up.email,
  up.name,
  up.role,
  up.position,
  au.email_confirmed_at,
  CASE 
    WHEN au.email_confirmed_at IS NULL THEN '미인증'
    ELSE '인증됨'
  END as auth_status
FROM public.user_profiles up
JOIN auth.users au ON up.id = au.id
ORDER BY up.created_at DESC;
```

## 권장 설정

### 개발 환경
- 이메일 인증 비활성화 (방법 2)
- 또는 테스트 계정만 수동 인증 (방법 3)

### 프로덕션 환경
- 이메일 인증 활성화 유지
- 사용자에게 이메일 확인 안내
- 인증 이메일 재전송 기능 제공

## 추가 문제 해결

### 로그인은 되지만 프로필이 없는 경우

```sql
-- 프로필이 없는 사용자 확인
SELECT au.id, au.email, au.email_confirmed_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 수동으로 프로필 생성 (필요한 경우)
INSERT INTO public.user_profiles (id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'role', 'user')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles);
```

### 비밀번호 재설정

로그인 페이지에서 비밀번호 재설정 기능을 추가할 수 있습니다:

```typescript
const handleResetPassword = async () => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  
  if (error) {
    setError(error.message)
  } else {
    alert('비밀번호 재설정 이메일을 전송했습니다.')
  }
}
```

