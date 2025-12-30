import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { useEmployees } from '@/hooks/useEmployees'
import { useCreateFeedback, useAdminUnreadComments } from '@/hooks/useFeedbacks'
import { useQueryClient } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { EmployeeColumn } from '@/components/admin/EmployeeColumn'
import { FeedbackWriteModal } from '@/components/admin/FeedbackWriteModal'
import { AdminTaskDetailModal } from '@/components/admin/AdminTaskDetailModal'
import { StatisticsView } from '@/components/admin/StatisticsView'
import { EmployeeManagementView } from '@/components/admin/EmployeeManagementView'
import { CommentListModal } from '@/components/admin/CommentListModal'
import type { Task } from '@/types/index'

export const AdminPage = () => {
  const { user, isLoading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(undefined, true)
  const { data: employees = [], isLoading: employeesLoading } = useEmployees()
  const { data: unreadComments = [] } = useAdminUnreadComments(user?.id || '')
  const createFeedback = useCreateFeedback()

  const [selectedFilter, setSelectedFilter] = useState('all')
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean
    taskId: string | null
    employeeId: string | null
  }>({ isOpen: false, taskId: null, employeeId: null })

  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean
    taskId: string | null
    employeeId: string | null
  }>({ isOpen: false, taskId: null, employeeId: null })

  const [commentListModal, setCommentListModal] = useState(false)

  // Filter tasks based on selected filter
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks]
    // Get today's date in local timezone (YYYY-MM-DD format)
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    switch (selectedFilter) {
      case 'today':
        filtered = filtered.filter((task) => task.deadline === today)
        break
      case 'in-progress':
        filtered = filtered.filter((task) => task.status === 'in_progress')
        break
      case 'completed':
        filtered = filtered.filter((task) => task.status === 'completed')
        break
      case 'all':
      default:
        break
    }

    return filtered
  }, [selectedFilter, tasks])

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

  // Filter employees (exclude admin)
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => emp.role !== 'admin')
  }, [employees])

  // Group tasks by employee
  const tasksByEmployee = useMemo(() => {
    const grouped: Record<string, Task[]> = {}

    filteredEmployees.forEach((employee) => {
      grouped[employee.id] = filteredTasks.filter(
        (task) => task.assigned_to === employee.id
      )
    })

    return grouped
  }, [filteredTasks, filteredEmployees])


  const handleFeedbackClick = (taskId: string, employeeId: string) => {
    setDetailModal({ isOpen: false, taskId: null, employeeId: null })
    setFeedbackModal({ isOpen: true, taskId, employeeId })
  }

  const handleViewDetails = (taskId: string, employeeId: string) => {
    setDetailModal({ isOpen: true, taskId, employeeId })
  }

  const handleCloseFeedback = () => {
    setFeedbackModal({ isOpen: false, taskId: null, employeeId: null })
  }

  const handleCloseDetail = () => {
    setDetailModal({ isOpen: false, taskId: null, employeeId: null })
  }

  const handleSendFeedback = async (message: string) => {
    if (!feedbackModal.taskId || !feedbackModal.employeeId) {
      alert('업무와 담당자 정보가 필요합니다.')
      return
    }

    if (!message.trim()) {
      alert('피드백 내용을 입력해주세요.')
      return
    }

    try {
      console.log('Sending feedback:', {
        taskId: feedbackModal.taskId,
        toUserId: feedbackModal.employeeId,
        message: message.trim(),
      })
      
      const result = await createFeedback.mutateAsync({
        taskId: feedbackModal.taskId,
        toUserId: feedbackModal.employeeId,
        message: message.trim(),
      })
      
      console.log('Feedback sent successfully:', result)
      // 모달을 닫지 않고 유지 - 사용자가 계속 피드백을 작성할 수 있도록
    } catch (error: any) {
      console.error('Error sending feedback:', error)
      const errorMessage = error?.message || error?.error?.message || '알 수 없는 오류'
      alert(`피드백 전송에 실패했습니다: ${errorMessage}`)
    }
  }

  const currentTask = feedbackModal.taskId
    ? tasks.find((t) => t.id === feedbackModal.taskId)
    : null

  const currentEmployee = feedbackModal.employeeId
    ? employees.find((e) => e.id === feedbackModal.employeeId)
    : null

  // Loading state
  if (authLoading || tasksLoading || employeesLoading) {
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

  // Not authenticated or not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-2xl">
            <p className="text-white/90 mb-4 drop-shadow-md">
              관리자 권한이 필요합니다.
            </p>
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
          userName="관리자 대시보드"
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
        <AdminSidebar
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          taskCounts={taskCounts}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="p-3 sm:p-4 md:p-6 overflow-y-auto custom-scrollbar min-h-0">
            {selectedFilter === 'statistics' ? (
              <StatisticsView tasks={tasks} employees={employees} />
            ) : selectedFilter === 'employee-management' ? (
              <EmployeeManagementView />
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 drop-shadow-md">
                  직원별 업무 현황 보드
                </h2>

                {/* Employee Columns */}
                <div className="flex gap-3 md:gap-4 lg:gap-6 overflow-x-auto pb-4 custom-scrollbar min-w-0">
                  {filteredEmployees.map((employee) => {
                    const employeeTasks = tasksByEmployee[employee.id] || []

                    return (
                      <EmployeeColumn
                        key={employee.id}
                        employee={{
                          id: employee.id,
                          name: employee.name,
                          position: employee.position || '',
                        }}
                        tasks={employeeTasks}
                        onFeedbackClick={handleFeedbackClick}
                        onViewDetails={handleViewDetails}
                      />
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {detailModal.taskId && detailModal.employeeId && (
        (() => {
          const detailTask = tasks.find((t) => t.id === detailModal.taskId)
          const detailEmployee = employees.find((e) => e.id === detailModal.employeeId)
          return detailTask && detailEmployee ? (
            <AdminTaskDetailModal
              isOpen={detailModal.isOpen}
              onClose={handleCloseDetail}
              task={detailTask}
              employee={{
                id: detailEmployee.id,
                name: detailEmployee.name,
                position: detailEmployee.position || '',
              }}
              onFeedbackClick={() =>
                handleFeedbackClick(detailTask.id, detailEmployee.id)
              }
            />
          ) : null
        })()
      )}

      {/* Feedback Write Modal */}
      {currentTask && currentEmployee && (
            <FeedbackWriteModal
              isOpen={feedbackModal.isOpen}
              onClose={handleCloseFeedback}
              task={currentTask}
              employee={{
                id: currentEmployee.id,
                name: currentEmployee.name,
                position: currentEmployee.position || '',
              }}
              onSend={handleSendFeedback}
            />
      )}

      {/* Comment List Modal */}
      <CommentListModal
        isOpen={commentListModal}
        onClose={() => setCommentListModal(false)}
        unreadCommentTasks={unreadComments}
        adminId={user?.id}
        onMarkAsViewed={() => {
          // Invalidate queries to refresh unread comments count
          queryClient.invalidateQueries({ queryKey: ['admin-unread-comments'] })
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  )
}
