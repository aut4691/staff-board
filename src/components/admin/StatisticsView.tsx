import { TrendingUp, Clock, CheckCircle2, AlertCircle, Users, Target, BarChart3, Activity } from 'lucide-react'
import type { Task } from '@/types/index'

interface StatisticsViewProps {
  tasks: Task[]
  employees: { id: string; name: string; position?: string; role?: string }[]
}

export const StatisticsView = ({ tasks, employees }: StatisticsViewProps) => {
  // Get today's date in local timezone (YYYY-MM-DD format)
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  
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

  // 완료율
  const completionRate = totalTasks > 0
    ? Math.round((completed / totalTasks) * 100)
    : 0

  // 직원별 통계 (관리자 제외)
  const filteredEmployees = employees.filter((emp: any) => emp.role !== 'admin')
  const employeeStats = filteredEmployees.map((employee) => {
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
      avgProgress: employeeTasks.length > 0
        ? Math.round(employeeTasks.reduce((sum, t) => sum + t.progress, 0) / employeeTasks.length)
        : 0,
    }
  })

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-xl p-4 md:p-5 shadow-xl text-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">통계 및 현황</h1>
            <p className="text-indigo-100 text-xs md:text-sm mt-0.5">전체 업무 현황을 한눈에 확인하세요</p>
          </div>
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* 전체 업무 */}
        <div className="group bg-white rounded-xl p-4 border-2 border-gray-100 shadow-md hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {totalTasks}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">건</p>
            </div>
          </div>
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">전체 업무</h3>
          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* 오늘 마감 */}
        <div className="group bg-white rounded-xl p-4 border-2 border-gray-100 shadow-md hover:shadow-xl hover:border-yellow-300 transition-all duration-300 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2.5 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {todayDeadline}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">건</p>
            </div>
          </div>
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">오늘 마감</h3>
          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500" 
              style={{ width: totalTasks > 0 ? `${(todayDeadline / totalTasks) * 100}%` : '0%' }} 
            />
          </div>
        </div>

        {/* 진행 중 */}
        <div className="group bg-white rounded-xl p-4 border-2 border-gray-100 shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {inProgress}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">건</p>
            </div>
          </div>
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">진행 중</h3>
          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500" 
              style={{ width: totalTasks > 0 ? `${(inProgress / totalTasks) * 100}%` : '0%' }} 
            />
          </div>
        </div>

        {/* 완료 */}
        <div className="group bg-white rounded-xl p-4 border-2 border-gray-100 shadow-md hover:shadow-xl hover:border-green-300 transition-all duration-300 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2.5 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {completed}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">건</p>
            </div>
          </div>
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">완료</h3>
          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: totalTasks > 0 ? `${(completed / totalTasks) * 100}%` : '0%' }} 
            />
          </div>
        </div>
      </div>

      {/* 성과 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* 완료율 */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-4 md:p-5 border-2 border-indigo-200 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">전체 완료율</h3>
              <p className="text-xs text-gray-600">업무 달성률</p>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-end gap-2 mb-3">
              <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {completionRate}
              </p>
              <span className="text-xl font-bold text-indigo-600 mb-1">%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                style={{ width: `${completionRate}%` }}
              >
                {completionRate > 10 && (
                  <span className="text-xs font-bold text-white">{completionRate}%</span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* 평균 진행률 */}
        <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-xl p-4 md:p-5 border-2 border-blue-200 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-lg shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">평균 진행률</h3>
              <p className="text-xs text-gray-600">전체 업무 평균</p>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-end gap-2 mb-3">
              <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {avgProgress}
              </p>
              <span className="text-xl font-bold text-blue-600 mb-1">%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                style={{ width: `${avgProgress}%` }}
              >
                {avgProgress > 10 && (
                  <span className="text-xs font-bold text-white">{avgProgress}%</span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 우선순위 및 지연 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
        {/* 긴급 */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border-2 border-red-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-red-500 rounded-full shadow-md ring-2 ring-red-100"></div>
            <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wide">긴급</h3>
          </div>
          <p className="text-3xl font-bold text-red-600 mb-0.5">{urgent}</p>
          <p className="text-xs text-gray-600">건</p>
          <div className="mt-3 h-1.5 bg-red-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-500" 
              style={{ width: totalTasks > 0 ? `${(urgent / totalTasks) * 100}%` : '0%' }} 
            />
          </div>
        </div>

        {/* 주의 */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border-2 border-yellow-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-md ring-2 ring-yellow-100"></div>
            <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wide">주의</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600 mb-0.5">{warning}</p>
          <p className="text-xs text-gray-600">건</p>
          <div className="mt-3 h-1.5 bg-yellow-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-500" 
              style={{ width: totalTasks > 0 ? `${(warning / totalTasks) * 100}%` : '0%' }} 
            />
          </div>
        </div>

        {/* 정상 */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-green-500 rounded-full shadow-md ring-2 ring-green-100"></div>
            <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wide">정상</h3>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-0.5">{normal}</p>
          <p className="text-xs text-gray-600">건</p>
          <div className="mt-3 h-1.5 bg-green-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: totalTasks > 0 ? `${(normal / totalTasks) * 100}%` : '0%' }} 
            />
          </div>
        </div>

        {/* 지연 */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-1.5 rounded-lg shadow-md">
              <AlertCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wide">지연</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600 mb-0.5">{delayed}</p>
          <p className="text-xs text-gray-600">건</p>
          <div className="mt-3 h-1.5 bg-orange-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500" 
              style={{ width: totalTasks > 0 ? `${(delayed / totalTasks) * 100}%` : '0%' }} 
            />
          </div>
        </div>
      </div>

      {/* 직원별 통계 */}
      <div className="bg-white rounded-xl p-4 md:p-5 border-2 border-gray-200 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800">직원별 업무 현황</h3>
            <p className="text-xs text-gray-600">개인별 업무 성과 및 진행 상황</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {employeeStats.map((stat) => (
            <div
              key={stat.id}
              className="group bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border-2 border-gray-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* 직원 헤더 */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-800 text-base">
                    {stat.name}
                    {stat.position && (
                      <span className="text-xs text-gray-600 font-normal ml-1.5">({stat.position})</span>
                    )}
                  </h4>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.total}
                  </p>
                  <p className="text-xs text-gray-500">전체</p>
                </div>
              </div>

              {/* 통계 그리드 */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white rounded-lg p-2 text-center border border-green-200">
                  <p className="text-xs text-gray-600 mb-0.5">완료</p>
                  <p className="text-lg font-bold text-green-600">{stat.completed}</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-blue-200">
                  <p className="text-xs text-gray-600 mb-0.5">진행중</p>
                  <p className="text-lg font-bold text-blue-600">{stat.inProgress}</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-red-200">
                  <p className="text-xs text-gray-600 mb-0.5">지연</p>
                  <p className="text-lg font-bold text-red-600">{stat.delayed}</p>
                </div>
              </div>

              {/* 진행률 바 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">완료율</span>
                  <span className="font-bold text-indigo-600">{stat.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-1"
                    style={{ width: `${stat.completionRate}%` }}
                  >
                    {stat.completionRate > 20 && (
                      <span className="text-[10px] font-bold text-white">{stat.completionRate}%</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">평균 진행률</span>
                  <span className="font-bold text-blue-600">{stat.avgProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-1"
                    style={{ width: `${stat.avgProgress}%` }}
                  >
                    {stat.avgProgress > 20 && (
                      <span className="text-[10px] font-bold text-white">{stat.avgProgress}%</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
