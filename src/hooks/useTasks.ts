import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Task, TaskStatus, TrafficLightColor } from '@/types/index'

// Fetch tasks
export const useTasks = (userId?: string, isAdmin: boolean = false) => {
  return useQuery({
    queryKey: ['tasks', userId, isAdmin],
    queryFn: async () => {
      console.log('📋 [useTasks] Fetching tasks:', { userId, isAdmin })
      
      // Explicitly select all fields including memo
      let query = supabase
        .from('tasks')
        .select('id, title, description, assigned_to, status, progress, deadline, traffic_light, memo, created_at, updated_at')
        .order('created_at', { ascending: false })

      // If not admin, only fetch tasks assigned to the user
      if (!isAdmin && userId) {
        console.log('👤 [useTasks] Filtering tasks for user:', userId)
        query = query.eq('assigned_to', userId)
      } else if (isAdmin) {
        console.log('👑 [useTasks] Fetching all tasks (admin mode)')
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ [useTasks] Error fetching tasks:', error)
        throw error
      }
      
      console.log('✅ [useTasks] Fetched tasks:', data?.length, 'tasks')
      
      // 디버깅: 각 업무의 assigned_to 확인
      if (data && data.length > 0) {
        console.log('📊 [useTasks] Task assignments:', data.map(t => ({
          id: t.id,
          title: t.title,
          assigned_to: t.assigned_to,
        })))
        
        // 사용자 ID로 필터링된 경우, 실제로 해당 사용자에게 할당된 업무인지 확인
        if (!isAdmin && userId) {
          const mismatched = data.filter(t => t.assigned_to !== userId)
          if (mismatched.length > 0) {
            console.warn('⚠️ [useTasks] Found tasks not assigned to user:', mismatched.map(t => ({
              id: t.id,
              title: t.title,
              assigned_to: t.assigned_to,
              expected: userId,
            })))
          }
        }
      }
      
      return (data || []) as Task[]
    },
    enabled: !!userId || isAdmin,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

// Update task
export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      console.log('Updating task:', { taskId, updates })
      
      // Ensure progress is a number and within valid range
      if (updates.progress !== undefined) {
        updates.progress = Math.max(0, Math.min(100, Number(updates.progress)))
      }
      
      // Ensure updated_at is set
      if (!updates.updated_at) {
        updates.updated_at = new Date().toISOString()
      }

      // Ensure memo is explicitly included in update if provided
      const updateData: any = { ...updates }
      
      // If memo is explicitly set (including null/empty), include it
      if ('memo' in updates) {
        updateData.memo = updates.memo === null || updates.memo === '' ? null : updates.memo
      }

      console.log('Sending update to Supabase:', updateData)

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single()

      if (error) {
        console.error('Error updating task:', error)
        throw error
      }
      
      if (!data) {
        throw new Error('Task update returned no data')
      }
      
      console.log('Task updated successfully:', data)
      return data
    },
    onSuccess: (data, variables) => {
      console.log('Invalidating queries after task update')
      // Update the cache with the returned data first
      queryClient.setQueryData(['tasks'], (oldData: Task[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map((task) =>
          task.id === variables.taskId ? { ...task, ...data } : task
        )
      })
      // Then invalidate all task queries to ensure UI updates from server
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      // Force refetch to ensure latest data
      queryClient.refetchQueries({ queryKey: ['tasks'] })
    },
  })
}

// Create task
export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      title,
      description,
      assigned_to,
      deadline,
      status,
      traffic_light,
    }: {
      title: string
      description?: string
      assigned_to: string
      deadline: string
      status: TaskStatus
      traffic_light: TrafficLightColor
    }) => {
      // Validate required fields
      if (!title || !title.trim()) {
        throw new Error('업무 제목을 입력해주세요.')
      }
      if (!deadline) {
        throw new Error('마감일을 선택해주세요.')
      }
      if (!assigned_to) {
        throw new Error('담당자를 지정해주세요.')
      }

      const progress = status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0

      console.log('Inserting task:', {
        title: title.trim(),
        description: description?.trim() || null,
        assigned_to,
        deadline,
        status,
        progress,
        traffic_light,
      })

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: title.trim(),
          description: description?.trim() || null,
          assigned_to,
          deadline,
          status,
          progress,
          traffic_light,
        })
        .select()
        .single()

      if (error) {
        console.error('Task creation error:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw new Error(error.message || '업무 생성에 실패했습니다.')
      }

      console.log('Task created successfully:', data)

      // Create notification for assigned user (ignore errors)
      try {
        const { error: notifError } = await supabase.from('notifications').insert({
          user_id: assigned_to,
          type: 'task_update',
          title: '새 업무 할당',
          message: `새로운 업무 "${title.trim()}"가 할당되었습니다.`,
          is_read: false,
        })
        if (notifError) {
          console.warn('Failed to create notification:', notifError)
        }
      } catch (notifError) {
        console.warn('Failed to create notification:', notifError)
        // Don't throw - notification failure shouldn't block task creation
      }

      return data
    },
    onSuccess: (_, variables) => {
      console.log('Invalidating queries for user:', variables.assigned_to)
      // Invalidate all task queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      // Also invalidate specific user's tasks
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.assigned_to, false] })
    },
  })
}

// Delete task
export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: string) => {
      console.log('Deleting task via Supabase:', taskId)
      
      // Get current user to verify ownership
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('로그인이 필요합니다.')
      }

      // First, verify the task exists and check ownership
      const { data: taskData, error: fetchError } = await supabase
        .from('tasks')
        .select('id, title, assigned_to')
        .eq('id', taskId)
        .single()

      if (fetchError) {
        console.error('Error fetching task before deletion:', fetchError)
        throw new Error(`업무를 찾을 수 없습니다: ${fetchError.message}`)
      }

      if (!taskData) {
        throw new Error('삭제할 업무를 찾을 수 없습니다.')
      }

      // Verify ownership
      if (taskData.assigned_to !== user.id) {
        console.error('User does not own this task:', {
          taskAssignedTo: taskData.assigned_to,
          currentUserId: user.id
        })
        throw new Error('삭제 권한이 없습니다. 자신의 업무만 삭제할 수 있습니다.')
      }

      console.log('Task found and ownership verified, proceeding with deletion:', taskData)
      
      // Delete the task
      const { data: deletedData, error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .select()

      if (error) {
        console.error('Error deleting task:', error)
        // Provide more specific error messages
        if (error.code === '42501') {
          throw new Error('삭제 권한이 없습니다. 자신의 업무만 삭제할 수 있습니다.')
        } else if (error.code === 'PGRST116') {
          throw new Error('삭제할 업무를 찾을 수 없습니다.')
        } else {
          throw new Error(`삭제 실패: ${error.message}`)
        }
      }

      if (!deletedData || deletedData.length === 0) {
        throw new Error('업무 삭제에 실패했습니다. 업무가 존재하지 않거나 권한이 없습니다.')
      }
      
      console.log('Task deleted successfully:', taskId, deletedData)
      return taskId
    },
    onSuccess: (taskId) => {
      console.log('Invalidating queries after task deletion:', taskId)
      // Invalidate all task queries to ensure UI updates immediately
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      // Also remove from cache optimistically
      queryClient.setQueryData(['tasks'], (oldData: Task[] | undefined) => {
        if (!oldData) return oldData
        return oldData.filter((task) => task.id !== taskId)
      })
    },
  })
}

