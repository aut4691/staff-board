import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, User, Mail, Briefcase } from 'lucide-react'

export const ProfilePage = () => {
  const { user, signOut } = useAuth()
  const { setUser } = useAuthStore()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        position: user.position || '',
      })
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      if (!user?.id) {
        throw new Error('사용자 정보를 찾을 수 없습니다.')
      }

      // Validate name
      if (!formData.name.trim()) {
        setError('이름을 입력해주세요.')
        setSaving(false)
        return
      }

      console.log('Updating profile:', { id: user.id, name: formData.name.trim(), position: formData.position.trim() || null })

      const { data: updatedData, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          name: formData.name.trim(),
          position: formData.position.trim() || null,
        })
        .eq('id', user.id)
        .select()

      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }

      if (!updatedData || updatedData.length === 0) {
        throw new Error('업데이트된 데이터를 받지 못했습니다.')
      }

      const updatedUser = updatedData[0]
      console.log('Updated user:', updatedUser)

      setSuccess('회원정보가 성공적으로 수정되었습니다.')
      
      // Update auth store immediately
      setUser(updatedUser)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err: any) {
      console.error('Save error:', err)
      const errorMessage = err.message || err.error_description || '회원정보 수정에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      try {
        console.log('Logging out...')
        await signOut()
        console.log('Sign out successful, navigating to login...')
        // Clear any local state
        setUser(null)
        // Navigate to login
        navigate('/login', { replace: true })
        // Force reload to clear all state
        window.location.href = '/login'
      } catch (error) {
        console.error('Logout error:', error)
        setError('로그아웃 중 오류가 발생했습니다.')
      }
    }
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <p className="text-gray-600">사용자 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">뒤로 가기</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            회원정보 수정
          </h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* User Info Display */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {user.role === 'admin' ? '관리자' : '일반 사용자'}
                  </span>
                  {user.position && (
                    <span className="text-xs text-gray-500">({user.position})</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="이름을 입력하세요"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                이메일은 변경할 수 없습니다.
              </p>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                직급
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="팀장, 연구원, 사원 등"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    저장
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>로그아웃</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

