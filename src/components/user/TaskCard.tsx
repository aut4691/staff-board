import { MessageCircle, Clock, TrendingUp } from 'lucide-react'
import type { Task, TrafficLightColor } from '@/types/index'

interface TaskCardProps {
  task: Task
  onUpdateStatus: (taskId: string) => void
  onViewFeedback: (taskId: string) => void
  onViewDetails: (taskId: string) => void
  hasFeedback?: boolean
  hasUnreadFeedback?: boolean
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

const getPriorityBadge = (trafficLight: TrafficLightColor) => {
  switch (trafficLight) {
    case 'red':
      return { label: '긴급', color: 'bg-red-500 text-white' }
    case 'yellow':
      return { label: '주의', color: 'bg-yellow-500 text-white' }
    case 'green':
      return { label: '정상', color: 'bg-green-500 text-white' }
    default:
      return { label: '정상', color: 'bg-green-500 text-white' }
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

const getDaysRemaining = (deadline: string) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export const TaskCard = ({
  task,
  onUpdateStatus,
  onViewFeedback,
  onViewDetails,
  hasFeedback = false,
  hasUnreadFeedback = false,
}: TaskCardProps) => {
  const statusColor = getStatusColor(task.traffic_light)
  const priorityBadge = getPriorityBadge(task.traffic_light)
  const daysRemaining = getDaysRemaining(task.deadline)

  return (
    <div
      onClick={() => onViewDetails(task.id)}
      className={`bg-white rounded-xl border-2 p-4 mb-3 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 ${
        hasUnreadFeedback 
          ? 'border-red-500 shadow-lg shadow-red-100 ring-4 ring-red-50' 
          : 'border-gray-200 hover:border-indigo-300'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`${statusColor.bg} w-4 h-4 rounded-full mt-0.5 flex-shrink-0 ring-4 ${statusColor.ring} shadow-lg`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-lg font-bold ${priorityBadge.color} shadow-sm`}>
              {priorityBadge.label}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span className={`font-medium ${daysRemaining < 0 ? 'text-red-600' : daysRemaining <= 3 ? 'text-yellow-600' : 'text-gray-600'}`}>
                {daysRemaining < 0 ? `${Math.abs(daysRemaining)}일 지연` : daysRemaining === 0 ? '오늘 마감' : `D-${daysRemaining}`}
              </span>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
            {task.title}
          </h3>
          
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1 text-gray-600">
                <TrendingUp className="w-3 h-3" />
                <span className="font-medium">진행률</span>
              </div>
              <span className="font-bold text-indigo-600">{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onUpdateStatus(task.id)
          }}
          className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg transition-all duration-200 font-medium text-gray-700 hover:shadow-md"
        >
          상태 업데이트
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewFeedback(task.id)
          }}
          className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
        >
          <MessageCircle className="w-3 h-3" />
          <span>피드백</span>
        </button>
      </div>
      
      {/* Unread Feedback Indicator */}
      {hasUnreadFeedback && (
        <div className="mt-2 text-xs text-red-600 font-semibold flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          새 피드백이 있습니다
        </div>
      )}
    </div>
  )
}

