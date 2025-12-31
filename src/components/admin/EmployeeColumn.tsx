import { AdminTaskCard } from './AdminTaskCard'
import type { Task } from '@/types/index'

interface EmployeeColumnProps {
  employee: { id: string; name: string; position: string }
  tasks: Task[]
  onFeedbackClick: (taskId: string, employeeId: string) => void
  onViewDetails: (taskId: string, employeeId: string) => void
}

export const EmployeeColumn = ({
  employee,
  tasks,
  onFeedbackClick,
  onViewDetails,
}: EmployeeColumnProps) => {
  return (
    <div className="flex flex-col w-full sm:w-[280px] md:w-[300px] lg:w-[320px] flex-shrink-0">
      {/* Column Header */}
      <div className="bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-xl rounded-t-xl px-4 md:px-5 py-3 md:py-4 shadow-2xl mb-4 border border-white/20">
        <div className="text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base md:text-lg drop-shadow-md">
              {employee.name}
            </h3>
            {employee.position && (
              <span className="text-xs md:text-sm bg-white/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/30 shadow-lg">
                {employee.position}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 bg-white/20 backdrop-blur-xl rounded-b-xl p-3 md:p-4 overflow-y-auto border-2 border-t-0 border-white/30 custom-scrollbar min-h-[calc(100vh-300px)] max-h-[calc(100vh-300px)] shadow-2xl">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-8">
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

