import { useState, useEffect } from 'react'
import { X, Save, TrendingUp, FileText } from 'lucide-react'
import type { TaskStatus } from '@/types/index'

interface StatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  taskTitle: string
  currentStatus: TaskStatus
  currentProgress: number
  onSave: (status: TaskStatus, progress: number, memo?: string) => void
}

const statusOptions: { 
  value: TaskStatus
  label: string
  color: string
  icon: string
}[] = [
  { value: 'todo', label: '할 일', color: 'border-gray-400 bg-gray-50 hover:bg-gray-100', icon: '📋' },
  { value: 'in_progress', label: '진행 중', color: 'border-blue-400 bg-blue-50 hover:bg-blue-100', icon: '▶️' },
  { value: 'completed', label: '완료', color: 'border-green-400 bg-green-50 hover:bg-green-100', icon: '✅' },
]

export const StatusUpdateModal = ({
  isOpen,
  onClose,
  taskTitle,
  currentStatus,
  currentProgress,
  onSave,
}: StatusUpdateModalProps) => {
  const [status, setStatus] = useState<TaskStatus>(currentStatus)
  const [progress, setProgress] = useState(currentProgress)
  const [memo, setMemo] = useState('')

  // 상태가 "완료"로 변경되면 진행률을 자동으로 100%로 설정
  useEffect(() => {
    if (status === 'completed') {
      setProgress(100)
    }
  }, [status])

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

  const handleSave = () => {
    onSave(status, progress, memo)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-5 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">상태 업데이트</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all duration-200"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar min-h-0">
          {/* Task Title */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3">
            <p className="text-xs text-gray-600 mb-1 font-medium">업무</p>
            <p className="font-bold text-gray-900">{taskTitle}</p>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              상태 변경
            </label>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatus(option.value)}
                  className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                    status === option.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-lg transform scale-105'
                      : option.color
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <span className="font-semibold text-xs">{option.label}</span>
                  </div>
                  {status === option.value && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              진도율
              {status === 'completed' && (
                <span className="ml-auto text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">
                  완료 시 자동 100%
                </span>
              )}
            </label>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">현재 진행률</span>
                <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                disabled={status === 'completed'}
                className={`w-full h-3 bg-gray-300 rounded-lg appearance-none accent-indigo-600 ${
                  status === 'completed' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
                style={{
                  background: `linear-gradient(to right, rgb(99 102 241) 0%, rgb(99 102 241) ${progress}%, rgb(209 213 219) ${progress}%, rgb(209 213 219) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Memo - Expanded */}
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-800 mb-2">
              주요 진행 사항 (개조식 작성)
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
              <p className="text-xs text-blue-800">
                💡 <strong>작성 가이드:</strong> 주요 진행 내용을 개조식으로 간단히 작성하세요
              </p>
              <ul className="text-xs text-blue-700 mt-1 ml-4 list-disc space-y-0.5">
                <li>예: - 예산 계획서 검토 완료</li>
                <li>예: - 기술팀 미팅 진행</li>
                <li>예: - 최종 보고서 초안 작성 중</li>
              </ul>
            </div>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="- 주요 진행 사항 1&#10;- 주요 진행 사항 2&#10;- 주요 진행 사항 3"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 custom-scrollbar"
              rows={6}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-5 py-3 flex justify-end gap-2 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-bold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

