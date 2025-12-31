import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Feedback } from '@/types/index'

interface Comment {
  id: string
  feedback_id: string
  user_id: string
  content: string
  created_at: string
  user_name?: string
}

interface FeedbackWithComments extends Feedback {
  comments?: Comment[]
  from_user_name?: string
}

// Fetch recent feedbacks (latest 3) for current user (no profile lookup to avoid RLS 406)
export const useRecentFeedbacks = (userId: string) => {
  return useQuery({
    queryKey: ['recent-feedbacks', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('🔍 [Recent Feedbacks] No userId provided')
        return []
      }

      console.log('🔍 [Recent Feedbacks] Fetching for userId:', userId)

      // 직접 admin 프로필 조회를 하지 않고, 단순히 최신 피드백 3개를 가져옵니다.
      const { data, error } = await supabase
        .from('feedbacks')
        .select(`
          id,
          task_id,
          message,
          created_at,
          from_user_id,
          tasks!inner(title)
        `)
        .eq('to_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) {
        console.error('❌ [Recent Feedbacks] Error fetching feedbacks:', error)
        return []
      }

      console.log('📊 [Recent Feedbacks] Total feedbacks fetched:', data?.length || 0)
      return data || []
    },
    enabled: !!userId,
    refetchInterval: 10000, // Refetch every 10 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  })
}

// Fetch latest comments on admin's feedbacks (latest 3, excluding admin's own comments)
export const useLatestAdminComments = (adminId: string) => {
  return useQuery({
    queryKey: ['latest-admin-comments', adminId],
    queryFn: async () => {
      if (!adminId) return []

      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          feedback_id,
          user_profiles:comments_user_id_fkey(name),
          feedbacks!inner(
            task_id,
            from_user_id,
            tasks!inner(title)
          )
        `)
        .eq('feedbacks.from_user_id', adminId) // admin이 남긴 피드백에 달린 댓글
        .neq('user_id', adminId) // 관리자가 아닌 사용자 댓글만
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) {
        console.error('❌ [LatestAdminComments] Error fetching comments:', error)
        return []
      }

      return data || []
    },
    enabled: !!adminId,
    refetchInterval: 30000, // 30초마다 갱신
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  })
}

// Fetch feedbacks for a task
export const useFeedbacks = (taskId: string) => {
  return useQuery({
    queryKey: ['feedbacks', taskId],
    queryFn: async () => {
      if (!taskId) {
        console.warn('useFeedbacks called without taskId')
        return []
      }

      console.log('Fetching feedbacks for task:', taskId)
      const { data: feedbacks, error } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching feedbacks:', error)
        throw error
      }

      console.log('Fetched feedbacks:', feedbacks?.length || 0, 'feedbacks')

      // Fetch comments and likes for each feedback
      const feedbacksWithComments = await Promise.all(
        (feedbacks || []).map(async (feedback) => {
          // Fetch from_user name
          let fromUserName = 'Unknown'
          if (feedback.from_user_id) {
            try {
              const { data: fromUser, error: fromUserError } = await supabase
                .from('user_profiles')
                .select('name')
                .eq('id', feedback.from_user_id)
                .maybeSingle()
              
              if (!fromUserError && fromUser && fromUser.name) {
                fromUserName = fromUser.name
                console.log('Fetched from_user_name:', fromUserName, 'for feedback:', feedback.id)
              } else {
                console.warn('Failed to fetch from_user_name:', {
                  feedbackId: feedback.id,
                  fromUserId: feedback.from_user_id,
                  error: fromUserError,
                  data: fromUser
                })
              }
            } catch (error) {
              console.error('Error fetching from_user_name:', error)
            }
          }

          // Fetch comments with likes
          const { data: comments, error: commentsError } = await supabase
            .from('comments')
            .select('*')
            .eq('feedback_id', feedback.id)
            .order('created_at', { ascending: true})

          if (commentsError) {
            console.error('Error fetching comments for feedback', feedback.id, ':', commentsError)
          }

          // Fetch user names and likes for each comment
          const commentsWithDetails = await Promise.all(
            (comments || []).map(async (comment) => {
              // Fetch user name
              let userName = 'Unknown'
              if (comment.user_id) {
                try {
                  const { data: user, error: userError } = await supabase
                    .from('user_profiles')
                    .select('name')
                    .eq('id', comment.user_id)
                    .maybeSingle()
                  
                  if (!userError && user && user.name) {
                    userName = user.name
                  }
                } catch (error) {
                  console.error('Error fetching user name for comment:', error)
                }
              }

              // Fetch like status for current user
              const { data: { user: currentUser } } = await supabase.auth.getUser()
              let isLiked = false
              if (currentUser) {
                const { data: like } = await supabase
                  .from('comment_likes')
                  .select('id')
                  .eq('comment_id', comment.id)
                  .eq('user_id', currentUser.id)
                  .maybeSingle()
                
                isLiked = !!like
              }

              return {
                ...comment,
                author: userName,
                is_liked: isLiked,
              }
            })
          )

          return {
            ...feedback,
            comments: commentsWithDetails,
            from_user_name: fromUserName,
          } as FeedbackWithComments
        })
      )

      return feedbacksWithComments
    },
    enabled: !!taskId,
  })
}

// Fetch unread feedbacks for a user
export const useUnreadFeedbacks = (userId: string) => {
  return useQuery({
    queryKey: ['unread-feedbacks', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('to_user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Feedback[]
    },
    enabled: !!userId,
  })
}

// Fetch all feedbacks for a user (read and unread)
export const useAllFeedbacks = (userId: string) => {
  return useQuery({
    queryKey: ['all-feedbacks', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('task_id, is_read')
        .eq('to_user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as { task_id: string; is_read: boolean }[]
    },
    enabled: !!userId,
  })
}

// Create feedback
export const useCreateFeedback = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      toUserId,
      fromUserId,
      message,
    }: {
      taskId: string
      toUserId: string
      fromUserId: string
      message: string
    }) => {
      console.log('📤 [Create Feedback] Starting feedback creation:', {
        taskId,
        toUserId,
        fromUserId,
        messageLength: message.length,
      })

      // Validate inputs
      if (!taskId || !toUserId || !fromUserId || !message.trim()) {
        const error = new Error('필수 필드가 누락되었습니다.')
        console.error('❌ [Create Feedback] Validation error:', error)
        throw error
      }

      const { data, error } = await supabase
        .from('feedbacks')
        .insert({
          task_id: taskId,
          to_user_id: toUserId,
          from_user_id: fromUserId,
          message: message.trim(),
          is_read: false,
        })
        .select()
        .single()

      if (error) {
        console.error('❌ [Create Feedback] Supabase error:', error)
        throw error
      }

      console.log('✅ [Create Feedback] Feedback created successfully:', data)
      return data
    },
    onSuccess: (_data, variables) => {
      console.log('🔄 [Create Feedback] Invalidating queries for:', {
        taskId: variables.taskId,
        toUserId: variables.toUserId,
      })

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['feedbacks', variables.taskId] })
      queryClient.invalidateQueries({ queryKey: ['unread-feedbacks', variables.toUserId] })
      queryClient.invalidateQueries({ queryKey: ['all-feedbacks', variables.toUserId] })
      
      // Force refetch recent feedbacks immediately
      queryClient.invalidateQueries({ 
        queryKey: ['recent-feedbacks', variables.toUserId],
        exact: true 
      })
      
      // Also refetch immediately
      queryClient.refetchQueries({ 
        queryKey: ['recent-feedbacks', variables.toUserId],
        exact: true 
      })
      
      // Also invalidate all feedbacks queries (for admin view)
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
      
      console.log('✅ [Create Feedback] Queries invalidated and refetched successfully')
    },
    onError: (error) => {
      console.error('❌ [Create Feedback] Mutation error:', error)
    },
  })
}

// Mark feedback as read
export const useMarkFeedbackAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (feedbackId: string) => {
      const { error } = await supabase
        .from('feedbacks')
        .update({ is_read: true })
        .eq('id', feedbackId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['unread-feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['all-feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['recent-feedbacks'] })
    },
  })
}

// Add comment to feedback
export const useAddComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      feedbackId,
      content,
    }: {
      feedbackId: string
      content: string
    }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Insert comment
      const { data, error } = await supabase
        .from('comments')
        .insert({
          feedback_id: feedbackId,
          user_id: user.id,
          content,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate feedbacks query to refetch with new comment
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['admin-unread-comments'] })
    },
  })
}

// Toggle comment like
export const useToggleCommentLike = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      commentId,
      isLiked,
    }: {
      commentId: string
      isLiked: boolean
    }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      if (isLiked) {
        // Unlike: delete the like
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Like: insert a new like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          })

        if (error) throw error
      }
    },
    onSuccess: () => {
      // Invalidate feedbacks query to refetch with updated like count
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
    },
  })
}

// Fetch unread comments for admin's feedbacks
export const useAdminUnreadComments = (adminId: string) => {
  return useQuery({
    queryKey: ['admin-unread-comments', adminId],
    queryFn: async () => {
      if (!adminId) return []

      // Get all feedbacks sent by admin
      const { data: feedbacks, error: feedbacksError } = await supabase
        .from('feedbacks')
        .select('id, task_id, created_at, last_viewed_at')
        .eq('from_user_id', adminId)
        .order('created_at', { ascending: false })

      if (feedbacksError) {
        console.error('Error fetching admin feedbacks:', feedbacksError)
        return []
      }

      if (!feedbacks || feedbacks.length === 0) return []

      // Get all comments on admin's feedbacks
      const feedbackIds = feedbacks.map((f) => f.id)
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id, feedback_id, user_id, created_at')
        .in('feedback_id', feedbackIds)
        .order('created_at', { ascending: false })

      if (commentsError) {
        console.error('Error fetching comments:', commentsError)
        return []
      }

      if (!comments || comments.length === 0) return []

      // Get admin's last view time for each feedback
      // Consider comment unread if:
      // 1. It's from a different user (not admin)
      // 2. It was created after the feedback's last_viewed_at (or created_at if last_viewed_at is null)
      const unreadComments = comments.filter((comment) => {
        const feedback = feedbacks.find((f) => f.id === comment.feedback_id)
        if (!feedback) return false
        
        // Skip comments from admin
        if (comment.user_id === adminId) return false
        
        // Get the last viewed time (use last_viewed_at if exists, otherwise use feedback created_at)
        const lastViewedAt = feedback.last_viewed_at || feedback.created_at
        
        // Consider comment unread if it was created after the last viewed time
        return new Date(comment.created_at) > new Date(lastViewedAt)
      })

      // Group by task_id to get unique tasks with unread comments
      const taskIdsWithUnreadComments = [
        ...new Set(
          unreadComments.map((comment) => {
            const feedback = feedbacks.find((f) => f.id === comment.feedback_id)
            return feedback?.task_id
          }).filter(Boolean)
        ),
      ]

      return taskIdsWithUnreadComments as string[]
    },
    enabled: !!adminId,
  })
}
