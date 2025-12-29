import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Task, TaskStatus, TrafficLightColor } from '@/types/index'

// Fetch tasks
export const useTasks = (userId?: string, isAdmin: boolean = false) => {
  return useQuery({
    queryKey: ['tasks', userId, isAdmin],
    queryFn: async () => {
      // Explicitly select all fields including memo
      let query = supabase
        .from('tasks')
        .select('id, title, description, assigned_to, status, progress, deadline, traffic_light, memo, created_at, updated_at')
        .order('created_at', { ascending: false })

      // If not admin, only fetch tasks assigned to the user
      if (!isAdmin && userId) {
        query = query.eq('assigned_to', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching tasks:', error)
        throw error
      }
      
      console.log('Fetched tasks:', data?.length, 'tasks with memo fields')
      return (data || []) as Task[]
    },
    enabled: !!userId || isAdmin,
  })
}

// Update task
export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
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
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

