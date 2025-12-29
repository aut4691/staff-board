import { useState } from 'react'
import { ClipboardList, PlayCircle, CheckCircle } from 'lucide-react'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus } from '@/types/index'

interface KanbanBoardProps {
  tasks: Task[]
  onUpdateStatus: (taskId: string) => void
  onViewFeedback: (taskId: string) => void
  onViewDetails: (taskId: string) => void
  onDragTask?: (taskId: string, newStatus: TaskStatus) => void
}

const columns: { 
  id: TaskStatus
  title: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}[] = [
  { 
    id: 'todo', 
    title: '내 업무 목록', 
    icon: ClipboardList,
    color: 'from-gray-400 to-gray-500'
  },
  { 
    id: 'in_progress', 
    title: '진행 중', 
    icon: PlayCircle,
    color: 'from-blue-400 to-indigo-500'
  },
  { 
    id: 'completed', 
    title: '완료', 
    icon: CheckCircle,
    color: 'from-green-400 to-emerald-500'
  },
]

export const KanbanBoard = ({
  tasks,
  onUpdateStatus,
  onViewFeedback,
  onViewDetails,
  onDragTask,
}: KanbanBoardProps) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId)
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
  }

  const handleDrop = (newStatus: TaskStatus) => {
    if (draggedTaskId && onDragTask) {
      onDragTask(draggedTaskId, newStatus)
    }
    setDraggedTaskId(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // 통계 계산
  const todayDeadline = tasks.filter(t => {
    const today = new Date().toISOString().split('T')[0]
    return t.deadline === today
  }).length

  const delayed = tasks.filter(t => {
    const today = new Date()
    const deadline = new Date(t.deadline)
    return deadline < today && t.status !== 'completed'
  }).length

  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length

  return (
    <div className="flex-1 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-blue-50 overflow-y-auto custom-scrollbar">
      <div className="mb-4 md:mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-3">내 업무 목록</h2>
        <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base">
          <span className="font-semibold text-gray-700">집중해야 할 업무:</span>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {todayDeadline > 0 && (
              <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 md:px-3 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                오늘 마감 <strong>{todayDeadline}건</strong>
              </span>
            )}
            {delayed > 0 && (
              <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 md:px-3 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                지연 <strong>{delayed}건</strong>
              </span>
            )}
            {inProgressCount > 0 && (
              <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 md:px-3 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                진행 중 <strong>{inProgressCount}건</strong>
              </span>
            )}
            {todayDeadline === 0 && delayed === 0 && inProgressCount === 0 && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                ✨ 모든 업무가 순조롭게 진행 중입니다!
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 min-h-[calc(100vh-240px)]">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id)
          const Icon = column.icon
          
          return (
            <div 
              key={column.id} 
              className="flex flex-col"
              onDrop={() => handleDrop(column.id)}
              onDragOver={handleDragOver}
            >
              {/* Column Header */}
              <div className={`bg-gradient-to-r ${column.color} rounded-t-xl px-5 py-4 shadow-lg`}>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg">
                      {column.title}
                    </h3>
                  </div>
                  <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-bold">
                    {columnTasks.length}
                  </span>
                </div>
              </div>
              
              {/* Column Content */}
              <div 
                className={`flex-1 bg-white/50 backdrop-blur-sm rounded-b-xl p-4 overflow-y-auto border-2 border-t-0 transition-all duration-200 custom-scrollbar ${
                  draggedTaskId && column.id !== tasks.find(t => t.id === draggedTaskId)?.status
                    ? 'border-indigo-300 bg-indigo-50/50 shadow-inner'
                    : 'border-gray-200'
                }`}
              >
                {columnTasks.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm mt-8">
                    <div className="text-4xl mb-2">📭</div>
                    <p>업무가 없습니다</p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                      className={`transition-opacity duration-200 ${
                        draggedTaskId === task.id ? 'opacity-50' : 'opacity-100'
                      }`}
                    >
                      <TaskCard
                        task={task}
                        onUpdateStatus={onUpdateStatus}
                        onViewFeedback={onViewFeedback}
                        onViewDetails={onViewDetails}
                        hasFeedback={true} // 항상 피드백 버튼 표시
                        hasUnreadFeedback={task.id === '1'} // Mock: 첫 번째 업무에 피드백 표시
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

