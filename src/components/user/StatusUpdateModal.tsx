import { useState, useEffect } from 'react'
import { X, Save, TrendingUp, FileText, Calendar, Edit } from 'lucide-react'
import type { TaskStatus } from '@/types/index'

interface StatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  taskTitle: string
  currentStatus: TaskStatus
  currentProgress: number
  currentDeadline: string
  currentMemo?: string
  onSave: (title: string, status: TaskStatus, progress: number, deadline: string, memo?: string) => Promise<void>
}

const statusOptions: { 
  value: TaskStatus
  label: string
  color: string
  icon: string
}[] = [
  { value: 'todo', label: '준비업무', color: 'border-gray-400 bg-gray-50 hover:bg-gray-100', icon: '📋' },
  { value: 'in_progress', label: '진행 중', color: 'border-blue-400 bg-blue-50 hover:bg-blue-100', icon: '▶️' },
  { value: 'completed', label: '완료', color: 'border-green-400 bg-green-50 hover:bg-green-100', icon: '✅' },
]

export const StatusUpdateModal = ({
  isOpen,
  onClose,
  taskTitle,
  currentStatus,
  currentProgress,
  currentDeadline,
  currentMemo = '',
  onSave,
}: StatusUpdateModalProps) => {
  const [title, setTitle] = useState(taskTitle)
  const [status, setStatus] = useState<TaskStatus>(currentStatus)
  const [progress, setProgress] = useState(currentProgress)
  const [deadline, setDeadline] = useState(currentDeadline)
  const [memo, setMemo] = useState(currentMemo || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  // Update state when props change (when modal opens with different task)
  useEffect(() => {
    if (isOpen) {
      console.log('StatusUpdateModal opened with:', {
        currentMemo,
        currentStatus,
        currentProgress,
        currentDeadline,
        taskTitle,
      })
      // Use currentMemo if available, otherwise use empty string
      // This ensures we always show the latest memo value
      const memoValue = currentMemo || ''
      // Force update all state values to ensure latest data is shown
      setMemo(memoValue)
      setTitle(taskTitle)
      setStatus(currentStatus)
      setProgress(currentProgress)
      setDeadline(currentDeadline)
      setIsEditingTitle(false)
      setIsSaving(false) // Reset saving state
      console.log('Set values:', { memo: memoValue, title: taskTitle, deadline: currentDeadline, status: currentStatus, progress: currentProgress })
    }
  }, [isOpen, currentMemo, currentStatus, currentProgress, currentDeadline, taskTitle])

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

  const handleSave = async () => {
    if (isSaving) {
      console.log('Already saving, ignoring click')
      return
    }

    // Validate title - use taskTitle as fallback if title is empty
    const finalTitle = (title && title.trim()) || taskTitle
    if (!finalTitle || !finalTitle.trim()) {
      alert('업무 제목을 입력해주세요.')
      return
    }

    // Validate deadline - use currentDeadline as fallback if deadline is empty
    const finalDeadline = deadline || currentDeadline
    if (!finalDeadline) {
      alert('마감일을 선택해주세요.')
      return
    }

    console.log('StatusUpdateModal - Saving:', {
      title: finalTitle,
      status,
      progress,
      deadline: finalDeadline,
      memo,
      originalTitle: taskTitle,
      originalDeadline: currentDeadline,
    })
    
    setIsSaving(true)
    
    try {
      // Ensure progress is a valid number
      const validProgress = Math.max(0, Math.min(100, Number(progress)))
      await onSave(finalTitle.trim(), status, validProgress, finalDeadline, memo)
      console.log('StatusUpdateModal - Save successful')
      // Parent will close the modal after successful save
    } catch (error: any) {
      console.error('Error in handleSave:', error)
      // Show error to user
      alert(error?.message || '상태 업데이트에 실패했습니다.')
      // Don't close modal on error - let user see the error and retry
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 border border-gray-200/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-xl px-5 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0 border-b border-white/20">
          <div className="flex items-center gap-2">
            <div className="bg-white/30 backdrop-blur-md p-2 rounded-lg border border-white/20">
              <TrendingUp className="w-5 h-5 text-white drop-shadow-md" />
            </div>
            <h3 className="text-lg font-bold text-white drop-shadow-lg">상태 업데이트</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-200 border border-white/20"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-white drop-shadow-md" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar min-h-0">
          {/* Task Title - Editable */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              업무 제목 <span className="text-red-500">*</span>
            </label>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingTitle(false)
                    } else if (e.key === 'Escape') {
                      setIsEditingTitle(false)
                      setTitle(taskTitle) // Reset if cancelled
                    }
                  }}
                  className="flex-1 px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="업무 제목을 입력하세요"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (!title || !title.trim()) {
                      alert('업무 제목을 입력해주세요.')
                      return
                    }
                    setIsEditingTitle(false)
                  }}
                  className="px-3 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                  title="확인"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingTitle(false)
                    setTitle(taskTitle) // Reset if cancelled
                  }}
                  className="px-3 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  title="취소"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                className="bg-gradient-to-br from-blue-100 to-indigo-100 backdrop-blur-md rounded-xl p-3 cursor-pointer hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 flex items-center justify-between group border border-indigo-200 shadow-lg"
                onClick={() => setIsEditingTitle(true)}
              >
                <p className="font-bold text-gray-900 flex-1">{title || taskTitle}</p>
                <Edit className="w-4 h-4 text-gray-500 group-hover:text-indigo-600 transition-colors" />
              </div>
            )}
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
                      ? 'border-indigo-500 bg-indigo-100 shadow-lg transform scale-105'
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
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 backdrop-blur-md rounded-xl p-4 border border-gray-300 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">현재 진행률</span>
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
            <div className="bg-blue-100 backdrop-blur-md border border-blue-300 rounded-lg p-3 mb-2 shadow-lg">
              <p className="text-xs text-blue-900">
                💡 <strong>작성 가이드:</strong> 주요 진행 내용을 개조식으로 간단히 작성하세요
              </p>
              <ul className="text-xs text-blue-800 mt-1 ml-4 list-disc space-y-0.5">
                <li>예: - 데이터 분석 12건 완료, OOO마트 데이터 전처리 및 가명처리 진행중</li>
                <li>예: - 컨설팅 30건 완료, OO 데이터 활용 컨설팅 예정(01/30)</li>
                <li>예: - 목표대비 달성 완료, 추가 실적 발굴 추진</li>
              </ul>
            </div>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="- 주요 진행 사항 1&#10;- 주요 진행 사항 2&#10;- 주요 진행 사항 3"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 custom-scrollbar bg-white"
              rows={6}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white/95 backdrop-blur-xl px-5 py-3 flex justify-end gap-2 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 bg-white backdrop-blur-md text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-lg"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-8 py-2 bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-md text-white rounded-lg hover:shadow-lg transition-all duration-200 font-bold flex items-center gap-2 border border-white/30 shadow-lg ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Save className="w-4 h-4" />
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

