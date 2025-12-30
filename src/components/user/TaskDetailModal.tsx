import { useState, useEffect } from 'react'
import { X, Calendar, TrendingUp, Clock, User as UserIcon, FileText, Trash2, MessageCircle, Edit } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/types/index'

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task
  onUpdateStatus: (taskId: string) => void
  onDeleteTask: (taskId: string) => Promise<void>
  onUpdateDeadline: (taskId: string, newDeadline: string) => void
  onViewFeedback?: (taskId: string) => void
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'todo': return '준비업무'
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

export const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  onUpdateStatus,
  onDeleteTask,
  onUpdateDeadline,
  onViewFeedback,
}: TaskDetailModalProps) => {
  const [isEditingDeadline, setIsEditingDeadline] = useState(false)
  const [newDeadline, setNewDeadline] = useState(task.deadline)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [assignedUserName, setAssignedUserName] = useState<string>('로딩 중...')

  // Fetch assigned user name
  useEffect(() => {
    const fetchAssignedUserName = async () => {
      if (!task.assigned_to) {
        setAssignedUserName('담당자 없음')
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('name, position')
          .eq('id', task.assigned_to)
          .single()

        if (error) {
          console.error('Error fetching assigned user:', error)
          setAssignedUserName('알 수 없음')
        } else if (data) {
          const name = data.name || '알 수 없음'
          const position = data.position ? ` (${data.position})` : ''
          setAssignedUserName(`${name}${position}`)
        } else {
          setAssignedUserName('알 수 없음')
        }
      } catch (error) {
        console.error('Error fetching assigned user:', error)
        setAssignedUserName('알 수 없음')
      }
    }

    if (isOpen && task.assigned_to) {
      fetchAssignedUserName()
    }
  }, [isOpen, task.assigned_to])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false)
        } else if (isEditingDeadline) {
          setIsEditingDeadline(false)
          setNewDeadline(task.deadline)
        } else {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose, showDeleteConfirm, isEditingDeadline, task.deadline])

  if (!isOpen) return null

  const trafficLight = getTrafficLightColor(task.traffic_light)
  const daysRemaining = getDaysRemaining(task.deadline)

  const handleSaveDeadline = () => {
    onUpdateDeadline(task.id, newDeadline)
    setIsEditingDeadline(false)
  }

  const handleDelete = async () => {
    try {
      console.log('TaskDetailModal - Starting delete for task:', task.id)
      await onDeleteTask(task.id)
      console.log('TaskDetailModal - Delete successful, closing modal')
      // Close modal after successful delete
      onClose()
    } catch (error: any) {
      console.error('Error in handleDelete:', error)
      // Show error message to user
      alert(error?.message || '업무 삭제에 실패했습니다.')
      // Reset delete confirmation state
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col border border-white/40">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-xl px-5 md:px-6 py-4 md:py-5 flex items-center justify-between flex-shrink-0 border-b border-white/20">
          <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">업무 상세</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-200 border border-white/20"
            aria-label="닫기"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar min-h-0">
          {/* Title */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 drop-shadow-sm">{task.title}</h3>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/50 backdrop-blur-md rounded-xl p-4 border border-white/40 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-gray-800" />
                <span className="text-sm font-medium text-gray-800">상태</span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border-2 ${getStatusBadge(task.status)}`}>
                {getStatusLabel(task.status)}
              </span>
            </div>

            <div className="bg-white/50 backdrop-blur-md rounded-xl p-4 border border-white/40 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-5 h-5 rounded-full ${trafficLight.bg} shadow-lg`} />
                <span className="text-sm font-medium text-gray-800">우선순위</span>
              </div>
              <span className={`text-lg font-bold ${trafficLight.text}`}>
                {trafficLight.label}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6 bg-gradient-to-br from-indigo-100/60 to-blue-100/60 backdrop-blur-md rounded-xl p-5 border border-white/40 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-800">진행률</span>
              </div>
              <span className="text-2xl font-bold text-indigo-600">{task.progress}%</span>
            </div>
            <div className="w-full bg-white/40 backdrop-blur-sm rounded-full h-4 overflow-hidden shadow-inner border border-white/30">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2 shadow-lg"
                style={{ width: `${task.progress}%` }}
              >
                {task.progress > 10 && (
                  <span className="text-xs text-white font-bold drop-shadow-md">{task.progress}%</span>
                )}
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div className="mb-6 bg-gradient-to-br from-orange-100/60 to-red-100/60 backdrop-blur-md rounded-xl p-5 border-2 border-orange-300/60 shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-gray-800">마감일</span>
                </div>
                {isEditingDeadline ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="px-3 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white/80 backdrop-blur-sm"
                    />
                    <button
                      onClick={handleSaveDeadline}
                      className="px-3 py-2 bg-orange-500/80 backdrop-blur-md text-white rounded-lg hover:bg-orange-600/80 transition-colors text-sm font-medium border border-white/30 shadow-lg"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingDeadline(false)
                        setNewDeadline(task.deadline)
                      }}
                      className="px-3 py-2 bg-gray-200/80 backdrop-blur-md text-gray-700 rounded-lg hover:bg-gray-300/80 transition-colors text-sm font-medium border border-white/30"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-900">{formatDate(task.deadline)}</p>
                    <button
                      onClick={() => setIsEditingDeadline(true)}
                      className="p-1 hover:bg-orange-200/50 backdrop-blur-sm rounded transition-colors border border-white/20"
                      title="마감일 수정"
                    >
                      <Edit className="w-4 h-4 text-orange-600" />
                    </button>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2 justify-end">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-gray-800">남은 기간</span>
                </div>
                <p className={`text-lg font-bold ${
                  daysRemaining < 0 ? 'text-red-600' : 
                  daysRemaining <= 3 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {daysRemaining < 0 
                    ? `${Math.abs(daysRemaining)}일 지연` 
                    : daysRemaining === 0 
                    ? '오늘 마감' 
                    : `${daysRemaining}일 남음`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Memo (Status Update) */}
          {task.memo && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                주요 진행 사항
              </h4>
              <p className="text-gray-800 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-md rounded-xl p-4 whitespace-pre-wrap border border-blue-200/40 shadow-lg">
                {task.memo}
              </p>
            </div>
          )}

          {/* Assigned To */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              담당자
            </h4>
            <p className="text-gray-800 bg-white/50 backdrop-blur-md rounded-xl p-4 border border-white/40 shadow-lg">
              {assignedUserName}
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-500">
            <div>
              <span className="font-medium">생성일:</span> {formatDate(task.created_at)}
            </div>
            <div>
              <span className="font-medium">최종 수정:</span> {formatDate(task.updated_at)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/40 bg-white/40 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 flex justify-between items-center gap-2 flex-shrink-0 flex-wrap">
          {/* Delete Button - Left */}
          <div>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500/80 backdrop-blur-md text-white rounded-lg hover:bg-red-600/80 transition-all duration-200 font-medium flex items-center gap-2 border border-white/30 shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">삭제</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-red-600">정말 삭제하시겠습니까?</span>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-600/80 backdrop-blur-md text-white rounded-lg hover:bg-red-700/80 transition-colors text-sm font-medium border border-white/30 shadow-lg"
                >
                  확인
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 bg-gray-200/80 backdrop-blur-md text-gray-700 rounded-lg hover:bg-gray-300/80 transition-colors text-sm font-medium border border-white/30"
                >
                  취소
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons - Right */}
          <div className="flex gap-2 md:gap-3 flex-wrap">
            {onViewFeedback && (
              <button
                onClick={() => {
                  onClose()
                  onViewFeedback(task.id)
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500/80 to-indigo-500/80 backdrop-blur-md text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2 border border-white/30 shadow-lg"
                title="피드백 확인"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">피드백</span>
              </button>
            )}
            <button
              onClick={() => onUpdateStatus(task.id)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-md text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium border border-white/30 shadow-lg"
            >
              상태 업데이트
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border-2 border-white/40 bg-white/20 backdrop-blur-md text-gray-700 rounded-lg hover:bg-white/30 transition-all duration-200 font-medium shadow-lg"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

