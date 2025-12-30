import { useState } from 'react'
import { Trash2, User, Mail, Briefcase, AlertTriangle } from 'lucide-react'
import { useEmployees, useDeleteEmployee } from '@/hooks/useEmployees'

interface Employee {
  id: string
  name: string
  position?: string
  email: string
  role: 'admin' | 'user'
}

export const EmployeeManagementView = () => {
  const { data: employees = [], isLoading } = useEmployees()
  const deleteEmployee = useDeleteEmployee()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filter out admin users - only show regular employees
  const regularEmployees = employees.filter((emp) => emp.role !== 'admin')

  const handleDelete = async (employee: Employee) => {
    if (!window.confirm(`정말로 "${employee.name}" 직원을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 해당 직원의 모든 업무와 피드백도 함께 삭제됩니다.`)) {
      return
    }

    setDeletingId(employee.id)
    try {
      await deleteEmployee.mutateAsync(employee.id)
      alert('직원이 성공적으로 삭제되었습니다.')
    } catch (error: any) {
      console.error('Error deleting employee:', error)
      alert(`직원 삭제에 실패했습니다: ${error?.message || '알 수 없는 오류'}`)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-xl rounded-xl px-6 py-4 shadow-2xl border border-white/20">
        <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
          직원 관리
        </h2>
        <p className="text-white/90 text-sm mt-1">
          등록된 직원 현황을 확인하고 관리할 수 있습니다.
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-100/80 backdrop-blur-md border-2 border-yellow-300/50 rounded-xl p-4 flex items-start gap-3 shadow-lg">
        <AlertTriangle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-yellow-800 font-semibold text-sm mb-1">주의사항</p>
          <p className="text-yellow-700 text-xs">
            직원을 삭제하면 해당 직원의 모든 업무와 피드백이 함께 삭제되며, 이 작업은 되돌릴 수 없습니다.
            이상자 칩임을 방지하기 위한 목적으로만 사용하세요.
          </p>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white/20 backdrop-blur-xl rounded-xl p-4 md:p-6 border-2 border-white/30 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            등록된 직원 목록
          </h3>
          <p className="text-sm text-gray-600">
            총 {regularEmployees.length}명의 직원이 등록되어 있습니다.
          </p>
        </div>

        {regularEmployees.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">등록된 직원이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {regularEmployees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white/50 backdrop-blur-md rounded-xl p-4 md:p-5 border-2 border-white/40 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-gradient-to-br from-indigo-500/80 to-blue-500/80 backdrop-blur-md rounded-full p-2 border border-white/30 shadow-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-lg mb-1 truncate">
                          {employee.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          {employee.position && (
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4 text-gray-500" />
                              <span className="bg-blue-100/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-blue-200/50">
                                {employee.position}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{employee.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(employee)}
                    disabled={deletingId === employee.id}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/80 to-pink-500/80 backdrop-blur-md text-white rounded-lg hover:from-red-600/80 hover:to-pink-600/80 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed border border-white/30 flex-shrink-0"
                  >
                    {deletingId === employee.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="text-sm font-medium">삭제 중...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">삭제</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

