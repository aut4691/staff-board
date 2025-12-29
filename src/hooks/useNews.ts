import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface NewsArticle {
  id: string
  title: string
  description: string
  source: string
  publishedAt: string
  url?: string
}

// Fetch news articles from Supabase
export const useNews = () => {
  return useQuery({
    queryKey: ['news'],
    queryFn: async (): Promise<NewsArticle[]> => {
      // Fetch news from Supabase database
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching news:', error)
        // Return empty array on error
        return []
      }

      // Transform database format to component format
      return (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        source: item.source,
        publishedAt: item.published_at,
        url: item.url || undefined,
      }))
    },
    staleTime: 1000 * 60 * 60, // Consider data fresh for 1 hour
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  })
}

// Trigger news fetch (call Edge Function to update news)
export const useFetchNews = () => {
  return useQuery({
    queryKey: ['fetch-news'],
    queryFn: async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Not authenticated')
      }

      // Call Edge Function to fetch and update news
      const response = await fetch(`${supabaseUrl}/functions/v1/fetch-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }

      return await response.json()
    },
    enabled: false, // Only fetch when explicitly called
  })
}

