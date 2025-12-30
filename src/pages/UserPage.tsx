import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTasks, useUpdateTask, useCreateTask, useDeleteTask } from '@/hooks/useTasks'
import { useUnreadFeedbacks, useMarkFeedbackRead } from '@/hooks/useFeedbacks'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
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
  const updateTask = useUpdateTask()
  const createTask = useCreateTask()
  const deleteTask = useDeleteTask()
  const markFeedbackRead = useMarkFeedbackRead()

  const [selectedMenu, setSelectedMenu] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
  const [feedbackListModal, setFeedbackListModal] = useState(false)


  // Filter tasks based on selected menu
  const filteredTasks = useMemo(() => {
    // Get today's date in local timezone (YYYY-MM-DD format)
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

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
    // Get today's date in local timezone (YYYY-MM-DD format)
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
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
    title: string,
    status: TaskStatus,
    progress: number,
    deadline: string,
    memo?: string
  ): Promise<void> => {
    if (!statusModal.taskId) {
      console.error('No task ID for status update')
      throw new Error('업무 ID가 없습니다.')
    }

    console.log('Saving status update:', {
      taskId: statusModal.taskId,
      title,
      status,
      progress,
      deadline,
      memo,
    })

    // Ensure progress is valid
    const finalProgress = status === 'completed' ? 100 : Math.max(0, Math.min(100, progress))
    
    // Calculate traffic light based on deadline
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let trafficLight: TrafficLightColor = 'green'
    if (diffDays < 0 || diffDays <= 3) trafficLight = 'red'
    else if (diffDays <= 7) trafficLight = 'yellow'
    
    try {
      // Prepare updates object
      const updates: any = {
        title: title.trim(),
        status,
        progress: finalProgress,
        deadline,
        traffic_light: trafficLight,
        updated_at: new Date().toISOString(),
      }

      // Always update memo, even if empty (to allow clearing)
      if (memo !== undefined) {
        updates.memo = memo.trim() || null
      }

      console.log('Updating task with:', updates)

      await updateTask.mutateAsync({
        taskId: statusModal.taskId,
        updates,
      })
      
      console.log('Status update saved successfully')
      // Invalidate and refetch tasks to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.refetchQueries({ queryKey: ['tasks'] })
      setStatusModal({ isOpen: false, taskId: null })
    } catch (error: any) {
      console.error('Error saving status update:', error)
      alert(`상태 업데이트에 실패했습니다: ${error?.message || '알 수 없는 오류'}`)
      throw error // Re-throw to let modal handle it
    }
  }

  const handleConfirmFeedback = async () => {
    // Mark only the current feedback as read
    if (feedbackModal.taskId) {
      const feedbackToMark = unreadFeedbacks.find(f => f.task_id === feedbackModal.taskId)
      if (feedbackToMark) {
        await markFeedbackRead.mutateAsync(feedbackToMark.id)
      }
    }
    
    setFeedbackModal({ isOpen: false, taskId: null })
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      console.log('Deleting task:', taskId)
      await deleteTask.mutateAsync(taskId)
      console.log('Task deleted successfully')
      setDetailModal({ isOpen: false, taskId: null })
    } catch (error: any) {
      console.error('Error deleting task:', error)
      alert(`업무 삭제에 실패했습니다: ${error?.message || '알 수 없는 오류'}`)
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="bg-white/20 backdrop-blur-xl rounded-full p-4 border border-white/30 shadow-2xl mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/80"></div>
          </div>
          <p className="text-white/90 drop-shadow-md">로딩 중...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-2xl">
            <p className="text-white/90 mb-4 drop-shadow-md">로그인이 필요합니다.</p>
            <button
              onClick={() => {
                // TODO: Implement login
                console.log('Login required')
              }}
              className="px-6 py-2 bg-indigo-500/80 backdrop-blur-md text-white rounded-lg hover:bg-indigo-600/80 border border-white/30 shadow-lg transition-all"
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Header */}
      <div className="relative z-10">
        <Header
          userName={user.name}
          onMenuClick={() => setSidebarOpen(true)}
          onProfileClick={() => navigate('/profile')}
          onLogoutClick={async () => {
            if (window.confirm('로그아웃 하시겠습니까?')) {
              try {
                await signOut()
                // Clear any cached data
                queryClient.clear()
                // Navigate to login page
                navigate('/login', { replace: true })
              } catch (error) {
                console.error('Logout error:', error)
                // Even if there's an error, navigate to login
                navigate('/login', { replace: true })
              }
            }
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative min-h-0 z-10">
        {/* Sidebar */}
        <Sidebar
          selectedMenu={selectedMenu}
          onMenuChange={setSelectedMenu}
          taskCounts={taskCounts}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
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
            selectedMenu={selectedMenu}
          />

          {/* Floating Add Button */}
          <button
            onClick={() => setNewTaskModal(true)}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 bg-gradient-to-r from-purple-500/80 to-indigo-500/80 backdrop-blur-xl text-white p-3 sm:p-3 rounded-2xl shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 z-40 flex items-center gap-2 group border border-white/30"
            title="새 업무 등록"
          >
            <div className="bg-white/30 backdrop-blur-md p-1.5 rounded-lg group-hover:bg-white/40 transition-all duration-300 border border-white/20">
              <Plus className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline font-semibold text-sm pr-1">새 업무</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {currentTask && statusModal.isOpen && (
        <StatusUpdateModal
          isOpen={statusModal.isOpen}
          onClose={() => setStatusModal({ isOpen: false, taskId: null })}
          taskTitle={currentTask.title}
          currentStatus={currentTask.status}
          currentProgress={currentTask.progress}
          currentDeadline={currentTask.deadline}
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
