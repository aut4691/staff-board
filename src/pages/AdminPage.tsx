import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { EmployeeColumn } from '@/components/admin/EmployeeColumn'
import { FeedbackWriteModal } from '@/components/admin/FeedbackWriteModal'
import { AdminTaskDetailModal } from '@/components/admin/AdminTaskDetailModal'
import { StatisticsView } from '@/components/admin/StatisticsView'
import type { Task, TaskStatus } from '@/types/index'

// Mock data for demonstration
const mockEmployees = [
  { id: '1', name: '김 책임', position: '팀장' },
  { id: '2', name: '박 연구원', position: '연구원' },
  { id: '3', name: '이 사원', position: '사원' },
]

const mockTasks: Task[] = [
  {
    id: '1',
    title: '데이터 댐 구축 2차 제안서 마감',
    description: '데이터 댐 구축 사업 2차 제안서 작성 및 제출',
    assigned_to: '1', // 김 책임
    status: 'todo',
    progress: 0,
    deadline: '2024-10-25',
    traffic_light: 'red',
    created_at: '2024-10-01',
    updated_at: '2024-10-20',
  },
  {
    id: '2',
    title: '모델 학습 데이터 확보',
    description: '모델 학습을 위한 데이터셋 수집 및 정제 작업',
    assigned_to: '1', // 김 책임
    status: 'in_progress',
    progress: 30,
    deadline: '2024-10-27',
    traffic_light: 'green',
    created_at: '2024-10-01',
    updated_at: '2024-10-18',
  },
  {
    id: '3',
    title: '시내 교통 분석 보고서',
    description: '도심 교통 혼잡도 분석 보고서 작성',
    assigned_to: '2', // 박 연구원
    status: 'todo',
    progress: 0,
    deadline: '2024-10-30',
    traffic_light: 'yellow',
    created_at: '2024-10-05',
    updated_at: '2024-10-15',
  },
  {
    id: '4',
    title: '데이터 분석 시스템 구축',
    description: '데이터 분석 시스템 기술 검토 및 보완',
    assigned_to: '2', // 박 연구원
    status: 'in_progress',
    progress: 50,
    deadline: '2024-10-25',
    traffic_light: 'yellow',
    created_at: '2024-10-01',
    updated_at: '2024-10-22',
  },
  {
    id: '5',
    title: '데이터 품질 관리',
    description: '데이터 품질 개선을 위한 추가 작업',
    assigned_to: '3', // 이 사원
    status: 'in_progress',
    progress: 75,
    deadline: '2024-10-27',
    traffic_light: 'green',
    created_at: '2024-10-05',
    updated_at: '2024-10-24',
  },
  {
    id: '6',
    title: '초기 데이터 수집 완료',
    description: '초기 데이터 수집 작업 완료',
    assigned_to: '3', // 이 사원
    status: 'completed',
    progress: 100,
    deadline: '2024-10-27',
    traffic_light: 'green',
    created_at: '2024-09-15',
    updated_at: '2024-10-10',
  },
]

export const AdminPage = () => {
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

  // Filter tasks based on selected filter
  const filteredTasks = useMemo(() => {
    let filtered = [...mockTasks]
    const today = new Date().toISOString().split('T')[0]

    switch (selectedFilter) {
      case 'today':
        // 오늘 마감인 업무
        filtered = filtered.filter((task) => task.deadline === today)
        break
      case 'in-progress':
        // 진행 중인 업무
        filtered = filtered.filter((task) => task.status === 'in_progress')
        break
      case 'completed':
        // 완료된 업무
        filtered = filtered.filter((task) => task.status === 'completed')
        break
      case 'all':
      default:
        // 모든 업무 표시
        break
    }

    return filtered
  }, [selectedFilter])

  // Task counts for sidebar
  const taskCounts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const allTasks = mockTasks
    
    return {
      all: allTasks.length,
      today: allTasks.filter((t) => t.deadline === today).length,
      inProgress: allTasks.filter((t) => t.status === 'in_progress').length,
      completed: allTasks.filter((t) => t.status === 'completed').length,
    }
  }, [])

  // Group tasks by employee
  const tasksByEmployee = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    
    mockEmployees.forEach((employee) => {
      grouped[employee.id] = filteredTasks.filter(
        (task) => task.assigned_to === employee.id
      )
    })

    return grouped
  }, [filteredTasks])


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

  const handleSendFeedback = (message: string) => {
    console.log('Sending feedback:', {
      taskId: feedbackModal.taskId,
      employeeId: feedbackModal.employeeId,
      message,
    })
    // TODO: 실제 API 호출
    handleCloseFeedback()
  }

  const currentTask = feedbackModal.taskId
    ? mockTasks.find((t) => t.id === feedbackModal.taskId)
    : null

  const currentEmployee = feedbackModal.employeeId
    ? mockEmployees.find((e) => e.id === feedbackModal.employeeId)
    : null

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header
        userName="관리자 대시보드"
        hasNewFeedback={false}
        onNotificationClick={() => console.log('Notification clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative min-h-0">
        {/* Sidebar */}
        <AdminSidebar
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          taskCounts={taskCounts}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-gray-50 to-blue-50 overflow-y-auto custom-scrollbar min-h-0">
            {selectedFilter === 'statistics' ? (
              <StatisticsView tasks={mockTasks} employees={mockEmployees} />
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">
                  직원별 업무 현황 보드
                </h2>

                {/* Employee Columns */}
                <div className="flex gap-3 md:gap-4 lg:gap-6 overflow-x-auto pb-4 custom-scrollbar min-w-0">
                  {mockEmployees.map((employee) => {
                    const tasks = tasksByEmployee[employee.id] || []

                    return (
                      <EmployeeColumn
                        key={employee.id}
                        employee={employee}
                        tasks={tasks}
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
          const detailTask = mockTasks.find((t) => t.id === detailModal.taskId)
          const detailEmployee = mockEmployees.find((e) => e.id === detailModal.employeeId)
          return detailTask && detailEmployee ? (
            <AdminTaskDetailModal
              isOpen={detailModal.isOpen}
              onClose={handleCloseDetail}
              task={detailTask}
              employee={detailEmployee}
              onFeedbackClick={() => handleFeedbackClick(detailTask.id, detailEmployee.id)}
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
          employee={currentEmployee}
          onSend={handleSendFeedback}
        />
      )}
    </div>
  )
}

