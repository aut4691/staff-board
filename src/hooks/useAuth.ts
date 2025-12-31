import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

// Prevent multiple concurrent auth listeners / session checks across components.
// This app currently calls `useAuth()` in multiple places (routes/pages).
let authInitStarted = false

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const useAuth = () => {
  const { user, isLoading, setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    // Ensure auth initialization runs only once per app lifetime.
    if (authInitStarted) {
      return
    }
    authInitStarted = true

    let isMounted = true
    let hasCheckedSession = false

    // Function to fetch and set user profile
    const fetchUserProfile = async (userId: string) => {
      if (!isMounted) return
      
      // Check if user is already loaded to avoid duplicate fetches
      const currentUser = useAuthStore.getState().user
      if (currentUser && currentUser.id === userId) {
        console.log('User already loaded, skipping fetch')
        setLoading(false)
        return
      }

      console.log('Fetching user profile for:', userId)
      
      try {
        // Profile can be created by trigger right after auth; on slow networks it may take a moment.
        // Retry a few times to avoid intermittent "profile not found" causing stuck login.
        let lastError: any = null
        for (let attempt = 0; attempt < 4; attempt++) {
          const { data: userData, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()

          if (userData) {
            if (!isMounted) return
            console.log('User profile loaded:', userData.name, 'Role:', userData.role)
            setUser(userData)
            setLoading(false)
            return
          }

          lastError = error
          // wait: 150ms, 300ms, 450ms, 600ms
          await sleep(150 * (attempt + 1))
        }

        if (!isMounted) return

        if (lastError) console.error('Error fetching user profile:', lastError)
        console.warn('User profile not available after retries for userId:', userId)
        setUser(null)
        setLoading(false)
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
        // Get session directly without timeout - let Supabase handle it
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (!isMounted) {
          setLoading(false)
          return
        }

        if (sessionError) {
          console.error('Error getting session:', sessionError)
          setUser(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          // Check if session is valid and not expired
          const expiresAt = session.expires_at
          if (expiresAt && expiresAt * 1000 < Date.now()) {
            // Session expired, clear it
            console.log('Session expired, clearing and redirecting to login')
            await supabase.auth.signOut()
            setUser(null)
            setLoading(false)
          } else {
            // Session is valid, fetch user profile
            await fetchUserProfile(session.user.id)
          }
        } else {
          // No session found - immediately redirect to login
          console.log('No initial session found - redirecting to login immediately')
          setUser(null)
          setLoading(false)
        }
      } catch (error: any) {
        if (!isMounted) {
          setLoading(false)
          return
        }
        // If error, log and set to no session
        console.error('Session check failed:', error?.message)
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
      }, 5000) // 5 second timeout - allow more time for slow networks
    }

    // Start session check and timeout
    checkInitialSession()
    setLoadingTimeout()

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
        return
      }

      // For SIGNED_IN event, check if user is already set (from LoginPage)
      if (event === 'SIGNED_IN') {
        const currentUser = useAuthStore.getState().user
        if (currentUser && currentUser.id === session.user.id) {
          // User already loaded from LoginPage, skip profile fetch
          console.log('User already loaded from login, skipping profile fetch')
          // Ensure loading is false - LoginPage should have set it, but be safe
          setLoading(false)
          return
        }
        // If user not set, fetch profile (fallback case)
        console.log('User not set, fetching profile after SIGNED_IN')
        // Don't set loading to true here - it might already be false from LoginPage
        await fetchUserProfile(session.user.id)
        return
      }

      if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        // Token refreshed or initial session
        if (session?.user) {
          // Check if user is already loaded
          const currentUser = useAuthStore.getState().user
          if (currentUser && currentUser.id === session.user.id) {
            // User already loaded, just ensure loading is false
            console.log('User already loaded, skipping profile fetch')
            // Don't change loading state if user is already set - it should already be false
            if (useAuthStore.getState().isLoading) {
              setLoading(false)
            }
          } else {
            // Fetch user profile
            console.log('Fetching profile for', event)
            // Only set loading if we don't have a user yet
            if (!currentUser) {
              setLoading(true)
            }
            await fetchUserProfile(session.user.id)
          }
        } else {
          // No session in INITIAL_SESSION event
          console.log('INITIAL_SESSION: No session found')
          setUser(null)
          setLoading(false)
        }
        return
      }

      // Fallback: if we have a session but no user, fetch profile
      if (session?.user) {
        const currentUser = useAuthStore.getState().user
        if (!currentUser || currentUser.id !== session.user.id) {
          console.log('Fallback: fetching profile for session user')
          // Only set loading if we don't have a user yet
          if (!currentUser) {
            setLoading(true)
          }
          await fetchUserProfile(session.user.id)
        } else {
          // User already set, just ensure loading is false
          if (useAuthStore.getState().isLoading) {
            setLoading(false)
          }
        }
      } else {
        // No session and no specific event, ensure loading is false
        console.log('No session found, setting loading to false')
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      // NOTE: We intentionally do NOT reset authInitStarted here.
      // The auth listener should remain active for the whole app lifetime.
      isMounted = false
      if (loadingTimeout) clearTimeout(loadingTimeout)
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

