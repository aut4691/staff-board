import { useState, useEffect } from 'react'
import { X, Plus, Calendar, FileText, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { TaskStatus, TrafficLightColor } from '@/types/index'

interface NewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTask: (title: string, description: string, deadline: string, status: TaskStatus, trafficLight: TrafficLightColor) => Promise<void>
}

export const NewTaskModal = ({
  isOpen,
  onClose,
  onCreateTask,
}: NewTaskModalProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [trafficLight, setTrafficLight] = useState<TrafficLightColor>('green')

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

  const handleSubmit = async () => {
    if (!title || !deadline) {
      alert('제목과 마감일을 입력해주세요.')
      return
    }

    try {
      await onCreateTask(title, description, deadline, status, trafficLight)
      
      // Reset form only on success
      setTitle('')
      setDescription('')
      setDeadline('')
      setStatus('todo')
      setTrafficLight('green')
      onClose()
    } catch (error) {
      // Error is already handled in parent component
      console.error('Error in handleSubmit:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-5 md:px-6 py-4 md:py-5 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Plus className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white">새 업무 등록</h3>
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
        <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4 min-h-0">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              업무 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 데이터 분석 보고서 작성"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              상세 설명
            </label>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-2">
              <p className="text-xs text-indigo-800">
                💡 <strong>작성 가이드:</strong> 주간업무 보고시 작성하는 형식 유지, 사업의 세부과제 수준으로 작성
              </p>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="- 주요 내용 1&#10;- 주요 내용 2&#10;- 주요 내용 3"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 custom-scrollbar"
              rows={6}
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              마감일 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              우선순위
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { 
                  value: 'red' as TrafficLightColor, 
                  label: '긴급', 
                  icon: AlertCircle,
                  borderColor: 'border-red-400',
                  bgColor: 'bg-red-50',
                  hoverColor: 'hover:bg-red-100',
                  selectedBorder: 'border-red-500',
                  selectedBg: 'bg-red-100',
                  iconColor: 'text-red-600',
                  shadowColor: 'shadow-red-200'
                },
                { 
                  value: 'yellow' as TrafficLightColor, 
                  label: '주의', 
                  icon: AlertTriangle,
                  borderColor: 'border-yellow-400',
                  bgColor: 'bg-yellow-50',
                  hoverColor: 'hover:bg-yellow-100',
                  selectedBorder: 'border-yellow-500',
                  selectedBg: 'bg-yellow-100',
                  iconColor: 'text-yellow-600',
                  shadowColor: 'shadow-yellow-200'
                },
                { 
                  value: 'green' as TrafficLightColor, 
                  label: '정상', 
                  icon: CheckCircle2,
                  borderColor: 'border-green-400',
                  bgColor: 'bg-green-50',
                  hoverColor: 'hover:bg-green-100',
                  selectedBorder: 'border-green-500',
                  selectedBg: 'bg-green-100',
                  iconColor: 'text-green-600',
                  shadowColor: 'shadow-green-200'
                },
              ].map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setTrafficLight(option.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                      trafficLight === option.value
                        ? `${option.selectedBorder} ${option.selectedBg} ${option.shadowColor} shadow-lg transform scale-105`
                        : `${option.borderColor} ${option.bgColor} ${option.hoverColor}`
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${option.iconColor} ${
                      trafficLight === option.value ? 'bg-white/50' : 'bg-white/30'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-xs text-gray-800">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Initial Status */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              초기 상태
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'todo' as TaskStatus, label: '할일', icon: '📋' },
                { value: 'in_progress' as TaskStatus, label: '진행중', icon: '▶️' },
                { value: 'completed' as TaskStatus, label: '완료', icon: '✅', disabled: true },
              ].map((option) => {
                const isDisabled = option.disabled || false
                return (
                  <button
                    key={option.value}
                    onClick={() => !isDisabled && setStatus(option.value)}
                    disabled={isDisabled}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      isDisabled
                        ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                        : status === option.value
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg transform scale-105'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    title={isDisabled ? '새 업무는 완료 상태로 등록할 수 없습니다' : undefined}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <span className="font-semibold text-xs">{option.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
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
            onClick={handleSubmit}
            className="px-8 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            등록
          </button>
        </div>
      </div>
    </div>
  )
}

