import { AdminTaskCard } from './AdminTaskCard'
import type { Task } from '@/types/index'

interface EmployeeColumnProps {
  employee: { id: string; name: string; position: string }
  tasks: Task[]
  onFeedbackClick: (taskId: string, employeeId: string) => void
  onViewDetails: (taskId: string, employeeId: string) => void
  tasksWithNewComments?: Set<string>
}

export const EmployeeColumn = ({
  employee,
  tasks,
  onFeedbackClick,
  onViewDetails,
  tasksWithNewComments = new Set(),
}: EmployeeColumnProps) => {
  return (
    <div className="flex flex-col min-w-[260px] sm:min-w-[280px] md:min-w-[300px] lg:min-w-[320px] flex-shrink-0">
      {/* Column Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-t-xl px-4 md:px-5 py-3 md:py-4 shadow-lg mb-4">
        <div className="text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base md:text-lg">
              {employee.name}
            </h3>
            {employee.position && (
              <span className="text-xs md:text-sm bg-white/20 px-2 py-1 rounded-full">
                {employee.position}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-b-xl p-3 md:p-4 overflow-y-auto border-2 border-t-0 border-gray-200 custom-scrollbar min-h-[calc(100vh-300px)] max-h-[calc(100vh-300px)]">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            <div className="text-4xl mb-2">📭</div>
            <p>업무가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <AdminTaskCard
                key={task.id}
                task={task}
                onFeedbackClick={() => onFeedbackClick(task.id, employee.id)}
                onViewDetails={() => onViewDetails(task.id, employee.id)}
                hasNewComment={tasksWithNewComments.has(task.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

