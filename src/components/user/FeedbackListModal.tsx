import { X, MessageCircle, Clock, FileText } from 'lucide-react'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Feedback } from '@/types/index'

interface FeedbackListModalProps {
  isOpen: boolean
  onClose: () => void
  unreadFeedbacks: Feedback[]
  userId?: string
  onMarkAsViewed?: () => void
  onFeedbackClick?: (taskId: string) => void
}

interface FeedbackItem {
  id: string
  task_id: string
  task_title: string
  from_user_name: string
  message: string
  created_at: string
  timestamp: string
}

export const FeedbackListModal = ({
  isOpen,
  onClose,
  unreadFeedbacks,
  userId,
  onMarkAsViewed,
  onFeedbackClick,
}: FeedbackListModalProps) => {
  // Fetch detailed feedbacks with task titles
  const { data: feedbackItems = [], isLoading } = useQuery({
    queryKey: ['user-feedbacks-list', unreadFeedbacks.map(f => f.id).join('-')],
    queryFn: async () => {
      if (unreadFeedbacks.length === 0) return []

      const allFeedbacks: FeedbackItem[] = []

      // Get all task IDs
      const taskIds = [...new Set(unreadFeedbacks.map((f) => f.task_id))]

      if (taskIds.length === 0) return []

      // Fetch task titles
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title')
        .in('id', taskIds)

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
        return []
      }

      const taskMap = new Map(tasks?.map((t) => [t.id, t.title]) || [])

      // Fetch from_user names
      const fromUserIds = [...new Set(unreadFeedbacks.map((f) => f.from_user_id))]
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, name')
        .in('id', fromUserIds)

      if (usersError) {
        console.error('Error fetching users:', usersError)
        return []
      }

      const userMap = new Map(users?.map((u) => [u.id, u.name]) || [])

      // Combine feedbacks with task titles and user names
      unreadFeedbacks.forEach((feedback) => {
        allFeedbacks.push({
          id: feedback.id,
          task_id: feedback.task_id,
          task_title: taskMap.get(feedback.task_id) || 'Unknown Task',
          from_user_name: userMap.get(feedback.from_user_id) || '센터장',
          message: feedback.message,
          created_at: feedback.created_at,
          timestamp: new Date(feedback.created_at).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        })
      })

      // Sort by created_at (newest first)
      return allFeedbacks.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    },
    enabled: isOpen && unreadFeedbacks.length > 0,
  })

  // Mark feedbacks as read when modal opens
  useEffect(() => {
    const markAsRead = async () => {
      if (!isOpen || !userId || unreadFeedbacks.length === 0) return

      try {
        // Get all feedback IDs
        const feedbackIds = unreadFeedbacks.map((f) => f.id)

        // Update is_read for all feedbacks
        const { error } = await supabase
          .from('feedbacks')
          .update({ is_read: true })
          .in('id', feedbackIds)
          .eq('to_user_id', userId)

        if (error) {
          console.error('Error marking feedbacks as read:', error)
        } else {
          console.log('Feedbacks marked as read')
          // Invalidate queries to refresh unread feedbacks count
          if (onMarkAsViewed) {
            onMarkAsViewed()
          }
        }
      } catch (error) {
        console.error('Error marking feedbacks as read:', error)
      }
    }

    if (isOpen) {
      markAsRead()
    }
  }, [isOpen, userId, unreadFeedbacks, onMarkAsViewed])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-5 md:px-6 py-4 md:py-5 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white">새로운 피드백</h3>
            {unreadFeedbacks.length > 0 && (
              <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-bold text-white">
                {unreadFeedbacks.length}개
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all duration-200"
            aria-label="닫기"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar min-h-0 space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">로딩 중...</div>
          ) : feedbackItems.length === 0 ? (
            <div className="text-center text-gray-500 py-8">새로운 피드백이 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {feedbackItems.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    if (onFeedbackClick) {
                      onFeedbackClick(feedback.task_id)
                      onClose()
                    }
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {feedback.from_user_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex flex-col flex-grow">
                      <span className="font-semibold text-sm text-gray-900">
                        {feedback.from_user_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        <Clock className="inline-block w-3 h-3 mr-1" />
                        {feedback.timestamp}
                      </span>
                    </div>
                  </div>
                  <div className="pl-9">
                    <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      업무: <span className="font-medium text-gray-800">{feedback.task_title}</span>
                    </p>
                    <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">
                      {feedback.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

