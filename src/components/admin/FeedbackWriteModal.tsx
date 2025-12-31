import { useState, useEffect, useMemo } from 'react'
import { X, Send, MessageSquare, FileText, Heart } from 'lucide-react'
import { useFeedbacks, useToggleCommentLike } from '@/hooks/useFeedbacks'
import type { Task } from '@/types/index'

interface ChatMessage {
  id: string
  type: 'feedback' | 'comment'
  author: string
  content: string
  timestamp: string
  created_at: string // For sorting
  like_count?: number
  is_liked?: boolean
}

interface FeedbackWriteModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task
  employee: { id: string; name: string; position: string }
  onSend: (message: string) => void
}

export const FeedbackWriteModal = ({
  isOpen,
  onClose,
  task,
  employee: _employee, // Unused but required by interface
  onSend,
}: FeedbackWriteModalProps) => {
  const { data: feedbacks = [] } = useFeedbacks(task.id)
  const toggleLike = useToggleCommentLike()
  const [feedback, setFeedback] = useState('')

  // Combine feedbacks and comments into a single timeline, sorted by time
  const chatMessages: ChatMessage[] = useMemo(() => {
    const messages: ChatMessage[] = []
    
    // Add feedbacks as messages
    feedbacks.forEach((fb: any) => {
      messages.push({
        id: fb.id,
        type: 'feedback',
        author: fb.from_user_name || '센터장',
        content: fb.message,
        timestamp: new Date(fb.created_at).toLocaleString('ko-KR', {
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        created_at: fb.created_at,
      })
      
      // Add comments as messages
      if (fb.comments) {
        fb.comments.forEach((comment: any) => {
          messages.push({
            id: comment.id,
            type: 'comment',
            author: comment.author || 'Unknown',
            content: comment.content,
            timestamp: new Date(comment.created_at).toLocaleString('ko-KR', {
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            created_at: comment.created_at,
            like_count: comment.like_count || 0,
            is_liked: comment.is_liked || false,
          })
        })
      }
    })
    
    // Sort by created_at timestamp
    return messages.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }, [feedbacks])

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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFeedback('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSend = () => {
    if (!feedback.trim()) {
      alert('피드백을 입력해주세요.')
      return
    }

    onSend(feedback)
    setFeedback('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full h-[90vh] max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 border border-gray-200/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-xl px-5 md:px-6 py-4 md:py-5 flex items-center justify-between rounded-t-2xl flex-shrink-0 border-b border-white/20">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-white/30 backdrop-blur-md p-2 rounded-lg border border-white/20">
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-lg">피드백 작성</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-200 border border-white/20"
            aria-label="닫기"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar min-h-0 space-y-4" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Task Name */}
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 backdrop-blur-md rounded-xl p-4 border border-indigo-200 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gray-700" />
              <span className="text-xs text-gray-700 font-medium">업무명</span>
            </div>
            <p className="font-bold text-gray-900 text-base md:text-lg">{task.title}</p>
          </div>

          {/* Chat Timeline - Feedback and Comments combined */}
          {chatMessages.length > 0 && (
            <div className="border-t-2 border-gray-200 pt-4">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                대화 내역
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-lg p-3 border backdrop-blur-md shadow-lg ${
                      message.type === 'feedback'
                        ? 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300'
                        : 'bg-gradient-to-br from-white to-blue-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          message.type === 'feedback'
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                        }`}
                      >
                        <span className="text-white text-xs font-bold">
                          {message.author.charAt(0)}
                        </span>
                      </div>
                      <span className="font-semibold text-sm text-gray-900">
                        {message.author}
                      </span>
                      {message.type === 'feedback' && (
                        <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                          피드백
                        </span>
                      )}
                      <span className="text-xs text-gray-500 ml-auto">
                        {message.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed pl-8 mb-2">
                      {message.content}
                    </p>
                    {/* Like Button - Only for comments */}
                    {message.type === 'comment' && (
                      <div className="pl-8">
                        <button
                          onClick={async () => {
                            try {
                              await toggleLike.mutateAsync({
                                commentId: message.id,
                                isLiked: message.is_liked || false,
                              })
                            } catch (error: any) {
                              console.error('Error toggling like:', error)
                              alert(error?.message || '좋아요 처리에 실패했습니다.')
                            }
                          }}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 ${
                            message.is_liked
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          disabled={toggleLike.isPending}
                        >
                          <Heart
                            className={`w-4 h-4 ${message.is_liked ? 'fill-current' : ''}`}
                          />
                          <span className="text-xs font-medium">
                            {message.like_count || 0}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Input */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              센터장 피드백
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="피드백을 입력하세요..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 custom-scrollbar bg-white"
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white/95 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 flex justify-end gap-2 md:gap-3 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 bg-white backdrop-blur-md text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-lg"
          >
            취소
          </button>
          <button
            onClick={handleSend}
            className="px-8 py-2 bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-md text-white rounded-lg hover:shadow-lg transition-all duration-200 font-bold flex items-center gap-2 border border-white/30 shadow-lg"
          >
            <Send className="w-4 h-4" />
            전송
          </button>
        </div>
      </div>
    </div>
  )
}

