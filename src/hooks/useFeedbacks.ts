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
            .order('created_at', { ascending: true })

          if (commentsError) {
            console.error('Error fetching comments for feedback', feedback.id, ':', commentsError)
          }

          // Fetch user names and likes for each comment
          const commentsWithDetails = await Promise.all(
            (comments || []).map(async (comment: any) => {
              // Fetch comment author name
              let authorName = 'Unknown'
              if (comment.user_id) {
                const { data: commentUser, error: commentUserError } = await supabase
                  .from('user_profiles')
                  .select('name')
                  .eq('id', comment.user_id)
                  .single()
                
                if (!commentUserError && commentUser) {
                  authorName = commentUser.name || 'Unknown'
                }
              }

              // Fetch like count and check if current user liked
              const { data: { user } } = await supabase.auth.getUser()
              let likeCount = 0
              let isLiked = false

              const { data: likes, error: likesError } = await supabase
                .from('comment_likes')
                .select('user_id')
                .eq('comment_id', comment.id)

              if (!likesError && likes) {
                likeCount = likes.length
                isLiked = user ? likes.some((like: any) => like.user_id === user.id) : false
              }

              return {
                id: comment.id,
                feedback_id: comment.feedback_id,
                user_id: comment.user_id,
                content: comment.content,
                created_at: comment.created_at,
                author: authorName,
                like_count: likeCount,
                is_liked: isLiked,
              }
            })
          )

          const result = {
            ...feedback,
            comments: commentsWithDetails,
            from_user_name: fromUserName,
          } as FeedbackWithComments
          
          // Debug: Log the result to verify from_user_name is set
          console.log('Feedback result:', {
            id: result.id,
            from_user_id: result.from_user_id,
            from_user_name: result.from_user_name,
            hasComments: !!result.comments && result.comments.length > 0
          })
          
          return result
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
      message,
    }: {
      taskId: string
      toUserId: string
      message: string
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('로그인이 필요합니다.')
      }

      console.log('Creating feedback:', {
        taskId,
        from_user_id: user.id,
        to_user_id: toUserId,
        message: message.trim(),
      })

      const { data, error } = await supabase
        .from('feedbacks')
        .insert({
          task_id: taskId,
          from_user_id: user.id,
          to_user_id: toUserId,
          message: message.trim(),
          is_read: false,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating feedback:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw new Error(error.message || '피드백 생성에 실패했습니다.')
      }

      console.log('Feedback created successfully:', data)

      // Update last_viewed_at when admin creates feedback (marking it as viewed)
      try {
        const { error: updateError } = await supabase
          .from('feedbacks')
          .update({ last_viewed_at: new Date().toISOString() })
          .eq('id', data.id)
        
        if (updateError) {
          console.warn('Failed to update last_viewed_at:', updateError)
        }
      } catch (updateError) {
        console.warn('Failed to update last_viewed_at:', updateError)
      }

      // Create notification (ignore errors)
      try {
        const { error: notifError } = await supabase.from('notifications').insert({
          user_id: toUserId,
          type: 'feedback',
          title: '새 피드백 도착',
          message: `새로운 피드백이 도착했습니다.`,
          is_read: false,
        })
        if (notifError) {
          console.warn('Failed to create notification:', notifError)
        }
      } catch (notifError) {
        console.warn('Failed to create notification:', notifError)
        // Don't throw - notification failure shouldn't block feedback creation
      }

      return data
    },
    onSuccess: (_, variables) => {
      console.log('Invalidating queries for task:', variables.taskId)
      queryClient.invalidateQueries({ queryKey: ['feedbacks', variables.taskId] })
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['unread-feedbacks'] })
    },
  })
}

// Mark feedback as read
export const useMarkFeedbackRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (feedbackId: string) => {
      const { data, error } = await supabase
        .from('feedbacks')
        .update({ is_read: true })
        .eq('id', feedbackId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['unread-feedbacks'] })
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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('로그인이 필요합니다.')
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          feedback_id: feedbackId,
          user_id: user.id,
          content: content.trim(),
        })
        .select()
        .single()

      if (error) {
        console.error('Comment creation error:', error)
        throw new Error(error.message || '댓글 작성에 실패했습니다.')
      }
      
      return data
    },
        onSuccess: () => {
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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('로그인이 필요합니다.')
      }

      if (isLiked) {
        // Unlike: delete the like
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error unliking comment:', error)
          throw new Error(error.message || '좋아요 취소에 실패했습니다.')
        }
      } else {
        // Like: insert the like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          })

        if (error) {
          console.error('Error liking comment:', error)
          throw new Error(error.message || '좋아요에 실패했습니다.')
        }
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate all feedback queries to refresh like counts
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['feedbacks', variables.commentId] })
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
      const tasksWithUnreadComments = new Map<string, { task_id: string; feedback_id: string }>()
      unreadComments.forEach((comment) => {
        const feedback = feedbacks.find((f) => f.id === comment.feedback_id)
        if (feedback && !tasksWithUnreadComments.has(feedback.task_id)) {
          tasksWithUnreadComments.set(feedback.task_id, {
            task_id: feedback.task_id,
            feedback_id: comment.feedback_id,
          })
        }
      })

      return Array.from(tasksWithUnreadComments.values())
    },
    enabled: !!adminId,
    refetchInterval: 30000, // Refetch every 30 seconds to check for new comments
  })
}

