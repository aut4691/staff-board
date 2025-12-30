import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, UserPlus, User, X, Sparkles } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'
import { useAuthStore } from '@/stores/authStore'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSignup, setShowSignup] = useState(false)
  const [rememberEmail, setRememberEmail] = useState(false)
  const [isFormFocused, setIsFormFocused] = useState(false)
  const navigate = useNavigate()

  // Load saved email on mount from Supabase
  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        // First check localStorage for quick loading
        const localEmail = localStorage.getItem('remembered_email')
        const localRemember = localStorage.getItem('remember_email') === 'true'
        
        if (localEmail && localRemember) {
          setEmail(localEmail)
          setRememberEmail(true)
        }
        
        // Then check Supabase for the latest saved email
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('saved_email, remember_email')
            .eq('id', session.user.id)
            .single()
          
          if (!error && profile) {
            if (profile.remember_email && profile.saved_email) {
              setEmail(profile.saved_email)
              setRememberEmail(true)
              // Sync with localStorage
              localStorage.setItem('remembered_email', profile.saved_email)
              localStorage.setItem('remember_email', 'true')
            } else {
              // Clear if not remembered
              setEmail('')
              setRememberEmail(false)
              localStorage.removeItem('remembered_email')
              localStorage.removeItem('remember_email')
            }
          }
        } else {
          // No session, try to load from localStorage only
          if (localEmail && localRemember) {
            setEmail(localEmail)
            setRememberEmail(true)
          }
        }
      } catch (error) {
        console.error('Error loading saved email:', error)
        // Fallback to localStorage
        const localEmail = localStorage.getItem('remembered_email')
        const localRemember = localStorage.getItem('remember_email') === 'true'
        if (localEmail && localRemember) {
          setEmail(localEmail)
          setRememberEmail(true)
        }
      }
    }
    
    loadSavedEmail()
  }, [])

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    position: '',
  })
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupError, setSignupError] = useState('')

  // ESC key to close signup modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSignup) {
          setShowSignup(false)
          setSignupError('')
          setSignupData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            position: '',
          })
        }
      }
    }

    if (showSignup) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showSignup])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Handle email not confirmed error
        if (authError.message.includes('Email not confirmed') || authError.message.includes('email_not_confirmed')) {
          setError('이메일 인증이 필요합니다. 이메일을 확인해주세요.')
          setLoading(false)
          return
        }
        throw authError
      }

      if (data.user) {
        // Save email to Supabase if remember checkbox is checked (async, don't wait)
        if (rememberEmail) {
          // Save to localStorage immediately
          localStorage.setItem('remembered_email', email)
          localStorage.setItem('remember_email', 'true')
          
          // Save to Supabase (async, don't block - fire and forget)
          Promise.resolve(
            supabase
              .from('user_profiles')
              .update({
                saved_email: email,
                remember_email: true,
              })
              .eq('id', data.user.id)
          ).catch((saveError: any) => {
            console.error('Error saving email preference:', saveError)
            // localStorage is already saved, so continue
          })
        } else {
          // Remove from localStorage immediately
          localStorage.removeItem('remembered_email')
          localStorage.removeItem('remember_email')
          
          // Remove from Supabase (async, don't block - fire and forget)
          Promise.resolve(
            supabase
              .from('user_profiles')
              .update({
                saved_email: null,
                remember_email: false,
              })
              .eq('id', data.user.id)
          ).catch((saveError: any) => {
            console.error('Error removing email preference:', saveError)
          })
        }

        // Fetch full user profile and set it in auth store
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          setError('사용자 정보를 불러올 수 없습니다.')
          setLoading(false)
          return
        }

        if (!profile) {
          setError('사용자 프로필을 찾을 수 없습니다.')
          setLoading(false)
          return
        }

        // Set user in auth store manually to avoid waiting for onAuthStateChange
        useAuthStore.getState().setUser(profile)
        useAuthStore.getState().setLoading(false)

        console.log('User set in auth store, navigating...', profile.role)

        // Reset loading state before navigation
        setLoading(false)

        // Navigate based on role with a small delay to ensure state is updated
        setTimeout(() => {
          if (profile.role === 'admin') {
            navigate('/admin', { replace: true })
          } else {
            navigate('/user', { replace: true })
          }
        }, 100)
      } else {
        // No user data returned
        setError('로그인에 실패했습니다. 사용자 정보를 가져올 수 없습니다.')
        setLoading(false)
      }
    } catch (err: any) {
      // More user-friendly error messages
      let errorMessage = '로그인에 실패했습니다.'
      
      if (err.message) {
        if (err.message.includes('Invalid login credentials') || err.message.includes('invalid_credentials')) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.'
        } else if (err.message.includes('Email not confirmed') || err.message.includes('email_not_confirmed')) {
          errorMessage = '이메일 인증이 필요합니다. 이메일을 확인해주세요.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.')
      return
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      alert('인증 이메일을 다시 전송했습니다. 이메일을 확인해주세요.')
    } catch (err: any) {
      setError(err.message || '인증 이메일 재전송에 실패했습니다.')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError('')

    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      setSignupError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (signupData.password.length < 6) {
      setSignupError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    if (!signupData.name.trim()) {
      setSignupError('이름을 입력해주세요.')
      return
    }

    setSignupLoading(true)

    try {
      // Sign up with Supabase Auth
      // The handle_new_user trigger will automatically create the profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            name: signupData.name,
            position: signupData.position || null,
            role: 'user', // Default role
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Profile is automatically created by trigger
        // If position was provided, it's already in the metadata and will be saved
        
        // Check if email confirmation is required
        if (authData.user.email_confirmed_at === null) {
          alert('회원가입이 완료되었습니다!\n\n이메일 인증 링크를 확인해주세요.\n이메일을 확인한 후 로그인해주세요.')
        } else {
          alert('회원가입이 완료되었습니다! 로그인해주세요.')
        }
        
        setShowSignup(false)
        setSignupData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          position: '',
        })
      }
    } catch (err: any) {
      setSignupError(err.message || '회원가입에 실패했습니다.')
    } finally {
      setSignupLoading(false)
    }
  }


  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
      {/* Night Sky Background with Animated Stars */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
        {/* Animated Stars Layer 1 - Small stars */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => {
            const size = Math.random() * 2 + 0.5
            const left = Math.random() * 100
            const top = Math.random() * 100
            const delay = Math.random() * 3
            const duration = 2 + Math.random() * 3
            
            return (
              <div
                key={`star-small-${i}`}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  top: `${top}%`,
                  boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.8)`,
                  animation: !isFormFocused ? `twinkle ${duration}s ease-in-out infinite` : 'none',
                  animationDelay: `${delay}s`,
                  opacity: 0.6 + Math.random() * 0.4,
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)',
                }}
              />
            )
          })}
        </div>

        {/* Animated Stars Layer 2 - Medium stars */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => {
            const size = Math.random() * 1.5 + 1
            const left = Math.random() * 100
            const top = Math.random() * 100
            const delay = Math.random() * 4
            const duration = 3 + Math.random() * 4
            
            return (
              <div
                key={`star-medium-${i}`}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  top: `${top}%`,
                  boxShadow: `0 0 ${size * 3}px rgba(255, 255, 255, 1), 0 0 ${size * 6}px rgba(147, 197, 253, 0.5)`,
                  animation: !isFormFocused ? `twinkle ${duration}s ease-in-out infinite` : 'none',
                  animationDelay: `${delay}s`,
                  opacity: 0.7 + Math.random() * 0.3,
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)',
                }}
              />
            )
          })}
        </div>

        {/* Animated Stars Layer 3 - Large bright stars */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => {
            const size = Math.random() * 2 + 2
            const left = Math.random() * 100
            const top = Math.random() * 100
            const delay = Math.random() * 5
            const duration = 4 + Math.random() * 3
            
            return (
              <div
                key={`star-large-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  top: `${top}%`,
                  background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(147,197,253,0.8) 50%, transparent 100%)',
                  boxShadow: `
                    0 0 ${size * 2}px rgba(255, 255, 255, 1),
                    0 0 ${size * 4}px rgba(147, 197, 253, 0.8),
                    0 0 ${size * 8}px rgba(99, 102, 241, 0.4)
                  `,
                  animation: !isFormFocused ? `twinkle ${duration}s ease-in-out infinite, float ${10 + Math.random() * 10}s ease-in-out infinite` : 'none',
                  animationDelay: `${delay}s`,
                  opacity: 0.8 + Math.random() * 0.2,
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)',
                }}
              />
            )
          })}
        </div>

        {/* Shooting Stars - Reduced to 1-2 */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(2)].map((_, i) => {
            const left = 10 + Math.random() * 80
            const top = -10
            const delay = Math.random() * 10
            const duration = 2 + Math.random() * 2
            
            return (
              <div
                key={`shooting-${i}`}
                className="absolute"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: '2px',
                  height: '100px',
                  background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.8), transparent)',
                  transform: `rotate(${-45 + Math.random() * 10}deg)`,
                  animation: !isFormFocused ? `shoot ${duration}s linear infinite` : 'none',
                  animationDelay: `${delay}s`,
                  opacity: 0,
                  willChange: 'transform, opacity',
                }}
              />
            )
          })}
        </div>

        {/* Gradient Overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/30 to-slate-900/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.15),transparent_50%)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {/* Login Box - Smaller */}
        <div className="w-full max-w-sm">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                대구 빅데이터 활용센터
              </h1>
              <p className="text-sm text-gray-600">업무 관리 시스템</p>
            </div>

            {/* Login Form */}
            <form 
              onSubmit={handleLogin} 
              className="space-y-4"
              onFocus={() => setIsFormFocused(true)}
              onBlur={(e) => {
                // Check if focus is moving to another form element
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsFormFocused(false)
                }
              }}
            >
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span>{error}</span>
                    {error.includes('이메일 인증') && (
                      <button
                        type="button"
                        onClick={handleResendConfirmation}
                        className="text-red-600 hover:text-red-800 underline text-xs whitespace-nowrap"
                      >
                        재전송
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="your@email.com"
                />
                {/* Remember Email Checkbox */}
                <div className="mt-1.5 flex items-center">
                  <input
                    type="checkbox"
                    id="rememberEmail"
                    checked={rememberEmail}
                    onChange={async (e) => {
                    const checked = e.target.checked
                    setRememberEmail(checked)
                    
                    // If checking the box, try to load saved email
                    if (checked) {
                      try {
                        // First check if user is logged in
                        const { data: { session } } = await supabase.auth.getSession()
                        if (session?.user) {
                          // Load from Supabase
                          const { data: profile, error } = await supabase
                            .from('user_profiles')
                            .select('saved_email, remember_email')
                            .eq('id', session.user.id)
                            .single()
                          
                          if (!error && profile?.saved_email && profile?.remember_email) {
                            setEmail(profile.saved_email)
                          }
                        } else {
                          // Not logged in, check localStorage
                          const savedEmail = localStorage.getItem('remembered_email')
                          if (savedEmail) {
                            setEmail(savedEmail)
                          }
                        }
                      } catch (error) {
                        console.error('Error loading saved email:', error)
                        // Fallback to localStorage
                        const savedEmail = localStorage.getItem('remembered_email')
                        if (savedEmail) {
                          setEmail(savedEmail)
                        }
                      }
                    }
                    
                    // If email is entered and checking, save it immediately
                    if (checked && email) {
                      try {
                        const { data: { session } } = await supabase.auth.getSession()
                        if (session?.user) {
                          // Save to Supabase
                          await supabase
                            .from('user_profiles')
                            .update({
                              saved_email: email,
                              remember_email: true,
                            })
                            .eq('id', session.user.id)
                        }
                        // Also save to localStorage as backup
                        localStorage.setItem('remembered_email', email)
                        localStorage.setItem('remember_email', 'true')
                      } catch (error) {
                        console.error('Error saving email:', error)
                      }
                    } else if (!checked) {
                      // If unchecking, clear saved email
                      try {
                        const { data: { session } } = await supabase.auth.getSession()
                        if (session?.user) {
                          await supabase
                            .from('user_profiles')
                            .update({
                              saved_email: null,
                              remember_email: false,
                            })
                            .eq('id', session.user.id)
                        }
                        localStorage.removeItem('remembered_email')
                        localStorage.removeItem('remember_email')
                      } catch (error) {
                        console.error('Error clearing saved email:', error)
                      }
                    }
                  }}
                    className="w-3.5 h-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                  />
                  <label
                    htmlFor="rememberEmail"
                    className="ml-1.5 text-xs text-gray-600 cursor-pointer select-none"
                  >
                    이전 이메일 저장하기
                  </label>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    로그인 중...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    로그인
                  </>
                )}
              </button>
            </form>

            {/* Signup Button */}
            <div className="mt-4">
              <button
                onClick={() => setShowSignup(true)}
                className="w-full py-2.5 border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <UserPlus className="w-4 h-4" />
                회원가입
              </button>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                💡 <strong>안내:</strong> 회원가입 후 이메일 인증이 필요합니다.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                🔨 센터외 인원은 회원가입 불가능합니다.
              </p>
            </div>
          </div>

      </div>
      </div>

      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-5 flex items-center justify-between rounded-t-2xl flex-shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">회원가입</h2>
              </div>
              <button
                onClick={() => {
                  setShowSignup(false)
                  setSignupError('')
                  setSignupData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    position: '',
                  })
                }}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200"
                aria-label="닫기"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {signupError && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {signupError}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData({ ...signupData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="홍길동"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Position (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    직급 (선택사항)
                  </label>
                  <input
                    type="text"
                    value={signupData.position}
                    onChange={(e) =>
                      setSignupData({ ...signupData, position: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="팀장, 연구원, 사원 등"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="최소 6자 이상"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    비밀번호는 최소 6자 이상이어야 합니다.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {signupLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      가입 중...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      회원가입
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  )
}

