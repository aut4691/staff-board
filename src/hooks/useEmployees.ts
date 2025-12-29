import { useQuery } from '@tanstack/react-query'
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

