import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTasks, useUpdateTask, useCreateTask, useDeleteTask } from '@/hooks/useTasks'
import { useUnreadFeedbacks, useAllFeedbacks, useMarkFeedbackRead } from '@/hooks/useFeedbacks'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { FeedbackBanner } from '@/components/user/FeedbackBanner'
import { KanbanBoard } from '@/components/user/KanbanBoard'
import { FeedbackModal } from '@/components/user/FeedbackModal'
import { FeedbackListModal } from '@/components/user/FeedbackListModal'
import { StatusUpdateModal } from '@/components/user/StatusUpdateModal'
import { TaskDetailModal } from '@/components/user/TaskDetailModal'
import { NewTaskModal } from '@/components/user/NewTaskModal'
import { useQueryClient } from '@tanstack/react-query'
import type { TaskStatus, TrafficLightColor } from '@/types/index'

export const UserPage = () => {
  const { user, isLoading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(user?.id, false)
  const { data: unreadFeedbacks = [] } = useUnreadFeedbacks(user?.id || '')
  const { data: allFeedbacks = [] } = useAllFeedbacks(user?.id || '')
  const updateTask = useUpdateTask()
  const createTask = useCreateTask()
  const deleteTask = useDeleteTask()
  const markFeedbackRead = useMarkFeedbackRead()

  const [selectedMenu, setSelectedMenu] = useState('all')
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(unreadFeedbacks.length > 0)

  // Modal states
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean
    taskId: string | null
  }>({ isOpen: false, taskId: null })

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean
    taskId: string | null
  }>({ isOpen: false, taskId: null })

  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean
    taskId: string | null
  }>({ isOpen: false, taskId: null })

  const [newTaskModal, setNewTaskModal] = useState(false)
  const [viewedFeedbackTaskIds, setViewedFeedbackTaskIds] = useState<Set<string>>(new Set())
  const [feedbackListModal, setFeedbackListModal] = useState(false)

  // Update feedback banner when unread feedbacks change
  useEffect(() => {
    setShowFeedbackBanner(unreadFeedbacks.length > 0)
  }, [unreadFeedbacks.length])

  // Initialize viewed feedback task IDs from all feedbacks (read feedbacks)
  useEffect(() => {
    const readFeedbackTaskIds = new Set(
      allFeedbacks
        .filter(f => f.is_read)
        .map(f => f.task_id)
    )
    if (readFeedbackTaskIds.size > 0) {
      setViewedFeedbackTaskIds(prev => new Set([...prev, ...readFeedbackTaskIds]))
    }
  }, [allFeedbacks])

  // Filter tasks based on selected menu
  const filteredTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]

    switch (selectedMenu) {
      case 'today':
        return tasks.filter((task) => task.deadline === today)
      case 'in-progress':
        return tasks.filter((task) => task.status === 'in_progress')
      case 'completed':
        return tasks.filter((task) => task.status === 'completed')
      case 'all':
      default:
        return tasks
    }
  }, [selectedMenu, tasks])

  // Task counts for sidebar
  const taskCounts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      all: tasks.length,
      today: tasks.filter((t) => t.deadline === today).length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    }
  }, [tasks])

  // Handlers
  const handleUpdateStatus = (taskId: string) => {
    setDetailModal({ isOpen: false, taskId: null })
    setStatusModal({ isOpen: true, taskId })
  }

  const handleViewFeedback = (taskId: string) => {
    setDetailModal({ isOpen: false, taskId: null })
    setFeedbackModal({ isOpen: true, taskId })
    // Mark feedback as viewed when opening modal
    setViewedFeedbackTaskIds(prev => new Set([...prev, taskId]))
  }

  const handleViewDetails = (taskId: string) => {
    setDetailModal({ isOpen: true, taskId })
  }

  const handleDragTask = async (taskId: string, newStatus: TaskStatus) => {
    const progress = newStatus === 'completed' ? 100 : undefined
    await updateTask.mutateAsync({
      taskId,
      updates: {
        status: newStatus,
        ...(progress !== undefined && { progress }),
        updated_at: new Date().toISOString(),
      },
    })
  }

  const handleSaveStatus = async (
    status: TaskStatus,
    progress: number,
    memo?: string
  ) => {
    if (statusModal.taskId) {
      await updateTask.mutateAsync({
        taskId: statusModal.taskId,
        updates: {
          status,
          progress: status === 'completed' ? 100 : progress,
          ...(memo?.trim() ? { memo: memo.trim() } : {}),
          updated_at: new Date().toISOString(),
        },
      })
      setStatusModal({ isOpen: false, taskId: null })
    }
  }

  const handleConfirmFeedback = async () => {
    // Mark only the current feedback as read
    if (feedbackModal.taskId) {
      const feedbackToMark = unreadFeedbacks.find(f => f.task_id === feedbackModal.taskId)
      if (feedbackToMark) {
        await markFeedbackRead.mutateAsync(feedbackToMark.id)
      }
      // Mark feedback task as viewed when confirmed
      setViewedFeedbackTaskIds(prev => new Set([...prev, feedbackModal.taskId!]))
    }
    
    setFeedbackModal({ isOpen: false, taskId: null })
    setShowFeedbackBanner(false)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('정말 이 업무를 삭제하시겠습니까?')) {
      await deleteTask.mutateAsync(taskId)
      setDetailModal({ isOpen: false, taskId: null })
    }
  }

  const handleUpdateDeadline = async (taskId: string, newDeadline: string) => {
    // Calculate traffic light based on new deadline
    const today = new Date()
    const deadlineDate = new Date(newDeadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let trafficLight: TrafficLightColor = 'green'
    if (diffDays < 0 || diffDays <= 3) trafficLight = 'red'
    else if (diffDays <= 7) trafficLight = 'yellow'

    await updateTask.mutateAsync({
      taskId,
      updates: {
        deadline: newDeadline,
        traffic_light: trafficLight,
        updated_at: new Date().toISOString(),
      },
    })
  }

  const handleCreateTask = async (
    title: string,
    description: string,
    deadline: string,
    status: TaskStatus,
    trafficLight: TrafficLightColor
  ) => {
    if (!user?.id) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      console.log('Creating task:', { title, description, deadline, status, trafficLight, assigned_to: user.id })
      const result = await createTask.mutateAsync({
        title: title.trim(),
        description: description?.trim() || '',
        assigned_to: user.id,
        deadline,
        status,
        traffic_light: trafficLight,
      })
      console.log('Task created successfully:', result)
      setNewTaskModal(false)
    } catch (error: any) {
      console.error('Error creating task:', error)
      const errorMessage = error?.message || error?.error?.message || '알 수 없는 오류'
      alert(`업무 생성에 실패했습니다: ${errorMessage}`)
    }
  }

  const handleCloseFeedbackModal = () => {
    setFeedbackModal({ isOpen: false, taskId: null })
  }

  const currentTask = statusModal.taskId
    ? tasks.find((t) => t.id === statusModal.taskId)
    : null

  // Debug: Log currentTask when status modal opens
  useEffect(() => {
    if (statusModal.isOpen && currentTask) {
      console.log('StatusUpdateModal - currentTask:', {
        id: currentTask.id,
        title: currentTask.title,
        description: currentTask.description,
        memo: currentTask.memo,
        status: currentTask.status,
        progress: currentTask.progress,
        willUseMemo: currentTask.memo || currentTask.description || '',
      })
    }
  }, [statusModal.isOpen, currentTask])

  const feedbackTask = feedbackModal.taskId
    ? tasks.find((t) => t.id === feedbackModal.taskId)
    : null

  const detailTask = detailModal.taskId
    ? tasks.find((t) => t.id === detailModal.taskId)
    : null

  // Loading state
  if (authLoading || tasksLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <button
            onClick={() => {
              // TODO: Implement login
              console.log('Login required')
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            로그인
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header
        userName={user.name}
        hasNewFeedback={unreadFeedbacks.length > 0}
        feedbackCount={unreadFeedbacks.length}
        onNotificationClick={() => {
          if (unreadFeedbacks.length > 0) {
            setFeedbackListModal(true)
          }
        }}
        onProfileClick={() => navigate('/profile')}
        onLogoutClick={async () => {
          if (window.confirm('로그아웃 하시겠습니까?')) {
            try {
              await signOut()
              navigate('/login', { replace: true })
              window.location.href = '/login'
            } catch (error) {
              console.error('Logout error:', error)
              alert('로그아웃 중 오류가 발생했습니다.')
            }
          }
        }}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative min-h-0">
        {/* Feedback Banner - Now positioned fixed in top-right */}
        {showFeedbackBanner && unreadFeedbacks.length > 0 && (
          <FeedbackBanner
            onClose={() => setShowFeedbackBanner(false)}
            onClick={() => {
              if (unreadFeedbacks.length > 0) {
                handleViewFeedback(unreadFeedbacks[0].task_id)
              }
            }}
          />
        )}
        {/* Sidebar */}
        <Sidebar
          selectedMenu={selectedMenu}
          onMenuChange={setSelectedMenu}
          taskCounts={taskCounts}
        />

        {/* Kanban Board with New Task Button */}
        <div className="flex-1 flex flex-col">
          <KanbanBoard
            tasks={filteredTasks}
            onUpdateStatus={handleUpdateStatus}
            onViewFeedback={handleViewFeedback}
            onViewDetails={handleViewDetails}
            onDragTask={handleDragTask}
            showStats={selectedMenu === 'all'}
            unreadFeedbackTaskIds={unreadFeedbacks.map(f => f.task_id)}
            allFeedbackTaskIds={[...new Set(allFeedbacks.map(f => f.task_id))]}
            viewedFeedbackTaskIds={viewedFeedbackTaskIds}
          />

          {/* Floating Add Button */}
          <button
            onClick={() => setNewTaskModal(true)}
            className="fixed bottom-24 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-2xl shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 z-40 flex items-center gap-2 group"
            title="새 업무 등록"
          >
            <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-all duration-300">
              <Plus className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline font-semibold text-sm pr-1">새 업무</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {currentTask && (
        <StatusUpdateModal
          isOpen={statusModal.isOpen}
          onClose={() => setStatusModal({ isOpen: false, taskId: null })}
          taskTitle={currentTask.title}
          currentStatus={currentTask.status}
          currentProgress={currentTask.progress}
          currentMemo={currentTask.memo || currentTask.description || ''}
          onSave={handleSaveStatus}
        />
      )}

      {feedbackTask && (
        <FeedbackModal
          isOpen={feedbackModal.isOpen}
          onClose={handleCloseFeedbackModal}
          taskTitle={feedbackTask.title}
          feedbackMessage={
            unreadFeedbacks.find((f) => f.task_id === feedbackTask.id)?.message || ''
          }
          onConfirm={handleConfirmFeedback}
          feedbackDate={
            unreadFeedbacks.find((f) => f.task_id === feedbackTask.id)?.created_at
              ? new Date(
                  unreadFeedbacks.find((f) => f.task_id === feedbackTask.id)!.created_at
                ).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : undefined
          }
          taskId={feedbackTask.id}
        />
      )}

      {detailTask && (
        <TaskDetailModal
          isOpen={detailModal.isOpen}
          onClose={() => setDetailModal({ isOpen: false, taskId: null })}
          task={detailTask}
          onUpdateStatus={handleUpdateStatus}
          onDeleteTask={handleDeleteTask}
          onUpdateDeadline={handleUpdateDeadline}
          onViewFeedback={handleViewFeedback}
        />
      )}

      <NewTaskModal
        isOpen={newTaskModal}
        onClose={() => setNewTaskModal(false)}
        onCreateTask={handleCreateTask}
      />

      {/* Feedback List Modal */}
      <FeedbackListModal
        isOpen={feedbackListModal}
        onClose={() => setFeedbackListModal(false)}
        unreadFeedbacks={unreadFeedbacks}
        userId={user?.id}
        onMarkAsViewed={() => {
          // Invalidate queries to refresh unread feedbacks count
          queryClient.invalidateQueries({ queryKey: ['unread-feedbacks'] })
          queryClient.invalidateQueries({ queryKey: ['all-feedbacks'] })
        }}
        onFeedbackClick={(taskId) => {
          handleViewFeedback(taskId)
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  )
}
