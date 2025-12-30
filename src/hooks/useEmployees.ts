import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface Employee {
  id: string
  name: string
  position?: string
  email: string
  role: 'admin' | 'user'
}

// Fetch all employees (admin only)
export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, name, position, email, role')
        .order('name', { ascending: true })

      if (error) throw error
      return data as Employee[]
    },
  })
}

// Delete employee (admin only)
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (employeeId: string) => {
      // First, delete all tasks assigned to this employee
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('assigned_to', employeeId)

      if (tasksError) {
        console.error('Error deleting employee tasks:', tasksError)
        throw new Error(`업무 삭제 중 오류가 발생했습니다: ${tasksError.message}`)
      }

      // Then, delete all feedbacks related to this employee's tasks
      const { data: employeeTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('assigned_to', employeeId)

      if (employeeTasks && employeeTasks.length > 0) {
        const taskIds = employeeTasks.map((t) => t.id)
        const { error: feedbacksError } = await supabase
          .from('feedbacks')
          .delete()
          .in('task_id', taskIds)

        if (feedbacksError) {
          console.error('Error deleting feedbacks:', feedbacksError)
          // Continue even if feedback deletion fails
        }
      }

      // Finally, delete the employee profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', employeeId)

      if (profileError) {
        console.error('Error deleting employee profile:', profileError)
        throw new Error(`직원 삭제 중 오류가 발생했습니다: ${profileError.message}`)
      }

      // Note: Auth user deletion requires service role key and should be done server-side
      // For now, we only delete the user profile. The auth user will remain but won't be able to access the app

      return { success: true }
    },
    onSuccess: () => {
      // Invalidate queries to refresh the employee list
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
    },
  })
}
