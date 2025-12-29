import { X, MessageSquare, User, Send, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
}

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  taskTitle: string
  feedbackMessage: string
  onConfirm: () => void
  feedbackDate?: string
}

export const FeedbackModal = ({
  isOpen,
  onClose,
  taskTitle,
  feedbackMessage,
  onConfirm,
  feedbackDate,
}: FeedbackModalProps) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const MAX_COMMENTS = 5

  const handleAddComment = () => {
    if (!newComment.trim()) return
    if (comments.length >= MAX_COMMENTS) {
      alert(`최대 ${MAX_COMMENTS}개까지만 댓글을 작성할 수 있습니다.`)
      return
    }

    const comment: Comment = {
      id: Date.now().toString(),
      author: '김 책임', // In real app, get from auth state
      content: newComment.trim(),
      timestamp: new Date().toLocaleString('ko-KR', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setComments([...comments, comment])
    setNewComment('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddComment()
    }
  }

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
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 md:px-6 py-4 md:py-5 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white">센터장님 피드백</h3>
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
          {/* Task Info */}
          <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1 font-medium">관련 업무</p>
            <p className="font-bold text-gray-900 text-lg">{taskTitle}</p>
          </div>

          {/* Feedback From */}
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span className="font-medium">센터장</span>
            {feedbackDate && (
              <>
                <span className="mx-1">•</span>
                <span>{feedbackDate}</span>
              </>
            )}
          </div>

          {/* Feedback Content */}
          <div className="bg-white border-2 border-blue-200 rounded-xl p-5 shadow-inner">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {feedbackMessage}
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <p className="text-sm text-yellow-800">
              💡 피드백을 확인하고 업무에 반영해주세요.
            </p>
          </div>

          {/* Comments Section */}
          <div className="mt-6 border-t-2 border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
                댓글 <span className="text-indigo-600">({comments.length}/{MAX_COMMENTS})</span>
              </h4>
            </div>

            {/* Comments List */}
            {comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200 animate-in slide-in-from-top duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {comment.author.charAt(0)}
                        </span>
                      </div>
                      <span className="font-semibold text-sm text-gray-900">{comment.author}</span>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed pl-9">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Input */}
            {comments.length < MAX_COMMENTS ? (
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="댓글을 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
                  className="w-full border-2 border-gray-300 rounded-xl p-4 pr-14 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 resize-none"
                  rows={2}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="absolute right-3 bottom-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2.5 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none group"
                  title="댓글 작성"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                <p className="text-sm text-orange-700 font-medium">
                  ⚠️ 최대 {MAX_COMMENTS}개까지만 댓글을 작성할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-4 md:px-6 py-3 md:py-4 flex justify-end gap-2 md:gap-3 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
          >
            나중에
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-bold"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  )
}

