import { useEffect } from 'react'
import { X, Calendar, TrendingUp, Clock, User as UserIcon, FileText, MessageCircle } from 'lucide-react'
import type { Task } from '@/types/index'

interface AdminTaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task
  employee: { id: string; name: string; position: string }
  onFeedbackClick: () => void
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'todo': return '할 일'
    case 'in_progress': return '진행 중'
    case 'completed': return '완료'
    default: return status
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'todo':
      return 'bg-gray-100 text-gray-700 border-gray-300'
    case 'in_progress':
      return 'bg-blue-100 text-blue-700 border-blue-300'
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-300'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300'
  }
}

const getTrafficLightColor = (color: string) => {
  switch (color) {
    case 'red': return { bg: 'bg-red-500', text: 'text-red-700', label: '긴급' }
    case 'yellow': return { bg: 'bg-yellow-500', text: 'text-yellow-700', label: '주의' }
    case 'green': return { bg: 'bg-green-500', text: 'text-green-700', label: '정상' }
    default: return { bg: 'bg-gray-500', text: 'text-gray-700', label: '알 수 없음' }
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getDaysRemaining = (deadline: string) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export const AdminTaskDetailModal = ({
  isOpen,
  onClose,
  task,
  employee,
  onFeedbackClick,
}: AdminTaskDetailModalProps) => {
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

  const trafficLight = getTrafficLightColor(task.traffic_light)
  const daysRemaining = getDaysRemaining(task.deadline)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-5 md:px-6 py-4 md:py-5 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-white">업무 상세</h2>
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
          {/* Title */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">{task.title}</h3>
          </div>

          {/* Employee Info */}
          <div className="mb-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-800">담당자</span>
            </div>
            <p className="text-gray-700 font-medium">
              {employee.name} {employee.position && `(${employee.position})`}
            </p>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">상태</span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border-2 ${getStatusBadge(task.status)}`}>
                {getStatusLabel(task.status)}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-5 h-5 rounded-full ${trafficLight.bg}`} />
                <span className="text-sm font-medium text-gray-600">우선순위</span>
              </div>
              <span className={`text-lg font-bold ${trafficLight.text}`}>
                {trafficLight.label}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-800">진행률</span>
              </div>
              <span className="text-2xl font-bold text-indigo-600">{task.progress}%</span>
            </div>
            <div className="w-full bg-white rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${task.progress}%` }}
              >
                {task.progress > 10 && (
                  <span className="text-xs text-white font-bold">{task.progress}%</span>
                )}
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div className="mb-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-gray-800">마감일</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatDate(task.deadline)}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2 justify-end">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-gray-800">남은 기간</span>
                </div>
                <p
                  className={`text-lg font-bold ${
                    daysRemaining < 0
                      ? 'text-red-600'
                      : daysRemaining <= 3
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                >
                  {daysRemaining < 0
                    ? `${Math.abs(daysRemaining)}일 지연`
                    : daysRemaining === 0
                    ? '오늘 마감'
                    : `${daysRemaining}일 남음`}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                상세 설명
              </h4>
              <p className="text-gray-600 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <span className="font-medium">생성일:</span> {formatDate(task.created_at)}
            </div>
            <div>
              <span className="font-medium">최종 수정:</span> {formatDate(task.updated_at)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-4 md:px-6 py-3 md:py-4 flex justify-end items-center gap-2 flex-shrink-0 flex-wrap">
          <button
            onClick={() => {
              onClose()
              onFeedbackClick()
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2"
            title="피드백 작성"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">피드백</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

