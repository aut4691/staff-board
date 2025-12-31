import { useEffect } from 'react'
import { Users, Calendar, PlayCircle, CheckCircle, BarChart3, UserCog, X, MessageSquare, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useLatestAdminComments } from '@/hooks/useFeedbacks'

interface AdminSidebarProps {
  selectedFilter: string
  onFilterChange: (filter: string) => void
  taskCounts?: {
    all: number
    today: number
    inProgress: number
    completed: number
  }
  isOpen?: boolean
  onClose?: () => void
}

const menuItems = [
  { id: 'all', label: '전체 직원', icon: Users },
  { id: 'today', label: '오늘 마감', icon: Calendar },
  { id: 'in-progress', label: '진행중', icon: PlayCircle },
  { id: 'completed', label: '완료', icon: CheckCircle },
  { id: 'statistics', label: '통계 및 현황', icon: BarChart3 },
  { id: 'employee-management', label: '직원관리', icon: UserCog },
]

export const AdminSidebar = ({ selectedFilter, onFilterChange, taskCounts, isOpen = false, onClose }: AdminSidebarProps) => {
  const { user } = useAuthStore()
  const { data: latestComments = [], isLoading, error, refetch } = useLatestAdminComments(user?.id || '')

  // 자동 리프레시 (1분마다)
  useEffect(() => {
    if (!user?.id) return
    const interval = setInterval(() => refetch(), 60000)
    return () => clearInterval(interval)
  }, [user?.id, refetch])

  const getCount = (id: string) => {
    if (!taskCounts) return 0
    switch (id) {
      case 'all': return taskCounts.all
      case 'today': return taskCounts.today
      case 'in-progress': return taskCounts.inProgress
      case 'completed': return taskCounts.completed
      case 'statistics': return 0 // 통계는 카운트 없음
      case 'employee-management': return 0 // 직원관리는 카운트 없음
      default: return 0
    }
  }

  const handleFilterClick = (filter: string) => {
    onFilterChange(filter)
    // 모바일에서 필터 선택 시 사이드바 닫기
    if (onClose) {
      onClose()
    }
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
        flex flex-col shadow-2xl flex-shrink-0
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
            const isSelected = selectedFilter === item.id
            const count = getCount(item.id)

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleFilterClick(item.id)}
                  className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 flex items-center justify-between group backdrop-blur-md border ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-500/90 to-blue-500/90 text-white shadow-2xl transform scale-105 border-white/40'
                      : 'bg-white/30 hover:bg-white/40 hover:shadow-lg hover:transform hover:scale-102 border-white/30 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <Icon
                      className={`w-4 h-4 md:w-5 md:h-5 ${
                        isSelected ? 'text-white' : 'text-gray-700 group-hover:text-indigo-600'
                      }`}
                    />
                    <span
                      className={`font-medium text-sm md:text-base ${
                        isSelected ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {count > 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold backdrop-blur-md ${
                        isSelected
                          ? 'bg-white/40 text-white border border-white/30'
                          : 'bg-indigo-500/80 text-white border border-indigo-400/50 group-hover:bg-indigo-600/80'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Latest Comments from Employees */}
        <div className="mt-4 bg-white/90 backdrop-blur-md rounded-xl p-3 border border-indigo-200 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-800">직원 최신 댓글</h3>
            </div>
            <button
              onClick={() => refetch()}
              className="p-1 hover:bg-indigo-100 rounded transition-colors"
              title="새로고침"
            >
              <RefreshCw className="w-3 h-3 text-indigo-600" />
            </button>
          </div>

          {isLoading ? (
            <div className="text-xs text-gray-500 text-center py-2">로딩 중...</div>
          ) : error ? (
            <div className="text-xs text-red-500 text-center py-2">오류 발생</div>
          ) : latestComments.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {latestComments.map((comment: any) => {
                const taskTitle = Array.isArray(comment.feedbacks?.tasks)
                  ? comment.feedbacks.tasks[0]?.title
                  : comment.feedbacks?.tasks?.title

                const timeAgo = (() => {
                  const now = new Date()
                  const date = new Date(comment.created_at)
                  const diffMs = now.getTime() - date.getTime()
                  const diffMins = Math.floor(diffMs / 60000)
                  const diffHours = Math.floor(diffMs / 3600000)
                  const diffDays = Math.floor(diffMs / 86400000)
                  if (diffMins < 1) return '방금 전'
                  if (diffMins < 60) return `${diffMins}분 전`
                  if (diffHours < 24) return `${diffHours}시간 전`
                  if (diffDays < 7) return `${diffDays}일 전`
                  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                })()

                return (
                  <div
                    key={comment.id}
                    className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-2 border border-indigo-100 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">💬</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {taskTitle || '업무'}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                          {comment.content}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-indigo-600">{timeAgo}</p>
                          <p className="text-xs text-gray-500">
                            {comment.user_profiles?.name || '직원'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-xs text-gray-500 text-center py-2">
              <p>직원 댓글이 없습니다</p>
              <p className="text-[10px] mt-1 text-gray-400">댓글이 등록되면 표시됩니다</p>
            </div>
          )}
        </div>
      </nav>
    </aside>
    </>
  )
}

