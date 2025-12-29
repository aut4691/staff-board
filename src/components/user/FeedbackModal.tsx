import { X, MessageSquare, FileText, Send, Heart } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useFeedbacks, useAddComment, useToggleCommentLike } from '@/hooks/useFeedbacks'
import { supabase } from '@/lib/supabase'

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

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  taskTitle: string
  feedbackMessage: string
  onConfirm: () => void
  feedbackDate?: string
  taskId?: string
}

export const FeedbackModal = ({
  isOpen,
  onClose,
  taskTitle,
  feedbackMessage,
  onConfirm,
  feedbackDate,
  taskId,
}: FeedbackModalProps) => {
  const { data: feedbacks = [] } = useFeedbacks(taskId || '')
  const addComment = useAddComment()
  const toggleLike = useToggleCommentLike()
  const [newComment, setNewComment] = useState('')
  const [fromUserName, setFromUserName] = useState<string>('센터장')
  const MAX_COMMENTS = 5

  // Fetch from_user name directly if not available in feedbacks
  useEffect(() => {
    const fetchFromUserName = async () => {
      if (feedbacks.length > 0 && taskId) {
        const firstFeedback = feedbacks[0] as any
        const userName = firstFeedback?.from_user_name
        
        if (userName && userName !== 'Unknown') {
          setFromUserName(userName)
          return
        }

        // If from_user_name is not available, fetch it directly
        if (firstFeedback?.from_user_id) {
          try {
            const { data: user, error } = await supabase
              .from('user_profiles')
              .select('name')
              .eq('id', firstFeedback.from_user_id)
              .maybeSingle()

            if (!error && user && user.name) {
              console.log('Fetched from_user_name directly:', user.name)
              setFromUserName(user.name)
            } else {
              console.warn('Failed to fetch from_user_name directly:', error)
              setFromUserName('센터장')
            }
          } catch (error) {
            console.error('Error fetching from_user_name:', error)
            setFromUserName('센터장')
          }
        } else {
          setFromUserName('센터장')
        }
      } else {
        setFromUserName('센터장')
      }
    }

    if (isOpen && taskId) {
      fetchFromUserName()
    }
  }, [isOpen, taskId, feedbacks])

  // Combine feedbacks and comments into a single timeline, sorted by time
  const chatMessages: ChatMessage[] = useMemo(() => {
    const messages: ChatMessage[] = []
    
    // Add feedbacks as messages
    feedbacks.forEach((fb: any) => {
      messages.push({
        id: fb.id,
        type: 'feedback',
        author: '센터장님',
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
  }, [feedbacks, fromUserName])

  // Get the most recent feedback ID, or use the first one if available
  const currentFeedbackId = feedbacks.length > 0 ? feedbacks[0].id : null

  // Count comments
  const commentCount = chatMessages.filter(m => m.type === 'comment').length

  // Check if user can add comments (must have a feedback)
  const canAddComment = currentFeedbackId !== null && commentCount < MAX_COMMENTS

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    if (commentCount >= MAX_COMMENTS) {
      alert(`최대 ${MAX_COMMENTS}개까지만 댓글을 작성할 수 있습니다.`)
      return
    }

    if (!currentFeedbackId) {
      alert('피드백을 찾을 수 없습니다. 관리자가 먼저 피드백을 작성해야 댓글을 달 수 있습니다.')
      return
    }

    try {
      console.log('Adding comment to feedback:', currentFeedbackId)
      await addComment.mutateAsync({
        feedbackId: currentFeedbackId,
        content: newComment.trim(),
      })
      setNewComment('')
      console.log('Comment added successfully')
    } catch (error: any) {
      console.error('Error adding comment:', error)
      const errorMessage = error?.message || '알 수 없는 오류'
      alert(`댓글 작성에 실패했습니다: ${errorMessage}`)
    }
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

  // Reset comment input when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewComment('')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-[90vh] max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-5 md:px-6 py-4 md:py-5 flex items-center justify-between rounded-t-2xl flex-shrink-0">
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
        <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar min-h-0 space-y-4" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Task Name */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600 font-medium">업무명</span>
            </div>
            <p className="font-bold text-gray-900 text-base md:text-lg">{taskTitle}</p>
          </div>

          {/* Chat Timeline - Feedback and Comments combined */}
          {chatMessages.length > 0 ? (
            <div className="border-t-2 border-gray-200 pt-4">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                대화 내역
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-lg p-3 border ${
                      message.type === 'feedback'
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                        : 'bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200'
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
          ) : feedbackMessage ? (
            // Fallback: Show feedback message if no feedbacks loaded yet
            <div className="border-t-2 border-gray-200 pt-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 rounded-lg p-3 border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-600">
                    <span className="text-white text-xs font-bold">
                      센
                    </span>
                  </div>
                  <span className="font-semibold text-sm text-gray-900">센터장님</span>
                  <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                    피드백
                  </span>
                  {feedbackDate && (
                    <span className="text-xs text-gray-500 ml-auto">{feedbackDate}</span>
                  )}
                </div>
                <p className="text-sm text-gray-800 leading-relaxed pl-8">
                  {feedbackMessage}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
              <p className="text-yellow-800 text-center">
                피드백을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
              </p>
            </div>
          )}

          {/* Comment Input */}
          {!currentFeedbackId ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-sm text-yellow-700 font-medium">
                💡 관리자가 먼저 피드백을 작성해야 댓글을 달 수 있습니다.
              </p>
            </div>
          ) : commentCount < MAX_COMMENTS ? (
            <div className="border-t-2 border-gray-200 pt-4">
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                댓글 작성 <span className="text-indigo-600">({commentCount}/{MAX_COMMENTS})</span>
              </label>
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="댓글을 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 custom-scrollbar pr-14"
                  rows={3}
                  disabled={!canAddComment}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || !canAddComment}
                  className="absolute right-3 bottom-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-2.5 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none group"
                  title="댓글 작성"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
              <p className="text-sm text-orange-700 font-medium">
                ⚠️ 최대 {MAX_COMMENTS}개까지만 댓글을 작성할 수 있습니다.
              </p>
            </div>
          )}
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
            className="px-8 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-bold flex items-center gap-2"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  )
}
