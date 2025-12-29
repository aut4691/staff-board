import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { FeedbackBanner } from '@/components/user/FeedbackBanner'
import { KanbanBoard } from '@/components/user/KanbanBoard'
import { FeedbackModal } from '@/components/user/FeedbackModal'
import { StatusUpdateModal } from '@/components/user/StatusUpdateModal'
import { TaskDetailModal } from '@/components/user/TaskDetailModal'
import { NewTaskModal } from '@/components/user/NewTaskModal'
import type { Task, TaskStatus, TrafficLightColor } from '@/types/index'

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: '1',
    title: '데이터 댐 구축 2차 제안서 마감',
    description: '데이터 댐 구축 사업 2차 제안서 작성 및 제출\n- 예산 계획서 검토\n- 기술 스펙 문서 작성\n- 사업 일정표 업데이트',
    assigned_to: '김 책임',
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
    description: '모델 학습을 위한 데이터셋 수집 및 정제 작업\n- 공공 데이터 포털 활용\n- 데이터 전처리 및 라벨링\n- 품질 검증',
    assigned_to: '김 책임',
    status: 'todo',
    progress: 30,
    deadline: '2024-10-27',
    traffic_light: 'green',
    created_at: '2024-10-01',
    updated_at: '2024-10-18',
  },
  {
    id: '3',
    title: '시내 교통 분석 보고서',
    description: '도심 교통 혼잡도 분석 보고서 작성\n- 교통량 데이터 수집\n- 시간대별 분석\n- 개선 방안 도출',
    assigned_to: '김 책임',
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
    description: '데이터 분석 시스템 기술 검토 및 보완\n- 아키텍처 설계 검토\n- 보안 요구사항 확인\n- 운영 계획 수립',
    assigned_to: '김 책임',
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
    description: '데이터 품질 개선을 위한 추가 작업\n- 기존 데이터 분석\n- 부족한 항목 보완\n- 검증 프로세스 구축',
    assigned_to: '김 책임',
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
    description: '초기 데이터 수집 작업 완료\n- 10만 건 데이터 확보\n- 품질 검증 완료\n- 데이터 제공',
    assigned_to: '김 책임',
    status: 'completed',
    progress: 100,
    deadline: '2024-10-27',
    traffic_light: 'green',
    created_at: '2024-09-15',
    updated_at: '2024-10-10',
  },
  {
    id: '7',
    title: '1차 제안서 제출',
    description: '1차 제안서 작성 및 제출 완료\n- 사업 계획서 작성\n- 예산 편성\n- 기술 검토 완료',
    assigned_to: '김 책임',
    status: 'completed',
    progress: 100,
    deadline: '2024-09-30',
    traffic_light: 'green',
    created_at: '2024-09-01',
    updated_at: '2024-09-29',
  },
]

export const UserPage = () => {
  const [selectedMenu, setSelectedMenu] = useState('all')
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(true)
  
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
      today: tasks.filter(t => t.deadline === today).length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
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

  const handleDragTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { 
              ...task, 
              status: newStatus, 
              // 완료 상태로 변경되면 진행률을 자동으로 100%로 설정
              progress: newStatus === 'completed' ? 100 : task.progress,
              updated_at: new Date().toISOString() 
            }
          : task
      )
    )
  }

  const handleSaveStatus = (status: TaskStatus, progress: number, memo?: string) => {
    if (statusModal.taskId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === statusModal.taskId
            ? { 
                ...task, 
                status, 
                // 완료 상태로 변경되면 진행률을 자동으로 100%로 설정
                progress: status === 'completed' ? 100 : progress, 
                updated_at: new Date().toISOString() 
              }
            : task
        )
      )
      console.log('Status updated:', { status, progress, memo })
    }
  }

  const handleConfirmFeedback = () => {
    // 피드백 확인 시 모달 닫기 및 알람 배너 닫기
    setFeedbackModal({ isOpen: false, taskId: null })
    setShowFeedbackBanner(false)
  }

  const handleCloseFeedbackModal = () => {
    // 피드백 모달을 닫을 때는 알람 배너는 유지 (확인하지 않고 닫은 경우)
    setFeedbackModal({ isOpen: false, taskId: null })
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  const handleUpdateDeadline = (taskId: string, newDeadline: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, deadline: newDeadline, updated_at: new Date().toISOString() }
          : task
      )
    )
  }

  const handleCreateTask = (title: string, description: string, deadline: string, status: TaskStatus, trafficLight: TrafficLightColor) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      assigned_to: '김 책임',
      status,
      progress: status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0,
      deadline,
      traffic_light: trafficLight,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setTasks((prev) => [newTask, ...prev])
  }

  const currentTask = statusModal.taskId
    ? tasks.find((t) => t.id === statusModal.taskId)
    : null

  const feedbackTask = feedbackModal.taskId
    ? tasks.find((t) => t.id === feedbackModal.taskId)
    : null

  const detailTask = detailModal.taskId
    ? tasks.find((t) => t.id === detailModal.taskId)
    : null

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header
        userName="김 책임"
        hasNewFeedback={showFeedbackBanner}
        onNotificationClick={() => console.log('Notification clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative min-h-0">
        {/* Feedback Banner - Now positioned fixed in top-right */}
        {showFeedbackBanner && (
          <FeedbackBanner 
            onClose={() => setShowFeedbackBanner(false)}
            onClick={() => handleViewFeedback('1')}
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
          />
          
          {/* Floating Add Button */}
          <button
            onClick={() => setNewTaskModal(true)}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-2xl shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 z-40 flex items-center gap-2 group"
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
          onSave={handleSaveStatus}
        />
      )}

      {feedbackTask && (
        <FeedbackModal
          isOpen={feedbackModal.isOpen}
          onClose={handleCloseFeedbackModal}
          taskTitle={feedbackTask.title}
          feedbackMessage="예산팀장과 통화했으니 기술 부분 먼저 진행하세요. (<IMAGE 0> 참조)"
          onConfirm={handleConfirmFeedback}
          feedbackDate="2024년 10월 25일"
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
          hasFeedback={true} // 모든 업무에 피드백 버튼 표시 (실제로는 피드백 여부 체크)
        />
      )}

      <NewTaskModal
        isOpen={newTaskModal}
        onClose={() => setNewTaskModal(false)}
        onCreateTask={handleCreateTask}
      />
    </div>
  )
}

