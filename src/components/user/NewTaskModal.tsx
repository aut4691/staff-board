import { useState, useEffect } from 'react'
import { X, Plus, Calendar, FileText, AlertCircle } from 'lucide-react'
import type { TaskStatus, TrafficLightColor } from '@/types/index'

interface NewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTask: (title: string, description: string, deadline: string, status: TaskStatus, trafficLight: TrafficLightColor) => void
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

  const handleSubmit = () => {
    if (!title || !deadline) {
      alert('제목과 마감일을 입력해주세요.')
      return
    }

    onCreateTask(title, description, deadline, status, trafficLight)
    
    // Reset form
    setTitle('')
    setDescription('')
    setDeadline('')
    setStatus('todo')
    setTrafficLight('green')
    onClose()
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
                💡 <strong>작성 가이드:</strong> 업무의 주요 내용을 개조식으로 간단히 작성하세요
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
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'red' as TrafficLightColor, label: '긴급', icon: '🔴', color: 'border-red-400 bg-red-50 hover:bg-red-100', selectedColor: 'border-red-500 bg-red-100' },
                { value: 'yellow' as TrafficLightColor, label: '주의', icon: '🟡', color: 'border-yellow-400 bg-yellow-50 hover:bg-yellow-100', selectedColor: 'border-yellow-500 bg-yellow-100' },
                { value: 'green' as TrafficLightColor, label: '정상', icon: '🟢', color: 'border-green-400 bg-green-50 hover:bg-green-100', selectedColor: 'border-green-500 bg-green-100' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTrafficLight(option.value)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    trafficLight === option.value
                      ? `${option.selectedColor} shadow-lg transform scale-105`
                      : option.color
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <span className="font-semibold text-xs">{option.label}</span>
                  </div>
                </button>
              ))}
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

