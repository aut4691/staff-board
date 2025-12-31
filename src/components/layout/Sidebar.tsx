import { useEffect } from 'react'
import { ClipboardList, Calendar, PlayCircle, CheckCircle, X, MessageSquare, RefreshCw } from 'lucide-react'
import { useRecentFeedbacks } from '@/hooks/useFeedbacks'
import { useAuthStore } from '@/stores/authStore'

interface SidebarProps {
  selectedMenu: string
  onMenuChange: (menu: string) => void
  taskCounts?: {
    all: number
    today: number
    inProgress: number
    completed: number
  }
  isOpen?: boolean
  onClose?: () => void
  onViewFeedback?: (taskId: string, taskTitle: string, feedbackMessage: string, feedbackDate: string) => void
}

const menuItems = [
  { id: 'all', label: '내업무전체', icon: ClipboardList },
  { id: 'today', label: '오늘마감', icon: Calendar },
  { id: 'in-progress', label: '진행중', icon: PlayCircle },
  { id: 'completed', label: '완료', icon: CheckCircle },
]

export const Sidebar = ({ selectedMenu, onMenuChange, taskCounts, isOpen = false, onClose, onViewFeedback }: SidebarProps) => {
  const { user } = useAuthStore()
  const { data: recentFeedbacks = [], isLoading, error, refetch } = useRecentFeedbacks(user?.id || '')

  // 주기적으로 refetch (추가 보장)
  useEffect(() => {
    if (!user?.id) return

    const interval = setInterval(() => {
      console.log('🔄 [Sidebar] Auto-refetching recent feedbacks')
      refetch()
    }, 60000) // 1분마다

    return () => clearInterval(interval)
  }, [user?.id, refetch])

  console.log('📊 [Sidebar] Recent feedbacks state:', {
    count: recentFeedbacks.length,
    isLoading,
    error: error ? String(error) : null,
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    feedbacks: recentFeedbacks.map((f: any) => {
      const taskTitle = Array.isArray(f.tasks) ? f.tasks[0]?.title : f.tasks?.title
      return {
        id: f.id,
        taskTitle,
        message: f.message?.substring(0, 30),
        fromUser: '센터장',
      }
    }),
  })

  // 디버깅: 피드백이 없을 때 상세 정보 표시
  useEffect(() => {
    if (!isLoading && recentFeedbacks.length === 0 && user?.id) {
      console.warn('⚠️ [Sidebar] No feedbacks displayed for user:', {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
      })
    }
  }, [isLoading, recentFeedbacks.length, user?.id, user?.name, user?.email])

  const getCount = (id: string) => {
    if (!taskCounts) return 0
    switch (id) {
      case 'all': return taskCounts.all
      case 'today': return taskCounts.today
      case 'in-progress': return taskCounts.inProgress
      case 'completed': return taskCounts.completed
      default: return 0
    }
  }

  const handleMenuClick = (menu: string) => {
    onMenuChange(menu)
    // 모바일에서 메뉴 선택 시 사이드바 닫기
    if (onClose) {
      onClose()
    }
  }

  // 시간 경과 표시 함수
  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  return (
    <>
      {/* Mobile Overlay Background */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-64 md:w-56 lg:w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        transition-transform duration-300 ease-in-out
        bg-white/20 backdrop-blur-xl border-r border-white/30
        flex flex-col shadow-2xl
      `}>
        {/* Close Button (Mobile Only) */}
        {onClose && (
          <button 
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-2 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-200 hover:scale-110 border border-white/20 z-10"
            aria-label="닫기"
            title="닫기"
          >
            <X className="w-6 h-6 text-white drop-shadow-md" />
          </button>
        )}

        <nav className="flex-1 p-3 md:p-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const count = getCount(item.id)
            const isSelected = selectedMenu === item.id
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 flex items-center justify-between group backdrop-blur-md border ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-500/90 to-blue-500/90 text-white shadow-2xl transform scale-105 border-white/40'
                      : 'bg-white/30 hover:bg-white/40 hover:shadow-lg hover:transform hover:scale-102 border-white/30 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isSelected ? 'text-white' : 'text-gray-700 group-hover:text-indigo-600'}`} />
                    <span className={`font-medium text-sm md:text-base ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                      {item.label}
                    </span>
                  </div>
                  {count > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold backdrop-blur-md ${
                      isSelected 
                        ? 'bg-white/40 text-white border border-white/30' 
                        : 'bg-indigo-500/80 text-white border border-indigo-400/50 group-hover:bg-indigo-600/80'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Recent Feedbacks */}
        <div className="mt-4 bg-white/90 backdrop-blur-md rounded-xl p-3 border border-indigo-200 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-800">최신 피드백</h3>
            </div>
            <button
              onClick={() => {
                console.log('🔄 [Sidebar] Manual refetch triggered')
                refetch()
              }}
              className="p-1 hover:bg-indigo-100 rounded transition-colors"
              title="새로고침"
            >
              <RefreshCw className="w-3 h-3 text-indigo-600" />
            </button>
          </div>
          {isLoading ? (
            <div className="text-xs text-gray-500 text-center py-2">로딩 중...</div>
          ) : error ? (
            <div className="text-xs text-red-500 text-center py-2">
              오류 발생
              <br />
              <span className="text-[10px]">{String(error)}</span>
            </div>
          ) : recentFeedbacks.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {recentFeedbacks.map((feedback: any) => {
                const timeAgo = getTimeAgo(feedback.created_at)
                const taskTitle = Array.isArray(feedback.tasks) ? feedback.tasks[0]?.title : feedback.tasks?.title
                const adminName = '센터장'
                return (
                  <div
                    key={feedback.id}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      if (onViewFeedback) {
                        onViewFeedback(
                          feedback.task_id,
                          taskTitle || '업무',
                          feedback.message,
                          feedback.created_at
                        )
                        if (onClose) onClose()
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">💬</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {feedback.tasks?.title || '업무'}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                          {feedback.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-indigo-600">{timeAgo}</p>
                          <p className="text-xs text-gray-500">{adminName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-xs text-gray-500 text-center py-2">
              <p>피드백이 없습니다</p>
              <p className="text-[10px] mt-1 text-gray-400">
                관리자가 피드백을 작성하면 여기에 표시됩니다
              </p>
            </div>
          )}
        </div>
      </nav>
    </aside>
    </>
  )
}

