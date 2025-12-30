import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

export const useAuth = () => {
  const { user, isLoading, setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    let isMounted = true
    let hasCheckedSession = false

    // Function to fetch and set user profile
    const fetchUserProfile = async (userId: string) => {
      if (!isMounted) return
      
      try {
        const { data: userData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (!isMounted) return

        if (error) {
          console.error('Error fetching user profile:', error)
          setUser(null)
          setLoading(false)
        } else if (userData) {
          console.log('User profile loaded:', userData.name)
          setUser(userData)
          setLoading(false)
        } else {
          setUser(null)
          setLoading(false)
        }
      } catch (error) {
        if (!isMounted) return
        console.error('Error fetching user profile:', error)
        setUser(null)
        setLoading(false)
      }
    }

    // Check initial session immediately
    const checkInitialSession = async () => {
      if (hasCheckedSession) return
      hasCheckedSession = true

      // Check if user is already loaded (e.g., from LoginPage)
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        console.log('User already loaded, skipping initial session check')
        setLoading(false)
        return
      }

      // Set loading state only if user is not already loaded
      setLoading(true)

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!isMounted) return

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          console.log('No initial session found')
          setUser(null)
          setLoading(false)
        }
      } catch (error) {
        if (!isMounted) return
        console.error('Error checking initial session:', error)
        setUser(null)
        setLoading(false)
      }
    }

    // Set a timeout to ensure loading doesn't hang forever
    let loadingTimeout: ReturnType<typeof setTimeout> | null = null
    
    const setLoadingTimeout = () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
      loadingTimeout = setTimeout(() => {
        if (isMounted && useAuthStore.getState().isLoading) {
          console.warn('Loading timeout reached, forcing loading to false')
          const currentUser = useAuthStore.getState().user
          if (!currentUser) {
            setUser(null)
          }
          setLoading(false)
        }
      }, 3000) // 3 second timeout
    }

    setLoadingTimeout()
    checkInitialSession()

    // Listen for auth changes (this handles subsequent changes)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return
      
      console.log('Auth state change:', event, session?.user?.id)
      
      // Clear timeout since we got an auth event
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
        loadingTimeout = null
      }
      
      if (event === 'SIGNED_OUT' || !session?.user) {
        // User signed out or no session
        console.log('User signed out or no session')
        setUser(null)
        setLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        // User signed in, token refreshed, or initial session
        if (session?.user) {
          // Check if user is already loaded
          const currentUser = useAuthStore.getState().user
          if (currentUser && currentUser.id === session.user.id) {
            // User already loaded, just ensure loading is false
            console.log('User already loaded, skipping profile fetch')
            setLoading(false)
          } else {
            // Fetch user profile
            await fetchUserProfile(session.user.id)
          }
        } else {
          // No session in INITIAL_SESSION event
          setUser(null)
          setLoading(false)
        }
      } else if (session?.user) {
        // Fallback: if we have a session but no user, fetch profile
        const currentUser = useAuthStore.getState().user
        if (!currentUser || currentUser.id !== session.user.id) {
          await fetchUserProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } else {
        // No session and no specific event, ensure loading is false
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
      subscription.unsubscribe()
    }

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [setUser, setLoading])

  const signOut = async () => {
    try {
      console.log('Signing out from Supabase...')
      // Clear local state first
      logout()
      setLoading(false)
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        // Even if Supabase sign out fails, we've already cleared local state
        throw error
      }
      console.log('Supabase sign out successful')
    } catch (error) {
      console.error('Error during sign out:', error)
      // Local state is already cleared, just throw the error
      throw error
    }
  }

  return {
    user,
    isLoading,
    signOut,
  }
}

