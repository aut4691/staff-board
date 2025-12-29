import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

export const useAuth = () => {
  const { user, isLoading, setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Fetch user details from user_profiles table
          const { data: userData, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.error('Error fetching user profile:', error)
          } else if (userData) {
            setUser(userData)
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: userData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
        } else if (userData) {
          setUser(userData)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setLoading])

  const signOut = async () => {
    try {
      console.log('Signing out from Supabase...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      console.log('Supabase sign out successful')
      logout()
      console.log('Auth store cleared')
    } catch (error) {
      console.error('Error during sign out:', error)
      // Still clear local state even if Supabase sign out fails
      logout()
      throw error
    }
  }

  return {
    user,
    isLoading,
    signOut,
  }
}

