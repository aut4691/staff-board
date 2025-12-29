import { TrendingUp, Clock, CheckCircle2, AlertCircle, Users, Calendar } from 'lucide-react'
import type { Task } from '@/types/index'

interface StatisticsViewProps {
  tasks: Task[]
  employees: { id: string; name: string; position: string }[]
}

export const StatisticsView = ({ tasks, employees }: StatisticsViewProps) => {
  const today = new Date().toISOString().split('T')[0]
  
  // 전체 통계
  const totalTasks = tasks.length
  const todayDeadline = tasks.filter((t) => t.deadline === today).length
  const delayed = tasks.filter((t) => {
    const deadline = new Date(t.deadline)
    const todayDate = new Date()
    return deadline < todayDate && t.status !== 'completed'
  }).length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const urgent = tasks.filter((t) => t.traffic_light === 'red').length
  const warning = tasks.filter((t) => t.traffic_light === 'yellow').length
  const normal = tasks.filter((t) => t.traffic_light === 'green').length

  // 평균 진행률
  const avgProgress = tasks.length > 0
    ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)
    : 0

  // 직원별 통계
  const employeeStats = employees.map((employee) => {
    const employeeTasks = tasks.filter((t) => t.assigned_to === employee.id)
    const employeeCompleted = employeeTasks.filter((t) => t.status === 'completed').length
    const employeeInProgress = employeeTasks.filter((t) => t.status === 'in_progress').length
    const employeeDelayed = employeeTasks.filter((t) => {
      const deadline = new Date(t.deadline)
      const todayDate = new Date()
      return deadline < todayDate && t.status !== 'completed'
    }).length

    return {
      ...employee,
      total: employeeTasks.length,
      completed: employeeCompleted,
      inProgress: employeeInProgress,
      delayed: employeeDelayed,
      completionRate: employeeTasks.length > 0
        ? Math.round((employeeCompleted / employeeTasks.length) * 100)
        : 0,
    }
  })

  return (
    <div className="space-y-6">
      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 전체 업무 */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border-2 border-indigo-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-indigo-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-indigo-600">{totalTasks}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-700">전체 업무</h3>
        </div>

        {/* 오늘 마감 */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-yellow-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-yellow-600">{todayDeadline}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-700">오늘 마감</h3>
        </div>

        {/* 진행 중 */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-blue-600">{inProgress}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-700">진행 중</h3>
        </div>

        {/* 완료 */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-green-600">{completed}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-700">완료</h3>
        </div>
      </div>

      {/* 우선순위 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-5 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <h3 className="font-bold text-gray-800">긴급</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{urgent}</p>
          <p className="text-sm text-gray-600 mt-1">건</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 border-2 border-yellow-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <h3 className="font-bold text-gray-800">주의</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{warning}</p>
          <p className="text-sm text-gray-600 mt-1">건</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <h3 className="font-bold text-gray-800">정상</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{normal}</p>
          <p className="text-sm text-gray-600 mt-1">건</p>
        </div>
      </div>

      {/* 지연 및 평균 진행률 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-800">지연 업무</h3>
          </div>
          <p className="text-4xl font-bold text-orange-600">{delayed}</p>
          <p className="text-sm text-gray-600 mt-1">건</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-800">평균 진행률</h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-purple-600">{avgProgress}</p>
            <span className="text-xl font-semibold text-purple-600 mb-1">%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${avgProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 직원별 통계 */}
      <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          직원별 업무 현황
        </h3>
        <div className="space-y-3">
          {employeeStats.map((stat) => (
            <div
              key={stat.id}
              className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-gray-800">
                    {stat.name} {stat.position && <span className="text-sm text-gray-600">({stat.position})</span>}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-indigo-600">{stat.total}</span>
                  <span className="text-sm text-gray-600 ml-1">건</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">완료</p>
                  <p className="font-bold text-green-600">{stat.completed}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">진행중</p>
                  <p className="font-bold text-blue-600">{stat.inProgress}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">지연</p>
                  <p className="font-bold text-red-600">{stat.delayed}</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">완료율</span>
                  <span className="font-bold text-indigo-600">{stat.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stat.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

