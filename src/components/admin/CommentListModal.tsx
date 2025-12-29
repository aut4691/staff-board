import { X, MessageCircle, Clock } from 'lucide-react'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface CommentListModalProps {
  isOpen: boolean
  onClose: () => void
  unreadCommentTasks: { task_id: string; feedback_id: string }[]
  adminId?: string
  onMarkAsViewed?: () => void
}

interface CommentItem {
  id: string
  task_id: string
  task_title: string
  feedback_id: string
  author: string
  content: string
  created_at: string
  timestamp: string
}

export const CommentListModal = ({
  isOpen,
  onClose,
  unreadCommentTasks,
  adminId,
  onMarkAsViewed,
}: CommentListModalProps) => {
  // Fetch all comments from unread tasks
  const { data: comments = [] } = useQuery({
    queryKey: ['admin-comments-list', unreadCommentTasks],
    queryFn: async () => {
      if (unreadCommentTasks.length === 0) return []

      const allComments: CommentItem[] = []

      // Get all feedback IDs
      const feedbackIds = [...new Set(unreadCommentTasks.map((item) => item.feedback_id))]

      if (feedbackIds.length === 0) return []

      // Fetch all comments for these feedbacks
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('id, feedback_id, user_id, content, created_at, feedbacks!inner(task_id)')
        .in('feedback_id', feedbackIds)
        .order('created_at', { ascending: false })

      if (commentsError) {
        console.error('Error fetching comments:', commentsError)
        return []
      }

      if (!commentsData) return []

      // Fetch task titles and user names
      for (const comment of commentsData) {
        const taskId = (comment.feedbacks as any)?.task_id

        // Fetch task title
        let taskTitle = '알 수 없음'
        if (taskId) {
          const { data: task, error: taskError } = await supabase
            .from('tasks')
            .select('title')
            .eq('id', taskId)
            .maybeSingle()

          if (!taskError && task) {
            taskTitle = task.title
          }
        }

        // Fetch user name
        let authorName = 'Unknown'
        if (comment.user_id) {
          const { data: user, error: userError } = await supabase
            .from('user_profiles')
            .select('name')
            .eq('id', comment.user_id)
            .maybeSingle()

          if (!userError && user) {
            authorName = user.name
          }
        }

        allComments.push({
          id: comment.id,
          task_id: taskId || '',
          task_title: taskTitle,
          feedback_id: comment.feedback_id,
          author: authorName,
          content: comment.content,
          created_at: comment.created_at,
          timestamp: new Date(comment.created_at).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        })
      }

      return allComments.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    },
    enabled: isOpen && unreadCommentTasks.length > 0,
  })

  // Mark feedbacks as viewed when modal opens
  useEffect(() => {
    const markAsViewed = async () => {
      if (!isOpen || !adminId || unreadCommentTasks.length === 0) return

      try {
        // Get all unique feedback IDs
        const feedbackIds = [...new Set(unreadCommentTasks.map((item) => item.feedback_id))]
        
        // Update last_viewed_at for all feedbacks
        const { error } = await supabase
          .from('feedbacks')
          .update({ last_viewed_at: new Date().toISOString() })
          .in('id', feedbackIds)
          .eq('from_user_id', adminId)

        if (error) {
          console.error('Error marking feedbacks as viewed:', error)
        } else {
          console.log('Feedbacks marked as viewed')
          // Invalidate queries to refresh unread comments count
          if (onMarkAsViewed) {
            onMarkAsViewed()
          }
        }
      } catch (error) {
        console.error('Error marking feedbacks as viewed:', error)
      }
    }

    if (isOpen) {
      markAsViewed()
    }
  }, [isOpen, adminId, unreadCommentTasks, onMarkAsViewed])

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
            <h3 className="text-lg md:text-xl font-bold text-white">새로운 댓글</h3>
            {unreadCommentTasks.length > 0 && (
              <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-bold text-white">
                {unreadCommentTasks.length}개
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
        <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar min-h-0">
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">새로운 댓글이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-all duration-200"
                >
                  {/* Task Title */}
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <p className="text-xs text-gray-600 mb-1 font-medium">관련 업무</p>
                    <p className="font-bold text-gray-900 text-base">{comment.task_title}</p>
                  </div>

                  {/* Comment Content */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {comment.author.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm text-gray-900">
                          {comment.author}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{comment.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-4 md:px-6 py-3 md:py-4 flex justify-end rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

