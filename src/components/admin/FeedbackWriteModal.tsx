import { useState, useEffect } from 'react'
import { X, Send, MessageSquare, User, FileText, MessageCircle } from 'lucide-react'
import type { Task } from '@/types/index'

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
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
  employee,
  onSend,
}: FeedbackWriteModalProps) => {
  const [feedback, setFeedback] = useState('')
  const [employeeUpdate, setEmployeeUpdate] = useState('예산팀 확인 대기 중입니다.')
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: '김 책임',
      content: '잘 확인했습니다. 예산팀과 협의 후 진행하겠습니다.',
      timestamp: '2024년 10월 25일 오후 2:30',
    },
    {
      id: '2',
      author: '센터장',
      content: '네, 빠르게 진행 부탁드립니다.',
      timestamp: '2024년 10월 25일 오후 3:15',
    },
  ])

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
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-5 md:px-6 py-4 md:py-5 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white">피드백 작성</h3>
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
          {/* Task Name */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600 font-medium">업무명</span>
            </div>
            <p className="font-bold text-gray-900 text-base md:text-lg">{task.title}</p>
          </div>

          {/* Employee Update */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600 font-medium">{employee.name}</span>
              {employee.position && (
                <span className="text-xs text-gray-500">({employee.position})</span>
              )}
            </div>
            <p className="text-sm text-gray-800 italic">
              &quot;{employeeUpdate}&quot;
            </p>
          </div>

          {/* Previous Feedback and Comments */}
          {comments.length > 0 && (
            <div className="border-t-2 border-gray-200 pt-4">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-indigo-600" />
                이전 피드백 및 댓글
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {comment.author.charAt(0)}
                        </span>
                      </div>
                      <span className="font-semibold text-sm text-gray-900">{comment.author}</span>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed pl-8">
                      {comment.content}
                    </p>
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 custom-scrollbar"
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 이미지 첨부 기능은 추후 추가 예정입니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-4 md:px-6 py-3 md:py-4 flex justify-end gap-2 md:gap-3 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSend}
            className="px-8 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-bold flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            전송
          </button>
        </div>
      </div>
    </div>
  )
}

