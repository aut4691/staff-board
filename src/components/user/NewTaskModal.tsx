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
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 border border-white/40">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-xl px-5 md:px-6 py-4 md:py-5 flex items-center justify-between rounded-t-2xl flex-shrink-0 border-b border-white/20">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-white/30 backdrop-blur-md p-2 rounded-lg border border-white/20">
              <Plus className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-lg">새 업무 등록</h3>
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
              placeholder="예: 빅데이터 컨설팅 및 분석 기술지원(계속)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              상세 설명
            </label>
            <div className="bg-indigo-100/60 backdrop-blur-md border border-indigo-300/50 rounded-lg p-3 mb-2 shadow-lg">
              <p className="text-xs text-indigo-900">
                💡 <strong>작성 가이드:</strong> 주간업무 보고시 작성 양식, 사업의 세부과제 수준 작성
              </p>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="- 데이터 분석 12건 완료, OOO마트 데이터 전처리 및 가명처리 진행중&#10;- 컨설팅 30건 완료, OO 데이터 활용 컨설팅 예정(01/30)&#10;- 목표대비 달성 완료, 추가 실적 발굴 추진"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 custom-scrollbar bg-white/80 backdrop-blur-sm"
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
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
                    className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 backdrop-blur-md ${
                      trafficLight === option.value
                        ? `${option.selectedBorder} ${option.selectedBg} ${option.shadowColor} shadow-lg transform scale-105`
                        : `${option.borderColor} ${option.bgColor} ${option.hoverColor} bg-white/30`
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
                { value: 'todo' as TaskStatus, label: '준비업무', icon: '📋' },
                { value: 'in_progress' as TaskStatus, label: '진행중', icon: '▶️' },
                { value: 'completed' as TaskStatus, label: '완료', icon: '✅', disabled: true },
              ].map((option) => {
                const isDisabled = option.disabled || false
                return (
                  <button
                    key={option.value}
                    onClick={() => !isDisabled && setStatus(option.value)}
                    disabled={isDisabled}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 backdrop-blur-md ${
                      isDisabled
                        ? 'border-gray-200 bg-gray-100/60 opacity-50 cursor-not-allowed'
                        : status === option.value
                        ? 'border-indigo-500 bg-indigo-100/60 shadow-lg transform scale-105'
                        : 'border-gray-300 hover:bg-gray-50/60 bg-white/30'
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
        <div className="border-t border-white/40 bg-white/40 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 flex justify-end gap-2 md:gap-3 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-white/40 bg-white/20 backdrop-blur-md text-gray-700 rounded-lg hover:bg-white/30 transition-all duration-200 font-medium shadow-lg"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-2 bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-md text-white rounded-lg hover:shadow-lg transition-all duration-200 font-bold flex items-center gap-2 border border-white/30 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            등록
          </button>
        </div>
      </div>
    </div>
  )
}

