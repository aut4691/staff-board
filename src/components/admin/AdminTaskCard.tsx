import { MessageCircle, Clock } from 'lucide-react'
import type { Task, TrafficLightColor, TaskStatus } from '@/types/index'

interface AdminTaskCardProps {
  task: Task
  onFeedbackClick: () => void
  onViewDetails?: () => void
  hasNewComment?: boolean
}

const getStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case 'todo': return '할 일'
    case 'in_progress': return '진행 중'
    case 'completed': return '완료'
    default: return status
  }
}

const getStatusBadge = (status: TaskStatus) => {
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

const getStatusColor = (color: TrafficLightColor) => {
  switch (color) {
    case 'red':
      return { bg: 'bg-red-500', ring: 'ring-red-100', shadow: 'shadow-red-200' }
    case 'yellow':
      return { bg: 'bg-yellow-500', ring: 'ring-yellow-100', shadow: 'shadow-yellow-200' }
    case 'green':
      return { bg: 'bg-green-500', ring: 'ring-green-100', shadow: 'shadow-green-200' }
    default:
      return { bg: 'bg-gray-500', ring: 'ring-gray-100', shadow: 'shadow-gray-200' }
  }
}


const getDaysRemaining = (deadline: string) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export const AdminTaskCard = ({ task, onFeedbackClick, onViewDetails, hasNewComment = false }: AdminTaskCardProps) => {
  const statusColor = getStatusColor(task.traffic_light)
  const daysRemaining = getDaysRemaining(task.deadline)
  const statusLabel = getStatusLabel(task.status)
  const statusBadge = getStatusBadge(task.status)

  // 오늘 할일(예정) 체크
  const today = new Date().toISOString().split('T')[0]
  const isTodayDeadline = task.deadline === today && task.status === 'todo'

  return (
    <div
      onClick={onViewDetails}
      className="bg-white rounded-xl border-2 p-3 md:p-4 hover:shadow-xl transition-all duration-300 group border-gray-200 hover:border-indigo-300 cursor-pointer"
    >
      {/* Card Header */}
      <div className="flex items-start gap-2 md:gap-3 mb-3">
        <div
          className={`${statusColor.bg} w-3 h-3 md:w-4 md:h-4 rounded-full mt-0.5 flex-shrink-0 ring-4 ${statusColor.ring} shadow-lg`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {/* Status Badge */}
            <span className={`text-xs px-2 py-0.5 rounded-lg font-bold border ${statusBadge} shadow-sm`}>
              {statusLabel}
            </span>
            {/* Today Deadline Badge */}
            {isTodayDeadline && (
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold bg-yellow-100 text-yellow-700 border border-yellow-300 shadow-sm">
                오늘 할일
              </span>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span
                className={`font-medium ${
                  daysRemaining < 0
                    ? 'text-red-600'
                    : daysRemaining <= 3
                    ? 'text-yellow-600'
                    : 'text-gray-600'
                }`}
              >
                {daysRemaining < 0
                  ? `${Math.abs(daysRemaining)}일 지연`
                  : daysRemaining === 0
                  ? '오늘 마감'
                  : `D-${daysRemaining}`}
              </span>
            </div>
          </div>
          <h3 className="text-sm md:text-base font-semibold text-gray-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onFeedbackClick()
        }}
        className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium text-sm ${
          hasNewComment
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
            : 'bg-gradient-to-r from-gray-400 to-gray-500'
        }`}
      >
        <MessageCircle className="w-4 h-4" />
        <span>피드백</span>
      </button>
    </div>
  )
}

